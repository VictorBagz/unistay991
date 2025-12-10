

import React, { useState, useEffect } from 'react';
import { useScrollObserver } from '../hooks/useScrollObserver';
import Spinner from './Spinner';
import { Hostel } from '../types';

interface HeroProps {
  hostels: Hostel[];
  onHostelSelect: (hostel: Hostel) => void;
}

const Hero = ({ hostels, onHostelSelect }: HeroProps) => {
  const [heroRef, isVisible] = useScrollObserver<HTMLDivElement>();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Hostel[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowResults(true);

    // Filter hostels based on search query
    const results = hostels.filter(hostel => {
      const searchTerms = searchQuery.toLowerCase().split(' ');
      const hostelText = `${hostel.name} ${hostel.location}`.toLowerCase();
      
      return searchTerms.every(term => hostelText.includes(term));
    });

    setTimeout(() => {
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById('search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search on enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section 
      ref={heroRef}
      className="relative bg-cover bg-center h-[60vh] min-h-[400px] flex items-center justify-center" 
      style={{ backgroundImage: `url('/images/hostels/akamweesi3.jpg')` }}
    >
      <div className="absolute inset-0 bg-unistay-navy bg-opacity-60"></div>
      <div className={`relative z-10 text-center text-white px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          Find Your Perfect Student Home
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-200 mb-8">
          Discover the best hostels near your university with all the amenities you need for a great student life.
        </p>
        <div className="max-w-2xl mx-auto">
          <div id="search-container" className="relative">
            <input
              type="text"
              placeholder="Search by hostel name or location..."
              className="w-full p-4 pl-12 rounded-full border-2 border-transparent focus:ring-4 focus:ring-unistay-yellow focus:border-unistay-yellow text-gray-800 text-lg shadow-2xl transition"
              disabled={isSearching}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-unistay-navy hover:bg-opacity-90 text-white font-bold py-2.5 px-8 rounded-full transition-all duration-300 flex items-center justify-center w-[120px] disabled:bg-opacity-70"
            >
              {isSearching ? <Spinner color="white" size="sm" /> : 'Search'}
            </button>

            {/* Search Results */}
            {showResults && (
              <div className="absolute mt-2 w-full bg-white rounded-xl shadow-2xl overflow-hidden z-20 transition-all duration-300">
                {isSearching ? (
                  <div className="p-4 text-center">
                    <Spinner size="lg" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.map((hostel) => (
                      <div
                        key={hostel.id}
                        onClick={() => {
                          onHostelSelect(hostel);
                          setShowResults(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                      >
                        <div className="w-16 h-16 flex-shrink-0">
                          <img
                            src={hostel.imageUrl}
                            alt={hostel.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-unistay-navy">{hostel.name}</h3>
                          <p className="text-sm text-gray-500">
                            <i className="fas fa-map-marker-alt text-unistay-yellow mr-2"></i>
                            {hostel.location}
                          </p>
                          <p className="text-sm text-gray-500">
                            <i className="fas fa-tag text-unistay-yellow mr-2"></i>
                            {hostel.priceRange}
                          </p>
                        </div>
                        {hostel.isRecommended && (
                          <span className="text-unistay-yellow">
                            <i className="fas fa-star"></i>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : searchQuery && (
                  <div className="p-8 text-center">
                    <i className="fas fa-home text-4xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500">No hostels found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
