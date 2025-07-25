import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Clock, DollarSign, Star, CheckCircle } from 'lucide-react';

/**
 * Service Detail Modal Component
 * 
 * Features:
 * - Detailed service information display
 * - Smooth animations and transitions
 * - Responsive design
 * - Accessibility support
 * - Call-to-action buttons
 * 
 * @param service - Service object to display
 * @param isOpen - Modal visibility state
 * @param onClose - Function to close modal
 */

interface Service {
  id: number;
  title: string;
  description: string;
  short_description?: string;
  icon?: string;
  price: string;
  tech_stack: string[];
  image?: string;
  duration?: string;
  is_featured?: boolean;
  features?: string[];
}

interface ServiceDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ service, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!service) return null;

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{service.icon || '🚀'}</div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">{service.title}</h2>
                  {service.is_featured && (
                    <div className="flex items-center space-x-1 text-yellow-300">
                      <Star size={16} fill="currentColor" />
                      <span className="text-sm">Featured Service</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                      Service Overview
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Features */}
                  {service.features && service.features.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                        What's Included
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {service.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technology Stack */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                      Technologies Used
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {service.tech_stack.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Service Image */}
                  {service.image && (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  {/* Service Details */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                    <div className="flex items-center space-x-3">
                      <DollarSign size={20} className="text-green-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Starting Price</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{service.price}</p>
                      </div>
                    </div>

                    {service.duration && (
                      <div className="flex items-center space-x-3">
                        <Clock size={20} className="text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{service.duration}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Call to Action */}
                  <div className="space-y-3">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2">
                      <span>Get Started</span>
                      <ExternalLink size={16} />
                    </button>
                    
                    <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                      Request Quote
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServiceDetailModal;