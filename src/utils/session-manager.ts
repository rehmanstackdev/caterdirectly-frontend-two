// SSOT for logout state management
// Poison pill pattern: marks intentional logouts to prevent auto sign-in
const LOGOUT_MARKER_KEY = 'app_logout_marker';

export function markLoggedOut() {
  // Set a marker that survives logout
  sessionStorage.setItem(LOGOUT_MARKER_KEY, Date.now().toString());
}

export function wasLoggedOut(): boolean {
  return sessionStorage.getItem(LOGOUT_MARKER_KEY) !== null;
}

export function clearLogoutMarker() {
  sessionStorage.removeItem(LOGOUT_MARKER_KEY);
}
