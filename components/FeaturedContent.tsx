

import React, { useState, useRef } from 'react';
import { University, Hostel } from '../types';
import { useScrollObserver } from '../hooks/useScrollObserver';
import LazyImage from './LazyImage';

// Reusable Hostel Card Component
const HostelCard = ({ hostel, onViewHostel, onSaveToggle, isSaved }: { hostel: Hostel; onViewHostel: (hostel: Hostel) => void; onSaveToggle: (hostelId: string) => void; isSaved: boolean; }) => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
    <div className="relative">
      <LazyImage src={hostel.imageUrl} alt={hostel.name} className="h-56 w-full object-cover" loading="lazy" />
      <button
        onClick={(e) => {
            e.stopPropagation(); // Prevent card's onViewHostel from firing
            onSaveToggle(hostel.id);
        }}
        className="absolute top-4 left-4 bg-black/40 text-white rounded-full h-10 w-10 flex items-center justify-center hover:bg-black/60 transition-all duration-200 transform hover:scale-110 z-10"
        aria-label={isSaved ? 'Unsave hostel' : 'Save hostel'}
      >
        <i className={`${isSaved ? 'fas' : 'far'} fa-heart ${isSaved ? 'text-red-500' : ''} text-lg`}></i>
      </button>
      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-unistay-navy px-3 py-1 rounded-full font-bold flex items-center gap-1">
        <i className="fas fa-star text-unistay-yellow"></i>
        {hostel.rating}
      </div>
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <h3 className="text-xl font-bold text-unistay-navy">{hostel.name}</h3>
      <p className="text-gray-600 mt-1 flex-grow">{hostel.location}</p>
      <div className="flex justify-between items-center mt-4">
        <span className="text-lg font-extrabold text-unistay-navy bg-unistay-yellow/20 px-3 py-1 rounded-lg">{hostel.priceRange}</span>
        <button
          onClick={() => onViewHostel(hostel)}
          className="bg-unistay-navy text-white font-semibold px-5 py-2 rounded-lg transition-transform transform group-hover:scale-105 group-hover:bg-unistay-yellow group-hover:text-unistay-navy">
          View
        </button>
      </div>
    </div>
  </div>
);


interface UniversitySelectorProps {
  universities: University[];
  selectedUniversity: University;
  onSelect: (university: University) => void;
}

