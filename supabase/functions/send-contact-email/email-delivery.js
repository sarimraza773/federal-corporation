export function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);
}

export function visitorConfirmationEnabled(value) {
  return typeof value === 'string' && value.trim() === 'true';
}

export function internalIdempotencyKey(inquiryId) {
  return `contact-inquiry-${inquiryId}`;
}

export function confirmationIdempotencyKey(inquiryId) {
  return `contact-inquiry-confirmation-${inquiryId}`;
}

export function buildInternalEmail({ inquiry, inquiryId, fromEmail, toEmail, submitted }) {
  return {
    idempotencyKey: internalIdempotencyKey(inquiryId),
    payload: {
      from: fromEmail,
      to: [toEmail],
      reply_to: inquiry.email,
      subject: `New Website Inquiry — ${inquiry.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#172033;line-height:1.6;max-width:680px">
          <h1 style="font-size:22px;margin:0 0 24px">New Website Inquiry</h1>
          <p><strong>Name:</strong><br>${escapeHtml(inquiry.name)}</p>
          <p><strong>Email:</strong><br>${escapeHtml(inquiry.email)}</p>
          <p><strong>Contact Number:</strong><br>${escapeHtml(inquiry.contactNumber)}</p>
          <p><strong>Message:</strong><br>${escapeHtml(inquiry.message).replace(/\n/g, '<br>')}</p>
          <p><strong>Submitted:</strong><br>${escapeHtml(submitted)}</p>
        </div>`,
      text: [
        'New Website Inquiry',
        '',
        'Name:',
        inquiry.name,
        '',
        'Email:',
        inquiry.email,
        '',
        'Contact Number:',
        inquiry.contactNumber,
        '',
        'Message:',
        inquiry.message,
        '',
        'Submitted:',
        submitted,
      ].join('\n'),
    },
  };
}

export function buildVisitorConfirmationEmail({ inquiry, inquiryId, fromEmail, toEmail }) {
  return {
    idempotencyKey: confirmationIdempotencyKey(inquiryId),
    payload: {
      from: fromEmail,
      to: [inquiry.email],
      reply_to: toEmail,
      subject: 'We’ve received your message — Federal Corporation',
      html: `
        <div style="margin:0;padding:32px 16px;background:#f4f1eb;color:#1b2433;font-family:Georgia,'Times New Roman',serif;line-height:1.7">
          <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #ded8cd;border-top:4px solid #8a6a2f;padding:40px;box-sizing:border-box">
            <p style="margin:0 0 24px;font-size:13px;letter-spacing:1.8px;text-transform:uppercase;color:#8a6a2f">FEDERAL CORPORATION</p>
            <h1 style="margin:0 0 28px;font-size:26px;font-weight:normal;color:#172033">We have received your message</h1>
            <p style="margin:0 0 18px">Dear ${escapeHtml(inquiry.name)},</p>
            <p style="margin:0 0 18px">Thank you for contacting Federal Corporation.</p>
            <p style="margin:0 0 24px">We have received your message and a member of our team will review your inquiry. We typically respond within 24 hours.</p>
            <p style="margin:0 0 12px">For your records, a copy of the message you submitted is included below:</p>
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#172033">Your Message</p>
            <div style="margin:0 0 28px;padding:18px 20px;background:#f8f7f4;border-left:3px solid #8a6a2f;color:#303949;font-family:Arial,sans-serif;font-size:15px;line-height:1.65">${escapeHtml(inquiry.message).replace(/\n/g, '<br>')}</div>
            <p style="margin:0">Kind regards,<br><strong>Federal Corporation</strong><br>Advocates &amp; Legal Practitioners</p>
            <p style="margin:32px 0 0;padding-top:18px;border-top:1px solid #e5e0d7;color:#6d7480;font-family:Arial,sans-serif;font-size:12px">This is an automated confirmation of your website inquiry.</p>
          </div>
        </div>`,
      text: [
        `Dear ${inquiry.name},`,
        '',
        'Thank you for contacting Federal Corporation.',
        '',
        'We have received your message and a member of our team will review your inquiry. We typically respond within 24 hours.',
        '',
        'For your records, a copy of the message you submitted is included below:',
        '',
        'Your Message',
        '',
        inquiry.message,
        '',
        'Kind regards,',
        '',
        'Federal Corporation',
        'Advocates & Legal Practitioners',
        '',
        'This is an automated confirmation of your website inquiry.',
      ].join('\n'),
    },
  };
}

async function safeUpdate(update, value, logger, message, inquiryId) {
  try {
    await update(value);
  } catch (error) {
    logger.error(message, {
      inquiryId,
      error: error instanceof Error ? error.name : 'unknown',
    });
  }
}

export async function deliverStoredInquiryEmails({
  inquiry,
  inquiryId,
  config,
  confirmationEnabled,
  sendEmail,
  updateNotificationStatus,
  updateConfirmationStatus,
  now = () => new Date().toISOString(),
  logger = console,
}) {
  const configured = Boolean(config.resendApiKey && config.toEmail && config.fromEmail);
  let notificationSent = false;

  if (!configured) {
    logger.error('Contact email notification is missing required server configuration', { inquiryId });
  } else {
    try {
      notificationSent = await sendEmail(buildInternalEmail({
        inquiry,
        inquiryId,
        fromEmail: config.fromEmail,
        toEmail: config.toEmail,
        submitted: now(),
      }), 'firm notification');
    } catch (error) {
      logger.error('Resend notification request failed', {
        inquiryId,
        error: error instanceof Error ? error.name : 'unknown',
      });
    }
  }

  await safeUpdate(
    updateNotificationStatus,
    notificationSent ? 'sent' : 'failed',
    logger,
    'Contact notification status update failed',
    inquiryId,
  );

  if (!confirmationEnabled) return;

  let confirmationSent = false;
  if (!configured) {
    logger.error('Visitor confirmation email is missing required server configuration', { inquiryId });
  } else {
    try {
      confirmationSent = await sendEmail(buildVisitorConfirmationEmail({
        inquiry,
        inquiryId,
        fromEmail: config.fromEmail,
        toEmail: config.toEmail,
      }), 'visitor confirmation');
    } catch (error) {
      logger.error('Resend visitor confirmation request failed', {
        inquiryId,
        error: error instanceof Error ? error.name : 'unknown',
      });
    }
  }

  await safeUpdate(
    updateConfirmationStatus,
    {
      status: confirmationSent ? 'sent' : 'failed',
      sentAt: confirmationSent ? now() : null,
    },
    logger,
    'Visitor confirmation status update failed',
    inquiryId,
  );
}
