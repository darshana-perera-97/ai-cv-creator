// Backend API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://69.197.187.24:5050/api',
    // BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5050/api',
    ENDPOINTS: {
        AUTH: {
            REGISTER: '/auth/register',
            LOGIN: '/auth/login',
            PROFILE: '/auth/profile',
            PLAN_INFO: '/auth/plan-info'
        },
        DOCUMENTS: {
            UPLOAD: '/documents/upload',
            GET_ALL: '/documents',
            GET_ONE: '/documents/:documentId',
            DELETE: '/documents/:documentId'
        },
        CV: {
            EXTRACT_FROM_DOCUMENTS: '/cv/extract-from-documents',
            ANALYZE_URL: '/cv/analyze-url',
            GENERATE_FROM_URL: '/cv/generate-from-url',
            CREATE: '/cv/create',
            GET_ALL: '/cv',
            GET_ONE: '/cv/:cvId',
            UPDATE: '/cv/:cvId',
            DELETE: '/cv/:cvId',
            DOWNLOAD: '/cv/:cvId/download',
            DOWNLOAD_JPG: '/cv/:cvId/download-jpg',
            COVER_LETTER: '/cv/:cvId/cover-letter'
        },
        HEALTH: '/health'
    },
    TIMEOUT: 10000, // 10 seconds
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers with token
export const getAuthHeaders = (token) => {
    return {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`
    };
}; 