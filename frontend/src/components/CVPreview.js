import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl, getAuthHeaders } from '../config/config';

const CVPreview = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { templateId } = useParams();
    const location = useLocation();
    const template = location.state?.template;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [extractedData, setExtractedData] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExtractingCV, setIsExtractingCV] = useState(false);

    // Mock CV data based on template
    const getMockCVData = (templateId) => {
        const baseData = {
            personalInfo: {
                name: 'John Smith',
                title: 'Senior Software Engineer',
                email: 'john.smith@email.com',
                phone: '+1 (555) 123-4567',
                location: 'San Francisco, CA',
                linkedin: 'linkedin.com/in/johnsmith',
                website: 'johnsmith.dev'
            },
            summary: 'Experienced software engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering scalable solutions and leading development teams.',
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB', 'Git'],
            experience: [
                {
                    company: 'TechCorp Inc.',
                    position: 'Senior Software Engineer',
                    period: '2020 - Present',
                    description: 'Led development of microservices architecture, improved system performance by 40%, and mentored junior developers.'
                },
                {
                    company: 'StartupXYZ',
                    position: 'Full Stack Developer',
                    period: '2018 - 2020',
                    description: 'Built and maintained web applications using React and Node.js, collaborated with cross-functional teams.'
                }
            ],
            education: [
                {
                    institution: 'University of Technology',
                    degree: 'Bachelor of Science in Computer Science',
                    period: '2014 - 2018',
                    gpa: '3.8/4.0'
                }
            ],
            projects: [
                {
                    name: 'E-commerce Platform',
                    description: 'Built a full-stack e-commerce solution with React, Node.js, and MongoDB',
                    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe']
                },
                {
                    name: 'Task Management App',
                    description: 'Developed a collaborative task management application with real-time updates',
                    technologies: ['React', 'Socket.io', 'Express', 'PostgreSQL']
                }
            ]
        };

        // Customize data based on template
        switch (templateId) {
            case 'creative':
                return {
                    ...baseData,
                    personalInfo: {
                        ...baseData.personalInfo,
                        name: 'Sarah Johnson',
                        title: 'UX/UI Designer'
                    },
                    summary: 'Creative designer passionate about user experience and visual storytelling. Specialized in creating intuitive interfaces and engaging user experiences.',
                    skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Sketch', 'InVision', 'Design Systems', 'User Testing']
                };
            case 'minimal':
                return {
                    ...baseData,
                    personalInfo: {
                        ...baseData.personalInfo,
                        name: 'Michael Brown',
                        title: 'Data Analyst'
                    },
                    summary: 'Analytical professional with expertise in data interpretation and business intelligence. Skilled in transforming complex data into actionable insights.',
                    skills: ['SQL', 'Python', 'Tableau', 'Excel', 'R', 'Power BI', 'Statistical Analysis', 'Data Visualization']
                };
            case 'executive':
                return {
                    ...baseData,
                    personalInfo: {
                        ...baseData.personalInfo,
                        name: 'Emily Davis',
                        title: 'Chief Technology Officer'
                    },
                    summary: 'Strategic technology leader with 15+ years driving digital transformation and innovation. Proven track record of scaling technology operations and leading high-performing teams.',
                    skills: ['Strategic Planning', 'Team Leadership', 'Technology Strategy', 'Budget Management', 'Digital Transformation', 'Vendor Management', 'Risk Assessment', 'Stakeholder Communication']
                };
            default:
                return baseData;
        }
    };

    const cvData = getMockCVData(templateId);

    const handleEditCV = async () => {
        setIsExtractingCV(true);
        try {
            // First, try to extract data from uploaded documents
            const response = await fetch(getApiUrl('/cv/extract-from-documents'), {
                method: 'POST',
                headers: getAuthHeaders(localStorage.getItem('token'))
            });

            const result = await response.json();
            
            if (result.success) {
                // Navigate to CV editor with extracted data
                navigate('/dashboard/create-cv', { 
                    state: { 
                        template: template,
                        cvData: result.cvData,
                        extractedFromDocuments: true
                    } 
                });
            } else {
                // If no documents or extraction failed, navigate with template data only
                navigate('/dashboard/create-cv', { 
                    state: { 
                        template: template,
                        cvData: cvData,
                        extractedFromDocuments: false
                    } 
                });
            }
        } catch (error) {
            console.error('Error extracting CV data:', error);
            // Fallback to template data if extraction fails
            navigate('/dashboard/create-cv', { 
                state: { 
                    template: template,
                    cvData: cvData,
                    extractedFromDocuments: false
                } 
            });
        } finally {
            setIsExtractingCV(false);
        }
    };

    const handleBack = () => {
        navigate('/dashboard/cv-templates');
    };

    const handleDownload = () => {
        // TODO: Implement PDF download functionality
        alert('PDF download functionality will be implemented here!');
    };

    const renderTemplate = () => {
        const colorClass = template?.color || 'primary';
        
        return (
            <div className={`cv-template cv-${templateId}`}>
                {/* Header */}
                <div className={`cv-header bg-${colorClass} text-white p-4`}>
                    <div className="row">
                        <div className="col-md-8">
                            <h1 className="cv-name mb-2">{cvData.personalInfo.name}</h1>
                            <h3 className="cv-title mb-3">{cvData.personalInfo.title}</h3>
                            <p className="cv-summary mb-0">{cvData.summary}</p>
                        </div>
                        <div className="col-md-4">
                            <div className="cv-contact">
                                <p><i className="bi bi-envelope me-2"></i>{cvData.personalInfo.email}</p>
                                <p><i className="bi bi-telephone me-2"></i>{cvData.personalInfo.phone}</p>
                                <p><i className="bi bi-geo-alt me-2"></i>{cvData.personalInfo.location}</p>
                                <p><i className="bi bi-linkedin me-2"></i>{cvData.personalInfo.linkedin}</p>
                                <p><i className="bi bi-globe me-2"></i>{cvData.personalInfo.website}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="cv-content p-4">
                    <div className="row">
                        <div className="col-md-8">
                            {/* Experience */}
                            <div className="cv-section mb-4">
                                <h4 className={`cv-section-title text-${colorClass} border-bottom pb-2 mb-3`}>
                                    <i className="bi bi-briefcase me-2"></i>
                                    Professional Experience
                                </h4>
                                {cvData.experience.map((exp, index) => (
                                    <div key={index} className="cv-experience mb-3">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <h5 className="cv-company mb-1">{exp.company}</h5>
                                            <span className="cv-period text-muted">{exp.period}</span>
                                        </div>
                                        <h6 className="cv-position text-muted mb-2">{exp.position}</h6>
                                        <p className="cv-description mb-0">{exp.description}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Education */}
                            <div className="cv-section mb-4">
                                <h4 className={`cv-section-title text-${colorClass} border-bottom pb-2 mb-3`}>
                                    <i className="bi bi-mortarboard me-2"></i>
                                    Education
                                </h4>
                                {cvData.education.map((edu, index) => (
                                    <div key={index} className="cv-education mb-3">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <h5 className="cv-institution mb-1">{edu.institution}</h5>
                                            <span className="cv-period text-muted">{edu.period}</span>
                                        </div>
                                        <h6 className="cv-degree text-muted mb-1">{edu.degree}</h6>
                                        {edu.gpa && <p className="cv-gpa text-muted mb-0">GPA: {edu.gpa}</p>}
                                    </div>
                                ))}
                            </div>

                            {/* Projects */}
                            <div className="cv-section">
                                <h4 className={`cv-section-title text-${colorClass} border-bottom pb-2 mb-3`}>
                                    <i className="bi bi-code-square me-2"></i>
                                    Key Projects
                                </h4>
                                {cvData.projects.map((project, index) => (
                                    <div key={index} className="cv-project mb-3">
                                        <h5 className="cv-project-name mb-1">{project.name}</h5>
                                        <p className="cv-project-description mb-2">{project.description}</p>
                                        <div className="cv-project-tech">
                                            {project.technologies.map((tech, techIndex) => (
                                                <span key={techIndex} className={`badge bg-${colorClass} me-1 mb-1`}>
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-md-4">
                            {/* Skills */}
                            <div className="cv-section mb-4">
                                <h4 className={`cv-section-title text-${colorClass} border-bottom pb-2 mb-3`}>
                                    <i className="bi bi-tools me-2"></i>
                                    Skills
                                </h4>
                                <div className="cv-skills">
                                    {cvData.skills.map((skill, index) => (
                                        <span key={index} className={`badge bg-${colorClass} me-1 mb-2`}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="cv-section">
                                <h4 className={`cv-section-title text-${colorClass} border-bottom pb-2 mb-3`}>
                                    <i className="bi bi-info-circle me-2"></i>
                                    Additional Information
                                </h4>
                                <div className="cv-additional">
                                    <p><strong>Languages:</strong> English (Native), Spanish (Fluent)</p>
                                    <p><strong>Certifications:</strong> AWS Certified Developer, Google Cloud Professional</p>
                                    <p><strong>Interests:</strong> Open Source Contribution, Tech Blogging, Mentoring</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!template) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Template not found. Please select a template first.
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard/cv-templates')}>
                    Go to Template Selection
                </button>
            </div>
        );
    }

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                <div className="col-12">
                    {/* Header */}
                    <div className="card shadow mb-4">
                        <div className="card-header bg-primary text-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <h2 className="mb-0">
                                    <i className="bi bi-eye me-2"></i>
                                    CV Preview - {template.name}
                                </h2>
                                <div>
                                    <button
                                        type="button"
                                        className="btn btn-light me-2"
                                        onClick={handleDownload}
                                    >
                                        <i className="bi bi-download me-2"></i>
                                        Download PDF
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-warning me-2"
                                        onClick={handleEditCV}
                                        disabled={isExtractingCV}
                                    >
                                        {isExtractingCV ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Extracting Data...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-pencil me-2"></i>
                                                Edit CV
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleBack}
                                    >
                                        <i className="bi bi-arrow-left me-2"></i>
                                        Back
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CV Preview */}
                    <div className="card shadow">
                        <div className="card-body p-0">
                            {renderTemplate()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CVPreview; 