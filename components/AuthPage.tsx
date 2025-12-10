import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import Spinner from './Spinner';
import { UNIVERSITIES } from '../constants';
import { useNotifier } from '../hooks/useNotifier';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onNavigateHome: () => void;
}
// Social sign-in removed (Google button) per request. Keeping email/password flow only.


const AuthPage = ({ onAuthSuccess, onNavigateHome }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
      name: '', 
      email: '', 
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      contactNumber: '',
      universityId: UNIVERSITIES[0]?.id || 'other',
      studentNumber: '',
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({ password: false, confirmPassword: false });
  const { notify } = useNotifier();
  

  const HouseIcon = () => (
    <svg aria-hidden="true" className="inline-block" width="0.8em" height="0.8em" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'translateY(-0.05em)'}}>
      <path d="M12 7.5l-7 6h2v7.5h10v-7.5h2l-7-6z" />
      <circle cx="12" cy="4" r="2" />
    </svg>
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            notify({ message: 'Image file is too large. Please use a file under 2MB.', type: 'error' });
            return;
        }
        setProfilePhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProvider('email');

    if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
            notify({ message: 'Passwords do not match.', type: 'error' });
            setLoadingProvider(null);
            return;
        }
        
        // Check if profile photo is uploaded
        if (!profilePhoto) {
            notify({ message: 'Please upload a profile photo.', type: 'error' });
            setLoadingProvider(null);
            return;
        }
        
        const requiredFields = ['name', 'email', 'password', 'confirmPassword', 'contactNumber', 'universityId', 'studentNumber', 'dateOfBirth'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                notify({ message: `Please fill out all fields. ${field.replace(/([A-Z])/g, ' $1')} is missing.`, type: 'error' });
                setLoadingProvider(null);
                return;
            }
        }
    } else if (!formData.email || !formData.password) {
        notify({ message: 'Please enter both email and password.', type: 'error' });
        setLoadingProvider(null);
        return;
    }

    try {
      if (isLogin) {
        await authService.login(formData.email, formData.password);
      } else {
        await authService.signUp(
            formData.name, 
            formData.email, 
            formData.password,
            formData.universityId,
            formData.contactNumber,
            formData.studentNumber,
            formData.dateOfBirth,
            profilePhoto
        );
      }
      onAuthSuccess();
    } catch (err) {
      notify({ message: err, type: 'error' });
    } finally {
      setLoadingProvider(null);
    }
  };

  // social login removed

  const toggleShowPassword = (field: 'password' | 'confirmPassword') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const isLoading = loadingProvider !== null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
            <a 
              href="/" 
              onClick={(e) => { 
                e.preventDefault(); 
                onNavigateHome(); 
              }} 
              className="inline-block hover:opacity-90 transition-opacity" 
              aria-label="Go to homepage"
            >
              <img 
                src="/images/hostels/unistay.png" 
                alt="UniStay Logo" 
                className="h-12 w-auto rounded-lg shadow-sm"
              />
            </a>
            <p className="text-gray-600 mt-2">Your partner in finding the perfect student accommodation.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center text-unistay-navy mb-6">{isLogin ? 'Welcome Back!' : 'Create Your Account'}</h2>
            
            {/* Social sign-in removed: email/password form only */}

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <>
                        <div>
                           <label htmlFor="photo-upload" className="block text-sm font-medium text-gray-700">Profile Photo</label>
                            <div className="mt-1 flex items-center gap-4">
                                <span className="inline-block h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Profile preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 20.993V24H0v-2.997A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    )}
                                </span>
                                <label htmlFor="photo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-unistay-yellow">
                                    <span>Upload Photo</span>
                                    <input id="photo-upload" name="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} disabled={isLoading} />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-unistay-yellow focus:border-unistay-yellow disabled:bg-gray-50" />
                        </div>
                         <div>
                            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
                            <input id="contactNumber" name="contactNumber" type="tel" required value={formData.contactNumber} onChange={handleChange} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-unistay-yellow focus:border-unistay-yellow disabled:bg-gray-50" />
                        </div>
                        <div>
                            <label htmlFor="universityId" className="block text-sm font-medium text-gray-700">University</label>
                            <select id="universityId" name="universityId" required value={formData.universityId} onChange={handleChange} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-unistay-yellow focus:border-unistay-yellow disabled:bg-gray-50">
                                {UNIVERSITIES.map(uni => <option key={uni.id} value={uni.id}>{uni.name}</option>)}
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-700">Student Number</label>
                            <input id="studentNumber" name="studentNumber" type="text" required value={formData.studentNumber} onChange={handleChange} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-unistay-yellow focus:border-unistay-yellow disabled:bg-gray-50" />
                        </div>
                         <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input id="dateOfBirth" name="dateOfBirth" type="date" required value={formData.dateOfBirth} onChange={handleChange} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-unistay-yellow focus:border-unistay-yellow disabled:bg-gray-50" />
                        </div>
                    </>
                )}
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} disabled={isLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-unistay-yellow focus:border-unistay-yellow disabled:bg-gray-50" />
                </div>
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
                    <div className="relative mt-1">
                        <input id="password" name="password" type={showPasswords.password ? 'text' : 'password'} autoComplete={isLogin ? "current-password" : "new-password"} required value={formData.password} onChange={handleChange} disabled={isLoading} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-unistay-yellow focus:border-unistay-yellow disabled:bg-gray-50 pr-10" />
                        <button type="button" onClick={() => toggleShowPassword('password')} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600" aria-label={showPasswords.password ? 'Hide password' : 'Show password'}>
                            <i className={`fas ${showPasswords.password ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                    </div>
                </div>
                 {!isLogin && (
                    <div>
                        <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-700">Confirm Password</label>
                         <div className="relative mt-1">
                            <input id="confirmPassword" name="confirmPassword" type={showPasswords.confirmPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} disabled={isLoading} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-unistay-yellow focus:border-unistay-yellow disabled:bg-gray-50 pr-10" />
                            <button type="button" onClick={() => toggleShowPassword('confirmPassword')} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600" aria-label={showPasswords.confirmPassword ? 'Hide password' : 'Show password'}>
                                <i className={`fas ${showPasswords.confirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="pt-2">
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold text-unistay-navy bg-unistay-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-300 disabled:bg-yellow-400/70 disabled:cursor-not-allowed">
                        {loadingProvider === 'email' ? <Spinner color="navy" /> : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </div>
            </form>
             <p className="mt-6 text-center text-sm text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => { if (!isLoading) { setIsLogin(!isLogin); }}} className="font-medium text-unistay-navy hover:text-unistay-yellow disabled:text-gray-400" disabled={isLoading}>
                    {isLogin ? 'Sign up' : 'Sign in'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;