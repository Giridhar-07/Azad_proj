import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { apiService } from '../services/api';

interface StatItemProps {
  value: number;
  label: string;
  suffix?: string;
  icon?: string;
  color?: string;
  delay?: number;
}

const StatItem: React.FC<StatItemProps> = ({ 
  value, 
  label, 
  suffix = '', 
  icon, 
  color = '#3b82f6',
  delay = 0 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Enhanced animation with easing
  useEffect(() => {
    if (isInView && !isAnimating) {
      setIsAnimating(true);
      
      const animateValue = () => {
        const duration = 2500 + (delay * 200); // Staggered animation
        const startTime = Date.now();
        const startValue = 0;
        const endValue = value;
        
        const updateValue = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function for smooth animation
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const currentValue = startValue + (endValue - startValue) * easeOutQuart;
          
          setDisplayValue(Math.floor(currentValue));
          
          if (progress < 1) {
            requestAnimationFrame(updateValue);
          }
        };
        
        requestAnimationFrame(updateValue);
      };
      
      setTimeout(animateValue, delay * 100);
    }
  }, [isInView, value, delay, isAnimating]);

  return (
    <motion.div
      ref={ref}
      className="stat-item"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          duration: 0.8,
          delay: delay * 0.1,
          ease: [0.6, -0.05, 0.01, 0.99]
        }
      } : {}}
      whileHover={{ 
        scale: 1.05,
        y: -5,
        transition: { duration: 0.3 }
      }}
      style={{
        background: `linear-gradient(135deg, ${color}25, ${color}10)`,
        borderColor: `${color}40`
      }}
    >
      {icon && (
        <motion.div 
          className="stat-icon"
          initial={{ rotate: 0 }}
          animate={isInView ? { rotate: 360 } : {}}
          transition={{ duration: 1, delay: delay * 0.1 + 0.5 }}
        >
          {icon}
        </motion.div>
      )}
      <motion.div 
        className="stat-value"
        style={{ color: `var(--text-color)` }}
        initial={{ scale: 0.8 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ duration: 0.5, delay: delay * 0.1 + 0.3 }}
      >
        {displayValue}{suffix}
      </motion.div>
      <motion.div 
        className="stat-label"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: delay * 0.1 + 0.6 }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
};

interface InteractiveStatsProps {
  stats?: Array<{ value: number; label: string; suffix?: string; icon?: string; color?: string }>;
  showTeamStats?: boolean;
}

const InteractiveStats: React.FC<InteractiveStatsProps> = ({ 
  stats: propStats, 
  showTeamStats = false 
}) => {
  const [stats, setStats] = useState(propStats || []);
  const [loading, setLoading] = useState(showTeamStats);
  const [error, setError] = useState<string | null>(null);

  // Fetch team statistics if enabled
  const fetchTeamStats = useCallback(async () => {
    if (!showTeamStats) return;
    
    try {
      setLoading(true);
      const teamStatsResponse = await apiService.getTeamStats();
      
      if (teamStatsResponse.success && teamStatsResponse.stats) {
        const { stats: teamStats } = teamStatsResponse;
        
        const enhancedStats = [
          {
            value: teamStats.total_members,
            label: "Team Members",
            suffix: "",
            icon: "👥",
            color: "#3b82f6"
          },
          {
            value: teamStats.leadership_count,
            label: "Leadership Team",
            suffix: "",
            icon: "⭐",
            color: "#f59e0b"
          },
          {
            value: teamStats.departments_count,
            label: "Departments",
            suffix: "",
            icon: "🏢",
            color: "#10b981"
          },
          {
            value: Math.round(teamStats.average_experience * 10) / 10,
            label: "Avg Experience",
            suffix: " years",
            icon: "📈",
            color: "#8b5cf6"
          },
          {
            value: teamStats.total_skills || 45,
            label: "Total Skills",
            suffix: "+",
            icon: "🛠️",
            color: "#ef4444"
          }
        ];
        
        setStats(enhancedStats);
      }
    } catch (err) {
      console.error('Error fetching team stats:', err);
      setError('Failed to load team statistics');
      
      // Fallback stats
      setStats([
        { value: 25, label: "Team Members", suffix: "", icon: "👥", color: "#3b82f6" },
        { value: 5, label: "Leadership Team", suffix: "", icon: "⭐", color: "#f59e0b" },
        { value: 4, label: "Departments", suffix: "", icon: "🏢", color: "#10b981" },
        { value: 4.2, label: "Avg Experience", suffix: " years", icon: "📈", color: "#8b5cf6" }
      ]);
    } finally {
      setLoading(false);
    }
  }, [showTeamStats]);

  useEffect(() => {
    if (showTeamStats) {
      fetchTeamStats();
    } else if (propStats) {
      setStats(propStats);
    }
  }, [showTeamStats, propStats, fetchTeamStats]);

  if (loading) {
    return (
      <div className="interactive-stats-container loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          ⏳
        </motion.div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error && stats.length === 0) {
    return (
      <div className="interactive-stats-container error">
        <p>⚠️ {error}</p>
        <button onClick={fetchTeamStats} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="interactive-stats-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {stats.map((stat, index) => (
        <StatItem 
          key={`${stat.label}-${index}`} 
          {...stat} 
          delay={index}
        />
      ))}
    </motion.div>
  );
};

export default InteractiveStats;