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
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-md border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-star text-xl text-blue-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Be Recognized</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Nominate students who shine bright in the community and deserve to be in the spotlight.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md border-l-4 border-indigo-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-crown text-xl text-indigo-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Get Featured</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Top nominees will be featured as MCM (Man Crush Monday) or WCW (Woman Crush Wednesday) winners.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md border-l-4 border-purple-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-heart text-xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Community Vote</h3>
            </div>
            <p className="text-gray-600 text-sm">
              All community members can vote for their favorite nominees throughout the month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NominationPage;
