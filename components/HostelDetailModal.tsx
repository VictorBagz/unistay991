

import React, { useEffect, useState } from 'react';
import { Hostel } from '../types';
import Spinner from './Spinner';
import LazyImage from './LazyImage';

interface HostelDetailModalProps {
  hostel: Hostel;
  onClose: () => void;
}

const HostelDetailModal = ({ hostel, onClose }: HostelDetailModalProps) => {
  const [isBooking, setIsBooking] = useState(false);

  // Close modal on escape key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleBooking = () => {
    setIsBooking(true);
    setTimeout(() => {
        setIsBooking(false);
        // In a real app, navigate to booking page or show success
    }, 2000);
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
      onClick={onClose} // Close on backdrop click
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto no-scrollbar"
        style={{ animation: 'scaleIn 0.3s ease-out forwards' }}
        onClick={e => e.stopPropagation()} // Prevent modal close when clicking inside
      >
        <div className="relative">
          <LazyImage src={hostel.imageUrl} alt={hostel.name} className="w-full h-64 object-cover rounded-t-2xl" loading="eager" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/70 text-unistay-navy rounded-full h-10 w-10 flex items-center justify-center hover:bg-white transition-transform duration-200 hover:scale-110 z-10"
            aria-label="Close modal"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
           <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-t-none rounded-t-2xl">
            <h2 className="text-3xl font-extrabold text-white">{hostel.name}</h2>
            <p className="text-gray-200 mt-1"><i className="fas fa-map-marker-alt text-unistay-yellow mr-2"></i>{hostel.location}</p>
          </div>
        </div>
        
        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
             <span className="text-xl font-extrabold text-unistay-navy bg-unistay-yellow/30 px-4 py-2 rounded-lg">{hostel.priceRange}</span>
             <div className="flex items-center gap-2 text-xl font-bold text-unistay-navy">
                <i className="fas fa-star text-unistay-yellow"></i>
                <span>{hostel.rating}</span>
                <span className="text-sm font-normal text-gray-500">(25 reviews)</span>
             </div>
          </div>
          
          <div className="mb-6">
             <h3 className="text-xl font-bold text-unistay-navy mb-3">About this hostel</h3>
             <p className="text-gray-600 leading-relaxed">{hostel.description}</p>
          </div>

          <div className="mb-6">
             <h3 className="text-xl font-bold text-unistay-navy mb-4">Amenities</h3>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               {hostel.amenities.map(amenity => (
                 <div key={amenity.name} className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex items-center gap-4">
                   <i className={`${amenity.icon} text-unistay-navy text-2xl w-8 text-center`}></i>
                   <span className="font-semibold text-gray-700">{amenity.name}</span>
                 </div>
               ))}
             </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
             <button
               onClick={handleBooking}
               disabled={isBooking}
               className="w-full bg-unistay-navy hover:bg-opacity-90 text-white font-bold text-lg py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center disabled:bg-opacity-70"
             >
              {isBooking ? <Spinner color="white" size="md" /> : 'Book Now'}
            </button>
          </div>
        </div>
      </div>
       <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
      `}</style>
    </div>
  );
};

export default HostelDetailModal;
