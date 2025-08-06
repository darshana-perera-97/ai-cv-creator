import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { isAuthenticated, user, getPlanInfo } = useAuth();
    const [planInfo, setPlanInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPlanInfo = async () => {
            if (isAuthenticated && user) {
                setLoading(true);
                const result = await getPlanInfo();
                if (result.success) {
                    setPlanInfo(result.planInfo);
                }
                setLoading(false);
            }
        };
        fetchPlanInfo();
    }, [isAuthenticated, user, getPlanInfo]);

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-8 text-center">
                    <h1 className="display-4 mb-4">
                        Welcome to AI CV Creator
                    </h1>
                    <p className="lead mb-4">
                        Create professional, AI-enhanced resumes that stand out from the crowd. 
                        Our intelligent system helps you craft compelling CVs that get you noticed.
                    </p>
                    
                    {!isAuthenticated ? (
                        <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
                            <Link to="/register" className="btn btn-primary btn-lg px-4 gap-3">
                                Get Started
                            </Link>
                            <Link to="/login" className="btn btn-outline-secondary btn-lg px-4">
                                Sign In
                            </Link>
                        </div>
                    ) : (
                        <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
                            <Link to="/dashboard" className="btn btn-primary btn-lg px-4 gap-3">
                                Go to Dashboard
                            </Link>
                        </div>
                    )}

                    {/* Plan Information for Authenticated Users */}
                    {isAuthenticated && planInfo && (
                        <div className="row mt-4 justify-content-center">
                            <div className="col-md-6">
                                <div className="card border-primary">
                                    <div className="card-body text-center">
                                        <h5 className="card-title">
                                            <i className="bi bi-person-badge me-2"></i>
                                            Your Plan Details
                                        </h5>
                                        <div className="mb-3">
                                            <span className={`badge ${planInfo.plan === 'Basic' ? 'bg-primary' : planInfo.plan === 'Pro' ? 'bg-success' : 'bg-secondary'} fs-6`}>
                                                {planInfo.plan} Plan
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <div className="progress" style={{height: '25px'}}>
                                                <div
                                                    className={`progress-bar ${planInfo.remaining > 0 ? 'bg-success' : 'bg-danger'}`}
                                                    style={{width: `${(planInfo.currentCount / planInfo.limit) * 100}%`}}
                                                    role="progressbar"
                                                    aria-valuenow={planInfo.currentCount}
                                                    aria-valuemin="0"
                                                    aria-valuemax={planInfo.limit}
                                                >
                                                    {planInfo.currentCount}/{planInfo.limit} CVs
                                                </div>
                                            </div>
                                            <small className="text-muted">
                                                {planInfo.remaining} CVs remaining
                                            </small>
                                        </div>
                                        <div className="row text-center">
                                            <div className="col-4">
                                                <div className="border-end">
                                                    <h6 className="text-primary mb-1">{planInfo.currentCount}</h6>
                                                    <small className="text-muted">Used</small>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="border-end">
                                                    <h6 className="text-success mb-1">{planInfo.remaining}</h6>
                                                    <small className="text-muted">Remaining</small>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div>
                                                    <h6 className="text-info mb-1">{planInfo.limit}</h6>
                                                    <small className="text-muted">Total</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isAuthenticated && loading && (
                        <div className="row mt-4 justify-content-center">
                            <div className="col-md-6">
                                <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2 text-muted">Loading plan details...</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="row mt-5">
                <div className="col-md-4 text-center">
                    <div className="p-4">
                        <i className="bi bi-magic text-primary" style={{ fontSize: '3rem' }}></i>
                        <h4 className="mt-3">AI-Powered</h4>
                        <p className="text-muted">
                            Advanced AI algorithms optimize your content for maximum impact and relevance.
                        </p>
                    </div>
                </div>
                <div className="col-md-4 text-center">
                    <div className="p-4">
                        <i className="bi bi-lightning text-primary" style={{ fontSize: '3rem' }}></i>
                        <h4 className="mt-3">Fast & Easy</h4>
                        <p className="text-muted">
                            Create professional CVs in minutes with our intuitive interface.
                        </p>
                    </div>
                </div>
                <div className="col-md-4 text-center">
                    <div className="p-4">
                        <i className="bi bi-download text-primary" style={{ fontSize: '3rem' }}></i>
                        <h4 className="mt-3">Multiple Formats</h4>
                        <p className="text-muted">
                            Download your CV in PDF, Word, or other popular formats.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home; 