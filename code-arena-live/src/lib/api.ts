
export const API_BASE = import.meta.env.VITE_API_URL || '';

// Internal helper for fetch wrapper
async function request(path: string, options: RequestInit = {}) {
  const base = import.meta.env.VITE_API_URL || '';
  const url = path.startsWith('http') ? path : (base ? `${base}${path}` : path);

  // Add default headers if needed (e.g. Content-Type for JSON)
  const defaultHeaders: Record<string, string> = {};

  // If we have a token in localStorage, attach it automatically
  // This simplifies auth handling across components
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // If body is an object (and not FormData), stringify it and set Content-Type
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const finalOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  return fetch(url, finalOptions);
}

// Support for api(path, options) usage if any remains, 
// though we see mostly api.get/post in inspected files.
export const api = Object.assign(
  (path: string, options?: RequestInit) => request(path, options),
  {
    get: (path: string, options?: RequestInit) => request(path, { ...options, method: 'GET' }),
    post: (path: string, body?: any, options?: RequestInit) => request(path, { ...options, method: 'POST', body }),
    put: (path: string, body?: any, options?: RequestInit) => request(path, { ...options, method: 'PUT', body }),
    delete: (path: string, options?: RequestInit) => request(path, { ...options, method: 'DELETE' }),
    patch: (path: string, body?: any, options?: RequestInit) => request(path, { ...options, method: 'PATCH', body }),
  }
);
