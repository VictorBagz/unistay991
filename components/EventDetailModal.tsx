import React from 'react';
import { Event } from '../types';

interface EventDetailModalProps {
    event: Event;
    onClose: () => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
    // Safely handle contacts - ensure it's always an array
    const contactsList = Array.isArray(event.contacts) ? event.contacts : [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-scale-up">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-unistay-yellow transition-colors z-10 bg-unistay-navy rounded-full w-10 h-10 flex items-center justify-center"
                    aria-label="Close modal"
                >
                    <i className="fas fa-times text-xl"></i>
                </button>

                {/* Event Image */}
                <div className="w-full h-96 relative">
                    <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-6 left-6 bg-unistay-yellow text-unistay-navy text-center rounded-xl px-4 py-2 shadow-lg">
                        <p className="font-extrabold text-3xl">{event.day}</p>
                        <p className="font-bold text-lg leading-tight">{event.month}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <h2 className="text-3xl font-bold text-unistay-navy mb-4">{event.title}</h2>
                    
                    {/* Event Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-600">
                                <i className="fas fa-map-marker-alt text-unistay-yellow text-xl w-6"></i>
                                <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <i className="fas fa-calendar text-unistay-yellow text-xl w-6"></i>
                                <span>{event.date}</span>
                            </div>
                            {event.time && (
                                <div className="flex items-center gap-3 text-gray-600">
                                    <i className="fas fa-clock text-unistay-yellow text-xl w-6"></i>
                                    <span>{event.time}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-gray-600">
                                <i className="fas fa-ticket-alt text-unistay-yellow text-xl w-6"></i>
                                <span>{event.price || 'Free Entry'}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-unistay-navy">Contact Information</h3>
                            <div className="space-y-3 text-gray-600">
                                {contactsList.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="font-medium text-unistay-navy">Contact Persons:</p>
                                        {contactsList.map((contact, index) => (
                                            <div key={index} className="flex items-center gap-3 ml-4">
                                                <i className="fas fa-user text-unistay-yellow text-lg w-5"></i>
                                                <span>{contact}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {event.phone && (
                                    <div className="flex items-center gap-3">
                                        <i className="fas fa-phone text-unistay-yellow text-xl w-6"></i>
                                        <a href={`tel:${event.phone}`} className="hover:text-unistay-navy transition-colors">
                                            {event.phone}
                                        </a>
                                    </div>
                                )}
                                
                                {event.email && (
                                    <div className="flex items-center gap-3">
                                        <i className="fas fa-envelope text-unistay-yellow text-xl w-6"></i>
                                        <a href={`mailto:${event.email}`} className="hover:text-unistay-navy transition-colors">
                                            {event.email}
                                        </a>
                                    </div>
                                )}
                                
                                {contactsList.length === 0 && !event.phone && !event.email && (
                                    <p className="text-gray-500 italic">No contact information provided</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Event Description */}
                    {event.description ? (
                        <div className="border-t pt-8">
                            <h3 className="font-bold text-lg text-unistay-navy mb-4">About the Event</h3>
                            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{event.description}</p>
                        </div>
                    ) : (
                        <div className="border-t pt-8">
                            <p className="text-gray-500 italic">No description provided</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t">
                        {event.phone && (
                            <a 
                                href={`tel:${event.phone}`}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
                            >
                                <i className="fas fa-phone"></i>
                                Call Now
                            </a>
                        )}
                        {event.email && (
                            <a 
                                href={`mailto:${event.email}?subject=Regarding: ${event.title}`}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
                            >
                                <i className="fas fa-envelope"></i>
                                Send Email
                            </a>
                        )}
                        {event.price && event.price !== 'Free Entry' && (
                            <div className="bg-unistay-yellow text-unistay-navy px-6 py-3 rounded-lg flex items-center gap-2">
                                <i className="fas fa-ticket-alt"></i>
                                Entry Fee: {event.price}
                            </div>
                        )}
                        <button 
                            onClick={onClose}
                            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors ml-auto"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailModal;