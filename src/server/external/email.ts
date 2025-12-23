import { renderEmail } from 'emails/render';
import { InvitationEmail } from 'emails/templates/InvitationEmail';
import { PasswordResetEmail } from 'emails/templates/PasswordResetEmail';
import { createElement } from 'react';
import { config } from '~/config';

interface EmailRecipient {
  email: string;
  name?: string;
}

interface BrevoEmailWithHtmlParams {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  sender?: {
    name: string;
    email: string;
  };
}

const DEFAULT_SENDER = {
  name: "dataesr",
  email: 'dataesr@enseignementsup.gouv.fr',
};

async function sendBrevoEmailWithHtml(data: BrevoEmailWithHtmlParams): Promise<Response> {
  const payload = {
    to: data.to,
    subject: data.subject,
    htmlContent: data.htmlContent,
    sender: data.sender || DEFAULT_SENDER,
  };

  const headers: Record<string, string> = {
    'api-key': config.brevo.apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const body = JSON.stringify(payload);
  if (!config.isProduction) {
    console.log('[Email] Sending with HTML content, subject:', data.subject);
    console.log('[Email] Recipients:', data.to.map((r) => r.email).join(', '));
    headers['X-Sib-Sandbox'] = 'drop';
  }


  return fetch(config.brevo.url, { method: 'POST', headers, body });
}

export async function sendInvitationEmail(email: string, invitationUrl: string): Promise<Response> {
  const htmlContent = renderEmail(createElement(InvitationEmail, { invitationUrl }));

  return sendBrevoEmailWithHtml({
    to: [{ email }],
    subject: 'Invitation à rejoindre la plateforme',
    htmlContent,
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<Response> {
  const htmlContent = renderEmail(createElement(PasswordResetEmail, { resetUrl }));

  return sendBrevoEmailWithHtml({
    to: [{ email }],
    subject: 'Réinitialisation de votre mot de passe',
    htmlContent,
  });
}
