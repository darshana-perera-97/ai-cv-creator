import React, { useState } from 'react';
import { useCVs } from '../context/CVContext';
import { useNavigate } from 'react-router-dom';

const CVList = () => {
    const { cvs, loading, error, deleteCV, downloadCV, downloadCVJPG, generateCoverLetter } = useCVs();
    const [deletingCV, setDeletingCV] = useState(null);
    const [downloadingCV, setDownloadingCV] = useState(null);
    const [downloadingJPG, setDownloadingJPG] = useState(null);
    const [coverLetters, setCoverLetters] = useState({});
    const [generatingCoverLetter, setGeneratingCoverLetter] = useState(null);
    const [copiedCoverLetter, setCopiedCoverLetter] = useState(null);
    const navigate = useNavigate();

    const handleDelete = async (cvId) => {
        if (window.confirm('Are you sure you want to delete this CV?')) {
            setDeletingCV(cvId);
            const success = await deleteCV(cvId);
            if (success) {
                // CV deleted successfully
            }
            setDeletingCV(null);
        }
    };

    const handleDownload = async (cvId) => {
        setDownloadingCV(cvId);
        const success = await downloadCV(cvId);
        setDownloadingCV(null);
        if (success) {
            // Download started successfully
        }
    };

    const handleDownloadJPG = async (cvId) => {
        setDownloadingJPG(cvId);
        const success = await downloadCVJPG(cvId);
        setDownloadingJPG(null);
        if (success) {
            // Download started successfully
        }
    };

    const handleGenerateCoverLetter = async (cvId) => {
        setGeneratingCoverLetter(cvId);
        const coverLetter = await generateCoverLetter(cvId);
        setGeneratingCoverLetter(null);
        
        if (coverLetter) {
            setCoverLetters(prev => ({
                ...prev,
                [cvId]: coverLetter
            }));
        }
    };

    const handleCopyCoverLetter = async (cvId) => {
        const coverLetter = coverLetters[cvId];
        if (coverLetter) {
            try {
                await navigator.clipboard.writeText(coverLetter);
                setCopiedCoverLetter(cvId);
                setTimeout(() => setCopiedCoverLetter(null), 2000);
            } catch (error) {
                console.error('Failed to copy cover letter:', error);
            }
        }
    };

    const handleEdit = (cvId) => {
        navigate(`/dashboard/edit-cv/${cvId}`);
    };

    const handleView = (cvId) => {
        navigate(`/dashboard/view-cv/${cvId}`);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTemplateName = (templateId) => {
        const templates = {
            'modern': 'Modern',
            'creative': 'Creative',
            'minimal': 'Minimal',
            'executive': 'Executive'
        };
        return templates[templateId] || 'Unknown';
    };

    const getCVTypeBadge = (cvType) => {
        if (cvType === 'job-related') {
            return (
                <span className="badge bg-success me-1">
                    <i className="bi bi-briefcase me-1"></i>
                    Job Related
                </span>
            );
        } else {
            return (
                <span className="badge bg-primary me-1">
                    <i className="bi bi-person-workspace me-1"></i>
                    Custom Generated
                </span>
            );
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading your CVs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
            </div>
        );
    }

    if (cvs.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="bi bi-file-earmark-text display-1 text-muted"></i>
                <h4 className="mt-3 text-muted">No CVs Found</h4>
                <p className="text-muted">You haven't created any CVs yet.</p>
                <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/dashboard/cv-templates')}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Your First CV
                </button>
            </div>
        );
    }

    return (
        <div className="cv-list">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">
                    <i className="bi bi-file-earmark-text me-2"></i>
                    My CVs ({cvs.length})
                </h3>
                <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/dashboard/cv-templates')}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Create New CV
                </button>
            </div>

            <div className="row">
                {cvs.map((cv) => (
                    <div key={cv.cvId} className="col-md-6 col-lg-4 mb-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-header bg-light">
                                <div className="d-flex justify-content-between align-items-start">
                                    <h6 className="card-title mb-0 text-truncate" title={cv.title}>
                                        {cv.title}
                                    </h6>
                                    <span className="badge bg-secondary">
                                        {getTemplateName(cv.templateId)}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    {getCVTypeBadge(cv.cvType)}
                                </div>
                            </div>
                            
                            <div className="card-body">
                                <div className="text-muted small mb-3">
                                    <div>
                                        <i className="bi bi-calendar me-1"></i>
                                        Created: {formatDate(cv.createdAt)}
                                    </div>
                                    <div>
                                        <i className="bi bi-clock me-1"></i>
                                        Updated: {formatDate(cv.updatedAt)}
                                    </div>
                                </div>

                                {/* Cover Letter Section */}
                                {coverLetters[cv.cvId] && (
                                    <div className="mb-3">
                                        <h6 className="text-success">
                                            <i className="bi bi-envelope me-1"></i>
                                            AI Generated Cover Letter
                                        </h6>
                                        <div className="bg-light p-2 rounded small" style={{maxHeight: '100px', overflow: 'hidden'}}>
                                            {coverLetters[cv.cvId].substring(0, 150)}...
                                        </div>
                                        <div className="mt-2">
                                            <button
                                                className="btn btn-sm btn-outline-success"
                                                onClick={() => handleCopyCoverLetter(cv.cvId)}
                                                title="Copy Cover Letter"
                                            >
                                                {copiedCoverLetter === cv.cvId ? (
                                                    <>
                                                        <i className="bi bi-check-circle me-1"></i>
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-clipboard me-1"></i>
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="btn-group-vertical w-100" role="group">
                                    <div className="btn-group w-100 mb-2" role="group">
                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => handleView(cv.cvId)}
                                            title="View CV"
                                        >
                                            <i className="bi bi-eye me-1"></i>
                                            View
                                        </button>
                                        
                                        <button
                                            className="btn btn-outline-warning btn-sm"
                                            onClick={() => handleEdit(cv.cvId)}
                                            title="Edit CV"
                                        >
                                            <i className="bi bi-pencil me-1"></i>
                                            Edit
                                        </button>
                                    </div>

                                    <div className="btn-group w-100 mb-2" role="group">
                                        <button
                                            className="btn btn-outline-success btn-sm"
                                            onClick={() => handleDownload(cv.cvId)}
                                            disabled={downloadingCV === cv.cvId}
                                            title="Download PDF"
                                        >
                                            {downloadingCV === cv.cvId ? (
                                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                            ) : (
                                                <i className="bi bi-file-pdf me-1"></i>
                                            )}
                                            PDF
                                        </button>
                                        
                                        <button
                                            className="btn btn-outline-info btn-sm"
                                            onClick={() => handleDownloadJPG(cv.cvId)}
                                            disabled={downloadingJPG === cv.cvId}
                                            title="Download JPG"
                                        >
                                            {downloadingJPG === cv.cvId ? (
                                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                            ) : (
                                                <i className="bi bi-file-image me-1"></i>
                                            )}
                                            JPG
                                        </button>
                                    </div>

                                    <div className="btn-group w-100 mb-2" role="group">
                                        {!coverLetters[cv.cvId] ? (
                                            <button
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => handleGenerateCoverLetter(cv.cvId)}
                                                disabled={generatingCoverLetter === cv.cvId}
                                                title="Generate Cover Letter"
                                            >
                                                {generatingCoverLetter === cv.cvId ? (
                                                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                ) : (
                                                    <i className="bi bi-envelope me-1"></i>
                                                )}
                                                Generate Cover Letter
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => setCoverLetters(prev => {
                                                    const newState = { ...prev };
                                                    delete newState[cv.cvId];
                                                    return newState;
                                                })}
                                                title="Hide Cover Letter"
                                            >
                                                <i className="bi bi-eye-slash me-1"></i>
                                                Hide Cover Letter
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDelete(cv.cvId)}
                                        disabled={deletingCV === cv.cvId}
                                        title="Delete CV"
                                    >
                                        {deletingCV === cv.cvId ? (
                                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                        ) : (
                                            <i className="bi bi-trash me-1"></i>
                                        )}
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CVList; 