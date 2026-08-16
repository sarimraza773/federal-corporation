import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  deliverStoredInquiryEmails,
  visitorConfirmationEnabled,
} from './email-delivery.js';

const LIMITS = {
  bodyBytes: 12_000,
  nameMin: 2,
  nameMax: 100,
  emailMax: 254,
  contactNumberMin: 7,
  contactNumberMax: 30,
  messageMin: 10,
  messageMax: 1800,
  userAgentMax: 500,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactNumberPattern = /^\+?[0-9][0-9\s().-]*$/;
const allowedKeys = new Set(['name', 'email', 'contactNumber', 'message', 'companyWebsite', 'turnstileToken']);

type JsonRecord = Record<string, unknown>;

function configuredOrigins(): Set<string> {
  const configured = Deno.env.get('ALLOWED_ORIGINS') || '';
  return new Set(configured.split(',').map((value) => value.trim()).filter(Boolean).map((value) => {
    try {
      return new URL(value).origin;
    } catch {
      return value.replace(/\/$/, '');
    }
  }));
}

function corsHeaders(origin: string | null, originAllowed: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (origin && originAllowed) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function jsonResponse(
  body: { success: boolean; error?: string },
  status: number,
  cors: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cleanSingleLine(value: unknown): string | null {
  if (typeof value !== 'string' || /[\u0000-\u001f\u007f]/.test(value)) return null;
  return value.trim().replace(/\s+/g, ' ');
}

function cleanMessage(value: unknown): string | null {
  if (typeof value !== 'string' || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) return null;
  return value.replace(/\r\n?/g, '\n').trim();
}

function parseAndValidate(payload: unknown) {
  if (!isRecord(payload) || Object.keys(payload).some((key) => !allowedKeys.has(key))) return null;

  const name = cleanSingleLine(payload.name);
  const email = cleanSingleLine(payload.email)?.toLowerCase() || null;
  const contactNumber = cleanSingleLine(payload.contactNumber);
  const message = cleanMessage(payload.message);

  if (!name || name.length < LIMITS.nameMin || name.length > LIMITS.nameMax) return null;
  if (!email || email.length > LIMITS.emailMax || !emailPattern.test(email)) return null;
  if (
    !contactNumber
    || contactNumber.length < LIMITS.contactNumberMin
    || contactNumber.length > LIMITS.contactNumberMax
    || !contactNumberPattern.test(contactNumber)
  ) return null;
  if (!message || message.length < LIMITS.messageMin || message.length > LIMITS.messageMax) return null;

  return { name, email, contactNumber, message };
}

function clientAddress(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return request.headers.get('cf-connecting-ip')?.trim()
    || forwarded
    || request.headers.get('x-real-ip')?.trim()
    || 'unavailable';
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function safeConfigValue(name: string): string | null {
  const value = Deno.env.get(name)?.trim();
  return value && !/[\r\n]/.test(value) ? value : null;
}

Deno.serve(async (request) => {
  const origin = request.headers.get('Origin');
  const originAllowed = !origin || configuredOrigins().has(origin);
  const cors = corsHeaders(origin, originAllowed);

  if (request.method === 'OPTIONS') {
    return originAllowed
      ? new Response(null, { status: 204, headers: cors })
      : jsonResponse({ success: false, error: 'Origin not allowed' }, 403, cors);
  }

  if (request.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405, cors);
  }

  if (!originAllowed) {
    return jsonResponse({ success: false, error: 'Origin not allowed' }, 403, cors);
  }

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > LIMITS.bodyBytes) {
    return jsonResponse({ success: false, error: 'Invalid request' }, 413, cors);
  }

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > LIMITS.bodyBytes) {
      return jsonResponse({ success: false, error: 'Invalid request' }, 413, cors);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ success: false, error: 'Invalid request' }, 400, cors);
    }

    if (!isRecord(payload)) {
      return jsonResponse({ success: false, error: 'Invalid request' }, 400, cors);
    }

    if (typeof payload.companyWebsite !== 'string') {
      return jsonResponse({ success: false, error: 'Invalid request' }, 400, cors);
    }

    // Honeypot submissions receive a plausible success response but are neither
    // stored nor emailed, which avoids teaching simple bots how to bypass it.
    if (payload.companyWebsite.trim()) {
      console.warn('Contact inquiry discarded by honeypot');
      return jsonResponse({ success: true }, 200, cors);
    }

    const inquiry = parseAndValidate(payload);
    if (!inquiry) {
      return jsonResponse({ success: false, error: 'Invalid request' }, 400, cors);
    }

    const supabaseUrl = safeConfigValue('SUPABASE_URL');
    const serviceRoleKey = safeConfigValue('SUPABASE_SERVICE_ROLE_KEY');
    const rateLimitSalt = safeConfigValue('RATE_LIMIT_SALT');
    if (!supabaseUrl || !serviceRoleKey || !rateLimitSalt) {
      console.error('Contact function is missing required server configuration');
      return jsonResponse({ success: false, error: 'Unable to send message' }, 500, cors);
    }

    const userAgent = (request.headers.get('user-agent') || '').slice(0, LIMITS.userAgentMax);
    const clientHash = await sha256(`${rateLimitSalt}:${clientAddress(request)}`);
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: inquiryId, error: insertError } = await supabaseAdmin.rpc('accept_contact_inquiry', {
      p_name: inquiry.name,
      p_email: inquiry.email,
      p_contact_number: inquiry.contactNumber,
      p_message: inquiry.message,
      p_user_agent: userAgent,
      p_client_hash: clientHash,
    });

    if (insertError) {
      if (insertError.message === 'contact_rate_limited') {
        console.warn('Contact inquiry rate limited');
        return jsonResponse({ success: false, error: 'Please wait before sending another message' }, 429, cors);
      }
      console.error('Unable to store contact inquiry', { code: insertError.code });
      return jsonResponse({ success: false, error: 'Unable to send message' }, 500, cors);
    }

    const resendApiKey = safeConfigValue('RESEND_API_KEY');
    const toEmail = safeConfigValue('CONTACT_TO_EMAIL');
    const fromEmail = safeConfigValue('CONTACT_FROM_EMAIL');
    await deliverStoredInquiryEmails({
      inquiry,
      inquiryId,
      config: { resendApiKey, toEmail, fromEmail },
      confirmationEnabled: visitorConfirmationEnabled(Deno.env.get('ENABLE_VISITOR_CONFIRMATION')),
      sendEmail: async ({ idempotencyKey, payload }, description) => {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10_000),
        });
        if (!resendResponse.ok) {
          console.error(`Resend ${description} failed`, { inquiryId, status: resendResponse.status });
        }
        return resendResponse.ok;
      },
      updateNotificationStatus: async (status) => {
        const { error } = await supabaseAdmin
          .from('contact_inquiries')
          .update({ notification_status: status })
          .eq('id', inquiryId);
        if (error) throw new Error(`notification_status:${error.code}`);
      },
      updateConfirmationStatus: async ({ status, sentAt }) => {
        const { error } = await supabaseAdmin
          .from('contact_inquiries')
          .update({ confirmation_status: status, confirmation_sent_at: sentAt })
          .eq('id', inquiryId);
        if (error) throw new Error(`confirmation_status:${error.code}`);
      },
    });

    // Once the database insert succeeds, the inquiry is safely received even
    // if either Resend email is temporarily unavailable; failed statuses support follow-up.
    return jsonResponse({ success: true }, 200, cors);
  } catch (error) {
    console.error('Unexpected contact function failure', {
      error: error instanceof Error ? error.name : 'unknown',
    });
    return jsonResponse({ success: false, error: 'Unable to send message' }, 500, cors);
  }
});
