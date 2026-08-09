import { createClient } from 'npm:@supabase/supabase-js@2';

const LIMITS = {
  bodyBytes: 12_000,
  nameMin: 2,
  nameMax: 100,
  emailMax: 254,
  messageMin: 10,
  messageMax: 1800,
  userAgentMax: 500,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedKeys = new Set(['name', 'email', 'message', 'companyWebsite', 'turnstileToken']);

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
  const message = cleanMessage(payload.message);

  if (!name || name.length < LIMITS.nameMin || name.length > LIMITS.nameMax) return null;
  if (!email || email.length > LIMITS.emailMax || !emailPattern.test(email)) return null;
  if (!message || message.length < LIMITS.messageMin || message.length > LIMITS.messageMax) return null;

  return { name, email, message };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);
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

function visitorConfirmationEnabled(): boolean {
  return Deno.env.get('ENABLE_VISITOR_CONFIRMATION')?.trim() === 'true';
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
    let notificationSent = false;

    if (!resendApiKey || !toEmail || !fromEmail) {
      console.error('Contact email notification is missing required server configuration', { inquiryId });
    } else {
      const submitted = new Date().toISOString();
      const plainText = [
        'New Website Inquiry',
        '',
        'Name:',
        inquiry.name,
        '',
        'Email:',
        inquiry.email,
        '',
        'Message:',
        inquiry.message,
        '',
        'Submitted:',
        submitted,
      ].join('\n');
      const html = `
        <div style="font-family:Arial,sans-serif;color:#172033;line-height:1.6;max-width:680px">
          <h1 style="font-size:22px;margin:0 0 24px">New Website Inquiry</h1>
          <p><strong>Name:</strong><br>${escapeHtml(inquiry.name)}</p>
          <p><strong>Email:</strong><br>${escapeHtml(inquiry.email)}</p>
          <p><strong>Message:</strong><br>${escapeHtml(inquiry.message).replace(/\n/g, '<br>')}</p>
          <p><strong>Submitted:</strong><br>${escapeHtml(submitted)}</p>
        </div>`;

      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': `contact-inquiry-${inquiryId}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [toEmail],
            reply_to: inquiry.email,
            subject: `New Website Inquiry — ${inquiry.name}`,
            html,
            text: plainText,
          }),
          signal: AbortSignal.timeout(10_000),
        });

        notificationSent = resendResponse.ok;
        if (!resendResponse.ok) {
          console.error('Resend notification failed', { inquiryId, status: resendResponse.status });
        }
      } catch (error) {
        console.error('Resend notification request failed', {
          inquiryId,
          error: error instanceof Error ? error.name : 'unknown',
        });
      }
    }

    try {
      const { error: notificationUpdateError } = await supabaseAdmin
        .from('contact_inquiries')
        .update({ notification_status: notificationSent ? 'sent' : 'failed' })
        .eq('id', inquiryId);

      if (notificationUpdateError) {
        console.error('Unable to update contact notification status', {
          inquiryId,
          code: notificationUpdateError.code,
        });
      }
    } catch (error) {
      console.error('Contact notification status update failed', {
        inquiryId,
        error: error instanceof Error ? error.name : 'unknown',
      });
    }

    if (visitorConfirmationEnabled()) {
      let confirmationSent = false;
      let confirmationSentAt: string | null = null;

      if (!resendApiKey || !toEmail || !fromEmail) {
        console.error('Visitor confirmation email is missing required server configuration', { inquiryId });
      } else {
        const escapedMessage = escapeHtml(inquiry.message).replace(/\n/g, '<br>');
        const confirmationText = [
          `Dear ${inquiry.name},`,
          '',
          'Thank you for contacting Rizvi & Rizvi.',
          '',
          'We have received your message and a member of our team will review your inquiry. We typically respond within 24 hours.',
          '',
          'For your records, a copy of the message you submitted is included below:',
          '',
          inquiry.message,
          '',
          'Kind regards,',
          'Rizvi & Rizvi',
          'Advocates & Legal Practitioners',
          '',
          'This is an automated confirmation of your website inquiry.',
        ].join('\n');
        const confirmationHtml = `
          <div style="margin:0;padding:32px 16px;background:#f4f1eb;color:#1b2433;font-family:Georgia,'Times New Roman',serif;line-height:1.7">
            <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #ded8cd;border-top:4px solid #8a6a2f;padding:40px;box-sizing:border-box">
              <p style="margin:0 0 24px;font-size:13px;letter-spacing:1.8px;text-transform:uppercase;color:#8a6a2f">Rizvi &amp; Rizvi</p>
              <h1 style="margin:0 0 28px;font-size:26px;font-weight:normal;color:#172033">We have received your message</h1>
              <p style="margin:0 0 18px">Dear ${escapeHtml(inquiry.name)},</p>
              <p style="margin:0 0 18px">Thank you for contacting Rizvi &amp; Rizvi.</p>
              <p style="margin:0 0 24px">We have received your message and a member of our team will review your inquiry. We typically respond within 24 hours.</p>
              <p style="margin:0 0 12px">For your records, a copy of the message you submitted is included below:</p>
              <div style="margin:0 0 28px;padding:18px 20px;background:#f8f7f4;border-left:3px solid #8a6a2f;color:#303949;font-family:Arial,sans-serif;font-size:15px;line-height:1.65">${escapedMessage}</div>
              <p style="margin:0">Kind regards,<br><strong>Rizvi &amp; Rizvi</strong><br>Advocates &amp; Legal Practitioners</p>
              <p style="margin:32px 0 0;padding-top:18px;border-top:1px solid #e5e0d7;color:#6d7480;font-family:Arial,sans-serif;font-size:12px">This is an automated confirmation of your website inquiry.</p>
            </div>
          </div>`;

        try {
          const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
              'Idempotency-Key': `contact-inquiry-confirmation-${inquiryId}`,
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [inquiry.email],
              reply_to: toEmail,
              subject: 'We’ve received your message — Rizvi & Rizvi',
              html: confirmationHtml,
              text: confirmationText,
            }),
            signal: AbortSignal.timeout(10_000),
          });

          confirmationSent = resendResponse.ok;
          if (confirmationSent) {
            confirmationSentAt = new Date().toISOString();
          } else {
            console.error('Resend visitor confirmation failed', {
              inquiryId,
              status: resendResponse.status,
            });
          }
        } catch (error) {
          console.error('Resend visitor confirmation request failed', {
            inquiryId,
            error: error instanceof Error ? error.name : 'unknown',
          });
        }
      }

      try {
        const { error: confirmationUpdateError } = await supabaseAdmin
          .from('contact_inquiries')
          .update({
            confirmation_status: confirmationSent ? 'sent' : 'failed',
            confirmation_sent_at: confirmationSentAt,
          })
          .eq('id', inquiryId);

        if (confirmationUpdateError) {
          console.error('Unable to update visitor confirmation status', {
            inquiryId,
            code: confirmationUpdateError.code,
          });
        }
      } catch (error) {
        console.error('Visitor confirmation status update failed', {
          inquiryId,
          error: error instanceof Error ? error.name : 'unknown',
        });
      }
    }

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
