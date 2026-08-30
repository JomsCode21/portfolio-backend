import nodemailer from 'nodemailer';
import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

const mailConfig = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, NOTIFICATION_EMAIL, ADMIN_EMAIL } =
    process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !(SMTP_FROM || SMTP_USER))
    return null;

  return {
    transporter: nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    }),
    from: SMTP_FROM || SMTP_USER,
    to: NOTIFICATION_EMAIL || ADMIN_EMAIL,
  };
};

const pushConfigured = () =>
  Boolean(
    process.env.VAPID_SUBJECT && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
  );

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character],
  );

const contactEmailTemplate = (contact) => `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        @media only screen and (max-width: 620px) {
          .email-background { padding: 16px 8px !important; }
          .email-card { border-radius: 10px !important; }
          .email-header, .email-section { padding-left: 20px !important; padding-right: 20px !important; }
          .email-header { padding-top: 22px !important; padding-bottom: 22px !important; }
          .email-header h1 { font-size: 21px !important; }
          .sender-column, .reply-column { display: block !important; width: 100% !important; box-sizing: border-box !important; }
          .sender-column { padding: 16px 16px 8px !important; }
          .reply-column { padding: 8px 16px 16px !important; text-align: left !important; }
          .reply-button { display: block !important; text-align: center !important; }
          .message-text { padding: 16px !important; font-size: 14px !important; }
          .email-footer { padding: 16px 20px !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background:#f4f7fb;color:#14213d;font-family:Arial,Helvetica,sans-serif;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
        New message from ${contact.name}: ${contact.subject}
      </div>
      <table class="email-background" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f7fb;padding:32px 16px;">
        <tr>
          <td align="center">
            <table class="email-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border:1px solid #dbe5f1;border-radius:14px;overflow:hidden;">
              <tr>
                <td class="email-header" style="padding:28px 32px;background:#0b1120;color:#ffffff;">
                  <p style="margin:0 0 8px;color:#38bdf8;font-family:Consolas,'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;">Portfolio contact form</p>
                  <h1 style="margin:0;font-size:24px;line-height:1.25;font-weight:700;">You have a new message</h1>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding:30px 32px 12px;">
                  <p style="margin:0 0 6px;color:#718096;font-family:Consolas,'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">Subject</p>
                  <h2 style="margin:0;color:#14213d;font-size:21px;line-height:1.35;font-weight:700;">${contact.subject}</h2>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding:16px 32px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7fafc;border:1px solid #e4edf6;border-radius:10px;">
                    <tr>
                      <td class="sender-column" style="padding:18px 20px;">
                        <p style="margin:0 0 5px;color:#718096;font-family:Consolas,'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">From</p>
                        <p style="margin:0 0 3px;color:#14213d;font-size:16px;font-weight:700;">${contact.name}</p>
                        <a href="mailto:${contact.email}" style="color:#0284c7;font-size:14px;text-decoration:none;">${contact.email}</a>
                      </td>
                      <td class="reply-column" align="right" valign="middle" style="padding:18px 20px 18px 0;">
                        <a class="reply-button" href="mailto:${contact.email}?subject=Re%3A%20${encodeURIComponent(contact.subject)}" style="display:inline-block;padding:11px 15px;background:#38bdf8;border-radius:7px;color:#07111e;font-size:13px;font-weight:700;text-decoration:none;">Reply to ${contact.name}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="email-section" style="padding:16px 32px 30px;">
                  <p style="margin:0 0 9px;color:#718096;font-family:Consolas,'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">Message</p>
                  <div class="message-text" style="padding:20px;background:#ffffff;border-left:3px solid #38bdf8;color:#334155;font-size:15px;line-height:1.7;white-space:pre-wrap;">${contact.message}</div>
                </td>
              </tr>
              <tr>
                <td class="email-footer" style="padding:18px 32px;border-top:1px solid #e4edf6;color:#718096;font-size:12px;line-height:1.5;">
                  This notification was sent from your portfolio contact form. Replying goes directly to ${contact.name}.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

async function sendEmail(contact) {
  const config = mailConfig();
  if (!config || !config.to) return;

  const safe = {
    name: escapeHtml(contact.name),
    email: escapeHtml(contact.email),
    subject: escapeHtml(contact.subject),
    message: escapeHtml(contact.message),
  };
  await config.transporter.sendMail({
    from: config.from,
    to: config.to,
    replyTo: contact.email,
    subject: `New portfolio message: ${contact.subject}`,
    text: `New portfolio contact\n\nFrom: ${contact.name} <${contact.email}>\nSubject: ${contact.subject}\n\n${contact.message}`,
    html: contactEmailTemplate(safe),
  });
}

async function sendPush(contact) {
  if (!pushConfigured()) return;

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT as string,
    process.env.VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string,
  );
  const subscriptions = await PushSubscription.find().lean();
  const payload = JSON.stringify({
    title: 'New portfolio message',
    body: `${contact.name}: ${contact.subject}`.slice(0, 180),
    url: '/admin/messages',
  });

  await Promise.all(
    subscriptions.map(async (subscription: any) => {
      try {
        await webpush.sendNotification(subscription, payload, { TTL: 60 * 60, urgency: 'high' });
      } catch (error: any) {
        if (error.statusCode === 404 || error.statusCode === 410)
          await PushSubscription.deleteOne({ _id: subscription._id });
        else throw error;
      }
    }),
  );
}

export async function notifyNewContact(contact) {
  const results = await Promise.allSettled([sendEmail(contact), sendPush(contact)]);
  results.forEach((result) => {
    if (result.status === 'rejected') console.error('Contact notification failed:', result.reason);
  });
}

export const getVapidPublicKey = () => process.env.VAPID_PUBLIC_KEY || '';