const UniversitySelector = ({ universities, selectedUniversity, onSelect }: UniversitySelectorProps) => {
  const [ref, isVisible] = useScrollObserver<HTMLDivElement>();
  const [showAll, setShowAll] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const initialCount = 5;
  const initialRowHeight = 70; // Estimated height for one row of buttons in px

  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
      <h2 className="text-3xl font-bold text-unistay-navy text-center mb-6">Find Hostels At Your University</h2>
      <div
        ref={wrapperRef}
        className="flex justify-center flex-wrap gap-4 overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: showAll ? `${wrapperRef.current?.scrollHeight}px` : `${initialRowHeight}px` }}
      >
        {universities.map((uni) => (
          <button
            key={uni.id}
            onClick={() => onSelect(uni)}
            className={`flex items-center gap-3 px-6 py-3 rounded-full text-lg font-semibold border-2 transition-all duration-300 transform hover:scale-105 ${
              selectedUniversity.id === uni.id
                ? 'bg-unistay-navy text-white border-unistay-navy shadow-lg'
                : 'bg-white text-unistay-navy border-gray-200 hover:border-unistay-navy'
            }`}
          >
            <LazyImage src={uni.logoUrl} alt={`${uni.name} Logo`} className="w-7 h-7 rounded-full object-cover" width={28} height={28} loading="lazy" />
            {uni.name}
          </button>
        ))}
      </div>

      {universities.length > initialCount && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="font-semibold text-unistay-navy hover:text-unistay-yellow transition-colors flex items-center gap-2 mx-auto"
            aria-expanded={showAll}
          >
            <span>{showAll ? 'Show Less' : 'Show More'}</span>
            <i className={`fas fa-chevron-down transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}></i>
          </button>
        </div>
      )}
    </div>
  );
};

// NEW SECTION for hostels at selected university
interface UniversityHostelsProps {
  hostels: Hostel[];
  universityName: string;
  onViewHostel: (hostel: Hostel) => void;
  savedHostelIds: Set<string>;
  onToggleSave: (hostelId: string) => void;
  hasActiveFilter: boolean;
  initialHostelCount: number;
}

const UniversityHostels = ({ hostels, universityName, onViewHostel, savedHostelIds, onToggleSave, hasActiveFilter, initialHostelCount }: UniversityHostelsProps) => {
  const [ref, isVisible] = useScrollObserver<HTMLDivElement>();
  const [showAll, setShowAll] = useState(false);
  
  const displayedHostels = showAll ? hostels : hostels.slice(0, 5);
  const hasMoreHostels = hostels.length > 5;

  if (initialHostelCount === 0) {
    return (
      <div ref={ref} className={`mt-16 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center py-8 px-4 bg-unistay-bg rounded-2xl">
          <i className="fas fa-bed text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-unistay-navy">No Hostels Found for {universityName}</h3>
          <p className="text-gray-500 mt-2">We don't have specific listings for this university yet. <br/> Please check our general recommendations below!</p>
        </div>
      </div>
    );
  }

  if (hostels.length === 0 && hasActiveFilter) {
    return (
       <div ref={ref} className={`mt-16 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center py-8 px-4 bg-unistay-bg rounded-2xl">
          <i className="fas fa-filter text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-unistay-navy">No Hostels Match Your Filters</h3>
          <p className="text-gray-500 mt-2">Try removing some amenities to see more results.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`mt-16 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-unistay-navy">Hostels Near {universityName}</h2>
        {hasMoreHostels && !hasActiveFilter && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-unistay-yellow font-semibold hover:underline transition-colors duration-200"
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {displayedHostels.map(hostel => (
          <div key={hostel.id}>
            <HostelCard 
              hostel={hostel} 
              onViewHostel={onViewHostel} 
              onSaveToggle={onToggleSave}
              isSaved={savedHostelIds.has(hostel.id)}
            />
          </div>
        ))}
      </div>
      {hasMoreHostels && !showAll && !hasActiveFilter && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="bg-unistay-yellow text-unistay-navy px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors duration-200"
          >
            Show All {hostels.length} Hostels
          </button>
        </div>
      )}
    </div>
  );
};


interface FeaturedHostelsProps {
  hostels: Hostel[];
  onViewHostel: (hostel: Hostel) => void;
  savedHostelIds: Set<string>;
  onToggleSave: (hostelId: string) => void;
}

const FeaturedHostels = ({ hostels, onViewHostel, savedHostelIds, onToggleSave }: FeaturedHostelsProps) => {
  const [ref, isVisible] = useScrollObserver<HTMLDivElement>();
  return (
    <div ref={ref} className={`mt-16 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-unistay-navy">Recommended For You</h2>
          <a href="#" className="text-unistay-yellow font-semibold hover:underline">See All</a>
        </div>
        <div className="flex overflow-x-auto space-x-6 pb-4 no-scrollbar scroll-snap-x-mandatory">
            {hostels.map((hostel, index) => (
                <div key={hostel.id} className={`w-80 md:w-96 flex-shrink-0 scroll-snap-align-start transition-transform duration-500 delay-${index * 100} ${isVisible ? 'translate-y-0' : 'translate-y-5'}`}>
                   <HostelCard 
                    hostel={hostel} 
                    onViewHostel={onViewHostel} 
                    onSaveToggle={onToggleSave}
                    isSaved={savedHostelIds.has(hostel.id)}
                  />
                </div>
            ))}
        </div>
    </div>
  );
};

interface FeaturedContentProps {
  universities: University[];
  selectedUniversity: University;
  onSelectUniversity: (university: University) => void;
  hostels: Hostel[];
  onViewHostel: (hostel: Hostel) => void;
  savedHostelIds: Set<string>;
  onToggleSave: (hostelId: string) => void;
}

const FeaturedContent = ({ universities, selectedUniversity, onSelectUniversity, hostels, onViewHostel, savedHostelIds, onToggleSave }: FeaturedContentProps) => {
  const universityHostels = hostels.filter(h => h.universityId === selectedUniversity.id);
  
  const recommendedHostels = hostels.filter(h => h.isRecommended);

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <UniversitySelector universities={universities} selectedUniversity={selectedUniversity} onSelect={onSelectUniversity} />
        
        <UniversityHostels 
          hostels={universityHostels} 
          universityName={selectedUniversity.name} 
          onViewHostel={onViewHostel} 
          savedHostelIds={savedHostelIds}
          onToggleSave={onToggleSave}
          hasActiveFilter={false}
          initialHostelCount={universityHostels.length}
        />
        {recommendedHostels.length > 0 && 
            <FeaturedHostels 
                hostels={recommendedHostels} 
                onViewHostel={onViewHostel} 
                savedHostelIds={savedHostelIds}
                onToggleSave={onToggleSave}
            />
        }
      </div>
    </section>
  );
};

export default FeaturedContent;