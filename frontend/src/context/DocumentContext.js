import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getApiUrl, getAuthHeaders } from '../config/config';

const DocumentContext = createContext();

export const useDocuments = () => {
    const context = useContext(DocumentContext);
    if (!context) {
        throw new Error('useDocuments must be used within a DocumentProvider');
    }
    return context;
};

export const DocumentProvider = ({ children }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token, isAuthenticated } = useAuth();

    // Load documents when user is authenticated
    useEffect(() => {
        if (isAuthenticated && token) {
            loadDocuments();
        } else {
            setDocuments([]);
        }
    }, [isAuthenticated, token]);

    const loadDocuments = async () => {
        if (!token) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(getApiUrl('/documents'), {
                headers: getAuthHeaders(token)
            });

            const data = await response.json();

            if (data.success) {
                setDocuments(data.documents);
            } else {
                setError(data.message || 'Failed to load documents');
            }
        } catch (error) {
            console.error('Load documents error:', error);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const uploadDocument = async (file) => {
        if (!token) {
            throw new Error('Not authenticated');
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('document', file);

            const response = await fetch(getApiUrl('/documents/upload'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setDocuments(prev => [data.document, ...prev]);
                return { success: true, document: data.document };
            } else {
                setError(data.message || 'Upload failed');
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError('Network error occurred');
            return { success: false, message: 'Network error occurred' };
        } finally {
            setLoading(false);
        }
    };

    const deleteDocument = async (documentId) => {
        if (!token) {
            throw new Error('Not authenticated');
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(getApiUrl(`/documents/${documentId}`), {
                method: 'DELETE',
                headers: getAuthHeaders(token)
            });

            const data = await response.json();

            if (data.success) {
                setDocuments(prev => prev.filter(doc => doc.documentId !== documentId));
                return { success: true };
            } else {
                setError(data.message || 'Delete failed');
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Delete error:', error);
            setError('Network error occurred');
            return { success: false, message: 'Network error occurred' };
        } finally {
            setLoading(false);
        }
    };

    const getDocument = async (documentId) => {
        if (!token) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(getApiUrl(`/documents/${documentId}`), {
                headers: getAuthHeaders(token)
            });

            const data = await response.json();

            if (data.success) {
                return { success: true, document: data.document };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Get document error:', error);
            return { success: false, message: 'Network error occurred' };
        }
    };

    const clearError = () => {
        setError('');
    };

    const value = {
        documents,
        loading,
        error,
        uploadDocument,
        deleteDocument,
        getDocument,
        loadDocuments,
        clearError
    };

    return (
        <DocumentContext.Provider value={value}>
            {children}
        </DocumentContext.Provider>
    );
}; 