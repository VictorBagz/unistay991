import React, { useState } from 'react';
import { University, StudentSpotlight } from '../types';
import SpotlightNominationForm from './SpotlightNominationForm';
import { spotlightService } from '../services/dbService';
import { useNotifier } from '../hooks/useNotifier';

interface NominationPageProps {
  onBack: () => void;
  universities: University[];
}

const NominationPage: React.FC<NominationPageProps> = ({ onBack, universities }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showNotification } = useNotifier();

  const handleSubmitNomination = async (formData: any) => {
    try {
      setIsSubmitting(true);

      // Prepare data for database
      const nomineeData: Omit<StudentSpotlight, 'id' | 'date'> = {
        name: formData.fullName,
        major: formData.course,
        bio: `${formData.about}\n\nExtracurricular Activities: ${formData.extracurricularActivities}`,
        imageUrl: formData.imageUrl,
        universityId: formData.university,
        gender: formData.nominee === 'mcm' ? 'male' : 'female',
        votes: 0,
        interests: formData.extracurricularActivities
          .split(',')
          .map((activity: string) => activity.trim())
          .filter((activity: string) => activity.length > 0),
      };

      // Add to database
      await spotlightService.add(nomineeData as any);

      setIsSuccess(true);
      showNotification('Nomination submitted successfully! 🎉', 'success');

      // Reset form after success
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error) {
      console.error('Error submitting nomination:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to submit nomination. Please try again.',
        'error'
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-6 py-12">
        <div className="max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce">
              <i className="fas fa-check text-4xl text-white"></i>
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3">Success! 🎉</h2>
          <p className="text-gray-600 text-lg mb-8">
            Your nomination has been submitted successfully. Thank you for recognizing this amazing student!
          </p>
          <p className="text-sm text-gray-500 mb-8">Redirecting you back...</p>
          <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
            <div className="bg-green-500 h-full animate-progress" style={{ width: '100%', animation: 'progress 2s ease-in-out' }}></div>
          </div>
        </div>

        <style>{`
          @keyframes progress {
            from { width: 0; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-unistay-navy hover:text-unistay-yellow transition-colors mb-8 font-semibold group"
        >
          <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          Back to Student Spotlight
        </button>

        {/* Main Form */}
        <SpotlightNominationForm
          onSubmit={handleSubmitNomination}
          onCancel={onBack}
          isSubmitting={isSubmitting}
        />

        {/* Info Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Be Recognized Card */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Header Image */}
            <div className="relative h-40 bg-blue-600 flex items-center justify-center overflow-hidden">
              <img 
                src="/images/services/bbb2.jpg" 
                alt="Recognition"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-blue-600/30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-blue-500/40 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <i className="fas fa-star text-4xl text-white"></i>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg font-black text-gray-900 mb-2">Be Recognized</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Nominate students who shine bright in the community and deserve to be in the spotlight.
              </p>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-blue-600 font-semibold mt-3">✨ Recognition</p>
              </div>
            </div>
          </div>

          {/* Get Featured Card */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Header Image */}
            <div className="relative h-40 bg-amber-500 flex items-center justify-center overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop" 
                alt="Featured"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-amber-500/30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-amber-500/40 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <i className="fas fa-crown text-4xl text-white"></i>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg font-black text-gray-900 mb-2">Get Featured</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Top nominees will be featured as MCM (Man Crush Monday) or WCW (Woman Crush Wednesday) winners.
              </p>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-amber-600 font-semibold mt-3">👑 Winners</p>
              </div>
            </div>
          </div>

          {/* Community Vote Card */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Header Image */}
            <div className="relative h-40 bg-purple-600 flex items-center justify-center overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=300&fit=crop" 
                alt="Community Vote"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-purple-600/30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-purple-500/40 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <i className="fas fa-heart text-4xl text-white"></i>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg font-black text-gray-900 mb-2">Community Vote</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                All community members can vote for their favorite nominees throughout the month.
              </p>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-purple-600 font-semibold mt-3">🗳️ Voting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NominationPage;
