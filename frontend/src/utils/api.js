// API URL helper for Render deployment
const getApiBaseUrl = () => {
  const apiHost = process.env.REACT_APP_API_URL || 'localhost:5000';
  const prefix = process.env.REACT_APP_API_URL_PREFIX || 'http://';
  const suffix = process.env.REACT_APP_API_URL_SUFFIX || '';
  
  // Nếu host đã bao gồm http/https, không thêm prefix
  if (apiHost.startsWith('http://') || apiHost.startsWith('https://')) {
    return `${apiHost}${suffix}`;
  }
  
  return `${prefix}${apiHost}${suffix}`;
};

export const API_BASE_URL = getApiBaseUrl();

// Hàm helper để gọi API
export const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API request failed with status ${response.status}`);
  }
  
  return response.json();
};

export default {
  API_BASE_URL,
  fetchApi,
}; 