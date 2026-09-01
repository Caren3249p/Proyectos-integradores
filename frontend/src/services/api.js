const API_BASE = 'http://localhost:3000/api';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('upb_token');
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return headers;
};

export const api = {
  async get(endpoint) {
    try {
      const res = await fetch(API_BASE + endpoint, {
        method: 'GET',
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      console.warn('[API GET ' + endpoint + '] Fallback:', err);
      return null;
    }
  },

  async post(endpoint, body, isFormData = false) {
    try {
      const res = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: getHeaders(isFormData),
        body: isFormData ? body : JSON.stringify(body)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API POST ' + endpoint + '] Fallback:', err);
      return null;
    }
  },

  async put(endpoint, body) {
    try {
      const res = await fetch(API_BASE + endpoint, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API PUT ' + endpoint + '] Fallback:', err);
      return null;
    }
  },

  async patch(endpoint, body = {}) {
    try {
      const res = await fetch(API_BASE + endpoint, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API PATCH ' + endpoint + '] Fallback:', err);
      return null;
    }
  },

  async delete(endpoint) {
    try {
      const res = await fetch(API_BASE + endpoint, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      console.warn('[API DELETE ' + endpoint + '] Fallback:', err);
      return null;
    }
  }
};