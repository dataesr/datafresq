export function hasAuthCookie(): boolean {
  try {
    if (typeof document === 'undefined') return false;

    return document.cookie.split(';').some((cookie) => {
      return cookie.trim().startsWith('fqv_auth=');
    });
  } catch (error) {
    console.warn('[hasAuthCookie] Failed to access document.cookie:', error);
    return false;
  }
}
