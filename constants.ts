import { University, Service, RoommateProfile, Hostel, NewsItem, Event, Job } from './types';

// Mock Data
export const HOSTELS: Hostel[] = [
  {
    id: '1',
    name: 'Olympia Hostel',
    location: 'Makerere Kikoni',
    priceRange: '600,000 - 1,200,000 UGX',
    imageUrl: '/images/hostels/olympia.jpg',
    imageUrls: ['/images/hostels/olympia.jpg'],
    rating: 4.5,
    universityId: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Luxury student accommodation near Makerere University',
    amenities: [
      { name: 'WiFi', icon: 'fas fa-wifi' },
      { name: 'Security', icon: 'fas fa-shield-alt' },
      { name: 'DSTV', icon: 'fas fa-tv' }
    ],
    isRecommended: true
  }
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    title: 'New Student Housing Development',
    description: 'Major new student housing development announced near Makerere',
    imageUrl: '/images/news/housing.jpg',
    source: 'UniStay News',
    timestamp: new Date().toISOString(),
    featured: false
  }
];

export const EVENTS: Event[] = [
  {
    id: '1',
    title: 'Housing Fair 2025',
    date: '2025-11-15',
    day: '15',
    month: 'NOV',
    location: 'Freedom Square',
    imageUrl: '/images/events/housing-fair.jpg',
    time: '10:00 AM',
    price: 'Free',
    description: 'Annual housing fair for students'
  }
];

export const JOBS: Job[] = [
  {
    id: '1',
    title: 'Student Ambassador',
    deadline: '2025-12-01',
    company: 'UniStay',
    imageUrl: '/images/jobs/ambassador.jpg',
    location: 'Kampala',
    type: 'Part-time',
    description: 'Represent UniStay on campus',
    responsibilities: ['Campus outreach', 'Social media management'],
    qualifications: ['Current student', 'Good communication skills'],
    howToApply: 'https://unistay.com/careers'
  }
];

export const ROOMMATE_PROFILES: RoommateProfile[] = [
  {
    id: 'demo1',
    name: 'John Doe',
    email: 'john@example.com',
    universityId: '123e4567-e89b-12d3-a456-426614174001',
    contactNumber: '+256700000000',
    studentNumber: 'MAK/000001',
    imageUrl: '/images/profiles/default.jpg',
    age: 20,
    gender: 'Male',
    course: 'Computer Science',
    yearOfStudy: 2,
    budget: 800000,
    moveInDate: '2025-09-01',
    leaseDuration: 'Semester',
    bio: 'Tech enthusiast looking for like-minded roommate',
    isSmoker: false,
    drinksAlcohol: 'Rarely',
    studySchedule: 'Night Owl',
    cleanliness: 'Tidy',
    guestFrequency: 'Sometimes',
    hobbies: 'Programming, Gaming, Reading',
    seekingGender: 'Any'
  }
];

// Core feature constants
export const UNIVERSITIES: University[] = [
  { id: '123e4567-e89b-12d3-a456-426614174001', name: 'Makerere University', logoUrl: '/images/hostels/makerere.jpg' },
  { id: '123e4567-e89b-12d3-a456-426614174002', name: 'Kyambogo University', logoUrl: '/images/hostels/kyambogo.jpg' },
  { id: '123e4567-e89b-12d3-a456-426614174003', name: 'Makerere University Business School', logoUrl: '/images/hostels/mubs.jpg' },
  { id: '123e4567-e89b-12d3-a456-426614174004', name: 'Uganda Christian University', logoUrl: '/images/hostels/ucu.png' },
  { id: '123e4567-e89b-12d3-a456-426614174005', name: 'UMU Nkozi', logoUrl: '/images/hostels/umu.png' },
  { id: '123e4567-e89b-12d3-a456-426614174006', name: 'Kampala International University', logoUrl: '/images/hostels/kiu.jpg' },
  { id: '123e4567-e89b-12d3-a456-426614174007', name: 'MUST', logoUrl: '/images/hostels/must.jpg' },
  { id: '123e4567-e89b-12d3-a456-426614174008', name: 'Aga Khan', logoUrl: '/images/hostels/agaKhan.jpg' },
  { id: '123e4567-e89b-12d3-a456-426614174009', name: 'Gulu', logoUrl: '/images/hostels/gulu.png' },
  { id: '123e4567-e89b-12d3-a456-426614174010', name: 'Lira', logoUrl: '/images/hostels/lira.png' },
  { id: '123e4567-e89b-12d3-a456-426614174011', name: 'IUEA', logoUrl: '/images/hostels/iuea.jpg' },
  { id: '123e4567-e89b-12d3-a456-426614174012', name: 'Soroti University', logoUrl: '/images/hostels/soroti.png' },
];

export const SERVICES: Service[] = [
  { id: 'food', name: 'Food', icon: 'fas fa-utensils', description: 'Best & affordable food spots.' },
  { id: 'transport', name: 'Transport', icon: 'fas fa-motorcycle', description: 'Easy ways to get around campus.' },
  { id: 'shopping', name: 'Shopping', icon: 'fas fa-shopping-bag', description: 'Your essentials and retail therapy.' },
  { id: 'stationery', name: 'Stationery', icon: 'fas fa-book-open', description: 'All your academic supplies.' },
  { id: 'laundry', name: 'Laundry', icon: 'fas fa-tshirt', description: 'Quick & convenient laundry services.' },
  { id: 'entertainment', name: 'Entertainment', icon: 'fas fa-ticket-alt', description: 'Fun activities and hangout joints.' },
  { id: 'internet', name: 'Internet', icon: 'fas fa-wifi', description: 'Reliable internet for study & fun.' },
  { id: 'health', name: 'Health', icon: 'fas fa-heartbeat', description: 'Clinics, pharmacies & wellness.' },
];

export const AMENITIES_LIST: { name: string; icon: string }[] = [
  { name: 'WiFi', icon: 'fas fa-wifi' },
  { name: 'Shuttle', icon: 'fas fa-bus' },
  { name: 'Security', icon: 'fas fa-shield-alt' },
  { name: 'DSTV', icon: 'fas fa-tv' },
  { name: 'Pool', icon: 'fas fa-swimmer' },
  { name: 'Gym', icon: 'fas fa-dumbbell' },
  { name: 'Restaurant', icon: 'fas fa-utensils' },
  { name: 'Water', icon: 'fas fa-shower' },
];

// Roommate form constants
export const GENDERS: RoommateProfile['gender'][] = ['Male', 'Female'];
export const SEEKING_GENDERS: RoommateProfile['seekingGender'][] = ['Male', 'Female', 'Any'];
export const LEASE_DURATIONS: RoommateProfile['leaseDuration'][] = ['Semester', 'Full Year', 'Flexible'];
export const STUDY_SCHEDULES: RoommateProfile['studySchedule'][] = ['Early Bird', 'Night Owl', 'Flexible'];
export const CLEANLINESS_LEVELS: RoommateProfile['cleanliness'][] = ['Tidy', 'Average', 'Relaxed'];
export const GUEST_FREQUENCIES: RoommateProfile['guestFrequency'][] = ['Rarely', 'Sometimes', 'Often'];
export const DRINKING_HABITS: RoommateProfile['drinksAlcohol'][] = ['Socially', 'Rarely', 'No'];