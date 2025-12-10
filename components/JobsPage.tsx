
import React, { useState } from 'react';
import { Job } from '../types';
import JobDetailModal from './JobDetailModal';
import LazyImage from './LazyImage';

interface JobsPageProps {
  jobs: Job[];
  onNavigateHome: () => void;
}

const JobsPage = ({ jobs, onNavigateHome }: JobsPageProps) => {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    const handleViewDetails = (job: Job) => {
        setSelectedJob(job);
    };

    const handleCloseModal = () => {
        setSelectedJob(null);
    };

    return (
        <div className="bg-gray-100 min-h-screen">
             <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
                    <h1 className="text-3xl font-bold text-unistay-navy">Jobs & Internships</h1>
                    <button onClick={onNavigateHome} className="font-semibold text-unistay-navy hover:text-unistay-yellow transition-colors flex items-center gap-2">
                        <i className="fas fa-arrow-left"></i>
                        Back to Home
                    </button>
                </div>
            </header>
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pt-24">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-unistay-navy mb-6">Current Opportunities</h2>
                    {jobs.length > 0 ? (
                        <div className="space-y-6">
                            {jobs.map((job, index) => (
                              <div key={job.id} className="flex flex-col sm:flex-row items-center gap-6 p-4 border rounded-lg hover:shadow-md hover:border-unistay-yellow transition-all duration-300" style={{ animation: 'fade-in-up 0.5s ease-out forwards', animationDelay: `${index * 100}ms` }}>
                                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <LazyImage src={job.imageUrl} alt={job.company} className="w-16 h-16 object-contain" width={64} height={64} loading="lazy" />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                  <p className="font-bold text-lg text-unistay-navy">{job.title}</p>
                                  <p className="text-md text-gray-700">{job.company}</p>
                                </div>
                                <div className="text-center sm:text-right flex-shrink-0">
                                    <p className="text-sm text-gray-500">Apply by</p>
                                    <p className="font-semibold text-unistay-navy text-lg">{job.deadline}</p>
                                </div>
                                 <button
                                    onClick={() => handleViewDetails(job)}
                                    className="w-full sm:w-auto bg-unistay-navy text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-all flex-shrink-0 transform hover:scale-105">
                                    Details
                                </button>
                              </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <i className="fas fa-briefcase text-4xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold text-unistay-navy">No Job Openings</h3>
                            <p className="text-gray-500 mt-2">New opportunities are posted regularly. Check back soon!</p>
                        </div>
                    )}
                </div>
            </main>
            {selectedJob && <JobDetailModal job={selectedJob} onClose={handleCloseModal} />}
        </div>
    );
};

export default JobsPage;