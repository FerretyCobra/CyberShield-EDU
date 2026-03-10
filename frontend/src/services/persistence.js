const HISTORY_KEY = 'cybershield_scan_history';

export const persistenceService = {
    saveScan: (type, result) => {
        try {
            const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            const newEntry = {
                id: Date.now(),
                type,
                timestamp: new Date().toISOString(),
                prediction: result.prediction,
                confidence: result.confidence || result.scam_score,
                summary: result.reasoning?.[0] || 'No specific reasoning found.'
            };

            // Keep only last 10 scans
            const updatedHistory = [newEntry, ...history].slice(0, 10);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
            return updatedHistory;
        } catch (err) {
            console.error('Failed to save scan to history:', err);
            return [];
        }
    },

    getHistory: () => {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        } catch (err) {
            return [];
        }
    },

    clearHistory: () => {
        localStorage.removeItem(HISTORY_KEY);
    }
};
