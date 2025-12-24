import { Elysia } from 'elysia';
import { createElement } from 'react';
import { renderEmail } from './render';
import { InvitationEmail, PasswordResetEmail } from './templates';

const PORT = process.env.EMAIL_PREVIEW_PORT || 3001;

new Elysia()
  .get('/', () => {
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Templates Preview</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 40px 20px;
            }
            .container {
              max-width: 900px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              color: white;
              margin-bottom: 40px;
            }
            .header h1 {
              font-size: 2.5rem;
              margin-bottom: 10px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .header p {
              font-size: 1.1rem;
              opacity: 0.9;
            }
            .badge {
              display: inline-block;
              background: rgba(255,255,255,0.2);
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 0.9rem;
              margin-top: 10px;
              backdrop-filter: blur(10px);
            }
            .template-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
              margin-bottom: 40px;
            }
            .template-card {
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              transition: all 0.3s ease;
              text-decoration: none;
              color: inherit;
              display: block;
            }
            .template-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 15px 40px rgba(0,0,0,0.3);
            }
            .template-icon {
              font-size: 3rem;
              margin-bottom: 15px;
            }
            .template-title {
              font-size: 1.5rem;
              font-weight: bold;
              color: #000091;
              margin-bottom: 10px;
            }
            .template-desc {
              color: #666;
              line-height: 1.5;
              margin-bottom: 15px;
            }
            .template-meta {
              display: flex;
              gap: 10px;
              font-size: 0.85rem;
              color: #999;
            }
            .view-btn {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              margin-top: 15px;
              transition: all 0.3s ease;
            }
            .view-btn:hover {
              transform: scale(1.05);
              box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
            .info-box {
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              margin-bottom: 40px;
            }
            .info-box h2 {
              color: #000091;
              margin-bottom: 15px;
            }
            .info-box p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 10px;
            }
            .info-box code {
              background: #f5f5f5;
              padding: 2px 8px;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
              color: #e91e63;
            }
            .footer {
              text-align: center;
              color: white;
              margin-top: 40px;
              opacity: 0.9;
            }
            .feature-list {
              list-style: none;
              padding: 0;
            }
            .feature-list li {
              padding: 8px 0;
              color: #666;
            }
            .feature-list li:before {
              content: "✓";
              color: #4caf50;
              font-weight: bold;
              margin-right: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Email Templates Preview</h1>
              <p>DSFR Design System - React Email Templates</p>
              <div class="badge">Standalone Preview Server</div>
            </div>

            <div class="info-box">
              <h2>🚀 Getting Started</h2>
              <p>This is a standalone preview server for email templates. Choose a template below to preview it.</p>
              <ul class="feature-list">
                <li>DSFR-compliant design system</li>
                <li>Dark mode support</li>
                <li>Mobile responsive</li>
                <li>Email client compatible</li>
              </ul>
            </div>

            <div class="template-grid">
              <a href="/invitation" class="template-card">
                <div class="template-icon">💌</div>
                <div class="template-title">Invitation Email</div>
                <div class="template-desc">
                  Sent to users when they are invited to join the platform.
                  Includes a call-to-action button and security notice.
                </div>
                <div class="template-meta">
                  <span>📱 Responsive</span>
                  <span>🌙 Dark Mode</span>
                </div>
                <span class="view-btn">View Template →</span>
              </a>

              <a href="/password-reset" class="template-card">
                <div class="template-icon">🔒</div>
                <div class="template-title">Password Reset Email</div>
                <div class="template-desc">
                  Sent when users request a password reset. Features secure
                  reset link with expiration notice.
                </div>
                <div class="template-meta">
                  <span>📱 Responsive</span>
                  <span>🌙 Dark Mode</span>
                </div>
                <span class="view-btn">View Template →</span>
              </a>
            </div>

            <div class="info-box">
              <h2>📝 Development Tips</h2>
              <p><strong>Hot Reload:</strong> This server automatically restarts when you save changes to email templates.</p>
              <p><strong>Generate Static Files:</strong> Run <code>bun run preview:emails</code> to create standalone HTML files.</p>
              <p><strong>Documentation:</strong> See <code>emails/README.md</code> for full documentation.</p>
            </div>

            <div class="footer">
              <p>Server running on port ${PORT}</p>
              <p>Press Ctrl+C to stop</p>
            </div>
          </div>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      },
    );
  })
  .get('/invitation', () => {
    // Preview invitation email with sample data
    const html = renderEmail(
      createElement(InvitationEmail, {
        invitationUrl: 'https://example.com/invitation?token=SAMPLE_TOKEN_ABC123',
      }),
    );

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  })
  .get('/password-reset', () => {
    // Preview password reset email with sample data
    const html = renderEmail(
      createElement(PasswordResetEmail, {
        resetUrl: 'https://example.com/reset-password?token=SAMPLE_TOKEN_XYZ789',
      }),
    );

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  })
  .listen(PORT);

console.log('\n📧 Email Preview Server');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`🌐 Server running at: http://localhost:${PORT}`);
console.log(`📋 Available templates:`);
console.log(`   → Invitation: http://localhost:${PORT}/invitation`);
console.log(`   → Password Reset: http://localhost:${PORT}/password-reset`);
console.log('\n💡 Tip: Run with --hot for auto-reload on changes');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
