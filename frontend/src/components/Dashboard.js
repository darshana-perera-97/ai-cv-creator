import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import CVList from './CVList';

const Dashboard = () => {
    const { user, getPlanInfo } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [showFloatingMenu, setShowFloatingMenu] = useState(false);
    const [planInfo, setPlanInfo] = useState(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const fetchPlanInfo = async () => {
            if (user) {
                const result = await getPlanInfo();
                if (result.success) {
                    setPlanInfo(result.planInfo);
                }
            }
        };
        fetchPlanInfo();
    }, [user, getPlanInfo]);

    const handleFloatingMenuToggle = () => {
        setShowFloatingMenu(!showFloatingMenu);
    };

    const handleMouseEnter = () => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setShowFloatingMenu(true);
    };

    const handleMouseLeave = () => {
        // Set a timeout to hide the menu after 5 seconds
        timeoutRef.current = setTimeout(() => {
            setShowFloatingMenu(false);
        }, 5000);
    };

    const handleCreateDefaultCV = () => {
        // Navigate to CV template selection page
        navigate('/dashboard/cv-templates');
    };

    const handleCreateCVForURL = () => {
        // Navigate to URL-based CV creation page
        navigate('/dashboard/create-cv-url');
    };

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <div className="card shadow">
                        <div className="card-body">
                            <h1 className="card-title text-center mb-4">
                                Welcome to AI CV Creator Dashboard
                            </h1>

                            {/* Navigation Tabs */}
                            <ul className="nav nav-tabs mb-4" id="dashboardTabs" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('overview')}
                                    >
                                        <i className="bi bi-house me-2"></i>
                                        Overview
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('documents')}
                                    >
                                        <i className="bi bi-folder me-2"></i>
                                        Documents
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('upload')}
                                    >
                                        <i className="bi bi-cloud-upload me-2"></i>
                                        Upload
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={`nav-link ${activeTab === 'cvs' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('cvs')}
                                    >
                                        <i className="bi bi-file-earmark-text me-2"></i>
                                        View My CVs
                                    </button>
                                </li>
                            </ul>

                            {/* Tab Content */}
                            <div className="tab-content">
                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div className="tab-pane fade show active">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="card bg-light">
                                                    <div className="card-body">
                                                        <h5 className="card-title">
                                                            <i className="bi bi-person-circle me-2"></i>
                                                            User Information
                                                        </h5>
                                                        <div className="row">
                                                            <div className="col-sm-4">
                                                                <strong>Name:</strong>
                                                            </div>
                                                            <div className="col-sm-8">
                                                                {user?.firstName} {user?.lastName}
                                                            </div>
                                                        </div>
                                                        <div className="row mt-2">
                                                            <div className="col-sm-4">
                                                                <strong>Username:</strong>
                                                            </div>
                                                            <div className="col-sm-8">
                                                                {user?.username}
                                                            </div>
                                                        </div>
                                                        <div className="row mt-2">
                                                            <div className="col-sm-4">
                                                                <strong>Email:</strong>
                                                            </div>
                                                            <div className="col-sm-8">
                                                                {user?.email}
                                                            </div>
                                                        </div>
                                                        <div className="row mt-2">
                                                            <div className="col-sm-4">
                                                                <strong>User ID:</strong>
                                                            </div>
                                                            <div className="col-sm-8">
                                                                <small className="text-muted">{user?.userId}</small>
                                                            </div>
                                                        </div>
                                                        <div className="row mt-2">
                                                            <div className="col-sm-4">
                                                                <strong>Member Since:</strong>
                                                            </div>
                                                            <div className="col-sm-8">
                                                                {new Date(user?.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        {planInfo && (
                                                            <>
                                                                <div className="row mt-2">
                                                                    <div className="col-sm-4">
                                                                        <strong>Plan:</strong>
                                                                    </div>
                                                                    <div className="col-sm-8">
                                                                        <span className={`badge ${planInfo.plan === 'Basic' ? 'bg-primary' : planInfo.plan === 'Pro' ? 'bg-success' : 'bg-secondary'}`}>
                                                                            {planInfo.plan}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="row mt-2">
                                                                    <div className="col-sm-4">
                                                                        <strong>CV Usage:</strong>
                                                                    </div>
                                                                    <div className="col-sm-8">
                                                                        <div className="progress" style={{height: '20px'}}>
                                                                            <div 
                                                                                className={`progress-bar ${planInfo.remaining > 0 ? 'bg-success' : 'bg-danger'}`}
                                                                                style={{width: `${(planInfo.currentCount / planInfo.limit) * 100}%`}}
                                                                                role="progressbar"
                                                                                aria-valuenow={planInfo.currentCount}
                                                                                aria-valuemin="0"
                                                                                aria-valuemax={planInfo.limit}
                                                                            >
                                                                                {planInfo.currentCount}/{planInfo.limit}
                                                                            </div>
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            {planInfo.remaining} CVs remaining
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-6">
                                                <div className="card bg-primary text-white">
                                                    <div className="card-body">
                                                        <h5 className="card-title">
                                                            <i className="bi bi-file-earmark-text me-2"></i>
                                                            Quick Actions
                                                        </h5>
                                                        <p className="card-text">
                                                            Start creating your professional CV with AI assistance.
                                                        </p>
                                                        <div className="d-grid gap-2">
                                                            <button className="btn btn-light" onClick={() => navigate('/dashboard/cv-templates')}>
                                                                <i className="bi bi-plus-circle me-2"></i>
                                                                Create New CV
                                                            </button>
                                                            <button className="btn btn-outline-light" onClick={() => navigate('/dashboard/create-cv-url')}>
                                                                <i className="bi bi-link-45deg me-2"></i>
                                                                Create CV for URL
                                                            </button>
                                                            <button className="btn btn-outline-light" onClick={() => setActiveTab('cvs')}>
                                                                <i className="bi bi-folder me-2"></i>
                                                                View My CVs
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row mt-4">
                                            <div className="col-12">
                                                <div className="card">
                                                    <div className="card-body">
                                                        <h5 className="card-title">
                                                            <i className="bi bi-info-circle me-2"></i>
                                                            Getting Started
                                                        </h5>
                                                        <div className="row">
                                                            <div className="col-md-4 text-center">
                                                                <div className="p-3">
                                                                    <i className="bi bi-1-circle text-primary" style={{ fontSize: '2rem' }}></i>
                                                                    <h6 className="mt-2">Fill Your Details</h6>
                                                                    <p className="text-muted small">
                                                                        Enter your personal information, work experience, and skills.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4 text-center">
                                                                <div className="p-3">
                                                                    <i className="bi bi-2-circle text-primary" style={{ fontSize: '2rem' }}></i>
                                                                    <h6 className="mt-2">AI Enhancement</h6>
                                                                    <p className="text-muted small">
                                                                        Our AI will suggest improvements and optimize your CV content.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4 text-center">
                                                                <div className="p-3">
                                                                    <i className="bi bi-3-circle text-primary" style={{ fontSize: '2rem' }}></i>
                                                                    <h6 className="mt-2">Download & Share</h6>
                                                                    <p className="text-muted small">
                                                                        Download your professional CV in multiple formats.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Documents Tab */}
                                {activeTab === 'documents' && (
                                    <div className="tab-pane fade show active">
                                        <DocumentList />
                                    </div>
                                )}

                                {/* Upload Tab */}
                                {activeTab === 'upload' && (
                                    <div className="tab-pane fade show active">
                                        <DocumentUpload />
                                    </div>
                                )}

                                {/* CVs Tab */}
                                {activeTab === 'cvs' && (
                                    <div className="tab-pane fade show active">
                                        <CVList />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <div 
                className="floating-action-button" 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
            >
                <button 
                    className="fab-main"
                    onClick={handleFloatingMenuToggle}
                    title="Create CV"
                >
                    <i className="bi bi-file-earmark-text"></i>
                </button>
                
                {showFloatingMenu && (
                    <div className="fab-menu">
                        <button 
                            className="fab-item"
                            onClick={handleCreateDefaultCV}
                            title="Create Default CV"
                        >
                            <i className="bi bi-file-earmark-plus me-2"></i>
                            Create Default CV
                        </button>
                        <button 
                            className="fab-item"
                            onClick={handleCreateCVForURL}
                            title="Create CV for a URL"
                        >
                            <i className="bi bi-link-45deg me-2"></i>
                            Create CV for a URL
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard; 