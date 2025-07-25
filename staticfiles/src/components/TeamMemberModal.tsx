import React from 'react';
import { motion } from 'framer-motion';
import { TeamMember as TeamMemberType } from '../services/api';

interface TeamMemberModalProps {
  member: TeamMemberType | null;
  onClose: () => void;
}

const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ member, onClose }) => {
  if (!member) return null;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ y: "-100vh", opacity: 0 }}
        animate={{ y: "0", opacity: 1 }}
        exit={{ y: "100vh", opacity: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <div className="modal-header">
          <h2>{member.name}</h2>
          <h3>{member.position}</h3>
        </div>
        <div className="modal-body">
          <p><strong>Department:</strong> {member.department}</p>
          <p><strong>Experience:</strong> {member.years_experience} years</p>
          <p><strong>Skills:</strong> {member.skills?.join(', ')}</p>
          {member.achievements && member.achievements.length > 0 && (
            <div>
              <h4>Achievements:</h4>
              <ul>
                {member.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}
          {member.linkedin_url && <p><a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn</a></p>}
          {member.twitter_url && <p><a href={member.twitter_url} target="_blank" rel="noopener noreferrer">Twitter</a></p>}
          {member.github_url && <p><a href={member.github_url} target="_blank" rel="noopener noreferrer">GitHub</a></p>}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TeamMemberModal;