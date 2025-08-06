import React, { useState } from 'react';
import { useDocuments } from '../context/DocumentContext';

const DocumentList = () => {
    const { documents, loading, deleteDocument } = useDocuments();
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);

    const handleDeleteClick = (document) => {
        setDocumentToDelete(document);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (documentToDelete) {
            await deleteDocument(documentToDelete.documentId);
            setShowDeleteModal(false);
            setDocumentToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDocumentToDelete(null);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'application/pdf':
                return 'bi-file-pdf';
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return 'bi-file-word';
            case 'text/plain':
                return 'bi-file-text';
            default:
                return 'bi-file';
        }
    };

    const getFileTypeName = (fileType) => {
        switch (fileType) {
            case 'application/pdf':
                return 'PDF';
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return 'DOCX';
            case 'text/plain':
                return 'TXT';
            default:
                return 'Unknown';
        }
    };

    const truncateText = (text, maxLength = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <div className="card">
                <div className="card-body text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading documents...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">
                        <i className="bi bi-folder me-2"></i>
                        My Documents ({documents.length})
                    </h5>

                    {documents.length === 0 ? (
                        <div className="text-center py-4">
                            <i className="bi bi-folder-x text-muted" style={{ fontSize: '3rem' }}></i>
                            <p className="mt-3 text-muted">No documents uploaded yet.</p>
                            <p className="text-muted small">Upload your first document to get started!</p>
                        </div>
                    ) : (
                        <div className="row">
                            {documents.map((document) => (
                                <div key={document.documentId} className="col-md-6 col-lg-4 mb-3">
                                    <div className="card h-100 document-card">
                                        <div className="card-body">
                                            <div className="d-flex align-items-start justify-content-between">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <i className={`bi ${getFileIcon(document.fileType)} text-primary me-2`}></i>
                                                        <h6 className="card-title mb-0 text-truncate" title={document.originalName}>
                                                            {document.originalName}
                                                        </h6>
                                                    </div>
                                                    
                                                    <div className="mb-2">
                                                        <small className="text-muted">
                                                            <i className="bi bi-file-earmark me-1"></i>
                                                            {getFileTypeName(document.fileType)} • {formatFileSize(document.fileSize)}
                                                        </small>
                                                    </div>
                                                    
                                                    <div className="mb-2">
                                                        <small className="text-muted">
                                                            <i className="bi bi-calendar me-1"></i>
                                                            {formatDate(document.uploadedAt)}
                                                        </small>
                                                    </div>

                                                    {document.extractedText && (
                                                        <div className="mb-3">
                                                            <small className="text-muted">
                                                                <strong>Extracted Text Preview:</strong>
                                                            </small>
                                                            <p className="small text-muted mt-1">
                                                                {truncateText(document.extractedText, 80)}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-outline-primary flex-fill"
                                                    onClick={() => setSelectedDocument(document)}
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    View
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDeleteClick(document)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Document Detail Modal */}
            {selectedDocument && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className={`bi ${getFileIcon(selectedDocument.fileType)} me-2`}></i>
                                    {selectedDocument.originalName}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedDocument(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>File Type:</strong> {getFileTypeName(selectedDocument.fileType)}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>File Size:</strong> {formatFileSize(selectedDocument.fileSize)}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Uploaded:</strong> {formatDate(selectedDocument.uploadedAt)}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Document ID:</strong> <small className="text-muted">{selectedDocument.documentId}</small>
                                    </div>
                                </div>
                                
                                {selectedDocument.extractedText && (
                                    <div>
                                        <h6>Extracted Text Content:</h6>
                                        <div className="border rounded p-3 bg-light" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                                                {selectedDocument.extractedText}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedDocument(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-danger">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    Delete Document
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleDeleteCancel}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete <strong>"{documentToDelete?.originalName}"</strong>?</p>
                                <p className="text-muted small">This action cannot be undone.</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleDeleteCancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDeleteConfirm}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </div>
            )}
        </>
    );
};

export default DocumentList; 