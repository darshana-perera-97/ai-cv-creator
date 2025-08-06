import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl, getAuthHeaders } from '../config/config';

const AccountDetails = () => {
    const { user, token } = useAuth();
    const [planInfo, setPlanInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('User data in AccountDetails:', user);
        loadPlanInfo();
    }, []);

    const loadPlanInfo = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(getApiUrl('/auth/plan-info'), {
                headers: getAuthHeaders(token)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Plan info response:', data);
                setPlanInfo(data.planInfo);
            } else {
                setError('Failed to load plan information');
            }
        } catch (error) {
            console.error('Error loading plan info:', error);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getPlanBadgeClass = (plan) => {
        switch (plan) {
            case 'Free':
                return 'bg-secondary';
            case 'Basic':
                return 'bg-primary';
            case 'Pro':
                return 'bg-success';
            default:
                return 'bg-secondary';
        }
    };

    const getUsagePercentage = (used, total) => {
        const usedValue = used || 0;
        const totalValue = total || 1; // Prevent division by zero
        if (totalValue === 0) return 0;
        return Math.round((usedValue / totalValue) * 100);
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading account details...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* Breadcrumb Navigation */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/dashboard" className="text-decoration-none">
                            <i className="bi bi-house me-1"></i>
                            Dashboard
                        </Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        Account Details
                    </li>
                </ol>
            </nav>

            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow account-details-card">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">
                                <i className="bi bi-person-circle me-2"></i>
                                Account Details
                            </h4>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            )}

                            {/* User Information */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="account-info-section">
                                        <h5 className="text-primary mb-3">
                                            <i className="bi bi-person me-2"></i>
                                            Personal Information
                                        </h5>
                                        <div className="info-item">
                                            <strong>Username:</strong>
                                            <span className="ms-2">{user?.username}</span>
                                        </div>
                                        <div className="info-item">
                                            <strong>First Name:</strong>
                                            <span className="ms-2">{user?.firstName || user?.firstname}</span>
                                        </div>
                                        <div className="info-item">
                                            <strong>Last Name:</strong>
                                            <span className="ms-2">{user?.lastName || user?.lastname}</span>
                                        </div>
                                        <div className="info-item">
                                            <strong>Email:</strong>
                                            <span className="ms-2">{user?.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="account-info-section">
                                        <h5 className="text-primary mb-3">
                                            <i className="bi bi-shield-check me-2"></i>
                                            Account Status
                                        </h5>
                                        <div className="info-item">
                                            <strong>Account ID:</strong>
                                            <span className="ms-2">{user?.userId}</span>
                                        </div>
                                        <div className="info-item">
                                            <strong>Member Since:</strong>
                                            <span className="ms-2">
                                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            {/* Plan Information */}
                            {planInfo && (
                                <div className="mb-4">
                                    <h5 className="text-primary mb-3">
                                        <i className="bi bi-star me-2"></i>
                                        Current Plan
                                    </h5>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="card border-primary plan-card">
                                                <div className="card-body text-center">
                                                    <span className={`badge ${getPlanBadgeClass(planInfo.plan)} fs-6 mb-2`}>
                                                        {planInfo.plan || 'Unknown'} Plan
                                                    </span>
                                                    <h6 className="card-title">CV Limit</h6>
                                                    <p className="card-text fs-4 fw-bold text-primary">
                                                        {planInfo.limit || planInfo.cvLimit || 0} CVs
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card border-success plan-card">
                                                <div className="card-body text-center">
                                                    <span className="badge bg-success fs-6 mb-2">
                                                        Usage Statistics
                                                    </span>
                                                    <h6 className="card-title">CVs Used</h6>
                                                    <p className="card-text fs-4 fw-bold text-success">
                                                        {planInfo.currentCount || planInfo.usedCVs || 0} / {planInfo.limit || planInfo.cvLimit || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>CV Usage Progress</span>
                                            <span>{getUsagePercentage(planInfo.currentCount || planInfo.usedCVs, planInfo.limit || planInfo.cvLimit)}%</span>
                                        </div>
                                        <div className="progress usage-progress" style={{ height: '25px' }}>
                                            <div 
                                                className={`progress-bar ${(planInfo.currentCount || planInfo.usedCVs || 0) >= (planInfo.limit || planInfo.cvLimit || 1) ? 'bg-danger' : 'bg-success'}`}
                                                role="progressbar"
                                                style={{ width: `${Math.min(getUsagePercentage(planInfo.currentCount || planInfo.usedCVs, planInfo.limit || planInfo.cvLimit), 100)}%` }}
                                                aria-valuenow={planInfo.currentCount || planInfo.usedCVs || 0}
                                                aria-valuemin="0"
                                                aria-valuemax={planInfo.limit || planInfo.cvLimit || 1}
                                            >
                                                {planInfo.currentCount || planInfo.usedCVs || 0} / {planInfo.limit || planInfo.cvLimit || 0}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remaining CVs */}
                                    <div className="mt-3">
                                        <div className="alert alert-info" role="alert">
                                            <i className="bi bi-info-circle me-2"></i>
                                            <strong>Remaining CVs:</strong> {Math.max(0, (planInfo.limit || planInfo.cvLimit || 0) - (planInfo.currentCount || planInfo.usedCVs || 0))} CVs
                                            {(planInfo.currentCount || planInfo.usedCVs || 0) >= (planInfo.limit || planInfo.cvLimit || 1) && (
                                                <span className="text-danger ms-2">
                                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                                    You've reached your CV limit. Consider upgrading your plan.
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Plan Comparison */}
                            <div className="mt-4">
                                <h5 className="text-primary mb-3">
                                    <i className="bi bi-graph-up me-2"></i>
                                    Plan Comparison
                                </h5>
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="card h-100 plan-card">
                                            <div className="card-header text-center">
                                                <h6 className="mb-0">Free Plan</h6>
                                            </div>
                                            <div className="card-body text-center">
                                                <h4 className="text-muted">5 CVs</h4>
                                                <p className="text-muted small">Perfect for getting started</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card h-100 border-primary plan-card">
                                            <div className="card-header text-center bg-primary text-white">
                                                <h6 className="mb-0">Basic Plan</h6>
                                            </div>
                                            <div className="card-body text-center">
                                                <h4 className="text-primary">15 CVs</h4>
                                                <p className="text-muted small">Great for active job seekers</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card h-100 plan-card">
                                            <div className="card-header text-center">
                                                <h6 className="mb-0">Pro Plan</h6>
                                            </div>
                                            <div className="card-body text-center">
                                                <h4 className="text-success">25 CVs</h4>
                                                <p className="text-muted small">For professionals and agencies</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Back to Dashboard Button */}
                            <div className="mt-4 text-center">
                                <Link to="/dashboard" className="btn btn-primary">
                                    <i className="bi bi-arrow-left me-2"></i>
                                    Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountDetails; 