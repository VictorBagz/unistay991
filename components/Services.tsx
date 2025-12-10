

import React, { useState, useEffect, useCallback } from 'react';
import { Service, University } from '../types';
import { SERVICE_PROVIDERS_BY_UNIVERSITY } from '../constants/serviceProviders';
import { UNIVERSITIES } from '../constants';
import { fetchServiceGuide } from '../services/geminiService';
import { useScrollObserver } from '../hooks/useScrollObserver';
import Spinner from './Spinner';

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
  index: number;
  isVisible: boolean;
}

const ServiceCard = ({ service, onClick, index, isVisible }: ServiceCardProps) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-lg p-6 text-center cursor-pointer group transform hover:-translate-y-2 transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    style={{ transitionDelay: `${isVisible ? index * 100 : 0}ms` }}
  >
    <div className="w-20 h-20 mx-auto bg-unistay-yellow/20 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-unistay-yellow">
      <i className={`${service.icon} text-4xl text-unistay-navy transition-colors duration-300 group-hover:text-white`}></i>
    </div>
    <h3 className="text-xl font-bold text-unistay-navy">{service.name}</h3>
    <p className="text-gray-500 text-sm mt-1">{service.description}</p>
  </div>
);

interface ServiceDetailProps {
  service: Service;
  universityName: string;
  onBack: () => void;
}

const ServiceDetail = ({ service, universityName, onBack }: ServiceDetailProps) => {
  const [guide, setGuide] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getGuide = async () => {
      setIsLoading(true);
      setGuide(null);
      const result = await fetchServiceGuide(universityName, service.name);
      setGuide(result);
      setIsLoading(false);
    };
    getGuide();
  }, [service, universityName]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 relative animate-fade-in-up">
      <button onClick={onBack} className="absolute top-4 left-4 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors z-10" aria-label="Go back to services">
        <i className="fas fa-arrow-left text-unistay-navy"></i>
      </button>
      <div className="text-center mb-6 pt-8">
        <div className="w-24 h-24 mx-auto bg-unistay-yellow rounded-full flex items-center justify-center mb-4">
          <i className={`${service.icon} text-5xl text-white`}></i>
        </div>
        <h2 className="text-3xl font-extrabold text-unistay-navy">{service.name} Services</h2>
        <p className="text-gray-600 mt-1">Your guide to the best {service.name.toLowerCase()} options near {universityName}.</p>
      </div>

      <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200 min-h-[250px] gemini-guide">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-unistay-navy p-4">
            <Spinner color="navy" size="lg" className="mb-4" />
            <p className="font-semibold">Generating your personalized guide...</p>
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: guide || '' }} />
        )}
      </div>
    </div>
  );
};


interface ServicesProps {
  services: Service[];
  selectedUniversity: University;
  onServiceSelect?: (service: Service) => void;
}

const Services = ({ services, selectedUniversity, onServiceSelect }: ServicesProps) => {
  const [sectionRef, isVisible] = useScrollObserver<HTMLElement>();
  const [displayedUniversity, setDisplayedUniversity] = useState<University>(selectedUniversity);
  
  useEffect(() => {
    setDisplayedUniversity(selectedUniversity);
  }, [selectedUniversity]);
  
  const handleSelectService = (service: Service) => {
    if (onServiceSelect) {
      onServiceSelect(service);
    }
  };

  const getProviderCountForService = (service: Service): number => {
    const universityData = SERVICE_PROVIDERS_BY_UNIVERSITY[displayedUniversity.name as keyof typeof SERVICE_PROVIDERS_BY_UNIVERSITY];
    if (!universityData) return 0;
    const providers = universityData[service.id as keyof typeof universityData] || [];
    return providers.length;
  };

  return (
    <section ref={sectionRef} id="services" className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-3xl font-bold text-unistay-navy sm:text-4xl">Student Life Services</h2>
          <p className="mt-4 text-lg text-gray-600">Everything you need for a comfortable and productive campus life at {displayedUniversity.name}, right at your fingertips.</p>
        </div>

        <div className="relative min-h-[400px]">
          {/* Grid View */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const providerCount = getProviderCountForService(service);
              return (
                <div key={service.id} className="relative">
                  <ServiceCard
                    service={service} 
                    onClick={() => handleSelectService(service)}
                    index={index}
                    isVisible={isVisible}
                  />
                  {providerCount > 0 && (
                    <div className="absolute top-2 right-2 bg-unistay-yellow text-unistay-navy px-2 py-1 rounded-full text-xs font-bold">
                      {providerCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;