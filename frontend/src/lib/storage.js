const TOKEN_KEY = "tjm_token";
const THEME_KEY = "tjm_theme"; // "light" | "dark" | "system"

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || "system";
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

