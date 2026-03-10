import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const detectionApi = {
    analyzeText: (text) => api.post('/detect/text', { text }),
    analyzeUrl: (url) => api.post('/detect/url', { url }),
    analyzePdf: (formData) => api.post('/detect/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    analyzeImage: (formData) => api.post('/detect/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const awarenessApi = {
    getContent: () => axios.get('http://localhost:8080/awareness'),
};

export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    getKeywords: () => api.get('/admin/keywords'),
    updateKeywords: (keywords) => api.post('/admin/keywords', { keywords }),
    updateResources: (content) => api.post('/admin/resources', { content }),
};

export default api;
