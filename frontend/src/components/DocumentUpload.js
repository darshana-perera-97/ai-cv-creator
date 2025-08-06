import React, { useState, useRef } from 'react';
import { useDocuments } from '../context/DocumentContext';

const DocumentUpload = () => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);
    const { uploadDocument, loading, error, clearError } = useDocuments();

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file) => {
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Only PDF, DOCX, and TXT files are allowed.');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size too large. Maximum size is 10MB.');
            return;
        }

        clearError();
        setUploadProgress(0);

        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);

            const result = await uploadDocument(file);
            
            clearInterval(progressInterval);
            setUploadProgress(100);

            if (result.success) {
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                
                // Show success message
                setTimeout(() => {
                    setUploadProgress(0);
                }, 1000);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadProgress(0);
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title">
                    <i className="bi bi-cloud-upload me-2"></i>
                    Upload Document
                </h5>
                
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <div
                    className={`upload-area ${dragActive ? 'drag-active' : ''} ${loading ? 'uploading' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={openFileDialog}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="d-none"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileInput}
                        disabled={loading}
                    />
                    
                    <div className="upload-content">
                        <i className="bi bi-cloud-upload upload-icon"></i>
                        <h6 className="mt-3">Drop your document here</h6>
                        <p className="text-muted">or click to browse</p>
                        <small className="text-muted">
                            Supported formats: PDF, DOCX, TXT (Max 10MB)
                        </small>
                    </div>

                    {loading && uploadProgress > 0 && (
                        <div className="upload-progress">
                            <div className="progress">
                                <div 
                                    className="progress-bar" 
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <small className="text-muted mt-2">
                                {uploadProgress === 100 ? 'Processing...' : `Uploading... ${uploadProgress}%`}
                            </small>
                        </div>
                    )}
                </div>

                <div className="mt-3">
                    <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Documents will be processed to extract text content for CV generation.
                    </small>
                </div>
            </div>

            <style jsx>{`
                .upload-area {
                    border: 2px dashed #dee2e6;
                    border-radius: 8px;
                    padding: 2rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    min-height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .upload-area:hover {
                    border-color: #0d6efd;
                    background-color: #f8f9fa;
                }

                .upload-area.drag-active {
                    border-color: #0d6efd;
                    background-color: #e7f3ff;
                }

                .upload-area.uploading {
                    pointer-events: none;
                    opacity: 0.7;
                }

                .upload-icon {
                    font-size: 3rem;
                    color: #6c757d;
                }

                .upload-content {
                    z-index: 1;
                }

                .upload-progress {
                    position: absolute;
                    bottom: 1rem;
                    left: 1rem;
                    right: 1rem;
                    z-index: 2;
                }

                .progress {
                    height: 8px;
                    border-radius: 4px;
                    background-color: #e9ecef;
                }

                .progress-bar {
                    background-color: #0d6efd;
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }
            `}</style>
        </div>
    );
};

export default DocumentUpload; 