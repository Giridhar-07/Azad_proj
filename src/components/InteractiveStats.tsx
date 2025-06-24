import React from 'react';
import { motion, useInView } from 'framer-motion';

interface StatItemProps {
  value: number;
  label: string;
  suffix?: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, suffix = '' }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000; // milliseconds
      let startTime: number | null = null;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = (currentTime - startTime) / duration;
        const animatedValue = Math.min(progress, 1) * end;
        setDisplayValue(Math.floor(animatedValue));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      className="stat-item"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="stat-value">{displayValue}{suffix}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
};

interface InteractiveStatsProps {
  stats: Array<{ value: number; label: string; suffix?: string }>;
}

const InteractiveStats: React.FC<InteractiveStatsProps> = ({ stats }) => {
  return (
    <div className="interactive-stats-container">
      {stats.map((stat, index) => (
        <StatItem key={index} {...stat} />
      ))}
    </div>
  );
};

export default InteractiveStats;