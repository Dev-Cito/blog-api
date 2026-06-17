import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api',
  withCredentials: true,
});

function getCsrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrfToken='))
    ?.split('=')[1];
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

api.interceptors.request.use((config) => {
  if (!SAFE_METHODS.has((config.method ?? 'GET').toUpperCase())) {
    const token = getCsrfToken();
    if (token) config.headers['X-CSRF-Token'] = token;
  }
  return config;
});

let isRefreshing = false;
let waitingQueue: Array<() => void> = [];

const drainQueue = () => {
  waitingQueue.forEach((resolve) => resolve());
  waitingQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    const is401 = error.response?.status === 401;
    // Never try to refresh if the failing request was itself a refresh/login/register
    const skipRefresh = ['/auth/refresh', '/auth/login', '/auth/register'].some(
      (path) => original?.url?.includes(path)
    );

    if (is401 && !original._retry && !skipRefresh) {
      original._retry = true;

      if (isRefreshing) {
        // Another request is already refreshing — queue this one
        return new Promise((resolve, reject) => {
          waitingQueue.push(() => {
            api(original).then(resolve).catch(reject);
          });
        });
      }

      isRefreshing = true;
      try {
        await api.post('/auth/refresh');
        drainQueue();
        return api(original);
      } catch {
        waitingQueue = [];
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
