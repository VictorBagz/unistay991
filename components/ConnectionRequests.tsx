import React, { useState, useEffect } from 'react';
import { ConnectionRequest, RoommateProfile, University } from '../types';
import { useNotifier } from '../hooks/useNotifier';
import { connectionRequestService } from '../services/dbService';
import Spinner from './Spinner';
import LazyImage from './LazyImage';

interface ConnectionRequestsProps {
  userId: string;
  allProfiles: RoommateProfile[];
  universities: University[];
  onRequestHandled?: () => void;
}

const ConnectionRequests = ({
  userId,
  allProfiles,
  universities,
  onRequestHandled
}: ConnectionRequestsProps) => {
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const { notify } = useNotifier();

  useEffect(() => {
    loadReceivedRequests();
  }, [userId]);

  const loadReceivedRequests = async () => {
    setIsLoading(true);
    try {
      const requests = await connectionRequestService.getReceivedRequests(userId);
      setReceivedRequests(requests);
    } catch (err) {
      console.error('Error loading connection requests:', err);
      // If it's a table not found error, silently fail
      if ((err as any)?.message?.includes('connection_requests') || (err as any)?.message?.includes('relation')) {
        setReceivedRequests([]);
        console.warn('Connection requests table not yet created in Supabase');
      } else {
        notify({ message: 'Failed to load connection requests', type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string, senderId: string) => {
    setRespondingTo(requestId);
    try {
      await connectionRequestService.acceptRequest(requestId, senderId, userId);
      notify({ message: 'Connection request accepted! You are now roomies!', type: 'success' });
      setReceivedRequests(prev => prev.filter(r => r.id !== requestId));
      onRequestHandled?.();
    } catch (err) {
      console.error('Error accepting request:', err);
      notify({ message: 'Failed to accept connection request', type: 'error' });
    } finally {
      setRespondingTo(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setRespondingTo(requestId);
    try {
      await connectionRequestService.rejectRequest(requestId);
      notify({ message: 'Connection request declined', type: 'success' });
      setReceivedRequests(prev => prev.filter(r => r.id !== requestId));
      onRequestHandled?.();
    } catch (err) {
      console.error('Error rejecting request:', err);
      notify({ message: 'Failed to decline connection request', type: 'error' });
    } finally {
      setRespondingTo(null);
    }
  };

  const getSenderProfile = (senderId: string) => {
    return allProfiles.find(p => p.id === senderId);
  };

  const getUniversityName = (uniId: string | undefined): string => {
    if (!uniId) return 'Unknown';
    const university = universities.find(u => u.id === uniId);
    return university ? university.name : 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (receivedRequests.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <i className="fas fa-heart text-4xl text-gray-300 mb-3"></i>
        <p className="text-gray-600 font-semibold">No connection requests yet</p>
        <p className="text-gray-500 text-sm mt-1">When someone sends you a roommate request, it will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {receivedRequests.map(request => {
        const senderProfile = getSenderProfile(request.senderId);
        if (!senderProfile) return null;

        return (
          <div
            key={request.id}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-unistay-yellow hover:shadow-xl transition-shadow"
          >
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Sender Image */}
              <div className="flex-shrink-0">
                <LazyImage
                  src={senderProfile.imageUrl || `https://picsum.photos/seed/${senderProfile.name.toLowerCase()}/100/100`}
                  alt={senderProfile.name}
                  className="h-24 w-24 rounded-full object-cover shadow-md"
                  loading="lazy"
                />
              </div>

              {/* Sender Info */}
              <div className="flex-grow">
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-unistay-navy">{senderProfile.name}, {senderProfile.age}</h3>
                  <p className="text-sm text-gray-600">{getUniversityName(senderProfile.universityId)}</p>
                </div>

                <p className="text-gray-700 font-semibold mb-2">{senderProfile.course} • Year {senderProfile.yearOfStudy}</p>

                {senderProfile.bio && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{senderProfile.bio}</p>
                )}

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 text-xs">Budget</p>
                    <p className="font-semibold text-unistay-navy text-sm">UGX {(senderProfile.budget || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 text-xs">Schedule</p>
                    <p className="font-semibold text-unistay-navy text-sm">{senderProfile.studySchedule}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 text-xs">Cleanliness</p>
                    <p className="font-semibold text-unistay-navy text-sm">{senderProfile.cleanliness}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 text-xs">Lease</p>
                    <p className="font-semibold text-unistay-navy text-sm">{senderProfile.leaseDuration}</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {senderProfile.isSmoker ? (
                    <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">Smoker</span>
                  ) : (
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Non-Smoker</span>
                  )}
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">{senderProfile.drinksAlcohol}</span>
                  <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">{senderProfile.guestFrequency}</span>
                </div>

                {/* Request Date */}
                <p className="text-xs text-gray-500 mb-4">
                  Requested on {new Date(request.createdAt).toLocaleDateString()}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAcceptRequest(request.id, request.senderId)}
                    disabled={respondingTo === request.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {respondingTo === request.id ? (
                      <>
                        <Spinner color="white" size="sm" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        Accept
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    disabled={respondingTo === request.id}
                    className="flex-1 bg-red-200 hover:bg-red-300 text-red-700 font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {respondingTo === request.id ? (
                      <>
                        <Spinner color="red" size="sm" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-times"></i>
                        Decline
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConnectionRequests;
