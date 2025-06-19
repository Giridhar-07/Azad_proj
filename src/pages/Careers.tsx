import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AOS from 'aos';

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

const Careers: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });

    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs/');
      setJobs(response.data);
    } catch (err) {
      // Fallback data for development
      setJobs([
        {
          id: 1,
          title: 'Senior Full Stack Developer',
          department: 'Engineering',
          location: 'Remote / New York',
          type: 'Full-time',
          description: 'We are looking for a senior full stack developer to join our growing engineering team. You will be responsible for developing and maintaining our web applications using modern technologies.',
          requirements: [
            '5+ years of experience in full stack development',
            'Proficiency in React, Node.js, and TypeScript',
            'Experience with cloud platforms (AWS, Azure, or GCP)',
            'Strong understanding of database design and optimization',
            'Excellent problem-solving and communication skills'
          ],
          posted_date: '2024-01-15',
          salary_range: '$120,000 - $160,000'
        },
        {
          id: 2,
          title: 'UI/UX Designer',
          department: 'Design',
          location: 'San Francisco / Remote',
          type: 'Full-time',
          description: 'Join our design team to create beautiful and intuitive user experiences. You will work closely with product managers and developers to bring designs to life.',
          requirements: [
            '3+ years of experience in UI/UX design',
            'Proficiency in Figma, Sketch, or Adobe XD',
            'Strong portfolio demonstrating design thinking',
            'Experience with user research and testing',
            'Knowledge of design systems and accessibility'
          ],
          posted_date: '2024-01-10',
          salary_range: '$90,000 - $130,000'
        },
        {
          id: 3,
          title: 'DevOps Engineer',
          department: 'Engineering',
          location: 'Austin / Remote',
          type: 'Full-time',
          description: 'Help us scale our infrastructure and improve our deployment processes. You will work on automation, monitoring, and ensuring high availability of our systems.',
          requirements: [
            '4+ years of experience in DevOps or Site Reliability Engineering',
            'Experience with Docker, Kubernetes, and CI/CD pipelines',
            'Knowledge of infrastructure as code (Terraform, CloudFormation)',
            'Experience with monitoring and logging tools',
            'Strong scripting skills (Python, Bash, or similar)'
          ],
          posted_date: '2024-01-08',
          salary_range: '$110,000 - $150,000'
        },
        {
          id: 4,
          title: 'Product Manager',
          department: 'Product',
          location: 'Boston / Remote',
          type: 'Full-time',
          description: 'Lead product strategy and execution for our core platform. You will work with cross-functional teams to define and deliver features that delight our users.',
          requirements: [
            '3+ years of experience in product management',
            'Strong analytical and data-driven decision making skills',
            'Experience with agile development methodologies',
            'Excellent communication and leadership skills',
            'Technical background or strong technical aptitude'
          ],
          posted_date: '2024-01-05',
          salary_range: '$100,000 - $140,000'
        },
        {
          id: 5,
          title: 'Marketing Specialist',
          department: 'Marketing',
          location: 'Los Angeles / Remote',
          type: 'Full-time',
          description: 'Drive our marketing initiatives and help grow our brand presence. You will be responsible for content creation, social media management, and campaign execution.',
          requirements: [
            '2+ years of experience in digital marketing',
            'Experience with content creation and social media management',
            'Knowledge of SEO, SEM, and marketing analytics',
            'Strong writing and communication skills',
            'Creative mindset with attention to detail'
          ],
          posted_date: '2024-01-03',
          salary_range: '$60,000 - $80,000'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const departments = ['all', ...Array.from(new Set(jobs.map(job => job.department)))];
  const filteredJobs = filterDepartment === 'all' 
    ? jobs 
    : jobs.filter(job => job.department === filterDepartment);

  const handleApply = (job: JobPosting) => {
    // In a real application, this would open an application form or redirect to an application page
    alert(`Application process for ${job.title} would be initiated here.`);
  };

  return (
    <div className="careers-page">
      {/* Hero Section */}
      <section className="careers-hero" data-aos="fade-up">
        <div className="container">
          <h1 className="page-title">Join Our Team</h1>
          <p className="page-subtitle">
            Build the future with us. We're looking for passionate individuals who want to make a difference.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Why Work at AZAYD?</h2>
          <div className="benefits-grid">
            <div className="benefit-card" data-aos="fade-up" data-aos-delay="100">
              <div className="benefit-icon">💰</div>
              <h3>Competitive Salary</h3>
              <p>We offer competitive compensation packages with equity options.</p>
            </div>
            <div className="benefit-card" data-aos="fade-up" data-aos-delay="200">
              <div className="benefit-icon">🏠</div>
              <h3>Remote Friendly</h3>
              <p>Work from anywhere with flexible hours and remote-first culture.</p>
            </div>
            <div className="benefit-card" data-aos="fade-up" data-aos-delay="300">
              <div className="benefit-icon">📚</div>
              <h3>Learning & Growth</h3>
              <p>Continuous learning opportunities and professional development budget.</p>
            </div>
            <div className="benefit-card" data-aos="fade-up" data-aos-delay="400">
              <div className="benefit-icon">🏥</div>
              <h3>Health Benefits</h3>
              <p>Comprehensive health, dental, and vision insurance coverage.</p>
            </div>
            <div className="benefit-card" data-aos="fade-up" data-aos-delay="500">
              <div className="benefit-icon">🌴</div>
              <h3>Unlimited PTO</h3>
              <p>Take the time you need to recharge with our unlimited vacation policy.</p>
            </div>
            <div className="benefit-card" data-aos="fade-up" data-aos-delay="600">
              <div className="benefit-icon">🎯</div>
              <h3>Impact</h3>
              <p>Work on meaningful projects that make a real difference for our clients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="jobs-section" data-aos="fade-up">
        <div className="container">
          <div className="jobs-header">
            <h2 className="section-title">Open Positions</h2>
            <div className="jobs-filter">
              <label htmlFor="department-filter">Filter by Department:</label>
              <select 
                id="department-filter"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="filter-select"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading job openings...</p>
            </div>
          ) : (
            <div className="jobs-list">
              {filteredJobs.length === 0 ? (
                <div className="no-jobs">
                  <p>No job openings found for the selected department.</p>
                </div>
              ) : (
                filteredJobs.map((job, index) => (
                  <div 
                    key={job.id} 
                    className="job-card"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="job-header">
                      <div className="job-title-section">
                        <h3 className="job-title">{job.title}</h3>
                        <div className="job-meta">
                          <span className="job-department">{job.department}</span>
                          <span className="job-location">{job.location}</span>
                          <span className="job-type">{job.type}</span>
                        </div>
                      </div>
                      <div className="job-actions">
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                        >
                          {selectedJob?.id === job.id ? 'Hide Details' : 'View Details'}
                        </button>
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleApply(job)}
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                    
                    {selectedJob?.id === job.id && (
                      <div className="job-details">
                        <div className="job-description">
                          <h4>Description</h4>
                          <p>{job.description}</p>
                        </div>
                        
                        <div className="job-requirements">
                          <h4>Requirements</h4>
                          <ul>
                            {job.requirements.map((req, reqIndex) => (
                              <li key={reqIndex}>{req}</li>
                            ))}
                          </ul>
                        </div>
                        
                        {job.salary_range && (
                          <div className="job-salary">
                            <h4>Salary Range</h4>
                            <p>{job.salary_range}</p>
                          </div>
                        )}
                        
                        <div className="job-posted">
                          <p><strong>Posted:</strong> {new Date(job.posted_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="careers-cta" data-aos="fade-up">
        <div className="container">
          <div className="cta-content">
            <h2>Don't See a Perfect Match?</h2>
            <p>We're always interested in hearing from talented individuals. Send us your resume and let's talk!</p>
            <button className="btn btn-primary btn-large">Send Resume</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Careers;