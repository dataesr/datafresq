/**
 * Email Render Utility
 *
 * Provides functions to render React email components to HTML strings
 * for use with transactional email services like Brevo.
 */

import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Render a React email component to an HTML string.
 *
 * Uses React's renderToStaticMarkup which produces clean HTML without
 * React-specific data attributes, perfect for email content.
 *
 * This function also adds the required DOCTYPE and xmlns attributes
 * for proper email client compatibility.
 *
 * @param element - The React element to render
 * @returns The rendered HTML string with DOCTYPE and proper email attributes
 *
 * @example
 * ```ts
 * import { renderEmail } from '~/emails/render';
 * import { InvitationEmail } from '~/emails/templates';
 *
 * const html = renderEmail(
 *   <InvitationEmail invitationUrl="https://example.com/invite?token=abc" />
 * );
 * ```
 */
export function renderEmail(element: ReactElement): string {
  let markup = renderToStaticMarkup(element);

  // Add xmlns attributes to the html tag for email client compatibility
  // These are required for proper rendering in Outlook and other email clients
  markup = markup.replace(
    '<html lang="fr">',
    '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="fr">',
  );

  return `<!DOCTYPE html>${markup}`;
}

/**
 * Render a React email component to an HTML string without DOCTYPE.
 *
 * Useful when you need just the HTML content without the doctype declaration,
 * for example when embedding in another template or for testing.
 *
 * @param element - The React element to render
 * @returns The rendered HTML string without DOCTYPE
 */
export function renderEmailContent(element: ReactElement): string {
  return renderToStaticMarkup(element);
}
