import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCVs } from '../context/CVContext';

const CVView = () => {
    const { cvId } = useParams();
    const navigate = useNavigate();
    const { getCV, downloadCV } = useCVs();
    const [cv, setCV] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        loadCV();
    }, [cvId]);

    const loadCV = async () => {
        setLoading(true);
        const cvData = await getCV(cvId);
        setCV(cvData);
        setLoading(false);
    };

    const handleDownload = async () => {
        setDownloading(true);
        await downloadCV(cvId);
        setDownloading(false);
    };

    const handleEdit = () => {
        navigate(`/dashboard/edit-cv/${cvId}`);
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading CV...</p>
            </div>
        );
    }

    if (!cv) {
        return (
            <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                CV not found
            </div>
        );
    }

    const { cvData, title, templateId } = cv;

    return (
        <div className="cv-view">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        <i className="bi bi-file-earmark-text me-2"></i>
                        {title}
                    </h2>
                    <p className="text-muted mb-0">Template: {templateId}</p>
                </div>
                <div className="btn-group">
                    <button
                        className="btn btn-success"
                        onClick={handleDownload}
                        disabled={downloading}
                    >
                        {downloading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-download me-2"></i>
                                Download PDF
                            </>
                        )}
                    </button>
                    <button
                        className="btn btn-warning"
                        onClick={handleEdit}
                    >
                        <i className="bi bi-pencil me-2"></i>
                        Edit CV
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleBack}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back
                    </button>
                </div>
            </div>

            {/* CV Content */}
            <div className="card">
                <div className="card-body p-0">
                    <div className="cv-preview">
                        {/* Header Section */}
                        <div className="cv-header bg-primary text-white p-4">
                            <div className="row">
                                <div className="col-md-8">
                                    <h1 className="cv-name mb-2">
                                        {cvData.personalInfo.firstName} {cvData.personalInfo.lastName}
                                    </h1>
                                    <h3 className="cv-title mb-3">
                                        {cvData.personalInfo.title || 'Professional'}
                                    </h3>
                                    {cvData.summary && (
                                        <p className="cv-summary mb-0">{cvData.summary}</p>
                                    )}
                                </div>
                                <div className="col-md-4">
                                    <div className="cv-contact">
                                        {cvData.personalInfo.email && (
                                            <p className="mb-2">
                                                <i className="bi bi-envelope me-2"></i>
                                                {cvData.personalInfo.email}
                                            </p>
                                        )}
                                        {cvData.personalInfo.phone && (
                                            <p className="mb-2">
                                                <i className="bi bi-telephone me-2"></i>
                                                {cvData.personalInfo.phone}
                                            </p>
                                        )}
                                        {cvData.personalInfo.address && (
                                            <p className="mb-2">
                                                <i className="bi bi-geo-alt me-2"></i>
                                                {cvData.personalInfo.address}
                                            </p>
                                        )}
                                        {cvData.personalInfo.linkedin && (
                                            <p className="mb-2">
                                                <i className="bi bi-linkedin me-2"></i>
                                                {cvData.personalInfo.linkedin}
                                            </p>
                                        )}
                                        {cvData.personalInfo.website && (
                                            <p className="mb-2">
                                                <i className="bi bi-globe me-2"></i>
                                                {cvData.personalInfo.website}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="cv-content p-4">
                            <div className="row">
                                <div className="col-md-8">
                                    {/* Work Experience */}
                                    {cvData.workExperience && cvData.workExperience.length > 0 && (
                                        <div className="cv-section mb-4">
                                            <h4 className="cv-section-title">
                                                <i className="bi bi-briefcase me-2"></i>
                                                Professional Experience
                                            </h4>
                                            {cvData.workExperience.map((exp, index) => (
                                                <div key={index} className="cv-experience mb-3">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <h5 className="cv-company mb-1">{exp.company}</h5>
                                                        <span className="cv-period text-muted">
                                                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                                        </span>
                                                    </div>
                                                    <h6 className="cv-position text-primary mb-2">{exp.position}</h6>
                                                    {exp.description && (
                                                        <p className="cv-description mb-0">{exp.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Education */}
                                    {cvData.education && cvData.education.length > 0 && (
                                        <div className="cv-section mb-4">
                                            <h4 className="cv-section-title">
                                                <i className="bi bi-mortarboard me-2"></i>
                                                Education
                                            </h4>
                                            {cvData.education.map((edu, index) => (
                                                <div key={index} className="cv-education mb-3">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <h5 className="cv-institution mb-1">{edu.institution}</h5>
                                                        <span className="cv-period text-muted">
                                                            {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                                                        </span>
                                                    </div>
                                                    <h6 className="cv-degree text-primary mb-1">{edu.degree}</h6>
                                                    {edu.field && (
                                                        <p className="text-muted mb-1">{edu.field}</p>
                                                    )}
                                                    {edu.gpa && (
                                                        <p className="text-muted mb-0">GPA: {edu.gpa}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-4">
                                    {/* Skills */}
                                    {cvData.skills && cvData.skills.length > 0 && (
                                        <div className="cv-section mb-4">
                                            <h4 className="cv-section-title">
                                                <i className="bi bi-tools me-2"></i>
                                                Skills
                                            </h4>
                                            <div className="cv-skills">
                                                {cvData.skills.map((skill, index) => (
                                                    <span key={index} className="badge bg-primary me-2 mb-2">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Languages */}
                                    {cvData.languages && cvData.languages.length > 0 && (
                                        <div className="cv-section mb-4">
                                            <h4 className="cv-section-title">
                                                <i className="bi bi-translate me-2"></i>
                                                Languages
                                            </h4>
                                            <div className="cv-skills">
                                                {cvData.languages.map((lang, index) => (
                                                    <span key={index} className="badge bg-success me-2 mb-2">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Certifications */}
                                    {cvData.certifications && cvData.certifications.length > 0 && (
                                        <div className="cv-section mb-4">
                                            <h4 className="cv-section-title">
                                                <i className="bi bi-award me-2"></i>
                                                Certifications
                                            </h4>
                                            <ul className="list-unstyled">
                                                {cvData.certifications.map((cert, index) => (
                                                    <li key={index} className="mb-2">
                                                        <i className="bi bi-check-circle text-success me-2"></i>
                                                        {cert}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CVView; 