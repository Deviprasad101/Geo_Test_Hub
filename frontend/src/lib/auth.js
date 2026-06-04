const AUTH_KEY = "geoaudit_auth";

export function isAuthenticated() {
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function login(email) {
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem("geoaudit_user", email || "user@geoaudit.local");
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem("geoaudit_user");
}

export function getUserEmail() {
  return localStorage.getItem("geoaudit_user") || "";
}
