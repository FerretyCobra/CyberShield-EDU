// api.js - Vanilla JS wrapper for FastAPI backend

const API_BASE_URL = 'http://localhost:8000/api/v1';

const detectionApi = {
    /**
     * Analyze a text message for scam indicators.
     * @param {string} text - The text to analyze.
     * @returns {Promise<Object>} The analysis result.
     */
    async analyzeText(text) {
        try {
            const response = await fetch(`${API_BASE_URL}/detect/text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Text analysis failed:', error);
            throw error;
        }
    },

    /**
     * Analyze a URL for phishing indicators.
     * @param {string} url - The URL to analyze.
     * @returns {Promise<Object>} The analysis result.
     */
    async analyzeUrl(url) {
        try {
            const response = await fetch(`${API_BASE_URL}/detect/url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('URL analysis failed:', error);
            throw error;
        }
    },

    /**
     * Analyze a PDF document for scam indicators.
     * @param {FormData} formData - The FormData containing the file.
     * @returns {Promise<Object>} The analysis result.
     */
    async analyzePdf(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/detect/pdf`, {
                method: 'POST',
                // Note: Do not set Content-Type for FormData, fetch sets it automatically with boundary
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('PDF analysis failed:', error);
            throw error;
        }
    },

    /**
     * Analyze an Image for scam intent (OCR).
     * @param {FormData} formData - The FormData containing the file.
     * @returns {Promise<Object>} The analysis result.
     */
    async analyzeImage(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/detect/image`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Image analysis failed:', error);
            throw error;
        }
    }
};

const awarenessApi = {
    /**
     * Fetch the educational content.
     */
    async getContent() {
        try {
            const response = await fetch(`${API_BASE_URL}/awareness`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch education content:', error);
            throw error;
        }
    }
};

const adminApi = {
    async getStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/system/stats`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
            throw error;
        }
    },
    async getKeywords() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/keywords`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch admin keywords:', error);
            throw error;
        }
    },
    async addKeyword(keyword) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/keywords`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ keyword }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to add admin keyword:', error);
            throw error;
        }
    }
};

// Export to global scope
window.api = {
    detection: detectionApi,
    awareness: awarenessApi,
    admin: adminApi
};
