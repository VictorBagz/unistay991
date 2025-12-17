import React, { useState } from 'react';
import { University } from '../types';
import { UNIVERSITIES } from '../constants';
import Spinner from './Spinner';
import { storageService } from '../services/storageService';

interface NominationFormData {
  fullName: string;
  university: string;
  course: string;
  yearOfStudy: string;
  about: string;
  extracurricularActivities: string;
  nominee: 'mcm' | 'wcw';
  imageUrl: string;
  imageFile?: File;
}

interface SpotlightNominationFormProps {
  onSubmit: (data: NominationFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const SpotlightNominationForm: React.FC<SpotlightNominationFormProps> = ({ onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState<NominationFormData>({
    fullName: '',
    university: UNIVERSITIES[0]?.id || '',
    course: '',
    yearOfStudy: '',
    about: '',
    extracurricularActivities: '',
    nominee: 'mcm',
    imageUrl: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please upload a valid image file' }));
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.university) {
      newErrors.university = 'University is required';
    }

    if (!formData.course.trim()) {
      newErrors.course = 'Course is required';
    }

    if (!formData.yearOfStudy) {
      newErrors.yearOfStudy = 'Year of study is required';
    }

    if (!formData.about.trim()) {
      newErrors.about = 'About section is required';
    } else if (formData.about.trim().length < 50) {
      newErrors.about = 'About section must be at least 50 characters';
    }

    if (!formData.extracurricularActivities.trim()) {
      newErrors.extracurricularActivities = 'Extracurricular activities are required';
    }

    if (!imageFile && !formData.imageUrl) {
      newErrors.image = 'A high-quality image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', formData);

    if (!validateForm()) {
      console.log('Form validation failed', errors);
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = formData.imageUrl;

      // Upload image if new file selected
      if (imageFile) {
        console.log('Uploading image...');
        const uploadedUrl = await storageService.uploadImage(imageFile, 'news', 'spotlight-nominations');
        imageUrl = uploadedUrl;
        console.log('Image uploaded:', imageUrl);
      }

      console.log('Calling onSubmit with data:', { ...formData, imageUrl });
      await onSubmit({
        ...formData,
        imageUrl,
      });
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setErrors(prev => ({ ...prev, submit: error instanceof Error ? error.message : 'Failed to submit nomination' }));
    } finally {
      setIsUploading(false);
    }
  };

  const yearOptions = Array.from({ length: 6 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Year ${i + 1}`,
  }));

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header with Gradient */}
      <div className="relative h-48 bg-gradient-to-r from-unistay-navy via-blue-900 to-indigo-900 overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-40 h-40 rounded-full bg-unistay-yellow top-0 left-0 transform -translate-x-20 -translate-y-20"></div>
          <div className="absolute w-40 h-40 rounded-full bg-unistay-yellow bottom-0 right-0 transform translate-x-20 translate-y-20"></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
            Nominate a Star
          </h2>
          <p className="text-lg text-yellow-200 font-semibold">
            Know someone deserving of recognition? Nominate them for MCM or WCW!
          </p>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
        {/* Error Message */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-4">Who are you nominating?</label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
              formData.nominee === 'mcm'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}>
              <input
                type="radio"
                name="nominee"
                value="mcm"
                checked={formData.nominee === 'mcm'}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                <span className="text-3xl">💙</span>
                <span>
                  <div className="font-bold text-gray-900">Man Crush Monday</div>
                  <div className="text-sm text-gray-600">Nominate a male student</div>
                </span>
              </div>
            </label>

            <label className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
              formData.nominee === 'wcw'
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-200 bg-white hover:border-pink-300'
            }`}>
              <input
                type="radio"
                name="nominee"
                value="wcw"
                checked={formData.nominee === 'wcw'}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                <span className="text-3xl">🩷</span>
                <span>
                  <div className="font-bold text-gray-900">Women Crush Wednesday</div>
                  <div className="text-sm text-gray-600">Nominate a female student</div>
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Basic Information */}
        <div className="border-t pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter student's full name"
                disabled={isSubmitting || isUploading}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  errors.fullName
                    ? 'border-red-300 bg-red-50 text-red-900'
                    : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:bg-blue-50'
                } placeholder-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500`}
              />
              {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* University */}
            <div>
              <label htmlFor="university" className="block text-sm font-semibold text-gray-900 mb-2">
                University <span className="text-red-500">*</span>
              </label>
              <select
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                disabled={isSubmitting || isUploading}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  errors.university
                    ? 'border-red-300 bg-red-50 text-red-900'
                    : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:bg-blue-50'
                } focus:outline-none disabled:bg-gray-50 disabled:text-gray-500`}
              >
                <option value="">Select a university</option>
                {UNIVERSITIES.map(uni => (
                  <option key={uni.id} value={uni.id}>{uni.name}</option>
                ))}
              </select>
              {errors.university && <p className="text-red-600 text-xs mt-1">{errors.university}</p>}
            </div>

            {/* Course */}
            <div>
              <label htmlFor="course" className="block text-sm font-semibold text-gray-900 mb-2">
                Course/Program <span className="text-red-500">*</span>
              </label>
              <input
                id="course"
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g., Computer Science, Business Administration"
                disabled={isSubmitting || isUploading}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  errors.course
                    ? 'border-red-300 bg-red-50 text-red-900'
                    : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:bg-blue-50'
                } placeholder-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500`}
              />
              {errors.course && <p className="text-red-600 text-xs mt-1">{errors.course}</p>}
            </div>

            {/* Year of Study */}
            <div>
              <label htmlFor="yearOfStudy" className="block text-sm font-semibold text-gray-900 mb-2">
                Year of Study <span className="text-red-500">*</span>
              </label>
              <select
                id="yearOfStudy"
                name="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={handleChange}
                disabled={isSubmitting || isUploading}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  errors.yearOfStudy
                    ? 'border-red-300 bg-red-50 text-red-900'
                    : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:bg-blue-50'
                } focus:outline-none disabled:bg-gray-50 disabled:text-gray-500`}
              >
                <option value="">Select year</option>
                {yearOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.yearOfStudy && <p className="text-red-600 text-xs mt-1">{errors.yearOfStudy}</p>}
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="border-t pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">About the Nominee</h3>
          
          {/* About */}
          <div className="mb-6">
            <label htmlFor="about" className="block text-sm font-semibold text-gray-900 mb-2">
              About <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 font-normal ml-2">(Minimum 50 characters)</span>
            </label>
            <textarea
              id="about"
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Describe why this student deserves to be recognized. What makes them stand out? Share their achievements, personality traits, or impact on the community..."
              disabled={isSubmitting || isUploading}
              rows={5}
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors resize-none ${
                errors.about
                  ? 'border-red-300 bg-red-50 text-red-900'
                  : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:bg-blue-50'
              } placeholder-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500`}
            />
            <div className="flex justify-between items-start mt-2">
              <div>
                {errors.about && <p className="text-red-600 text-xs">{errors.about}</p>}
              </div>
              <span className="text-xs text-gray-500">{formData.about.length}/500</span>
            </div>
          </div>

          {/* Extracurricular Activities */}
          <div>
            <label htmlFor="extracurricularActivities" className="block text-sm font-semibold text-gray-900 mb-2">
              Extracurricular Activities & Involvements <span className="text-red-500">*</span>
            </label>
            <textarea
              id="extracurricularActivities"
              name="extracurricularActivities"
              value={formData.extracurricularActivities}
              onChange={handleChange}
              placeholder="What clubs, societies, or activities is this student involved in? E.g., Student union, Sports team, Debate club, etc."
              disabled={isSubmitting || isUploading}
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors resize-none ${
                errors.extracurricularActivities
                  ? 'border-red-300 bg-red-50 text-red-900'
                  : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:bg-blue-50'
              } placeholder-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500`}
            />
            {errors.extracurricularActivities && <p className="text-red-600 text-xs mt-1">{errors.extracurricularActivities}</p>}
          </div>
        </div>

        {/* Image Upload */}
        <div className="border-t pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">High-Quality Photo</h3>
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            errors.image
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
          }`}>
            {imagePreview ? (
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-xs mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setImageFile(null);
                    }}
                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <label htmlFor="image" className="cursor-pointer">
                  <div className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold inline-block">
                    Change Photo
                  </div>
                </label>
              </div>
            ) : (
              <label htmlFor="image" className="cursor-pointer block">
                <div className="flex flex-col items-center">
                  <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                  <p className="text-lg font-semibold text-gray-900 mb-1">Upload a high-quality photo</p>
                  <p className="text-sm text-gray-600 mb-4">PNG, JPG or WebP. Max 5MB</p>
                  <div className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold inline-block">
                    Choose Photo
                  </div>
                </div>
              </label>
            )}
            <input
              id="image"
              type="file"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              disabled={isSubmitting || isUploading}
              className="sr-only"
            />
          </div>
          {errors.image && <p className="text-red-600 text-xs mt-2">{errors.image}</p>}
          <p className="text-xs text-gray-600 mt-3">
            <i className="fas fa-info-circle mr-1"></i>
            A clear, well-lit headshot or full-body photo is recommended for best results.
          </p>
        </div>

        {/* Form Actions */}
        <div className="border-t pt-8 flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || isUploading}
            className="flex-1 px-6 py-3 rounded-lg font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={(e) => {
              console.log('Button clicked!');
              handleSubmit(e as any);
            }}
            disabled={isSubmitting || isUploading}
            className="flex-1 px-6 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting || isUploading ? (
              <>
                <Spinner color="white" size="sm" />
                Submitting...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Submit Nomination
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SpotlightNominationForm;
