import React from 'react';
import { motion } from 'framer-motion';

interface TimelineEvent {
  year: string;
  description: string;
}

interface CompanyTimelineProps {
  events: TimelineEvent[];
}

const CompanyTimeline: React.FC<CompanyTimelineProps> = ({ events }) => {
  return (
    <div className="company-timeline">
      {events.map((event, index) => (
        <motion.div
          key={index}
          className="timeline-event"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <div className="timeline-year">{event.year}</div>
          <div className="timeline-description">{event.description}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default CompanyTimeline;