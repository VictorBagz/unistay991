
import React, { useEffect } from 'react';
import { Job } from '../types';

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
}

const JobDetailModal = ({ job, onClose }: JobDetailModalProps) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex items-center justify-center p-4 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-slide-in-down"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-unistay-navy">{job.title}</h2>
              <p className="text-gray-600 mt-1">{job.company} &middot; <span className="text-gray-500">{job.location}</span></p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-unistay-navy transition-colors h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 flex-shrink-0 ml-4"
              aria-label="Close modal"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">{job.type}</span>
            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full">Deadline: {job.deadline}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar flex-grow">
          <div>
            <h3 className="text-lg font-bold text-unistay-navy mb-2">Job Description</h3>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </div>

          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-unistay-navy mb-2">Responsibilities</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {job.responsibilities.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          )}

          {job.qualifications && job.qualifications.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-unistay-navy mb-2">Qualifications</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {job.qualifications.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <a
            href={job.howToApply}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block text-center bg-unistay-navy hover:bg-opacity-90 text-white font-bold text-lg py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Apply Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;