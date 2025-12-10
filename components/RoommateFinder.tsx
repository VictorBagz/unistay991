
import React, { useState, useMemo, useEffect } from 'react';
import { University, RoommateProfile, User } from '../types';
import { UNIVERSITIES, GENDERS, SEEKING_GENDERS, LEASE_DURATIONS, STUDY_SCHEDULES, CLEANLINESS_LEVELS, GUEST_FREQUENCIES, DRINKING_HABITS } from '../constants';
import Spinner from './Spinner';
import LazyImage from './LazyImage';

// --- Helper Components ---
// FIX: Add explicit types to helper components to fix type inference issues.
const SectionTitle = ({ children }: { children: React.ReactNode }) => <h3 className="text-xl font-bold text-unistay-navy mb-4 border-b pb-2">{children}</h3>;
const Input = (props: React.ComponentPropsWithoutRef<'input'>) => <input {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-unistay-yellow focus:border-unistay-yellow disabled:bg-gray-200" />;
const Select = ({ children, ...props }: React.ComponentPropsWithoutRef<'select'>) => <select {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-unistay-yellow focus:border-unistay-yellow disabled:bg-gray-200">{children}</select>;
const Textarea = (props: React.ComponentPropsWithoutRef<'textarea'>) => <textarea {...props} rows={4} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-unistay-yellow focus:border-unistay-yellow disabled:bg-gray-200" />;
const Label = ({ children, ...props }: React.ComponentPropsWithoutRef<'label'>) => <label {...props} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;


// --- Profile Creation/Editing Form ---
const ProfileForm = ({ profile, user, onProfileUpdate, onCancel, isProfileIncomplete }) => {
    const initialFormData = {
        id: user.id,
        name: user.name.split(' ')[0],
        imageUrl: `https://picsum.photos/seed/${user.name.toLowerCase()}/400/400`,
        age: 20,
        gender: 'Female',
        universityId: UNIVERSITIES[0].id,
        course: '',
        yearOfStudy: 1,
        budget: 500000,
        moveInDate: new Date().toISOString().split('T')[0],
        leaseDuration: 'Semester',
        bio: '',
        isSmoker: false,
        drinksAlcohol: 'No',
        studySchedule: 'Flexible',
        cleanliness: 'Average',
        guestFrequency: 'Rarely',
        hobbies: '',
        seekingGender: 'Any',
        ...profile, // Overwrite defaults with existing profile data
    };
    const [formData, setFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await onProfileUpdate(formData);
        setIsLoading(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-unistay-navy mb-1">
              {isProfileIncomplete ? 'Complete Your Profile' : (profile ? 'Update Your Profile' : 'Create Your Roommate Profile')}
            </h2>
            <p className="text-gray-600 mb-6">
              {isProfileIncomplete ? 'Welcome to UniStay! Please fill out the details below to start finding roommates.' : 'A detailed profile helps us find you the best matches!'}
            </p>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Details */}
                <div>
                    <SectionTitle>Personal Details</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><Label htmlFor="name">First Name</Label><Input id="name" name="name" value={formData.name} onChange={handleChange} required /></div>
                        <div><Label htmlFor="age">Age</Label><Input id="age" name="age" type="number" value={formData.age} onChange={handleNumberChange} required /></div>
                        <div><Label htmlFor="gender">Gender</Label><Select id="gender" name="gender" value={formData.gender} onChange={handleChange}>{GENDERS.map(g => <option key={g} value={g}>{g}</option>)}</Select></div>
                        <div><Label htmlFor="universityId">University</Label><Select id="universityId" name="universityId" value={formData.universityId} onChange={handleChange}>{UNIVERSITIES.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></div>
                        <div><Label htmlFor="course">Course of Study</Label><Input id="course" name="course" value={formData.course} onChange={handleChange} placeholder="e.g., Computer Science" required /></div>
                        <div><Label htmlFor="yearOfStudy">Year of Study</Label><Input id="yearOfStudy" name="yearOfStudy" type="number" min="1" max="7" value={formData.yearOfStudy} onChange={handleNumberChange} required /></div>
                    </div>
                </div>

                {/* Accommodation Needs */}
                <div>
                    <SectionTitle>Accommodation Needs</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div><Label htmlFor="budget">Monthly Budget (UGX)</Label><Input id="budget" name="budget" type="number" step="50000" value={formData.budget} onChange={handleNumberChange} required /></div>
                        <div><Label htmlFor="moveInDate">Move-in Date</Label><Input id="moveInDate" name="moveInDate" type="date" value={formData.moveInDate} onChange={handleChange} required /></div>
                        <div><Label htmlFor="leaseDuration">Lease Duration</Label><Select id="leaseDuration" name="leaseDuration" value={formData.leaseDuration} onChange={handleChange}>{LEASE_DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}</Select></div>
                    </div>
                </div>

                {/* Lifestyle & Habits */}
                <div>
                    <SectionTitle>Lifestyle & Habits</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div><Label htmlFor="studySchedule">Study Schedule</Label><Select id="studySchedule" name="studySchedule" value={formData.studySchedule} onChange={handleChange}>{STUDY_SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}</Select></div>
                        <div><Label htmlFor="cleanliness">Cleanliness</Label><Select id="cleanliness" name="cleanliness" value={formData.cleanliness} onChange={handleChange}>{CLEANLINESS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}</Select></div>
                        <div><Label htmlFor="guestFrequency">Guest Frequency</Label><Select id="guestFrequency" name="guestFrequency" value={formData.guestFrequency} onChange={handleChange}>{GUEST_FREQUENCIES.map(g => <option key={g} value={g}>{g}</option>)}</Select></div>
                        <div><Label htmlFor="drinksAlcohol">Drinking Habits</Label><Select id="drinksAlcohol" name="drinksAlcohol" value={formData.drinksAlcohol} onChange={handleChange}>{DRINKING_HABITS.map(d => <option key={d} value={d}>{d}</option>)}</Select></div>
                        <div className="flex items-center pt-6"><input id="isSmoker" name="isSmoker" type="checkbox" checked={formData.isSmoker} onChange={handleChange} className="h-4 w-4 text-unistay-yellow focus:ring-unistay-yellow border-gray-300 rounded" /><Label htmlFor="isSmoker" className="ml-2">Are you a smoker?</Label></div>
                    </div>
                </div>
                
                {/* Preferences & Bio */}
                 <div>
                    <SectionTitle>About You & What You're Looking For</SectionTitle>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><Label htmlFor="seekingGender">Seeking Roommate Gender</Label><Select id="seekingGender" name="seekingGender" value={formData.seekingGender} onChange={handleChange}>{SEEKING_GENDERS.map(g => <option key={g} value={g}>{g}</option>)}</Select></div>
                        <div><Label htmlFor="hobbies">Hobbies (comma-separated)</Label><Input id="hobbies" name="hobbies" value={formData.hobbies} onChange={handleChange} placeholder="e.g., Football, Reading, Movies"/></div>
                     </div>
                     <div className="mt-6"><Label htmlFor="bio">Short Bio</Label><Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell potential roommates a little about yourself..." required /></div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                    {profile && !isProfileIncomplete && <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-full hover:bg-gray-300 transition-colors">Cancel</button>}
                    <button type="submit" disabled={isLoading} className="bg-unistay-yellow text-unistay-navy font-bold py-2 px-6 rounded-full hover:bg-yellow-400 transition-colors disabled:bg-yellow-400/70 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]">
                        {isLoading ? <Spinner color="navy" size="sm" /> : (profile ? 'Save Changes' : 'Create Profile & Find Matches')}
                    </button>
                </div>
            </form>
        </div>
    );
}

// --- Match Scoring Algorithm ---
function calculateMatchScore(userProf, otherProf) {
    if (!userProf || !otherProf) return 0;
    let score = 0;
    const weights = { gender: 20, budget: 25, university: 20, lifestyle: 25, interest: 10 };

    // 1. Gender (20%)
    const userLikesOtherGender = userProf.seekingGender === 'Any' || userProf.seekingGender === otherProf.gender;
    const otherLikesUserGender = otherProf.seekingGender === 'Any' || otherProf.seekingGender === userProf.gender;
    if (userLikesOtherGender && otherLikesUserGender) { score += weights.gender; }

    // 2. Budget (25%)
    const budgetDiff = Math.abs(userProf.budget - otherProf.budget);
    const maxBudget = Math.max(userProf.budget, 1);
    const budgetScore = Math.max(0, 1 - (budgetDiff / maxBudget)); // Linear scale down
    score += budgetScore * weights.budget;

    // 3. University (20%)
    if (userProf.universityId === otherProf.universityId) { score += weights.university; }

    // 4. Lifestyle (25%)
    let lifestyleScore = 0;
    const lifestyleFactors = 5;
    if (userProf.isSmoker === otherProf.isSmoker) lifestyleScore++;
    if (userProf.studySchedule === otherProf.studySchedule) lifestyleScore++; else if (userProf.studySchedule === 'Flexible' || otherProf.studySchedule === 'Flexible') lifestyleScore += 0.5;
    const cleanLevels = { 'Tidy': 2, 'Average': 1, 'Relaxed': 0 };
    if (Math.abs(cleanLevels[userProf.cleanliness] - cleanLevels[otherProf.cleanliness]) === 0) lifestyleScore++; else if (Math.abs(cleanLevels[userProf.cleanliness] - cleanLevels[otherProf.cleanliness]) === 1) lifestyleScore += 0.5;
    const guestLevels = { 'Often': 2, 'Sometimes': 1, 'Rarely': 0 };
    if (Math.abs(guestLevels[userProf.guestFrequency] - guestLevels[otherProf.guestFrequency]) === 0) lifestyleScore++; else if (Math.abs(guestLevels[userProf.guestFrequency] - guestLevels[otherProf.guestFrequency]) === 1) lifestyleScore += 0.5;
    if (userProf.drinksAlcohol === otherProf.drinksAlcohol) lifestyleScore++; else if (userProf.drinksAlcohol === 'Rarely' || otherProf.drinksAlcohol === 'Rarely') lifestyleScore += 0.5;
    score += (lifestyleScore / lifestyleFactors) * weights.lifestyle;
    
    // 5. Interest (10%)
    let interestScore = 0;
    if (Math.abs(userProf.yearOfStudy - otherProf.yearOfStudy) <= 1) interestScore += 5;
    const userHobbies = userProf.hobbies.toLowerCase().split(',').map(h => h.trim()).filter(Boolean);
    const otherHobbies = otherProf.hobbies.toLowerCase().split(',').map(h => h.trim()).filter(Boolean);
    const commonHobbies = userHobbies.filter(h => otherHobbies.includes(h)).length;
    interestScore += Math.min(5, commonHobbies * 2.5);
    score += (interestScore / 10) * weights.interest;

    return Math.round(score);
}


// --- Match Viewing Components ---
const MatchCard = ({ profile, score, universityName }) => {
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = () => {
        setIsConnecting(true);
        setTimeout(() => {
            setIsConnecting(false);
        }, 2000);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 h-full flex flex-col border-4 border-transparent hover:border-unistay-yellow">
            <div className="relative">
                <LazyImage src={profile.imageUrl} alt={profile.name} className="h-56 w-full object-cover" loading="lazy" />
                <div className="absolute top-3 right-3 bg-unistay-navy text-white rounded-full h-16 w-16 flex flex-col items-center justify-center font-bold shadow-lg">
                    <span className="text-2xl">{score}%</span>
                    <span className="text-xs">Match</span>
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-unistay-navy">{profile.name}, {profile.age}</h3>
                <p className="text-gray-500 text-sm">{universityName} &middot; {profile.course}</p>
                <p className="text-gray-600 mt-3 text-sm flex-grow">{profile.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">{profile.studySchedule}</span>
                    <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">{profile.cleanliness}</span>
                    <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">{profile.isSmoker ? 'Smoker' : 'Non-Smoker'}</span>
                </div>
            </div>
            <div className="p-4 bg-gray-50 border-t">
                 <button 
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full bg-unistay-navy hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 flex items-center justify-center disabled:bg-opacity-70"
                 >
                  {isConnecting ? <Spinner color="white" size="sm" /> : 'Request to Connect'}
                </button>
            </div>
        </div>
    )
};


const MatchView = ({ userProfile, profiles, universities, onEditProfile }) => {
    const universityMap = useMemo(() => new Map(universities.map(u => [u.id, u.name])), [universities]);

    const matches = useMemo(() => {
        if (!userProfile) return [];
        return profiles
            .filter(p => p.id !== userProfile.id) // Exclude self
            .map(p => ({
                profile: p,
                score: calculateMatchScore(userProfile, p)
            }))
            .sort((a, b) => b.score - a.score); // Sort by score descending
    }, [userProfile, profiles]);

    return (
        <div className="animate-fade-in">
             <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-unistay-navy">Your Top Roommate Matches</h2>
                        <p className="text-gray-600 mt-1">Based on your profile, here are your most compatible roommates.</p>
                    </div>
                    <button onClick={onEditProfile} className="bg-unistay-yellow text-unistay-navy font-bold py-2 px-6 rounded-full hover:bg-yellow-400 transition-colors flex-shrink-0">
                        Edit My Profile
                    </button>
                </div>
             </div>

            {matches.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {matches.slice(0, 9).map(({ profile, score }, index) => (
                        <div key={profile.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                           <MatchCard 
                               profile={profile}
                               score={score}
                               universityName={universityMap.get(profile.universityId) || 'Unknown University'}
                           />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                    <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-unistay-navy">No Matches Found Yet</h3>
                    <p className="text-gray-500 mt-2">We couldn't find any compatible roommates right now. More students are signing up every day, so check back soon!</p>
                </div>
            )}
        </div>
    );
};


// --- Main Component ---
interface RoommateFinderProps {
  currentUser: User;
  currentUserProfile: RoommateProfile | null;
  onProfileUpdate: (profile: RoommateProfile) => Promise<void>;
  profiles: RoommateProfile[];
  universities: University[];
  onNavigateHome: () => void;
  onNavigateToProfile: () => void;
}

const RoommateFinder = ({ currentUser, currentUserProfile, onProfileUpdate, profiles, universities, onNavigateHome, onNavigateToProfile }: RoommateFinderProps) => {
    const [isEditing, setIsEditing] = useState(false);

    // A profile is considered incomplete if essential fields used for matching are missing.
    // This is common for users who just signed up with a social provider like Google.
    const isProfileIncomplete = !currentUserProfile || !currentUserProfile.contactNumber || !currentUserProfile.universityId || !currentUserProfile.course;

    // Show the profile form if the profile is incomplete, or if the user explicitly clicks "edit".
    const showProfileForm = isProfileIncomplete || isEditing;

    const handleProfileUpdated = async (profileData) => {
        await onProfileUpdate(profileData);
        setIsEditing(false); // Hide form after successful update
        // Redirect to profile page after successful profile completion/update
        onNavigateToProfile();
    }
    
    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-unistay-navy text-white shadow-lg sticky top-0 z-40">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
                    <h1 className="text-3xl font-bold">Find a Roommate</h1>
                    <button onClick={onNavigateHome} className="font-semibold hover:text-unistay-yellow transition-colors flex items-center gap-2">
                        <i className="fas fa-arrow-left"></i>
                        Back to Home
                    </button>
                 </div>
            </header>
            
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-24">
                {showProfileForm ? (
                    <ProfileForm 
                        profile={currentUserProfile}
                        user={currentUser}
                        onProfileUpdate={handleProfileUpdated}
                        onCancel={() => setIsEditing(false)}
                        isProfileIncomplete={isProfileIncomplete}
                    />
                ) : (
                    <MatchView
                        userProfile={currentUserProfile}
                        profiles={profiles}
                        universities={universities}
                        onEditProfile={() => setIsEditing(true)}
                    />
                )}
            </main>
        </div>
    );
};

export default RoommateFinder;