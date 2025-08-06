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

    const pricingPlans = [
        {
            name: 'Free',
            price: 'Free',
            cvLimit: 5,
            features: [
                '5 CVs per month',
                'Basic AI enhancement',
                'PDF download',
                'Standard templates',
                'Email support'
            ],
            badge: 'bg-secondary',
            buttonClass: 'btn-outline-secondary',
            popular: false
        },
        {
            name: 'Basic',
            price: '$9.99',
            period: '/month',
            cvLimit: 15,
            features: [
                '15 CVs per month',
                'Advanced AI enhancement',
                'PDF & Word download',
                'Premium templates',
                'Priority support',
                'Cover letter generation',
                'URL-based CV creation'
            ],
            badge: 'bg-primary',
            buttonClass: 'btn-primary',
            popular: true
        },
        {
            name: 'Pro',
            price: '$19.99',
            period: '/month',
            cvLimit: 25,
            features: [
                '25 CVs per month',
                'Premium AI enhancement',
                'All download formats',
                'All templates',
                '24/7 support',
                'Cover letter generation',
                'URL-based CV creation',
                'Priority processing',
                'Custom branding'
            ],
            badge: 'bg-success',
            buttonClass: 'btn-success',
            popular: false
        }
    ];

    return (
        <div className="container mt-5">
            {/* Hero Section */}
            <div className="row justify-content-center">
                <div className="col-lg-8 text-center">
                    <div className="home-hero">
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
            </div>

            {/* Features Section */}
            <div className="row mt-5">
                <div className="col-12 text-center mb-4">
                    <h2 className="display-5 mb-3">Why Choose AI CV Creator?</h2>
                    <p className="lead text-muted">
                        Powerful features to help you create the perfect CV
                    </p>
                </div>
            </div>
            
            <div className="row">
                <div className="col-md-4 text-center">
                    <div className="home-features">
                        <i className="bi bi-magic" style={{ fontSize: '3rem' }}></i>
                        <h4 className="mt-3">AI-Powered</h4>
                        <p className="text-muted">
                            Advanced AI algorithms optimize your content for maximum impact and relevance.
                        </p>
                    </div>
                </div>
                <div className="col-md-4 text-center">
                    <div className="home-features">
                        <i className="bi bi-lightning" style={{ fontSize: '3rem' }}></i>
                        <h4 className="mt-3">Fast & Easy</h4>
                        <p className="text-muted">
                            Create professional CVs in minutes with our intuitive interface.
                        </p>
                    </div>
                </div>
                <div className="col-md-4 text-center">
                    <div className="home-features">
                        <i className="bi bi-download" style={{ fontSize: '3rem' }}></i>
                        <h4 className="mt-3">Multiple Formats</h4>
                        <p className="text-muted">
                            Download your CV in PDF, Word, or other popular formats.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pricing Plans Section */}
            <div className="row mt-5">
                <div className="col-12 text-center mb-5">
                    <h2 className="display-5 mb-3">Choose Your Plan</h2>
                    <p className="lead text-muted">
                        Select the perfect plan for your CV creation needs
                    </p>
                </div>
            </div>

            <div className="row justify-content-center">
                {pricingPlans.map((plan, index) => (
                    <div key={index} className="col-lg-4 col-md-6 mb-4">
                        <div className={`card h-100 pricing-card ${plan.popular ? 'border-primary shadow-lg' : 'border'}`}>
                            {plan.popular && (
                                <div className="card-header bg-primary text-white text-center">
                                    <span className="badge bg-warning text-dark">Most Popular</span>
                                </div>
                            )}
                            <div className="card-body text-center">
                                <h5 className="card-title">{plan.name}</h5>
                                <div className="pricing-price mb-3">
                                    <span className="display-6 fw-bold">{plan.price}</span>
                                    {plan.period && <span className="text-muted">{plan.period}</span>}
                                </div>
                                <div className="mb-4">
                                    <span className={`badge ${plan.badge} fs-6`}>
                                        {plan.cvLimit} CVs per month
                                    </span>
                                </div>
                                <ul className="list-unstyled mb-4">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="mb-2">
                                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                {!isAuthenticated ? (
                                    <Link 
                                        to="/register" 
                                        className={`btn ${plan.buttonClass} btn-lg w-100`}
                                    >
                                        {plan.name === 'Free' ? 'Get Started Free' : `Choose ${plan.name}`}
                                    </Link>
                                ) : (
                                    <div className="text-center">
                                        <span className="text-muted small">
                                            {planInfo && planInfo.plan === plan.name ? 'Current Plan' : 'Contact support to upgrade'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="row mt-5">
                <div className="col-12 text-center mb-4">
                    <h3>Frequently Asked Questions</h3>
                </div>
                <div className="col-md-6">
                    <div className="card mb-3 faq-card">
                        <div className="card-body">
                            <h6 className="card-title">
                                <i className="bi bi-question-circle text-primary me-2"></i>
                                Can I upgrade my plan later?
                            </h6>
                            <p className="card-text text-muted">
                                Yes, you can upgrade your plan at any time. Contact our support team to process the upgrade.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card mb-3 faq-card">
                        <div className="card-body">
                            <h6 className="card-title">
                                <i className="bi bi-question-circle text-primary me-2"></i>
                                Do unused CVs roll over?
                            </h6>
                            <p className="card-text text-muted">
                                CV limits reset monthly. Unused CVs from the previous month do not carry over.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card mb-3 faq-card">
                        <div className="card-body">
                            <h6 className="card-title">
                                <i className="bi bi-question-circle text-primary me-2"></i>
                                What formats can I download?
                            </h6>
                            <p className="card-text text-muted">
                                Free plan: PDF only. Basic & Pro plans: PDF, Word, and other popular formats.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card mb-3 faq-card">
                        <div className="card-body">
                            <h6 className="card-title">
                                <i className="bi bi-question-circle text-primary me-2"></i>
                                Is there a free trial?
                            </h6>
                            <p className="card-text text-muted">
                                Yes! Start with our Free plan and create up to 5 CVs to experience our platform.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home; 