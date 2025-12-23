export function hasAuthCookie(): boolean {
  if (typeof document === 'undefined') return false;

  return document.cookie.split(';').some((cookie) => {
    return cookie.trim().startsWith('fqv_auth=');
  });
}
