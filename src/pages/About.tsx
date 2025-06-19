import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AOS from 'aos';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  image?: string;
  linkedin_url?: string;
  twitter_url?: string;
  github_url?: string;
}

const About: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });

    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('/api/team/');
      setTeamMembers(response.data);
    } catch (err) {
      // Fallback data for development
      setTeamMembers([
        {
          id: 1,
          name: 'Alex Johnson',
          position: 'CEO & Founder',
          bio: 'Visionary leader with 10+ years of experience in tech innovation and business development.',
          linkedin_url: '#',
          twitter_url: '#',
          github_url: '#'
        },
        {
          id: 2,
          name: 'Sarah Chen',
          position: 'CTO',
          bio: 'Technical expert specializing in full-stack development and system architecture.',
          linkedin_url: '#',
          twitter_url: '#',
          github_url: '#'
        },
        {
          id: 3,
          name: 'Mike Rodriguez',
          position: 'Lead Designer',
          bio: 'Creative designer focused on user experience and modern interface design.',
          linkedin_url: '#',
          twitter_url: '#',
          github_url: '#'
        },
        {
          id: 4,
          name: 'Emily Davis',
          position: 'Project Manager',
          bio: 'Experienced project manager ensuring smooth delivery and client satisfaction.',
          linkedin_url: '#',
          twitter_url: '#',
          github_url: '#'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero" data-aos="fade-up">
        <div className="container">
          <h1 className="page-title">About AZAYD</h1>
          <p className="page-subtitle">
            We are a passionate team of innovators dedicated to creating exceptional digital experiences
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="company-story" data-aos="fade-up">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2 className="section-title">Our Story</h2>
              <p>
                Founded in 2019, AZAYD began as a small team of developers with a big vision: 
                to bridge the gap between cutting-edge technology and practical business solutions. 
                What started as a passion project has grown into a full-service digital agency 
                serving clients worldwide.
              </p>
              <p>
                We believe that technology should empower businesses, not complicate them. 
                That's why we focus on creating solutions that are not only technically excellent 
                but also user-friendly and business-focused.
              </p>
            </div>
            <div className="story-visual">
              <div className="timeline">
                <div className="timeline-item" data-aos="fade-left" data-aos-delay="100">
                  <div className="timeline-year">2019</div>
                  <div className="timeline-content">
                    <h4>Company Founded</h4>
                    <p>Started with a vision to innovate</p>
                  </div>
                </div>
                <div className="timeline-item" data-aos="fade-left" data-aos-delay="200">
                  <div className="timeline-year">2020</div>
                  <div className="timeline-content">
                    <h4>First Major Client</h4>
                    <p>Delivered our first enterprise solution</p>
                  </div>
                </div>
                <div className="timeline-item" data-aos="fade-left" data-aos-delay="300">
                  <div className="timeline-year">2022</div>
                  <div className="timeline-content">
                    <h4>Team Expansion</h4>
                    <p>Grew to a team of 15+ professionals</p>
                  </div>
                </div>
                <div className="timeline-item" data-aos="fade-left" data-aos-delay="400">
                  <div className="timeline-year">2024</div>
                  <div className="timeline-content">
                    <h4>AI Integration</h4>
                    <p>Leading the way in AI-powered solutions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <div className="values-grid">
            <div className="value-card" data-aos="fade-up" data-aos-delay="100">
              <div className="value-icon">🎯</div>
              <h3>Excellence</h3>
              <p>We strive for perfection in every project, ensuring the highest quality deliverables.</p>
            </div>
            <div className="value-card" data-aos="fade-up" data-aos-delay="200">
              <div className="value-icon">🤝</div>
              <h3>Collaboration</h3>
              <p>We work closely with our clients as partners, not just service providers.</p>
            </div>
            <div className="value-card" data-aos="fade-up" data-aos-delay="300">
              <div className="value-icon">🚀</div>
              <h3>Innovation</h3>
              <p>We embrace new technologies and methodologies to stay ahead of the curve.</p>
            </div>
            <div className="value-card" data-aos="fade-up" data-aos-delay="400">
              <div className="value-icon">🔒</div>
              <h3>Integrity</h3>
              <p>We maintain the highest ethical standards in all our business practices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Meet Our Team</h2>
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading team members...</p>
            </div>
          ) : (
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <div 
                  key={member.id} 
                  className="team-card"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="member-image">
                    {member.image ? (
                      <img src={member.image} alt={member.name} />
                    ) : (
                      <div className="placeholder-avatar">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">{member.name}</h3>
                    <p className="member-position">{member.position}</p>
                    <p className="member-bio">{member.bio}</p>
                    <div className="social-links">
                      {member.linkedin_url && (
                        <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <i className="fab fa-linkedin"></i>
                        </a>
                      )}
                      {member.twitter_url && (
                        <a href={member.twitter_url} target="_blank" rel="noopener noreferrer">
                          <i className="fab fa-twitter"></i>
                        </a>
                      )}
                      {member.github_url && (
                        <a href={member.github_url} target="_blank" rel="noopener noreferrer">
                          <i className="fab fa-github"></i>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta" data-aos="fade-up">
        <div className="container">
          <div className="cta-content">
            <h2>Want to Join Our Team?</h2>
            <p>We're always looking for talented individuals to join our growing team.</p>
            <button className="btn btn-primary btn-large">View Careers</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;