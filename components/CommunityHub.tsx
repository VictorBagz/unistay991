
import React, { useState, forwardRef } from 'react';
import { NewsItem, Event, Job, University, User, Confession } from '../types';
import { useScrollObserver } from '../hooks/useScrollObserver';
import { formatTimeAgo, sortByTimestamp } from '../utils/dateUtils';
import { spotlightVoteService } from '../services/dbService';
import Spinner from './Spinner';
import EventDetailModal from './EventDetailModal';
import NewsDetailModal from './NewsDetailModal';

type AppView = 'main' | 'roommateFinder' | 'blog' | 'events' | 'jobs' | 'auth' | 'admin' | 'profile';

// Mock data types for new sections
interface Deal {
  id: string;
  title: string;
  description: string;
  discount: number;
  imageUrl: string;
  imageUrls?: string[]; // Support for multiple images
  postedBy: string;
  timestamp: string;
}

interface LostItem {
  id: string;
  title: string;
  description: string;
  category: 'lost' | 'found';
  imageUrl: string;
  postedBy: string;
  phone: string;
  timestamp: string;
}

interface StudentSpotlight {
  id: string;
  name: string;
  major: string;
  bio: string;
  imageUrl: string;
  universityId?: string;
  date: string;
  votes: number;
  gender: 'male' | 'female';
  isWinner?: boolean;
}

