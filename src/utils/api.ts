import { API_URL } from '@/utils/config';

function buildApiError(message: string, status?: number) {
  return new Error(status ? `Error ${status}: ${message}` : message);
}

export function getApiUrl(path: string) {
  if (!API_URL) {
    throw buildApiError(
      'Missing NEXT_PUBLIC_TESTMATE_API_URL. Check TestMateAI-frontend/.env and restart the Next.js server.'
    );
  }

  return `${API_URL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const rawBody = await response.text();

  if (!contentType.includes('application/json')) {
    const looksLikeHtml = rawBody.trim().startsWith('<!DOCTYPE') || rawBody.trim().startsWith('<html');
    const message = looksLikeHtml
      ? 'API returned HTML instead of JSON. Check NEXT_PUBLIC_TESTMATE_API_URL, confirm the backend is running, and restart the frontend after changing .env.'
      : 'API returned a non-JSON response.';

    throw buildApiError(message, response.status);
  }

  const data = rawBody ? (JSON.parse(rawBody) as T) : ({} as T);

  if (!response.ok) {
    const errorMessage =
      (data as { message?: string; detail?: { message?: string; error?: string }; error?: string }).message ||
      (data as { detail?: { message?: string; error?: string } }).detail?.message ||
      (data as { detail?: { message?: string; error?: string } }).detail?.error ||
      (data as { error?: string }).error ||
      'Request failed';

    throw buildApiError(errorMessage, response.status);
  }

  return data;
}
