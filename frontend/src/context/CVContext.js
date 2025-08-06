import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getApiUrl, getAuthHeaders } from '../config/config';

const CVContext = createContext();

export const useCVs = () => {
    const context = useContext(CVContext);
    if (!context) {
        throw new Error('useCVs must be used within a CVProvider');
    }
    return context;
};

export const CVProvider = ({ children }) => {
    const [cvs, setCVs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated && token) {
            loadCVs();
        } else {
            setCVs([]);
        }
    }, [isAuthenticated, token]);

    const loadCVs = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(getApiUrl('/cv'), {
                headers: getAuthHeaders(token)
            });
            const result = await response.json();
            
            if (result.success) {
                setCVs(result.cvs);
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('Error loading CVs:', error);
            setError('Failed to load CVs');
        } finally {
            setLoading(false);
        }
    };

    const createCV = async (cvData, templateId, title) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(getApiUrl('/cv/create'), {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({ cvData, templateId, title })
            });
            const result = await response.json();
            
            if (result.success) {
                await loadCVs(); // Reload the list
                return result.cv;
            } else {
                setError(result.message);
                return null;
            }
        } catch (error) {
            console.error('Error creating CV:', error);
            setError('Failed to create CV');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateCV = async (cvId, cvData, title) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(getApiUrl(`/cv/${cvId}`), {
                method: 'PUT',
                headers: getAuthHeaders(token),
                body: JSON.stringify({ cvData, title })
            });
            const result = await response.json();
            
            if (result.success) {
                await loadCVs(); // Reload the list
                return result.cv;
            } else {
                setError(result.message);
                return null;
            }
        } catch (error) {
            console.error('Error updating CV:', error);
            setError('Failed to update CV');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteCV = async (cvId) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(getApiUrl(`/cv/${cvId}`), {
                method: 'DELETE',
                headers: getAuthHeaders(token)
            });
            const result = await response.json();
            
            if (result.success) {
                await loadCVs(); // Reload the list
                return true;
            } else {
                setError(result.message);
                return false;
            }
        } catch (error) {
            console.error('Error deleting CV:', error);
            setError('Failed to delete CV');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getCV = async (cvId) => {
        try {
            const response = await fetch(getApiUrl(`/cv/${cvId}`), {
                headers: getAuthHeaders(token)
            });
            const result = await response.json();
            
            if (result.success) {
                return result.cv;
            } else {
                setError(result.message);
                return null;
            }
        } catch (error) {
            console.error('Error getting CV:', error);
            setError('Failed to get CV');
            return null;
        }
    };

    const downloadCV = async (cvId) => {
        try {
            const response = await fetch(getApiUrl(`/cv/${cvId}/download`), {
                headers: getAuthHeaders(token)
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cv_${cvId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                return true;
            } else {
                const result = await response.json();
                setError(result.message);
                return false;
            }
        } catch (error) {
            console.error('Error downloading CV:', error);
            setError('Failed to download CV');
            return false;
        }
    };

    const downloadCVJPG = async (cvId) => {
        try {
            const response = await fetch(getApiUrl(`/cv/${cvId}/download-jpg`), {
                headers: getAuthHeaders(token)
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cv_${cvId}.jpg`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                return true;
            } else {
                const result = await response.json();
                setError(result.message);
                return false;
            }
        } catch (error) {
            console.error('Error downloading CV as JPG:', error);
            setError('Failed to download CV as JPG');
            return false;
        }
    };

    const generateCoverLetter = async (cvId) => {
        try {
            const response = await fetch(getApiUrl(`/cv/${cvId}/cover-letter`), {
                method: 'POST',
                headers: getAuthHeaders(token)
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.coverLetter;
            } else {
                const result = await response.json();
                setError(result.message);
                return null;
            }
        } catch (error) {
            console.error('Error generating cover letter:', error);
            setError('Failed to generate cover letter');
            return null;
        }
    };

    const clearError = () => {
        setError('');
    };

    const value = {
        cvs,
        loading,
        error,
        createCV,
        updateCV,
        deleteCV,
        getCV,
        downloadCV,
        downloadCVJPG,
        generateCoverLetter,
        loadCVs,
        clearError
    };

    return (
        <CVContext.Provider value={value}>
            {children}
        </CVContext.Provider>
    );
}; 