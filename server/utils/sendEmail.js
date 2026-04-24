const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a password reset email via Resend.
 * @param {string} toEmail       — recipient email address
 * @param {string} resetUrl      — full reset link with token
 */
const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  const { error } = await resend.emails.send({
    from:    'Wrath of God <onboarding@resend.dev>', // update to your verified sender
    to:      [toEmail],
    subject: 'Reset your WoG password',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Password</title>
      </head>
      <body style="margin:0;padding:0;background:#0d0d0d;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0"
                     style="background:#141414;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:32px;text-align:center;">
                    <div style="display:inline-block;width:52px;height:52px;background:rgba(0,0,0,0.25);
                                border-radius:12px;line-height:52px;font-size:26px;margin-bottom:12px;">🔥</div>
                    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:900;letter-spacing:0.15em;">
                      WRATH OF GOD
                    </h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:12px;
                               text-transform:uppercase;letter-spacing:0.2em;">
                      Scrim Manager
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px;">
                    <h2 style="margin:0 0 12px;color:#fff;font-size:18px;font-weight:700;">
                      Reset your password
                    </h2>
                    <p style="margin:0 0 24px;color:rgba(255,255,255,0.55);font-size:14px;line-height:1.7;">
                      We received a request to reset your password. Click the button below
                      to create a new password. This link expires in <strong style="color:#f97316;">1 hour</strong>.
                    </p>

                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                      <tr>
                        <td style="border-radius:10px;background:linear-gradient(135deg,#ef4444,#f97316);">
                          <a href="${resetUrl}"
                             style="display:inline-block;padding:14px 36px;color:#fff;text-decoration:none;
                                    font-weight:800;font-size:14px;letter-spacing:0.12em;text-transform:uppercase;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 8px;color:rgba(255,255,255,0.35);font-size:12px;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin:0;word-break:break-all;font-size:11px;color:#f97316;">
                      ${resetUrl}
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);
                             text-align:center;color:rgba(255,255,255,0.25);font-size:11px;">
                    If you didn't request this, you can safely ignore this email.<br/>
                    © ${new Date().getFullYear()} Wrath of God Scrim Manager
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(`Email send failed: ${error.message}`);
  }
};

module.exports = { sendPasswordResetEmail };
