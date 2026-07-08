const normalizeBaseUrl = (value) => value.replace(/\/+$/, "");

export const getApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL?.trim();

  if (configured) {
    return normalizeBaseUrl(configured);
  }

  if (import.meta.env.DEV) {
    return "http://localhost:5000";
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return normalizeBaseUrl(window.location.origin);
  }

  return "http://localhost:5000";
};

export const getApiUrl = (path = "") => {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};