import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import JobApplicationForm from './JobApplicationForm';
import '../styles/careers.css';
import '../styles/jobApplication.css';

// Fix for path-to-regexp issue with useParams

interface JobDetailProps {}

interface JobPosting {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  posted_date: string;
  salary_range?: string;
}

const JobDetail: React.FC<JobDetailProps> = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetail = async () => {
      if (!id) {
        setError('Job ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const jobData = await apiService.getJobPosting(parseInt(id));
        if (jobData) {
          setJob(jobData);
          setError(null);
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError('Failed to load job details');
        console.error('Error fetching job details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [id]);

  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const handleApply = () => {
    setShowApplicationForm(true);
    // Scroll to application form
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleBack = () => {
    navigate('/careers');
  };

  if (loading) {
    return (
      <div className="job-detail-container loading">
        <div className="loading-spinner"></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-detail-container error">
        <h2>Error</h2>
        <p>{error || 'Job not found'}</p>
        <button className="btn btn-primary" onClick={handleBack}>
          Back to Careers
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="job-detail-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="job-detail-header">
        <h1>{job.title}</h1>
        <div className="job-meta">
          <span className="job-department">{job.department}</span>
          <span className="job-location">{job.location}</span>
          <span className="job-type">{job.type}</span>
          {job.salary_range && <span className="job-salary">{job.salary_range}</span>}
        </div>
      </div>

      <div className="job-detail-content">
        <div className="job-description">
          <h2>Description</h2>
          <p>{job.description}</p>
        </div>

        <div className="job-requirements">
          <h2>Requirements</h2>
          <ul>
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="job-detail-actions">
        {!showApplicationForm && (
          <>
            <button className="btn btn-primary" onClick={handleApply}>
              Apply Now
            </button>
            <button className="btn btn-secondary" onClick={handleBack}>
              Back to Careers
            </button>
          </>
        )}
      </div>

      {showApplicationForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <JobApplicationForm jobId={parseInt(id!)} jobTitle={job.title} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default JobDetail;