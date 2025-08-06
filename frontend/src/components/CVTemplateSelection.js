import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CVTemplateSelection = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const templates = [
        {
            id: 'modern',
            name: 'Modern Professional',
            description: 'Clean and contemporary design with emphasis on skills and achievements',
            features: ['Professional layout', 'Skills-focused', 'Modern typography', 'Color-coded sections'],
            preview: {
                name: 'John Smith',
                title: 'Senior Software Engineer',
                summary: 'Experienced software engineer with 5+ years in full-stack development...',
                skills: ['JavaScript', 'React', 'Node.js', 'Python'],
                experience: 'TechCorp Inc. - Senior Developer (2020-Present)',
                education: 'Computer Science, University of Technology'
            },
            color: 'primary',
            icon: 'bi-briefcase'
        },
        {
            id: 'creative',
            name: 'Creative Portfolio',
            description: 'Eye-catching design perfect for creative professionals and designers',
            features: ['Visual appeal', 'Portfolio showcase', 'Creative layout', 'Project highlights'],
            preview: {
                name: 'Sarah Johnson',
                title: 'UX/UI Designer',
                summary: 'Creative designer passionate about user experience and visual storytelling...',
                skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
                experience: 'Design Studio - Lead Designer (2019-Present)',
                education: 'Design & Media, Art Institute'
            },
            color: 'success',
            icon: 'bi-palette'
        },
        {
            id: 'minimal',
            name: 'Minimal Clean',
            description: 'Simple and elegant design focusing on content over decoration',
            features: ['Minimal design', 'Easy to read', 'Professional', 'Print-friendly'],
            preview: {
                name: 'Michael Brown',
                title: 'Data Analyst',
                summary: 'Analytical professional with expertise in data interpretation and business intelligence...',
                skills: ['SQL', 'Python', 'Tableau', 'Excel'],
                experience: 'Analytics Corp - Data Analyst (2021-Present)',
                education: 'Statistics, Business University'
            },
            color: 'secondary',
            icon: 'bi-graph-up'
        },
        {
            id: 'executive',
            name: 'Executive Leadership',
            description: 'Sophisticated template designed for senior executives and managers',
            features: ['Leadership focus', 'Executive summary', 'Strategic achievements', 'Board-ready'],
            preview: {
                name: 'Emily Davis',
                title: 'Chief Technology Officer',
                summary: 'Strategic technology leader with 15+ years driving digital transformation...',
                skills: ['Strategic Planning', 'Team Leadership', 'Technology Strategy', 'Budget Management'],
                experience: 'Global Tech - CTO (2018-Present)',
                education: 'MBA, Business Leadership'
            },
            color: 'dark',
            icon: 'bi-trophy'
        }
    ];

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
    };

    const handleContinue = () => {
        if (selectedTemplate) {
            navigate(`/dashboard/cv-preview/${selectedTemplate.id}`, { 
                state: { template: selectedTemplate } 
            });
        }
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h2 className="mb-0">
                                <i className="bi bi-layout-text-window me-2"></i>
                                Choose Your CV Template
                            </h2>
                        </div>
                        <div className="card-body">
                            <div className="row mb-4">
                                <div className="col-12">
                                    <p className="text-muted">
                                        Select a template that best represents your professional style and industry. 
                                        You can preview each template and customize it later.
                                    </p>
                                </div>
                            </div>

                            <div className="row">
                                {templates.map((template) => (
                                    <div key={template.id} className="col-lg-6 col-xl-3 mb-4">
                                        <div 
                                            className={`card h-100 template-card ${selectedTemplate?.id === template.id ? 'border-primary border-3' : ''}`}
                                            onClick={() => handleTemplateSelect(template)}
                                            style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                        >
                                            <div className={`card-header bg-${template.color} text-white text-center`}>
                                                <i className={`bi ${template.icon}`} style={{ fontSize: '2rem' }}></i>
                                                <h5 className="mt-2 mb-0">{template.name}</h5>
                                            </div>
                                            <div className="card-body d-flex flex-column">
                                                <p className="card-text text-muted mb-3">
                                                    {template.description}
                                                </p>
                                                
                                                <div className="mb-3">
                                                    <strong>Features:</strong>
                                                    <ul className="list-unstyled mt-2">
                                                        {template.features.map((feature, index) => (
                                                            <li key={index} className="mb-1">
                                                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Template Preview */}
                                                <div className="template-preview mt-auto">
                                                    <strong>Preview:</strong>
                                                    <div className="preview-content mt-2 p-3 bg-light rounded">
                                                        <div className="preview-header">
                                                            <h6 className="mb-1 fw-bold">{template.preview.name}</h6>
                                                            <p className="mb-1 text-muted small">{template.preview.title}</p>
                                                        </div>
                                                        <div className="preview-body">
                                                            <p className="small text-muted mb-2">
                                                                {template.preview.summary.substring(0, 80)}...
                                                            </p>
                                                            <div className="preview-skills">
                                                                {template.preview.skills.slice(0, 3).map((skill, index) => (
                                                                    <span key={index} className={`badge bg-${template.color} me-1 mb-1`}>
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {selectedTemplate?.id === template.id && (
                                                    <div className="mt-3 text-center">
                                                        <i className="bi bi-check-circle-fill text-primary" style={{ fontSize: '1.5rem' }}></i>
                                                        <span className="ms-2 text-primary fw-bold">Selected</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="row mt-4">
                                <div className="col-12">
                                    <div className="d-flex justify-content-between">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleBack}
                                        >
                                            <i className="bi bi-arrow-left me-2"></i>
                                            Back to Dashboard
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            disabled={!selectedTemplate}
                                            onClick={handleContinue}
                                        >
                                            <i className="bi bi-eye me-2"></i>
                                            Preview Selected Template
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {selectedTemplate && (
                                <div className="row mt-4">
                                    <div className="col-12">
                                        <div className="alert alert-info">
                                            <i className="bi bi-info-circle me-2"></i>
                                            <strong>Selected:</strong> {selectedTemplate.name} - {selectedTemplate.description}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CVTemplateSelection; 