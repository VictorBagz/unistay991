import React, { useState, useEffect, useRef } from 'react';
import { Service, University } from '../types';
import { SERVICE_PROVIDERS_BY_UNIVERSITY } from '../constants/serviceProviders';
import { UNIVERSITIES } from '../constants';

interface ServicePageProps {
  service: Service;
  university: University;
  onNavigateHome: () => void;
}

const ServicePage = ({ service, university, onNavigateHome }: ServicePageProps) => {
  const [selectedUniversity, setSelectedUniversity] = useState<string>(university.name);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Update selectedUniversity when the university prop changes
  useEffect(() => {
    setSelectedUniversity(university.name);
  }, [university.name]);

  const getServiceColor = (serviceId: string) => {
    const colors: Record<string, string> = {
      food: 'from-orange-500 to-red-500',
      transport: 'from-blue-500 to-cyan-500',
      shopping: 'from-pink-500 to-rose-500',
      stationery: 'from-purple-500 to-indigo-500',
      laundry: 'from-green-500 to-emerald-500',
      entertainment: 'from-yellow-500 to-orange-500',
      internet: 'from-indigo-500 to-blue-500',
      health: 'from-red-500 to-pink-500',
    };
    return colors[serviceId] || 'from-unistay-navy to-blue-600';
  };

  const getServiceBackgroundImage = (serviceId: string) => {
    const backgroundImages: Record<string, string> = {
      food: '/images/services/burger1.webp',
      transport: '/images/services/boda1.jpg',
      shopping: '/images/services/shopping4.webp',
      stationery: '/images/services/stationery1.webp',
      entertainment: '/images/services/entertainment.avif',
      internet: '/images/services/wifi5.jpg',
      health: '/images/services/medicine1.png',
      laundry: '/images/services/laundry1.jpg',
    };
    return backgroundImages[serviceId] || '';
  };

  const getServiceProviders = () => {
    const universityData = SERVICE_PROVIDERS_BY_UNIVERSITY[selectedUniversity as keyof typeof SERVICE_PROVIDERS_BY_UNIVERSITY];
    if (!universityData) return [];
    const providers = universityData[service.id as keyof typeof universityData] || [];
    return providers;
  };

  const getProviderLogoUrl = (providerName: string) => {
    const logoUrls: Record<string, string> = {
      'SafeBoda': 'https://www.safeboda.com/assets/logo.png',
      'Faras': 'https://www.faras.co/images/logo.png',
      'Uber': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Uber_logo_2018.svg/2560px-Uber_logo_2018.svg.png',
      'Jumia Food': 'https://www.jumiafoods.com/logo.png',
      'Uber Eats': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/UberEats_logo.svg/2560px-UberEats_logo.svg.png',
      'SafeBites': 'https://via.placeholder.com/150?text=SafeBites',
      'Jumia': 'https://www.jumia.ug/logo.png',
      'Kilimall': 'https://www.kilimall.co.ug/logo.png',
      'Local Markets': 'https://via.placeholder.com/150?text=Local+Markets',
      'Student Supply Hub': 'https://via.placeholder.com/150?text=Student+Supply',
      'Pen & Paper': 'https://via.placeholder.com/150?text=Pen+Paper',
      'Office Plus': 'https://via.placeholder.com/150?text=Office+Plus',
      'Quick Wash Laundry': 'https://via.placeholder.com/150?text=QuickWash',
      'Campus Laundry Hub': 'https://via.placeholder.com/150?text=Campus+Laundry',
      'Premium Dry Cleaning': 'https://via.placeholder.com/150?text=Premium+Cleaning',
      'Campus Events Organizers': 'https://via.placeholder.com/150?text=Campus+Events',
      'Gaming & Sports Zone': 'https://via.placeholder.com/150?text=Gaming+Sports',
      'Movie & Concert Tickets': 'https://via.placeholder.com/150?text=Tickets',
      'MTN Uganda': 'https://www.mtn.co.ug/logo.png',
      'Airtel Uganda': 'https://www.airtel.co.ug/logo.png',
      'StarLink Campus WiFi': 'https://www.starlink.com/logo.png',
      'Campus Health Center': 'https://via.placeholder.com/150?text=Health+Center',
      'Student Wellness Pharmacy': 'https://via.placeholder.com/150?text=Pharmacy',
      'Mental Health Support': 'https://via.placeholder.com/150?text=Mental+Health',
    };
    return logoUrls[providerName] || `https://via.placeholder.com/150?text=${encodeURIComponent(providerName)}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div 
        className="text-white py-12 sticky top-0 z-30 shadow-lg bg-cover bg-center relative"
        style={{ backgroundImage: `url('${getServiceBackgroundImage(service.id)}')` }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full h-16 w-16 flex items-center justify-center backdrop-blur-sm">
              <i className={`${service.icon} text-4xl`}></i>
            </div>
            <div>
              <h1 className="text-4xl font-bold">{service.name} Services</h1>
              <p className="text-white/90 mt-1">Trusted providers at {selectedUniversity}</p>
            </div>
          </div>
          <button
            onClick={onNavigateHome}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-2 px-6 rounded-full transition-all duration-300 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* University Filter */}
        <div className="mb-12 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-unistay-navy mb-2">Filter by University</h3>
              <p className="text-gray-600 text-sm">Select your university to see local service providers</p>
            </div>
            {/* Custom university selector with badges */}
            <div className="relative inline-block text-left w-full sm:w-auto">
              <button
                ref={null}
                onClick={() => setDropdownOpen(prev => !prev)}
                className="w-full sm:w-72 flex items-center justify-between gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-unistay-navy focus:outline-none focus:border-unistay-yellow transition-colors cursor-pointer bg-white"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <span className="flex items-center gap-3">
                  <img src={UNIVERSITIES.find(u => u.name === selectedUniversity)?.logoUrl} alt="logo" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                  <span className="truncate">{selectedUniversity}</span>
                </span>
                <i className="fas fa-chevron-down text-gray-400"></i>
              </button>

              {dropdownOpen && (
                <div ref={menuRef} className="absolute mt-2 w-full sm:w-96 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    {UNIVERSITIES.map((uni) => {
                      const providersForUni = SERVICE_PROVIDERS_BY_UNIVERSITY[uni.name as keyof typeof SERVICE_PROVIDERS_BY_UNIVERSITY];
                      const count = providersForUni && providersForUni[service.id as keyof typeof providersForUni]
                        ? providersForUni[service.id as keyof typeof providersForUni].length
                        : 0;
                      return (
                        <button
                          key={uni.id}
                          onClick={() => { setSelectedUniversity(uni.name); setDropdownOpen(false); }}
                          className="w-full flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <img src={uni.logoUrl} alt={uni.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                            <div>
                              <div className="font-semibold text-unistay-navy">{uni.name}</div>
                              <div className="text-xs text-gray-500">{count} provider{count !== 1 ? 's' : ''}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {count > 0 ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-unistay-yellow text-unistay-navy">{count}</span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">0</span>
                            )}
                            <i className="fas fa-chevron-right text-gray-300"></i>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-4xl font-bold text-unistay-navy mb-3">Featured Providers</h2>
          <p className="text-gray-600 text-lg">Choose from verified and trusted service providers near {selectedUniversity}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {getServiceProviders().length > 0 ? (
            getServiceProviders().map((provider, index) => (
              <div key={provider.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                {/* Provider Logo Section */}
                <div className={`bg-gradient-to-br ${getServiceColor(service.id)} h-40 flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10 flex items-center justify-center text-9xl">{provider.icon}</div>
                  <img 
                    src={getProviderLogoUrl(provider.name)} 
                    alt={provider.name}
                    className="h-24 w-24 object-contain z-10 drop-shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Provider Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-2xl text-unistay-navy flex-1">{provider.name}</h3>
                    <div className="flex items-center gap-1 bg-yellow-100 text-unistay-navy px-3 py-1 rounded-full flex-shrink-0 ml-2">
                      <i className="fas fa-star text-unistay-yellow text-sm"></i>
                      <span className="font-bold text-sm">{provider.rating}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-6 line-clamp-2">{provider.description}</p>

                  {/* Details */}
                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 rounded-full p-3 w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-clock text-unistay-yellow text-lg"></i>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-semibold">AVAILABILITY</p>
                        <p className="text-sm font-bold text-unistay-navy">{provider.availability}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 rounded-full p-3 w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-map-marker-alt text-unistay-yellow text-lg"></i>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-semibold">LOCATION</p>
                        <p className="text-sm font-bold text-unistay-navy">{provider.location}</p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-unistay-navy to-blue-700 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                    <i className="fas fa-shopping-bag"></i>
                    Order Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
              <div className="inline-block bg-gray-100 rounded-full p-6 mb-4">
                <i className="fas fa-search text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-2xl font-bold text-unistay-navy mb-2">No Providers Available</h3>
              <p className="text-gray-600 text-lg">Unfortunately, there are no service providers available for {service.name} at {selectedUniversity} at this time.</p>
            </div>
          )}
        </div>

        {/* Quick Action */}
        <div className="bg-gradient-to-r from-unistay-yellow to-yellow-400 rounded-2xl p-8 md:p-12 text-center shadow-lg border border-yellow-200">
          <h2 className="text-3xl font-bold text-unistay-navy mb-4">Need Help Finding a Provider?</h2>
          <p className="text-unistay-navy/80 mb-8 text-lg">
            Can't find what you're looking for? Contact our support team or submit a service request and we'll help you out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-unistay-navy text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all hover:shadow-lg transform hover:-translate-y-1">
              <i className="fas fa-envelope mr-2"></i>
              Contact Support
            </button>
            <button className="bg-white text-unistay-navy px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all hover:shadow-lg transform hover:-translate-y-1">
              <i className="fas fa-plus-circle mr-2"></i>
              Request Service
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServicePage;
