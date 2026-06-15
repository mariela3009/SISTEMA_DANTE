export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('eva_token');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(url, { ...options, headers });

  // Handle Token Expiration / Silent Refresh
  if (response.status === 401 && token) {
    const refreshUrl = `${API_BASE_URL}/api/refresh`;
    
    // Only attempt refresh if we aren't already trying to refresh
    if (url !== refreshUrl) {
      const refreshRes = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('eva_token', data.access_token);
        }
        
        // Retry original request with new token
        headers.set('Authorization', `Bearer ${data.access_token}`);
        response = await fetch(url, { ...options, headers });
      } else {
        // Refresh failed, force logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('eva_token');
          localStorage.removeItem('eva_user');
          window.location.href = '/';
        }
      }
    }
  }

  return response;
};
