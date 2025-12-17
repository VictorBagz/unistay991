import React, { useState, useRef } from 'react';
import { User, RoommateProfile, University, Hostel } from '../types';
import Spinner from './Spinner';
import { useNotifier } from '../hooks/useNotifier';
import { authService } from '../services/authService';
import ConnectionRequests from './ConnectionRequests';

type AppView = 'main' | 'roommateFinder' | 'blog' | 'events' | 'jobs' | 'auth' | 'admin' | 'profile';

interface ProfilePageProps {
  user: User;
  onSignOut: () => void;
  savedHostels: Hostel[];
  onToggleSaveHostel: (hostelId: string) => void;
  profile?: RoommateProfile;
  universities: University[];
  onNavigate: (page: string) => void;
  onDataChange: () => void;
  confessions?: any[];
  confessionHandler?: {
    add: (content: string) => Promise<void>;
    remove: (id: string) => Promise<void>;
  };
  allProfiles?: RoommateProfile[];
}

const ProfileStatCard = ({ icon, label, value }) => (
    <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
        <div className="bg-unistay-yellow/20 text-unistay-navy rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
            <i className={`fas ${icon} text-xl`}></i>
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-lg font-bold text-unistay-navy truncate">{value}</p>
        </div>
    </div>
);


const ProfilePage = ({ 
    user, 
    savedHostels, 
    onSignOut, 
    onToggleSaveHostel,
    profile,
    universities,
    onNavigate,
    onDataChange,
    confessions = [],
    confessionHandler,
    allProfiles = []
}: ProfilePageProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [confessionContent, setConfessionContent] = useState('');
    const [isSubmittingConfession, setIsSubmittingConfession] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { notify } = useNotifier();

    const getUniversityName = (uniId: string | undefined): string => {
        if (!uniId) return 'Not Set';
        const university = universities.find(u => u.id === uniId);
        return university ? university.name : 'Unknown University';
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        try {
            await authService.updateProfilePhoto(user.id, file);
            notify({ message: 'Profile photo updated successfully!', type: 'success' });
            onDataChange(); // Refresh all app data to show the new photo
        } catch (err) {
            notify({ message: err, type: 'error' });
        } finally {
            setIsUploading(false);
            // Reset file input value to allow re-uploading the same file
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSubmitConfession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confessionContent.trim() || !confessionHandler) return;

        setIsSubmittingConfession(true);
        try {
            await confessionHandler.add(confessionContent.trim());
            setConfessionContent('');
            notify({ message: 'Your confession has been posted anonymously!', type: 'success' });
        } catch (err) {
            notify({ message: 'Failed to post confession', type: 'error' });
        } finally {
            setIsSubmittingConfession(false);
        }
    };
    
    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #ffd700 0%, #0047ab 100%)' }}>
             <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
                    <h1 className="text-3xl font-bold text-unistay-navy">My Profile</h1>
                    <button onClick={() => onNavigate('main')} className="font-semibold text-unistay-navy hover:text-unistay-yellow transition-colors flex items-center gap-2">
                        <i className="fas fa-arrow-left"></i>
                        Back to Home
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/png, image/jpeg"
                                disabled={isUploading}
                            />
                            <div className="relative w-32 h-32 mx-auto mb-4 group">
                                <button 
                                    onClick={handleAvatarClick}
                                    disabled={isUploading}
                                    className="w-full h-full rounded-full bg-unistay-yellow flex items-center justify-center font-bold text-unistay-navy text-5xl disabled:cursor-not-allowed"
                                    aria-label="Change profile photo"
                                >
                                    {profile?.imageUrl ? (
                                        <img src={profile.imageUrl} alt={user.name || ''} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        user.name?.charAt(0).toUpperCase()
                                    )}
                                </button>
                                {isUploading ? (
                                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                        <Spinner color="white" size="lg" />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarClick}>
                                        <i className="fas fa-camera text-white text-3xl"></i>
                                    </div>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-unistay-navy">{user.name}</h2>
                            <p className="text-gray-500">{user.email}</p>
                            {profile ? (
                                <div className="mt-6 space-y-3">
                                    <button 
                                        onClick={() => onNavigate('roommateMatch')}
                                        className="w-full bg-unistay-yellow text-unistay-navy font-bold py-2 px-6 rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-users"></i>
                                        Find a Roommate
                                    </button>
                                    <button 
                                        onClick={() => onNavigate('roommateFinder')}
                                        className="w-full bg-gray-200 text-unistay-navy font-bold py-2 px-6 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-edit"></i>
                                        Edit Profile
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => onNavigate('roommateFinder')}
                                    className="mt-6 w-full bg-unistay-navy text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-90 transition-colors"
                                >
                                    Create Roommate Profile
                                </button>
                            )}
                        </div>

                         <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-bold text-unistay-navy mb-4">Account</h3>
                             <button 
                                onClick={onSignOut}
                                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-3"
                            >
                                <i className="fas fa-sign-out-alt w-5"></i>
                                Logout
                            </button>
                         </div>
                    </div>

                    {/* Right Column: Details & Activity */}
                    <div className="lg:col-span-2 space-y-8">
                         <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-bold text-unistay-navy mb-4">My Student Details</h3>
                            {profile ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ProfileStatCard icon="fa-university" label="University" value={getUniversityName(profile?.universityId)} />
                                    <ProfileStatCard icon="fa-book" label="Course" value={profile.course || 'Not Set'} />
                                    <ProfileStatCard icon="fa-calendar-day" label="Year of Study" value={profile.yearOfStudy?.toString() || 'Not Set'} />
                                    <ProfileStatCard icon="fa-wallet" label="Budget" value={`UGX ${profile.budget?.toLocaleString() || '0'}`} />
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <i className="fas fa-user-graduate text-4xl text-gray-300 mb-4"></i>
                                    <p className="text-gray-600">You haven't created a roommate profile yet.</p>
                                    <button onClick={() => onNavigate('roommateFinder')} className="mt-4 font-bold text-unistay-navy hover:text-unistay-yellow">
                                        Create one now to find matches!
                                    </button>
                                </div>
                            )}
                         </div>

                         <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-bold text-unistay-navy mb-4">Quick Links</h3>
                            <div className="space-y-3">
                                {profile && (
                                    <button onClick={() => onNavigate('roommateMatch')} className="flex items-center justify-between w-full p-4 rounded-lg hover:bg-unistay-yellow/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <i className="fas fa-heart text-unistay-navy"></i>
                                            <span className="font-semibold">Find a Roommate</span>
                                        </div>
                                        <i className="fas fa-chevron-right text-gray-400"></i>
                                    </button>
                                )}
                                <button onClick={() => onNavigate('roommateFinder')} className="flex items-center justify-between w-full p-4 rounded-lg hover:bg-unistay-yellow/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <i className="fas fa-users text-unistay-navy"></i>
                                        <span className="font-semibold">{profile ? 'Edit Roommate Profile' : 'Create Roommate Profile'}</span>
                                    </div>
                                    <i className="fas fa-chevron-right text-gray-400"></i>
                                </button>
                                {savedHostels.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-4">
                                            <div className="flex items-center gap-4">
                                                <i className="fas fa-heart text-unistay-navy"></i>
                                                <span className="font-semibold">Saved Hostels ({savedHostels.length})</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 px-4">
                                            {savedHostels.map(hostel => (
                                                <div key={hostel.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                                                    <div>
                                                        <h4 className="font-semibold text-unistay-navy">{hostel.name}</h4>
                                                        <p className="text-sm text-gray-600">{hostel.priceRange}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => onToggleSaveHostel(hostel.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                                                            title="Remove from saved"
                                                        >
                                                            <i className="fas fa-heart"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between w-full p-4 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <i className="far fa-heart text-unistay-navy"></i>
                                            <span className="font-semibold">No Saved Hostels</span>
                                        </div>
                                    </div>
                                )}
                                 <button className="flex items-center justify-between w-full p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-not-allowed opacity-60">
                                    <div className="flex items-center gap-4">
                                        <i className="fas fa-file-alt text-unistay-navy"></i>
                                        <span className="font-semibold">My Job Applications</span>
                                    </div>
                                    <i className="fas fa-chevron-right text-gray-400"></i>
                                </button>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Roommate Connection Requests Section */}
                {profile && (
                    <div className="mt-8 space-y-8">
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-unistay-navy flex items-center gap-2">
                                    <i className="fas fa-heart text-red-500"></i>
                                    Roommate Connection Requests
                                </h3>
                            </div>
                            <ConnectionRequests
                                userId={user.id}
                                allProfiles={allProfiles}
                                universities={universities}
                                onRequestHandled={onDataChange}
                            />
                        </div>
                    </div>
                )}

                {/* Anonymous Confessions Section */}
                <div className="mt-8 space-y-8">
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h3 className="text-xl font-bold text-unistay-navy mb-4">💭 Share an Anonymous Confession</h3>
                        <form onSubmit={handleSubmitConfession} className="space-y-4">
                            <textarea
                                value={confessionContent}
                                onChange={(e) => setConfessionContent(e.target.value)}
                                placeholder="Share your thoughts anonymously... Keep it positive and respectful! You can use emojis 😊"
                                maxLength={250}
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-unistay-yellow focus:border-transparent resize-none font-sans"
                                disabled={isSubmittingConfession}
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">{confessionContent.length}/250 characters</span>
                                <button
                                    type="submit"
                                    disabled={!confessionContent.trim() || isSubmittingConfession}
                                    className="bg-unistay-navy text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmittingConfession ? (
                                        <>
                                            <Spinner color="white" size="sm" />
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-paper-plane"></i>
                                            Post Confession
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Display Recent Confessions */}
                    {confessions.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-bold text-unistay-navy mb-4">Recent Confessions</h3>
                            <div className="space-y-4">
                                {confessions.slice(0, 5).map((confession) => (
                                    <div
                                        key={confession.id}
                                        className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-purple-200"
                                    >
                                        <p className="text-gray-800 italic">{confession.content}</p>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs text-gray-500">
                                                {new Date(confession.timestamp).toLocaleDateString()} • {new Date(confession.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <div className="flex items-center gap-4">
                                                <button className="text-sm text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1">
                                                    <i className="fas fa-heart"></i> {confession.reactions}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;