const NewsPanel = ({ items, onNavigateToBlog, onSelectNews }: { items: NewsItem[], onNavigateToBlog: () => void, onSelectNews?: (news: NewsItem) => void }) => {
  const sortedItems = sortByTimestamp(items).slice(0, 6);
  
  return (
    <div className="space-y-4">
      {sortedItems.map(item => (
      <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <img src={item.imageUrl} alt={item.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-unistay-navy">{item.title}</p>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-400">{item.timestamp ? formatTimeAgo(item.timestamp) : 'Recently'}</p>
            <p className="text-xs text-gray-400">Source: {item.source}</p>
          </div>
          <button 
            onClick={() => onSelectNews ? onSelectNews(item) : onNavigateToBlog()}
            className="mt-2 text-sm font-semibold text-unistay-yellow hover:text-unistay-navy transition-colors"
          >
            Read Full Article <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    ))}
  </div>
  );
};

const EventsPanel = ({ items, onSelectEvent }: { items: Event[], onSelectEvent?: (event: Event) => void }) => {
  const [fullImageUrl, setFullImageUrl] = React.useState<string | null>(null);
  
  // Sort events by timestamp (most recent posted first). Fallback to event.date if timestamp is missing.
  const sorted = [...items].sort((a, b) => {
    const taVal = (a as any).timestamp;
    const tbVal = (b as any).timestamp;
    const ta = taVal ? new Date(taVal).getTime() : (a.date ? new Date(a.date).getTime() : 0);
    const tb = tbVal ? new Date(tbVal).getTime() : (b.date ? new Date(b.date).getTime() : 0);
    return tb - ta;
  }).slice(0, 6);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sorted.map((event, index) => (
          <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300" style={{ animation: 'fade-in-up 0.5s ease-out forwards', animationDelay: `${index * 100}ms` }}>
            <div className="relative cursor-pointer" onClick={() => setFullImageUrl(event.imageUrl)}>
              <img src={event.imageUrl} alt={event.title} className="h-56 w-full object-cover group-hover:opacity-75 transition-opacity duration-300" />
              <div className="absolute top-4 left-4 bg-unistay-yellow text-unistay-navy text-center rounded-lg px-4 py-2 shadow-lg">
                <p className="font-extrabold text-2xl">{event.day}</p>
                <p className="font-bold text-sm leading-tight">{event.month}</p>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-xl text-unistay-navy mb-2 group-hover:text-unistay-yellow transition-colors">{event.title}</h3>
              <p className="text-sm text-gray-600"><i className="fas fa-calendar-alt text-gray-400 mr-2"></i>{event.date}</p>
              <p className="text-sm text-gray-600 mt-1"><i className="fas fa-map-marker-alt text-gray-400 mr-2"></i>{event.location}</p>
              <button 
                onClick={() => onSelectEvent?.(event)}
                className="mt-4 w-full bg-unistay-navy text-white font-semibold py-2 rounded-lg hover:bg-opacity-80 transition-all transform hover:scale-105"
              >
                More Info
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full Image Popup */}
      {fullImageUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setFullImageUrl(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={fullImageUrl} 
              alt="Full view" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setFullImageUrl(null)}
              className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg"
            >
              <i className="fas fa-times text-lg text-gray-800"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const JobsPanel = ({ items }: { items: Job[] }) => (
    <div className="space-y-4">
    {items.slice(0, 6).map(job => (
      <div key={job.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <img src={job.imageUrl} alt={job.company} className="w-12 h-12 object-contain"/>
        </div>
        <div className="flex-1">
          <p className="font-bold text-unistay-navy">{job.title}</p>
          <p className="text-sm text-gray-600">{job.company}</p>
        </div>
        <div className="text-right">
            <p className="text-sm text-gray-500">Apply by</p>
            <p className="font-semibold text-unistay-navy">{job.deadline}</p>
        </div>
      </div>
    ))}
  </div>
);

const StudentDealsPanel = ({ items }: { items: Deal[] }) => {
  const [currentImageIndices, setCurrentImageIndices] = React.useState<Record<string, number>>({});
  const [touchStart, setTouchStart] = React.useState<Record<string, number>>({});
  const [fullImageUrl, setFullImageUrl] = React.useState<string | null>(null);

  // Initialize current image indices
  React.useEffect(() => {
    const indices: Record<string, number> = {};
    items.forEach(deal => {
      indices[deal.id] = 0;
    });
    setCurrentImageIndices(indices);
  }, [items]);

  const getImages = (deal: Deal) => {
    return deal.imageUrls && deal.imageUrls.length > 0 ? deal.imageUrls : [deal.imageUrl];
  };

  const getCurrentImage = (deal: Deal) => {
    const images = getImages(deal);
    return images[currentImageIndices[deal.id] || 0] || deal.imageUrl;
  };

  const goToNextImage = (dealId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const images = getImages(items.find(d => d.id === dealId)!);
    setCurrentImageIndices(prev => ({
      ...prev,
      [dealId]: (prev[dealId] + 1) % images.length,
    }));
  };

  const goToPrevImage = (dealId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const images = getImages(items.find(d => d.id === dealId)!);
    setCurrentImageIndices(prev => ({
      ...prev,
      [dealId]: (prev[dealId] - 1 + images.length) % images.length,
    }));
  };

  const handleTouchStart = (dealId: string, e: React.TouchEvent) => {
    setTouchStart(prev => ({
      ...prev,
      [dealId]: e.touches[0].clientX,
    }));
  };

  const handleTouchEnd = (dealId: string, e: React.TouchEvent) => {
    if (!touchStart[dealId]) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart[dealId] - touchEnd;

    // Swipe threshold of 50 pixels
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped left - go to next image
        goToNextImage(dealId, e as any);
      } else {
        // Swiped right - go to previous image
        goToPrevImage(dealId, e as any);
      }
    }

    setTouchStart(prev => {
      const newState = { ...prev };
      delete newState[dealId];
      return newState;
    });
  };

  return (
    <>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-6 pb-4 min-w-min">
          {items.map(deal => {
            const images = getImages(deal);
            const currentImageIndex = currentImageIndices[deal.id] || 0;
            const hasMultipleImages = images.length > 1;

            return (
              <div 
                key={deal.id} 
                className="flex-shrink-0 w-72 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col"
              >
                {/* Image Container with Navigation */}
                <div 
                  className="relative h-40 w-full overflow-hidden bg-gray-100 group cursor-pointer"
                  onTouchStart={(e) => handleTouchStart(deal.id, e)}
                  onTouchEnd={(e) => handleTouchEnd(deal.id, e)}
                  onClick={() => setFullImageUrl(getCurrentImage(deal))}
                >
                  <img 
                    src={getCurrentImage(deal)} 
                    alt={deal.title} 
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-75" 
                  />

                  {/* Previous Button */}
                  {hasMultipleImages && (
                    <button
                      onClick={(e) => goToPrevImage(deal.id, e)}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1.5 transition-all duration-200 shadow-md z-10"
                      aria-label="Previous image"
                    >
                      <i className="fas fa-chevron-left text-gray-800 text-sm"></i>
                    </button>
                  )}

                  {/* Next Button */}
                  {hasMultipleImages && (
                    <button
                      onClick={(e) => goToNextImage(deal.id, e)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1.5 transition-all duration-200 shadow-md z-10"
                      aria-label="Next image"
                    >
                      <i className="fas fa-chevron-right text-gray-800 text-sm"></i>
                    </button>
                  )}

                  {/* Discount Badge */}
                  <div className="absolute top-3 right-3 bg-unistay-yellow text-unistay-navy font-bold px-3 py-1 rounded-full text-sm">
                    {deal.discount}% OFF
                  </div>

                  {/* Image Counter */}
                  {hasMultipleImages && (
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}

                  {/* Image Indicators (Dots) */}
                  {hasMultipleImages && (
                    <div className="absolute bottom-3 right-3 flex gap-1">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndices(prev => ({
                              ...prev,
                              [deal.id]: idx,
                            }));
                          }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentImageIndex
                              ? 'bg-white w-3'
                              : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                          }`}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Content - Fixed Height Container */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-unistay-navy">{deal.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 flex-grow">{deal.description}</p>
                  <p className="text-xs text-gray-400 mt-3">{deal.timestamp ? formatTimeAgo(deal.timestamp) : 'Recently'}</p>
                  
                  {/* Button - Fixed at Bottom */}
                  <button className="mt-auto pt-4 w-full bg-unistay-navy text-white font-semibold py-2 px-4 rounded-lg hover:bg-unistay-yellow hover:text-unistay-navy transition-colors">
                    Order Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Image Popup */}
      {fullImageUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setFullImageUrl(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={fullImageUrl} 
              alt="Full view" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setFullImageUrl(null)}
              className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg"
            >
              <i className="fas fa-times text-lg text-gray-800"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const LostAndFoundPanel = ({ items }: { items: LostItem[] }) => {
  const [fullImageUrl, setFullImageUrl] = React.useState<string | null>(null);

  return (
    <>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 pb-4 min-w-min">
          {items.map(item => (
            <div key={item.id} className={`flex-shrink-0 w-96 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 ${
              item.category === 'lost' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
            }`}>
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-40 rounded-lg object-cover mb-3 cursor-pointer hover:opacity-75 transition-opacity duration-300" 
                onClick={() => setFullImageUrl(item.imageUrl)}
              />
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-unistay-navy">{item.title}</h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  item.category === 'lost' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                }`}>
                  {item.category === 'lost' ? 'LOST' : 'FOUND'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <i className="fas fa-phone"></i> {item.phone}
              </p>
              <p className="text-xs text-gray-400 mt-2">{item.timestamp ? formatTimeAgo(item.timestamp) : 'Recently'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Full Image Popup */}
      {fullImageUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setFullImageUrl(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={fullImageUrl} 
              alt="Full view" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setFullImageUrl(null)}
              className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg"
            >
              <i className="fas fa-times text-lg text-gray-800"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const StudentSpotlightPanel = ({ items, user, onNavigateToNomination }: { items: StudentSpotlight[], user: User | null, onNavigateToNomination?: () => void }) => {
  const [votes, setVotes] = React.useState<Record<string, number>>({});
  const [hasVoted, setHasVoted] = React.useState<Set<string>>(new Set());
  const [userVotedMale, setUserVotedMale] = React.useState(false);
  const [userVotedFemale, setUserVotedFemale] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<StudentSpotlight | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [votingInProgress, setVotingInProgress] = React.useState<string | null>(null);

  // Load vote data from database on component mount
  React.useEffect(() => {
    const loadVoteData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get all votes for the current user
        const userVotes = await spotlightVoteService.getUserVotes(user.id);
        setHasVoted(new Set(userVotes));
        
        // Check if user has voted for each category
        let hasVotedForMale = false;
        let hasVotedForFemale = false;
        
        for (const studentId of userVotes) {
          const student = items.find(s => s.id === studentId);
          if (student) {
            if (student.gender === 'male') {
              hasVotedForMale = true;
            } else if (student.gender === 'female') {
              hasVotedForFemale = true;
            }
          }
        }
        
        setUserVotedMale(hasVotedForMale);
        setUserVotedFemale(hasVotedForFemale);

        // Get vote counts for all students
        const voteCounts: Record<string, number> = {};
        for (const item of items) {
          try {
            const count = await spotlightVoteService.getVoteCount(item.id);
            voteCounts[item.id] = count;
          } catch (err) {
            console.error(`Error loading vote count for student ${item.id}:`, err);
            voteCounts[item.id] = item.votes || 0;
          }
        }
        setVotes(voteCounts);
      } catch (error) {
        console.error('Error loading vote data:', error);
        // Fall back to using the votes from the items
        const initialVotes: Record<string, number> = {};
        items.forEach(item => {
          initialVotes[item.id] = item.votes || 0;
        });
        setVotes(initialVotes);
      } finally {
        setIsLoading(false);
      }
    };

    loadVoteData();
  }, [user, items]);

  // Map universityId to university name (you can import UNIVERSITIES from constants if needed)
  const getUniversityName = (universityId?: string) => {
    // Simple mapping - adjust IDs as needed based on your constants
    const universities: Record<string, string> = {
      '123e4567-e89b-12d3-a456-426614174001': 'Makerere',
      '123e4567-e89b-12d3-a456-426614174002': 'Kyambogo',
      '123e4567-e89b-12d3-a456-426614174003': 'MUBS',
      '123e4567-e89b-12d3-a456-426614174004': 'UCU',
      '123e4567-e89b-12d3-a456-426614174005': 'UMU Nkozi',
      '123e4567-e89b-12d3-a456-426614174006': 'KIU',
      '123e4567-e89b-12d3-a456-426614174007': 'MUST',
      '123e4567-e89b-12d3-a456-426614174008': 'Aga Khan',
      '123e4567-e89b-12d3-a456-426614174009': 'Gulu',
      '123e4567-e89b-12d3-a456-426614174010': 'Lira',
      '123e4567-e89b-12d3-a456-426614174011': 'IUEA',
    };
    return universities[universityId || ''] || 'University';
  };

  const handleVote = async (studentId: string, category: 'male' | 'female') => {
    if (!user) return;
    
    // Check if user has already voted in this category
    if (category === 'male' && userVotedMale) {
      alert('You have already voted for a male candidate. You can only vote for one candidate per category.');
      return;
    }
    
    if (category === 'female' && userVotedFemale) {
      alert('You have already voted for a female candidate. You can only vote for one candidate per category.');
      return;
    }
    
    try {
      setVotingInProgress(studentId);
      // Add vote to database
      await spotlightVoteService.addVote(studentId, user.id);
      
      // Update local state
      setVotes(prev => ({
        ...prev,
        [studentId]: (prev[studentId] || 0) + 1,
      }));
      setHasVoted(prev => new Set(prev).add(studentId));
      
      // Update category-specific voting status
      if (category === 'male') {
        setUserVotedMale(true);
      } else {
        setUserVotedFemale(true);
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert(error instanceof Error ? error.message : 'Error voting. Please try again.');
      // Re-check if user has voted (in case of race condition)
      const userVotes = await spotlightVoteService.getUserVotes(user.id);
      if (userVotes.length > 0) {
        setHasVoted(new Set(userVotes));
        // Recheck voting status per category
        let hasVotedForMale = false;
        let hasVotedForFemale = false;
        
        for (const studentId of userVotes) {
          const student = items.find(s => s.id === studentId);
          if (student) {
            if (student.gender === 'male') {
              hasVotedForMale = true;
            } else if (student.gender === 'female') {
              hasVotedForFemale = true;
            }
          }
        }
        
        setUserVotedMale(hasVotedForMale);
        setUserVotedFemale(hasVotedForFemale);
      }
    } finally {
      setVotingInProgress(null);
    }
  };

  // Separate by gender and sort by votes
  const maleStudents = items.filter(item => item.gender === 'male').sort((a, b) => {
    const aVotes = votes[a.id] || a.votes || 0;
    const bVotes = votes[b.id] || b.votes || 0;
    return bVotes - aVotes;
  });

  const femaleStudents = items.filter(item => item.gender === 'female').sort((a, b) => {
    const aVotes = votes[a.id] || a.votes || 0;
    const bVotes = votes[b.id] || b.votes || 0;
    return bVotes - aVotes;
  });

  const maleWinner = maleStudents[0];
  const femaleWinner = femaleStudents[0];
  const maleNominees = maleStudents.slice(1);
  const femaleNominees = femaleStudents.slice(1);

  // Component for rendering winner
  const WinnerCard = ({ student, category }: { student: StudentSpotlight, category: 'male' | 'female' }) => (
    <div className={`group relative flex-shrink-0 w-96 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 ${
      category === 'male' 
        ? 'bg-gradient-to-br from-blue-500 to-blue-700' 
        : 'bg-gradient-to-br from-pink-500 to-pink-700'
    }`}>
      {/* Ribbon Badge */}
      <div className={`absolute top-0 right-0 z-20 flex items-center gap-2 px-6 py-3 rounded-bl-3xl font-bold text-white shadow-lg ${
        category === 'male'
          ? 'bg-blue-700'
          : 'bg-pink-700'
      }`}>
        <span className="text-xl">{category === 'male' ? '💙' : '🩷'}</span>
        <span>#{category === 'male' ? 'MCM' : 'WCW'}</span>
      </div>

      {/* Image Container with Overlay */}
      <div className="relative h-72 overflow-hidden">
        <img src={student.imageUrl} alt={student.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
      </div>

      {/* Content Container */}
      <div className="relative px-8 py-8 bg-white">
        {/* Vote Count Badge */}
        <div className={`absolute -top-6 right-8 flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-lg font-bold text-white transform group-hover:scale-110 transition-transform duration-300 ${
          category === 'male'
            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
            : 'bg-gradient-to-br from-pink-500 to-pink-600'
        }`}>
          <span className="text-2xl">{votes[student.id] || student.votes || 0}</span>
          <span className="text-xs">votes</span>
        </div>

        <div className="mt-4">
          <h3 className="text-2xl font-black text-gray-900 mb-1">{student.name}</h3>
          <p className={`text-sm font-semibold mb-2 ${
            category === 'male'
              ? 'text-blue-600'
              : 'text-pink-600'
          }`}>{student.major}</p>
          <p className="text-xs text-gray-500 mb-3"><i className="fas fa-university mr-1"></i>{getUniversityName(student.universityId)}</p>
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">{student.bio}</p>
        </div>

        {/* Divider */}
        <div className={`my-4 h-1 rounded-full ${
          category === 'male'
            ? 'bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300'
            : 'bg-gradient-to-r from-pink-300 via-pink-500 to-pink-300'
        }`}></div>

        {/* Crown Icon */}
        <div className="flex items-center justify-center">
          <span className="text-3xl animate-bounce">👑</span>
        </div>
      </div>
    </div>
  );

  // Component for rendering nominee
  const NomineeCard = ({ student }: { student: StudentSpotlight }) => {
    const studentVotes = votes[student.id] || 0;
    const isMale = student.gender === 'male';
    const categoryVoted = isMale ? userVotedMale : userVotedFemale;
    const isVotedForThisStudent = hasVoted.has(student.id);
    
    return (
      <div className={`group flex-shrink-0 w-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 h-full flex flex-col bg-white border-2 ${
        isMale ? 'border-blue-200 hover:border-blue-400' : 'border-pink-200 hover:border-pink-400'
      }`}>
        {/* Image Container with Overlay */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
          <img src={student.imageUrl} alt={student.name} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500" />
          
          {/* Gradient Overlay on Hover */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${
            isMale
              ? 'bg-gradient-to-t from-blue-600 via-transparent to-transparent'
              : 'bg-gradient-to-t from-pink-600 via-transparent to-transparent'
          }`}></div>

          {/* Vote Count Badge - Floating */}
          <div className={`absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full text-white font-bold text-sm backdrop-blur-md shadow-lg transform group-hover:scale-110 transition-transform duration-300 ${
            isMale ? 'bg-blue-600/80' : 'bg-pink-600/80'
          }`}>
            <i className="fas fa-fire text-xs"></i>
            {studentVotes}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-6">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-pink-600 transition-all duration-300 mb-1">
            {student.name}
          </h3>
          <p className={`text-sm font-semibold mb-2 ${
            isMale ? 'text-blue-600' : 'text-pink-600'
          }`}>
            {student.major}
          </p>
          <p className="text-xs text-gray-500 mb-3"><i className="fas fa-university mr-1"></i>{getUniversityName(student.universityId)}</p>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
            {student.bio}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedStudent(student)}
              className="flex-1 py-2 px-3 rounded-lg font-semibold transition-all duration-300 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
            >
              <i className="fas fa-eye mr-1"></i>View More
            </button>
            <button
              onClick={() => handleVote(student.id, isMale ? 'male' : 'female')}
              disabled={!user || categoryVoted || votingInProgress === student.id}
              title={!user ? 'Sign in to vote' : categoryVoted ? `You have already voted for a ${isMale ? 'male' : 'female'} candidate` : 'Vote for this student'}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all duration-300 text-sm flex items-center justify-center gap-1 transform ${
                !user
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-60'
                  : categoryVoted
                  ? 'bg-gray-200 text-gray-700 cursor-not-allowed'
                  : votingInProgress === student.id
                  ? 'opacity-70 cursor-not-allowed'
                  : isMale
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-105'
                  : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 hover:shadow-lg hover:scale-105'
              }`}
            >
              {votingInProgress === student.id ? (
                <Spinner color="white" size="sm" />
              ) : (
                <>
                  <i className={`fas ${!user ? 'fa-lock' : categoryVoted ? 'fa-check' : 'fa-thumbs-up'}`}></i>
                  {!user ? 'Sign in' : categoryVoted ? 'Voted' : 'Vote'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-16">
      {/* MCM Section - Man Crush Monday */}
      <div>
        <div className="mb-12">
          <h3 className="text-3xl font-black text-gray-900 mb-3">
            💙 Man Crush Monday
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 rounded-full"></div>
            <p className="text-gray-600 font-semibold">Vote for your favorite male student</p>
          </div>
        </div>

        {/* Winner Showcase */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <h4 className="text-2xl font-bold text-gray-900">Current Winner</h4>
            {maleWinner && (
              <span className="ml-auto text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full">
                {votes[maleWinner.id] || maleWinner.votes || 0} votes
              </span>
            )}
          </div>
          {maleWinner && (
            <div className="flex justify-center">
              <div key={maleWinner.id}>
                <WinnerCard student={maleWinner} category="male" />
              </div>
            </div>
          )}
        </div>

        {/* Nominees */}
        {maleNominees.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <h4 className="text-2xl font-bold text-gray-900">Other Nominees</h4>
              <span className="ml-auto text-sm text-white font-bold bg-gray-400 px-4 py-2 rounded-full">{maleNominees.length} Nominees</span>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-6 pb-4 min-w-min justify-center mx-auto">
                {maleNominees.map((student) => (
                  <div key={student.id}>
                    <NomineeCard student={student} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Divider Section */}
      <div className="py-12">
        <div className="h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full"></div>
      </div>

      {/* WCW Section - Women Crush Wednesday */}
      <div>
        <div className="mb-12">
          <h3 className="text-3xl font-black text-gray-900 mb-3">
            🩷 Women Crush Wednesday
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-16 h-1 bg-gradient-to-r from-pink-500 via-pink-600 to-pink-500 rounded-full"></div>
            <p className="text-gray-600 font-semibold">Vote for your favorite female student</p>
          </div>
        </div>

        {/* Winner Showcase */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <h4 className="text-2xl font-bold text-gray-900">Current Winner</h4>
            {femaleWinner && (
              <span className="ml-auto text-sm font-bold bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-full">
                {votes[femaleWinner.id] || femaleWinner.votes || 0} votes
              </span>
            )}
          </div>
          {femaleWinner && (
            <div className="flex justify-center">
              <div key={femaleWinner.id}>
                <WinnerCard student={femaleWinner} category="female" />
              </div>
            </div>
          )}
        </div>

        {/* Nominees */}
        {femaleNominees.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <h4 className="text-2xl font-bold text-gray-900">Other Nominees</h4>
              <span className="ml-auto text-sm text-white font-bold bg-gray-400 px-4 py-2 rounded-full">{femaleNominees.length} Nominees</span>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-6 pb-4 min-w-min justify-center mx-auto">
                {femaleNominees.map((student) => (
                  <div key={student.id}>
                    <NomineeCard student={student} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nomination Section */}
      {onNavigateToNomination && (
        <div className="border-t pt-16">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-black text-gray-900 mb-3">
              ⭐ Know Someone Worthy?
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              Don't see your favorite student here? Nominate them for MCM or WCW and help them shine in the spotlight!
            </p>
            <button
              onClick={onNavigateToNomination}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 transition-all duration-300 hover:shadow-xl hover:scale-105 group"
            >
              <i className="fas fa-edit group-hover:scale-110 transition-transform"></i>
              Nominate a Student
              <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>

            {/* Header Image */}
            <div className="relative h-80 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
              <img 
                src={selectedStudent.imageUrl} 
                alt={selectedStudent.name} 
                className="w-full h-full object-cover"
              />
              {/* Category Badge */}
              <div className={`absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-white shadow-lg ${
                selectedStudent.gender === 'male'
                  ? 'bg-blue-700'
                  : 'bg-pink-700'
              }`}>
                <span>{selectedStudent.gender === 'male' ? '💙' : '🩷'}</span>
                <span>{selectedStudent.gender === 'male' ? 'Male Student' : 'Female Student'}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Name and Title */}
              <div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">{selectedStudent.name}</h2>
                <p className={`text-lg font-semibold ${
                  selectedStudent.gender === 'male' ? 'text-blue-600' : 'text-pink-600'
                }`}>{selectedStudent.major}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-semibold mb-1">University</p>
                  <p className="text-lg font-bold text-gray-900"><i className="fas fa-university mr-2"></i>{getUniversityName(selectedStudent.universityId)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-semibold mb-1">Votes</p>
                  <p className="text-lg font-bold text-gray-900"><i className="fas fa-fire mr-2"></i>{votes[selectedStudent.id] || selectedStudent.votes || 0}</p>
                </div>
              </div>

              {/* Full Bio */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">About</h3>
                <p className="text-gray-700 leading-relaxed text-base">{selectedStudent.bio}</p>
              </div>

              {/* Additional Info if available */}
              {selectedStudent.interests && selectedStudent.interests.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.interests.map((interest, idx) => (
                      <span key={idx} className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                        selectedStudent.gender === 'male' 
                          ? 'bg-blue-500' 
                          : 'bg-pink-500'
                      }`}>
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Vote Button */}
              <button
                onClick={() => {
                  handleVote(selectedStudent.id);
                  // Don't close modal immediately - let it stay open while voting
                }}
                disabled={!user || hasVoted.has(selectedStudent.id) || votingInProgress === selectedStudent.id}
                className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-lg ${
                  !user
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-60'
                    : hasVoted.has(selectedStudent.id)
                    ? 'bg-gray-200 text-gray-700 cursor-not-allowed'
                    : votingInProgress === selectedStudent.id
                    ? 'opacity-70 cursor-not-allowed'
                    : selectedStudent.gender === 'male'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg'
                    : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 hover:shadow-lg'
                }`}
              >
                {votingInProgress === selectedStudent.id ? (
                  <>
                    <Spinner color={hasVoted.has(selectedStudent.id) ? 'navy' : 'white'} size="sm" />
                    Voting...
                  </>
                ) : (
                  <>
                    <i className={`fas ${!user ? 'fa-lock' : hasVoted.has(selectedStudent.id) ? 'fa-check' : 'fa-thumbs-up'}`}></i>
                    {!user ? 'Sign in to Vote' : hasVoted.has(selectedStudent.id) ? 'Already Voted' : 'Vote for this Student'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AnonymousConfessionsPanel = ({ items, user, confessionHandler }: { items: Confession[], user: User | null, confessionHandler?: any }) => {
  const [expandedComments, setExpandedComments] = React.useState<Set<string>>(new Set());
  const [commentInput, setCommentInput] = React.useState<Record<string, string>>({});

  const toggleComments = (confessionId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(confessionId)) {
        newSet.delete(confessionId);
      } else {
        newSet.add(confessionId);
      }
      return newSet;
    });
  };

  const handleAddComment = async (confessionId: string) => {
    const comment = commentInput[confessionId]?.trim();
    if (!comment || !confessionHandler) return;

    try {
      await confessionHandler.addComment(confessionId, comment, user?.name || 'Anonymous');
      setCommentInput(prev => ({ ...prev, [confessionId]: '' }));
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleLike = async (confessionId: string, currentStatus?: 'like' | 'dislike' | null) => {
    if (!user || !confessionHandler) return;
    try {
      await confessionHandler.like(confessionId, currentStatus);
    } catch (err) {
      console.error('Failed to like confession:', err);
    }
  };

  const handleDislike = async (confessionId: string, currentStatus?: 'like' | 'dislike' | null) => {
    if (!user || !confessionHandler) return;
    try {
      await confessionHandler.dislike(confessionId, currentStatus);
    } catch (err) {
      console.error('Failed to dislike confession:', err);
    }
  };

  return (
    <div className="space-y-4">
      {items.map(confession => (
        <div key={confession.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-purple-200">
          <p className="text-gray-800 italic mb-3">{confession.content}</p>
          
          {/* Footer with Timestamp */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">{confession.timestamp ? formatTimeAgo(confession.timestamp) : 'Recently'}</span>
          </div>

          {/* Like/Dislike and Comments Section */}
          <div className="flex items-center gap-4 pt-3 border-t border-purple-200">
            {/* Like Button */}
            <button
              onClick={() => handleLike(confession.id, confession.userLikeStatus)}
              disabled={!user || (confession.userLikeStatus !== null && confession.userLikeStatus !== 'like')}
              title={
                !user 
                  ? 'Sign in to react' 
                  : confession.userLikeStatus === 'like'
                  ? 'Click to undo your like'
                  : confession.userLikeStatus === 'dislike'
                  ? 'You already reacted with dislike'
                  : 'Like this confession'
              }
              className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
                confession.userLikeStatus === 'like'
                  ? 'text-green-600 cursor-pointer'
                  : user && confession.userLikeStatus === null
                  ? 'text-gray-600 hover:text-green-600 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              <i className={`fas fa-thumbs-up ${confession.userLikeStatus === 'like' ? 'fas' : 'far'}`}></i>
              {Number(confession.likes) || 0}
            </button>

            {/* Dislike Button */}
            <button
              onClick={() => handleDislike(confession.id, confession.userLikeStatus)}
              disabled={!user || (confession.userLikeStatus !== null && confession.userLikeStatus !== 'dislike')}
              title={
                !user 
                  ? 'Sign in to react' 
                  : confession.userLikeStatus === 'dislike'
                  ? 'Click to undo your dislike'
                  : confession.userLikeStatus === 'like'
                  ? 'You already reacted with like'
                  : 'Dislike this confession'
              }
              className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
                confession.userLikeStatus === 'dislike'
                  ? 'text-red-600 cursor-pointer'
                  : user && confession.userLikeStatus === null
                  ? 'text-gray-600 hover:text-red-600 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              <i className={`fas fa-thumbs-down ${confession.userLikeStatus === 'dislike' ? 'fas' : 'far'}`}></i>
              {Number(confession.dislikes) || 0}
            </button>

            {/* Comments Toggle */}
            <button
              onClick={() => toggleComments(confession.id)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
            >
              <i className="fas fa-comment"></i>
              {confession.comments?.length || 0}
            </button>
          </div>

          {/* Comments Section */}
          {expandedComments.has(confession.id) && (
            <div className="mt-4 pt-4 border-t border-purple-200 space-y-3">
              {/* Comment Form */}
              {user && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    maxLength={150}
                    value={commentInput[confession.id] || ''}
                    onChange={(e) => setCommentInput(prev => ({ ...prev, [confession.id]: e.target.value }))}
                    className="flex-1 px-3 py-2 text-sm border border-purple-300 rounded-lg focus:ring-1 focus:ring-purple-400 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleAddComment(confession.id)}
                    disabled={!commentInput[confession.id]?.trim()}
                    className="px-3 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Post
                  </button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {confession.comments && confession.comments.length > 0 ? (
                  confession.comments.map(comment => (
                    <div key={comment.id} className="p-2 bg-white rounded border border-purple-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">{comment.userName}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(comment.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-2">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};


interface CommunityHubProps {
  news: NewsItem[];
  events: Event[];
  jobs: Job[];
  universities: University[];
  onNavigateToBlog: () => void;
  onNavigateToEvents: () => void;
  onNavigateToJobs: () => void;
  onNavigateToNomination?: () => void;
  user: User | null;
  onNavigate: (view: AppView) => void;
  deals?: Deal[];
  lostItems?: LostItem[];
  studentSpotlights?: StudentSpotlight[];
  confessions?: Confession[];
  studentDealsRef?: React.RefObject<HTMLDivElement>;
  studentSpotlightRef?: React.RefObject<HTMLDivElement>;
  confessionHandler?: {
    add: (content: string) => Promise<void>;
    remove: (id: string) => Promise<void>;
    like: (id: string, currentStatus?: 'like' | 'dislike' | null) => Promise<void>;
    dislike: (id: string, currentStatus?: 'like' | 'dislike' | null) => Promise<void>;
    addComment: (confessionId: string, comment: string, userName?: string) => Promise<void>;
  };
}

const CommunityHub = forwardRef<HTMLDivElement, CommunityHubProps>(({ news, events, jobs, universities, onNavigateToBlog, onNavigateToEvents, onNavigateToJobs, onNavigateToNomination, user, onNavigate, deals = [], lostItems = [], studentSpotlights = [], confessions = [], studentDealsRef, studentSpotlightRef, confessionHandler }: CommunityHubProps, ref) => {
  const [activeTab, setActiveTab] = useState('News');
  const [sectionRef, isVisible] = useScrollObserver<HTMLElement>();
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [selectedNews, setSelectedNews] = React.useState<NewsItem | null>(null);

  const tabs = [
    { name: 'News', icon: 'fas fa-newspaper', action: onNavigateToBlog },
    { name: 'Events', icon: 'fas fa-calendar-alt', action: onNavigateToEvents },
    { name: 'Jobs', icon: 'fas fa-briefcase', action: onNavigateToJobs },
  ];

  const panels = {
    News: <NewsPanel items={news} onNavigateToBlog={onNavigateToBlog} onSelectNews={setSelectedNews} />,
    Events: <EventsPanel items={events} onSelectEvent={setSelectedEvent} />,
    Jobs: <JobsPanel items={jobs} />,
  };
  
  return (
    <section ref={sectionRef} className="py-16 bg-unistay-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'}`}>
          <h2 className="text-3xl font-bold text-unistay-navy sm:text-4xl">Campus Community Hub</h2>
          <p className="mt-4 text-lg text-gray-600">Stay connected with the latest news, events, and job opportunities from your university.</p>
        </div>

        {/* Main Tabs Section */}
        <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100' : 'opacity-100'}`}>
            <div className="mb-8 flex justify-center border-b-2 border-gray-200" role="tablist" aria-label="Community Hub Tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`px-4 sm:px-8 py-4 font-semibold text-lg border-b-4 transition-all duration-300 -mb-0.5 ${
                            activeTab === tab.name
                            ? 'text-unistay-navy border-unistay-yellow'
                            : 'text-gray-500 border-transparent hover:text-unistay-navy hover:border-gray-300'
                        }`}
                        role="tab"
                        aria-selected={activeTab === tab.name}
                        aria-controls={`panel-${tab.name}`}
                    >
                       <i className={`${tab.icon} mr-2 hidden sm:inline-block`} aria-hidden="true"></i> {tab.name}
                    </button>
                ))}
            </div>

            <div className="relative min-h-[400px]">
              {Object.entries(panels).map(([name, panel]) => (
                  <div key={name} id={`panel-${name}`} role="tabpanel" aria-labelledby={`tab-${name}`} className={`transition-opacity duration-500 ${activeTab === name ? 'opacity-100' : 'opacity-0 absolute w-full pointer-events-none'}`}>
                      {panel}
                  </div>
              ))}
            </div>

            <div className="text-center mt-8">
                <button onClick={tabs.find(t => t.name === activeTab)?.action} className="font-bold text-unistay-navy hover:text-unistay-yellow transition-colors flex items-center gap-2 mx-auto">
                    <span>View All {activeTab}</span>
                    <i className="fas fa-arrow-right" aria-hidden="true"></i>
                </button>
            </div>
        </div>

        {/* Student Deals Section */}
        {deals && deals.length > 0 && (
          <div ref={studentDealsRef} className={`mt-16 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100' : 'opacity-100'}`}>
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-unistay-navy mb-2">🛍️ Student Deals</h3>
              <p className="text-gray-600">Exclusive discounts and offers from local businesses</p>
            </div>
            <StudentDealsPanel items={deals} />
          </div>
        )}

        {/* Lost and Found Section */}
        {lostItems && lostItems.length > 0 && (
          <div className={`mt-16 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100' : 'opacity-100'}`}>
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-unistay-navy mb-2">🔍 Lost & Found</h3>
              <p className="text-gray-600">Help classmates find their lost items or report something you found</p>
            </div>
            <LostAndFoundPanel items={lostItems} />
          </div>
        )}

        {/* Student Spotlight Section */}
        {studentSpotlights && studentSpotlights.length > 0 && (
          <div ref={studentSpotlightRef} className={`mt-16 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100' : 'opacity-100'}`}>
            {/* Header with Background Image */}
            <div className="relative -mx-6 -mt-8 mb-10 z-10">
              {/* Background Image with Overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-fixed"
                style={{
                  backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400"><defs><pattern id="pattern" patternUnits="userSpaceOnUse" width="100" height="100"><circle cx="50" cy="50" r="40" fill="none" stroke="%23FFD700" stroke-width="1" opacity="0.1"/><circle cx="50" cy="50" r="30" fill="none" stroke="%23FFD700" stroke-width="1" opacity="0.15"/><circle cx="50" cy="50" r="20" fill="none" stroke="%23FFD700" stroke-width="1" opacity="0.2"/></pattern></defs><rect width="1200" height="400" fill="%230A2540"/><rect width="1200" height="400" fill="url(%23pattern)"/></svg>')`,
                  backgroundAttachment: 'fixed'
                }}
              ></div>
              
              {/* Dark Blue Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-unistay-navy via-blue-900 to-unistay-navy"></div>
              
              {/* Content */}
              <div className="relative px-6 py-12 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto">
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-3">
                    Student Spotlight
                  </h3>
                  <p className="text-lg md:text-xl text-yellow-200 font-semibold">
                    Get to know a featured student from our community
                  </p>
                  
                  {/* Decorative Bottom Border */}
                  <div className="mt-6 flex gap-2">
                    <div className="h-1 w-16 bg-unistay-yellow rounded-full"></div>
                    <div className="h-1 w-12 bg-unistay-yellow rounded-full opacity-75"></div>
                    <div className="h-1 w-8 bg-unistay-yellow rounded-full opacity-50"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <StudentSpotlightPanel items={studentSpotlights} user={user} onNavigateToNomination={onNavigateToNomination} />
          </div>
        )}

        {/* Anonymous Confessions Section */}
        {confessions && confessions.length > 0 && (
          <div className={`mt-16 transition-all duration-700 delay-600 ${isVisible ? 'opacity-100' : 'opacity-100'}`}>
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-unistay-navy mb-2">💭 Anonymous Confessions</h3>
              <p className="text-gray-600">Share your thoughts anonymously with the community</p>
            </div>
            <AnonymousConfessionsPanel items={confessions} user={user} confessionHandler={confessionHandler} />
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* News Detail Modal */}
      {selectedNews && (
        <NewsDetailModal
          news={selectedNews}
          onClose={() => setSelectedNews(null)}
        />
      )}
    </section>
  );
});

CommunityHub.displayName = 'CommunityHub';

export default CommunityHub;
