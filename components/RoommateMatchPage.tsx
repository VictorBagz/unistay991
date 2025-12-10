import React, { useState, useMemo, useEffect } from 'react';
import { RoommateProfile, University, ConnectionRequest } from '../types';
import { UNIVERSITIES, GENDERS, STUDY_SCHEDULES, CLEANLINESS_LEVELS, GUEST_FREQUENCIES, DRINKING_HABITS, LEASE_DURATIONS } from '../constants';
import Spinner from './Spinner';
import LazyImage from './LazyImage';
import { useNotifier } from '../hooks/useNotifier';
import { connectionRequestService } from '../services/dbService';

interface RoommateMatchPageProps {
  currentUser: RoommateProfile | null;
  profiles: RoommateProfile[];
  universities: University[];
  onNavigateHome: () => void;
  onNavigateToProfile: () => void;
}

// Filter panel component
const FilterPanel = ({ filters, onFilterChange, activeFiltersCount }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleRangeChange = (key: string, value: number) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleSelectChange = (key: string, value: string) => {
    const currentValue = filters[key];
    if (Array.isArray(currentValue)) {
      if (currentValue.includes(value)) {
        onFilterChange({ ...filters, [key]: currentValue.filter(v => v !== value) });
      } else {
        onFilterChange({ ...filters, [key]: [...currentValue, value] });
      }
    }
  };

  const handleClearFilters = () => {
    onFilterChange({
      university: [],
      gender: [],
      ageMin: 18,
      ageMax: 40,
      budget: 10000000,
      cleanliness: [],
      studySchedule: [],
      guestFrequency: [],
      isSmoker: undefined,
      drinksAlcohol: [],
      leaseDuration: [],
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-unistay-navy flex items-center gap-2">
          <i className="fas fa-filter"></i>
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-unistay-yellow text-unistay-navy text-xs font-bold px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden text-unistay-navy hover:text-unistay-yellow transition-colors"
        >
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* University Filter */}
          <div className="pb-6 border-b">
            <label className="block text-sm font-semibold text-unistay-navy mb-3">University</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {UNIVERSITIES.map(uni => (
                <label key={uni.id} className="flex items-center gap-2 cursor-pointer hover:text-unistay-yellow transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.university.includes(uni.id)}
                    onChange={() => handleSelectChange('university', uni.id)}
                    className="rounded border-gray-300 text-unistay-yellow focus:ring-unistay-yellow"
                  />
                  <span className="text-sm text-gray-700">{uni.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div className="pb-6 border-b">
            <label className="block text-sm font-semibold text-unistay-navy mb-3">Gender</label>
            <div className="space-y-2">
              {GENDERS.map(gender => (
                <label key={gender} className="flex items-center gap-2 cursor-pointer hover:text-unistay-yellow transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.gender.includes(gender)}
                    onChange={() => handleSelectChange('gender', gender)}
                    className="rounded border-gray-300 text-unistay-yellow focus:ring-unistay-yellow"
                  />
                  <span className="text-sm text-gray-700">{gender}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Age Range */}
          <div className="pb-6 border-b">
            <label className="block text-sm font-semibold text-unistay-navy mb-3">Age Range</label>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Min</span>
                  <span>{filters.ageMin} years</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="40"
                  value={filters.ageMin}
                  onChange={(e) => handleRangeChange('ageMin', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Max</span>
                  <span>{filters.ageMax} years</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="40"
                  value={filters.ageMax}
                  onChange={(e) => handleRangeChange('ageMax', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Budget Range */}
          <div className="pb-6 border-b">
            <label className="block text-sm font-semibold text-unistay-navy mb-3">
              Budget: UGX {Math.round(filters.budget / 100000) * 100000 | 0}
            </label>
            <input
              type="range"
              min="100000"
              max="10000000"
              step="100000"
              value={filters.budget}
              onChange={(e) => handleRangeChange('budget', parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-2">Up to UGX {filters.budget.toLocaleString()}</p>
          </div>

          {/* Cleanliness */}
          <div className="pb-6 border-b">
            <label className="block text-sm font-semibold text-unistay-navy mb-3">Cleanliness Level</label>
            <div className="space-y-2">
              {CLEANLINESS_LEVELS.map(level => (
                <label key={level} className="flex items-center gap-2 cursor-pointer hover:text-unistay-yellow transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.cleanliness.includes(level)}
                    onChange={() => handleSelectChange('cleanliness', level)}
                    className="rounded border-gray-300 text-unistay-yellow focus:ring-unistay-yellow"
                  />
                  <span className="text-sm text-gray-700">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Study Schedule */}
          <div className="pb-6 border-b">
            <label className="block text-sm font-semibold text-unistay-navy mb-3">Study Schedule</label>
            <div className="space-y-2">
              {STUDY_SCHEDULES.map(schedule => (
                <label key={schedule} className="flex items-center gap-2 cursor-pointer hover:text-unistay-yellow transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.studySchedule.includes(schedule)}
                    onChange={() => handleSelectChange('studySchedule', schedule)}
                    className="rounded border-gray-300 text-unistay-yellow focus:ring-unistay-yellow"
                  />
                  <span className="text-sm text-gray-700">{schedule}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Guest Frequency */}
          <div className="pb-6 border-b">
            <label className="block text-sm font-semibold text-unistay-navy mb-3">Guest Frequency</label>
            <div className="space-y-2">
              {GUEST_FREQUENCIES.map(freq => (
                <label key={freq} className="flex items-center gap-2 cursor-pointer hover:text-unistay-yellow transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.guestFrequency.includes(freq)}
                    onChange={() => handleSelectChange('guestFrequency', freq)}
                    className="rounded border-gray-300 text-unistay-yellow focus:ring-unistay-yellow"
                  />
                  <span className="text-sm text-gray-700">{freq}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Drinking Habits */}
          <div className="pb-6 border-b">
            <label className="block text-sm font-semibold text-unistay-navy mb-3">Drinking Habits</label>
            <div className="space-y-2">
              {DRINKING_HABITS.map(habit => (
                <label key={habit} className="flex items-center gap-2 cursor-pointer hover:text-unistay-yellow transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.drinksAlcohol.includes(habit)}
                    onChange={() => handleSelectChange('drinksAlcohol', habit)}
                    className="rounded border-gray-300 text-unistay-yellow focus:ring-unistay-yellow"
                  />
                  <span className="text-sm text-gray-700">{habit}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lease Duration */}
          <div className="pb-6 border-b">
            <label className="block text-sm font-semibold text-unistay-navy mb-3">Lease Duration</label>
            <div className="space-y-2">
              {LEASE_DURATIONS.map(duration => (
                <label key={duration} className="flex items-center gap-2 cursor-pointer hover:text-unistay-yellow transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.leaseDuration.includes(duration)}
                    onChange={() => handleSelectChange('leaseDuration', duration)}
                    className="rounded border-gray-300 text-unistay-yellow focus:ring-unistay-yellow"
                  />
                  <span className="text-sm text-gray-700">{duration}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Smoker Filter */}
          <div className="pb-6 border-b">
            <label className="block text-sm font-semibold text-unistay-navy mb-3">Smoking</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer hover:text-unistay-yellow transition-colors">
                <input
                  type="radio"
                  name="smoker"
                  checked={filters.isSmoker === undefined}
                  onChange={() => handleRangeChange('isSmoker', undefined)}
                  className="border-gray-300 text-unistay-yellow focus:ring-unistay-yellow"
                />
                <span className="text-sm text-gray-700">Any</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-unistay-yellow transition-colors">
                <input
                  type="radio"
                  name="smoker"
                  checked={filters.isSmoker === false}
                  onChange={() => handleRangeChange('isSmoker', false)}
                  className="border-gray-300 text-unistay-yellow focus:ring-unistay-yellow"
                />
                <span className="text-sm text-gray-700">Non-Smoker</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-unistay-yellow transition-colors">
                <input
                  type="radio"
                  name="smoker"
                  checked={filters.isSmoker === true}
                  onChange={() => handleRangeChange('isSmoker', true)}
                  className="border-gray-300 text-unistay-yellow focus:ring-unistay-yellow"
                />
                <span className="text-sm text-gray-700">Smoker</span>
              </label>
            </div>
          </div>

          {/* Clear Filters Button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="w-full bg-red-50 text-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-red-100 transition-colors text-sm"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Roommate card component
const RoommateCard = ({ profile, matchPercentage, university, currentUser, onRequestSent }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const { notify } = useNotifier();

  useEffect(() => {
    checkRequestStatus();
  }, []);

  const checkRequestStatus = async () => {
    if (!currentUser?.id) return;
    try {
      const request = await connectionRequestService.checkRequestExists(currentUser.id, profile.id);
      if (request) {
        setRequestStatus(request.status as 'pending' | 'accepted');
      } else {
        setRequestStatus('none');
      }
    } catch (err) {
      console.error('Error checking request status:', err);
    }
  };

  const handleSendConnectionRequest = async () => {
    if (!currentUser?.id) {
      notify({ message: 'Please sign in to send connection requests', type: 'error' });
      return;
    }

    setIsConnecting(true);
    try {
      await connectionRequestService.sendRequest(
        currentUser.id,
        profile.id,
        currentUser.name,
        currentUser.imageUrl
      );
      setRequestStatus('pending');
      notify({ message: `Connection request sent to ${profile.name}!`, type: 'success' });
      onRequestSent?.();
    } catch (err) {
      console.error('Error sending connection request:', err);
      // Check if it's a table not found error
      if ((err as any)?.message?.includes('connection_requests') || (err as any)?.message?.includes('relation')) {
        notify({ message: 'Connection request feature is being set up. Please try again in a moment.', type: 'info' });
      } else {
        notify({ message: 'Failed to send connection request', type: 'error' });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const getButtonState = () => {
    if (requestStatus === 'accepted') {
      return { label: '✓ Roomies!', disabled: true, color: 'bg-green-600 hover:bg-green-700' };
    } else if (requestStatus === 'pending') {
      return { label: '⏳ Request Pending', disabled: true, color: 'bg-gray-400 hover:bg-gray-500' };
    } else {
      return { label: 'Send Connection Request', disabled: false, color: 'bg-unistay-navy hover:bg-unistay-navy/90' };
    }
  };

  const buttonState = getButtonState();
  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getMatchBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-blue-50 border-blue-200';
    if (percentage >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-xl ${getMatchBgColor(matchPercentage)}`}>
      <div className="relative">
        <LazyImage 
          src={profile.imageUrl || `https://picsum.photos/seed/${profile.name.toLowerCase()}/400/400`} 
          alt={profile.name} 
          className="h-64 w-full object-cover" 
          loading="lazy" 
        />
        <div className={`absolute top-3 right-3 ${getMatchColor(matchPercentage)} bg-white rounded-full h-20 w-20 flex flex-col items-center justify-center font-bold shadow-lg border-2`}>
          <span className="text-2xl">{matchPercentage}%</span>
          <span className="text-xs">Match</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-bold text-unistay-navy">{profile.name}, {profile.age}</h3>
            <p className="text-sm text-gray-600">{university}</p>
          </div>
        </div>

        <p className="text-gray-700 font-semibold mb-3">{profile.course} • Year {profile.yearOfStudy}</p>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{profile.bio || 'No bio provided'}</p>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-gray-500 text-xs">Budget</p>
            <p className="font-semibold text-unistay-navy">UGX {(profile.budget || 0).toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-gray-500 text-xs">Lease</p>
            <p className="font-semibold text-unistay-navy">{profile.leaseDuration}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-gray-500 text-xs">Study Schedule</p>
            <p className="font-semibold text-unistay-navy">{profile.studySchedule}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-gray-500 text-xs">Cleanliness</p>
            <p className="font-semibold text-unistay-navy">{profile.cleanliness}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.isSmoker ? (
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">Smoker</span>
          ) : (
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Non-Smoker</span>
          )}
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">{profile.drinksAlcohol}</span>
          <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">{profile.guestFrequency}</span>
        </div>

        {/* Hobbies */}
        {profile.hobbies && (
          <p className="text-xs text-gray-600 mb-4">
            <i className="fas fa-heart text-red-500 mr-1"></i>
            {profile.hobbies}
          </p>
        )}

        {/* Action Button */}
        <button
          onClick={handleSendConnectionRequest}
          disabled={isConnecting || buttonState.disabled}
          className={`w-full ${buttonState.color} text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {isConnecting ? (
            <>
              <Spinner color="white" size="sm" />
              Sending...
            </>
          ) : (
            <>
              <i className={`fas ${requestStatus === 'accepted' ? 'fa-check' : 'fa-paper-plane'}`}></i>
              {buttonState.label}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const RoommateMatchPage = ({
  currentUser,
  profiles,
  universities,
  onNavigateHome,
  onNavigateToProfile
}: RoommateMatchPageProps) => {
  const [filters, setFilters] = useState({
    university: [],
    gender: [],
    ageMin: 18,
    ageMax: 40,
    budget: 10000000,
    cleanliness: [],
    studySchedule: [],
    guestFrequency: [],
    isSmoker: undefined,
    drinksAlcohol: [],
    leaseDuration: [],
  });

  const [sortBy, setSortBy] = useState('match'); // 'match', 'recent', 'budget-low', 'budget-high'

  // Calculate match score
  const calculateMatchScore = (profile1: RoommateProfile, profile2: RoommateProfile): number => {
    if (!profile1 || !profile2) return 0;
    let score = 0;
    const weights = { gender: 20, budget: 25, university: 20, lifestyle: 25, interest: 10 };

    // Gender match
    const userLikesGender = profile1.seekingGender === 'Any' || profile1.seekingGender === profile2.gender;
    const otherLikesGender = profile2.seekingGender === 'Any' || profile2.seekingGender === profile1.gender;
    if (userLikesGender && otherLikesGender) score += weights.gender;

    // Budget
    const budgetDiff = Math.abs((profile1.budget || 0) - (profile2.budget || 0));
    const maxBudget = Math.max(profile1.budget || 1, 1);
    const budgetScore = Math.max(0, 1 - (budgetDiff / maxBudget));
    score += budgetScore * weights.budget;

    // University
    if (profile1.universityId === profile2.universityId) score += weights.university;

    // Lifestyle
    let lifestyleScore = 0;
    const lifestyleFactors = 5;
    if (profile1.isSmoker === profile2.isSmoker) lifestyleScore++;
    if (profile1.studySchedule === profile2.studySchedule) lifestyleScore++;
    else if (profile1.studySchedule === 'Flexible' || profile2.studySchedule === 'Flexible') lifestyleScore += 0.5;
    
    const cleanLevels = { 'Tidy': 2, 'Average': 1, 'Relaxed': 0 };
    const cleanDiff = Math.abs((cleanLevels[profile1.cleanliness] || 1) - (cleanLevels[profile2.cleanliness] || 1));
    if (cleanDiff === 0) lifestyleScore++;
    else if (cleanDiff === 1) lifestyleScore += 0.5;

    const guestLevels = { 'Often': 2, 'Sometimes': 1, 'Rarely': 0 };
    const guestDiff = Math.abs((guestLevels[profile1.guestFrequency] || 1) - (guestLevels[profile2.guestFrequency] || 1));
    if (guestDiff === 0) lifestyleScore++;
    else if (guestDiff === 1) lifestyleScore += 0.5;

    if (profile1.drinksAlcohol === profile2.drinksAlcohol) lifestyleScore++;
    else if (profile1.drinksAlcohol === 'Rarely' || profile2.drinksAlcohol === 'Rarely') lifestyleScore += 0.5;

    score += (lifestyleScore / lifestyleFactors) * weights.lifestyle;

    // Interest
    let interestScore = 0;
    if (Math.abs((profile1.yearOfStudy || 0) - (profile2.yearOfStudy || 0)) <= 1) interestScore += 5;
    const hobbies1 = (profile1.hobbies || '').toLowerCase().split(',').map(h => h.trim()).filter(Boolean);
    const hobbies2 = (profile2.hobbies || '').toLowerCase().split(',').map(h => h.trim()).filter(Boolean);
    const commonHobbies = hobbies1.filter(h => hobbies2.includes(h)).length;
    interestScore += Math.min(5, commonHobbies * 2.5);
    score += (interestScore / 10) * weights.interest;

    return Math.round(score);
  };

  // Filter and sort profiles
  const filteredMatches = useMemo(() => {
    if (!currentUser) return [];

    let matches = profiles
      .filter(p => p.id !== currentUser.id) // Exclude current user
      .map(p => ({
        profile: p,
        matchScore: calculateMatchScore(currentUser, p)
      }))
      .filter(m => {
        const p = m.profile;
        // Apply filters
        if (filters.university.length > 0 && !filters.university.includes(p.universityId)) return false;
        if (filters.gender.length > 0 && !filters.gender.includes(p.gender)) return false;
        if ((p.age || 0) < filters.ageMin || (p.age || 0) > filters.ageMax) return false;
        if ((p.budget || 0) > filters.budget) return false;
        if (filters.cleanliness.length > 0 && !filters.cleanliness.includes(p.cleanliness)) return false;
        if (filters.studySchedule.length > 0 && !filters.studySchedule.includes(p.studySchedule)) return false;
        if (filters.guestFrequency.length > 0 && !filters.guestFrequency.includes(p.guestFrequency)) return false;
        if (filters.drinksAlcohol.length > 0 && !filters.drinksAlcohol.includes(p.drinksAlcohol)) return false;
        if (filters.leaseDuration.length > 0 && !filters.leaseDuration.includes(p.leaseDuration)) return false;
        if (filters.isSmoker !== undefined && p.isSmoker !== filters.isSmoker) return false;
        return true;
      });

    // Sort
    if (sortBy === 'match') {
      matches.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'recent') {
      matches.sort((a, b) => (b.profile.id || '').localeCompare(a.profile.id || ''));
    } else if (sortBy === 'budget-low') {
      matches.sort((a, b) => (a.profile.budget || 0) - (b.profile.budget || 0));
    } else if (sortBy === 'budget-high') {
      matches.sort((a, b) => (b.profile.budget || 0) - (a.profile.budget || 0));
    }

    return matches;
  }, [currentUser, profiles, filters, sortBy]);

  // Count active filters
  const activeFiltersCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    if (value !== undefined && value !== 10000000 && value !== 18 && value !== 40) return count + 1;
    return count;
  }, 0);

  const getUniversityName = (uniId: string | undefined): string => {
    if (!uniId) return 'Unknown';
    const university = universities.find(u => u.id === uniId);
    return university ? university.name : 'Unknown';
  };

  if (!currentUser) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <div>
            <h1 className="text-3xl font-bold text-unistay-navy">Find a Roommate</h1>
            <p className="text-gray-600 text-sm">Discover your perfect match</p>
          </div>
          <button 
            onClick={onNavigateHome} 
            className="font-semibold text-unistay-navy hover:text-unistay-yellow transition-colors flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar - Hidden on mobile, visible on lg */}
          <div className="hidden lg:block">
            <FilterPanel 
              filters={filters} 
              onFilterChange={setFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <FilterPanel 
                filters={filters} 
                onFilterChange={setFilters}
                activeFiltersCount={activeFiltersCount}
              />
            </div>

            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Found <span className="font-bold text-unistay-navy text-lg">{filteredMatches.length}</span> compatible roommates
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="sortBy" className="text-sm font-semibold text-gray-700">Sort by:</label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <option value="match">Best Match</option>
                    <option value="recent">Most Recent</option>
                    <option value="budget-low">Budget: Low to High</option>
                    <option value="budget-high">Budget: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {filteredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredMatches.map(({ profile, matchScore }, index) => (
                  <div key={profile.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <RoommateCard 
                      profile={profile}
                      matchPercentage={matchScore}
                      university={getUniversityName(profile.universityId)}
                      currentUser={currentUser}
                      onRequestSent={() => {
                        // Refresh matches to update request status
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-2xl font-bold text-unistay-navy mb-2">No Matches Found</h3>
                <p className="text-gray-600 mb-6">
                  {activeFiltersCount > 0
                    ? 'Try adjusting your filters to see more roommate matches.'
                    : 'Be the first to complete your profile!'}
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => setFilters({
                      university: [],
                      gender: [],
                      ageMin: 18,
                      ageMax: 40,
                      budget: 10000000,
                      cleanliness: [],
                      studySchedule: [],
                      guestFrequency: [],
                      isSmoker: undefined,
                      drinksAlcohol: [],
                      leaseDuration: [],
                    })}
                    className="bg-unistay-yellow text-unistay-navy font-bold py-2 px-6 rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoommateMatchPage;
