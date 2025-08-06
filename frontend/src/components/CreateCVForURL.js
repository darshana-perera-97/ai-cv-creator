import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentContext';
import { useCVs } from '../context/CVContext';
import { getApiUrl, getAuthHeaders } from '../config/config';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

const CreateCVForURL = () => {
    const { user, token } = useAuth();
    const { documents } = useDocuments();
    const { createCV } = useCVs();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        url: '',
        title: ''
    });
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [generatingCV, setGeneratingCV] = useState(false);

    // Check if user has uploaded documents
    useEffect(() => {
        if (documents.length === 0) {
            setError('Please upload some documents first before analyzing job URLs.');
        } else {
            setError('');
        }
    }, [documents]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateURL = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const analyzeURL = async () => {
        if (!formData.url.trim()) {
            setError('Please enter a URL');
            return;
        }

        if (!validateURL(formData.url)) {
            setError('Please enter a valid URL');
            return;
        }

        if (documents.length === 0) {
            setError('Please upload some documents first');
            return;
        }

        setAnalyzing(true);
        setError('');
        setAnalysisResult(null);

        try {
            const response = await fetch(getApiUrl('/cv/analyze-url'), {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({ url: formData.url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze URL');
            }

            setAnalysisResult(data);
        } catch (error) {
            console.error('Error analyzing URL:', error);
            setError(error.message || 'Failed to analyze URL. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const generateCVFromURL = async () => {
        if (!selectedTemplate) {
            setError('Please select a CV template');
            return;
        }

        if (!formData.title.trim()) {
            setError('Please enter a title for your CV');
            return;
        }

        setGeneratingCV(true);
        setError('');

        try {
            const response = await fetch(getApiUrl('/cv/generate-from-url'), {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify({
                    url: formData.url,
                    templateId: selectedTemplate,
                    title: formData.title
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate CV');
            }

            alert('CV generated successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error generating CV:', error);
            setError(error.message || 'Failed to generate CV. Please try again.');
        } finally {
            setGeneratingCV(false);
        }
    };

    const getCompatibilityChartData = () => {
        if (!analysisResult?.compatibility) return null;

        const { categories } = analysisResult.compatibility;
        
        return {
            labels: Object.keys(categories).map(key => 
                key.charAt(0).toUpperCase() + key.slice(1)
            ),
            datasets: [
                {
                    data: Object.values(categories),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }
            ]
        };
    };

    const getSkillsChartData = () => {
        if (!analysisResult?.compatibility) return null;

        const { matchedSkills, missingSkills } = analysisResult.compatibility;
        
        return {
            labels: ['Matched Skills', 'Missing Skills'],
            datasets: [
                {
                    label: 'Skills Analysis',
                    data: [matchedSkills.length, missingSkills.length],
                    backgroundColor: ['#4BC0C0', '#FF6384'],
                    borderWidth: 1,
                    borderColor: '#fff'
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.parsed}%`;
                    }
                }
            }
        }
    };

    const skillsChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Skills Match Analysis'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    const templates = [
        { id: 'modern', name: 'Modern', description: 'Clean and professional design' },
        { id: 'creative', name: 'Creative', description: 'Stand out with creative layout' },
        { id: 'minimal', name: 'Minimal', description: 'Simple and elegant' },
        { id: 'executive', name: 'Executive', description: 'Traditional business style' }
    ];

    return (
        <div className="container mt-4 url-analysis">
            <div className="row">
                <div className="col-12">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h2 className="mb-0">
                                <i className="bi bi-link-45deg me-2"></i>
                                Create CV for a Job URL
                            </h2>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            )}

                            {/* URL Input Section */}
                            <div className="mb-4">
                                <h4 className="border-bottom pb-2">
                                    <i className="bi bi-globe me-2"></i>
                                    Job Posting URL
                                </h4>
                                <div className="row">
                                    <div className="col-md-8">
                                        <div className="input-group">
                                            <input
                                                type="url"
                                                className="form-control"
                                                placeholder="https://example.com/job-posting"
                                                value={formData.url}
                                                onChange={(e) => handleInputChange('url', e.target.value)}
                                                disabled={analyzing}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={analyzeURL}
                                                disabled={analyzing || !formData.url.trim() || documents.length === 0}
                                            >
                                                {analyzing ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Analyzing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-search me-2"></i>
                                                        Analyze Job
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="form-text">
                                            Enter the URL of a job posting to analyze compatibility with your uploaded documents.
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="alert alert-info">
                                            <i className="bi bi-info-circle me-2"></i>
                                            <strong>Documents:</strong> {documents.length} uploaded
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Results */}
                            {analysisResult && (
                                <div className="mb-4">
                                    <h4 className="border-bottom pb-2">
                                        <i className="bi bi-graph-up me-2"></i>
                                        Analysis Results
                                    </h4>
                                    
                                    <div className="row">
                                        {/* Job Information */}
                                        <div className="col-lg-6 mb-4">
                                            <div className="card h-100 job-info-card">
                                                <div className="card-header">
                                                    <h5 className="mb-0">
                                                        <i className="bi bi-briefcase me-2"></i>
                                                        Job Information
                                                    </h5>
                                                </div>
                                                <div className="card-body">
                                                    <div className="mb-3">
                                                        <strong>Job Title:</strong>
                                                        <p className="mb-1">{analysisResult.jobData.jobTitle}</p>
                                                    </div>
                                                    <div className="mb-3">
                                                        <strong>Company:</strong>
                                                        <p className="mb-1">{analysisResult.jobData.company}</p>
                                                    </div>
                                                    <div className="mb-3">
                                                        <strong>Location:</strong>
                                                        <p className="mb-1">{analysisResult.jobData.location}</p>
                                                    </div>
                                                    <div className="mb-3">
                                                        <strong>Salary:</strong>
                                                        <p className="mb-1">{analysisResult.jobData.salary}</p>
                                                    </div>
                                                    
                                                    <div className="mb-3">
                                                        <strong>Required Skills:</strong>
                                                        <div className="mt-2">
                                                            {analysisResult.jobData.skills.map((skill, index) => (
                                                                <span key={index} className="badge bg-primary me-1 mb-1">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Compatibility Charts */}
                                        <div className="col-lg-6 mb-4">
                                            <div className="card h-100 compatibility-card">
                                                <div className="card-header">
                                                    <h5 className="mb-0">
                                                        <i className="bi bi-pie-chart me-2"></i>
                                                        Compatibility Analysis
                                                    </h5>
                                                </div>
                                                <div className="card-body">
                                                    <div className="text-center mb-3">
                                                        <h3 className="compatibility-score">
                                                            {analysisResult.compatibility.overallMatch}%
                                                        </h3>
                                                        <p className="text-muted">Overall Match</p>
                                                    </div>
                                                    
                                                    {getCompatibilityChartData() && (
                                                        <div className="chart-container mb-4">
                                                            <Pie data={getCompatibilityChartData()} options={chartOptions} />
                                                        </div>
                                                    )}
                                                    
                                                    {getSkillsChartData() && (
                                                        <div className="chart-container">
                                                            <Bar data={getSkillsChartData()} options={skillsChartOptions} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recommendations */}
                                    <div className="row mb-4">
                                        <div className="col-12">
                                            <div className="card recommendations-card">
                                                <div className="card-header">
                                                    <h5 className="mb-0">
                                                        <i className="bi bi-lightbulb me-2"></i>
                                                        Recommendations
                                                    </h5>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <h6 className="text-success">
                                                                <i className="bi bi-check-circle me-2"></i>
                                                                Matched Skills ({analysisResult.compatibility.matchedSkills.length})
                                                            </h6>
                                                            <div className="mt-2 matched-skills">
                                                                {analysisResult.compatibility.matchedSkills.map((skill, index) => (
                                                                    <span key={index} className="badge bg-success me-1 mb-1">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <h6 className="text-warning">
                                                                <i className="bi bi-exclamation-triangle me-2"></i>
                                                                Missing Skills ({analysisResult.compatibility.missingSkills.length})
                                                            </h6>
                                                            <div className="mt-2 missing-skills">
                                                                {analysisResult.compatibility.missingSkills.map((skill, index) => (
                                                                    <span key={index} className="badge bg-warning me-1 mb-1">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {analysisResult.compatibility.recommendations.length > 0 && (
                                                        <div className="mt-3">
                                                            <h6>Recommendations:</h6>
                                                            <ul className="list-unstyled">
                                                                {analysisResult.compatibility.recommendations.map((rec, index) => (
                                                                    <li key={index} className="mb-1">
                                                                        <i className="bi bi-arrow-right text-primary me-2"></i>
                                                                        {rec}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CV Generation Section */}
                                    <div className="mb-4">
                                        <h4 className="border-bottom pb-2">
                                            <i className="bi bi-file-earmark-text me-2"></i>
                                            Generate Tailored CV
                                        </h4>
                                        
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">CV Title *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="e.g., Software Engineer CV for Tech Company"
                                                    value={formData.title}
                                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Select Template *</label>
                                                <select
                                                    className="form-select"
                                                    value={selectedTemplate || ''}
                                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                                >
                                                    <option value="">Choose a template...</option>
                                                    {templates.map(template => (
                                                        <option key={template.id} value={template.id}>
                                                            {template.name} - {template.description}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div className="d-flex justify-content-between">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => navigate('/dashboard')}
                                            >
                                                <i className="bi bi-arrow-left me-2"></i>
                                                Back to Dashboard
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                onClick={generateCVFromURL}
                                                disabled={generatingCV || !selectedTemplate || !formData.title.trim()}
                                            >
                                                {generatingCV ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Generating CV...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-magic me-2"></i>
                                                        Generate CV for Job
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Instructions when no analysis */}
                            {!analysisResult && !analyzing && (
                                <div className="text-center py-5">
                                    <i className="bi bi-search" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                    <h4 className="mt-3 text-muted">Ready to Analyze</h4>
                                    <p className="text-muted">
                                        Enter a job posting URL above and click "Analyze Job" to see compatibility with your uploaded documents.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCVForURL; 