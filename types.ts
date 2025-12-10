



export interface University {
  id: string; // UUID format: 123e4567-e89b-12d3-a456-426614174000
  name: string;
  logoUrl: string;
}

export interface Hostel {
  id: string;
  name: string;
  location: string;
  priceRange: string;
  imageUrl: string; // Primary image (thumbnail)
  imageUrls: string[]; // All hostel images including the primary image
  rating: number;
  universityId: string;
  description: string;
  amenities: {
    name:string;
    icon: string; // font-awesome icon class
  }[];
  isRecommended: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  source: string;
  timestamp: string; // ISO date string
  featured: boolean; // Flag to mark featured news
}

export interface Event {
  id: string;
  title: string;
  date: string;
  day: string;
  month: string;
  location: string;
  imageUrl: string;
  time?: string;
  price?: string;
  contacts?: string[];
  phone?: string;
  email?: string;
  description?: string;
  registrationLink?: string;
}

export interface Job {
  id: string;
  title: string;
  deadline: string;
  company: string;
  imageUrl: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship';
  description: string;
  responsibilities: string[];
  qualifications: string[];
  howToApply: string; // URL to the application page
}

export interface Service {
  id: string;
  name: string;
  icon: string; // Font Awesome class string
  description: string;
}

export interface RoommateProfile {
    id: string; // User ID (string for UID)
    name: string; // First name
    email: string;
    universityId: string;
    contactNumber: string;
    studentNumber: string;
    imageUrl: string;

    // Optional fields for progressive profile completion
    age?: number;
    gender?: 'Male' | 'Female';
    course?: string;
    yearOfStudy?: number;
    budget?: number; // UGX per month
    moveInDate?: string; // YYYY-MM-DD
    dateOfBirth?: string; // YYYY-MM-DD
    leaseDuration?: 'Semester' | 'Full Year' | 'Flexible';
    bio?: string;
    isSmoker?: boolean;
    drinksAlcohol?: 'Socially' | 'Rarely' | 'No';
    studySchedule?: 'Early Bird' | 'Night Owl' | 'Flexible';
    cleanliness?: 'Tidy' | 'Average' | 'Relaxed';
    guestFrequency?: 'Rarely' | 'Sometimes' | 'Often';
    hobbies?: string; // comma separated string
    seekingGender?: 'Male' | 'Female' | 'Any';
    roommateStatus?: 'no-roommate' | 'roomies' | 'pending-request'; // Roommate status
}

// Connection Request for roommates
export interface ConnectionRequest {
    id: string;
    senderId: string; // User who sent the request
    senderName?: string;
    senderImage?: string;
    recipientId: string; // User who receives the request
    status: 'pending' | 'accepted' | 'rejected'; // Request status
    createdAt: string; // ISO date string
    respondedAt?: string; // When recipient responded
}


export interface User {
  id: string; // Supabase UID
  name: string | null;
  email: string | null;
}

export interface Notification {
  id: string;
  type: 'news' | 'job' | 'hostel' | 'roommate';
  message: string;
  timestamp: Date;
  read: boolean;
}

// Student spotlight nominations
export interface StudentSpotlight {
  id: string;
  name: string;
  major?: string;
  bio?: string;
  imageUrl?: string;
  universityId?: string;
  date?: string; // display-friendly date or ISO
  votes?: number;
  gender?: 'male' | 'female' | 'other';
  isWinner?: boolean;
  interests?: string[];
}

// Student spotlight votes
export interface StudentSpotlightVote {
  id: string;
  student_spotlight_id: string;
  user_id: string;
  timestamp: string;
}

// Anonymous confessions
export interface ConfessionComment {
  id: string;
  userId?: string;
  userName?: string;
  content: string;
  timestamp: string;
}

export interface Confession {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  comments: ConfessionComment[];
  userLikeStatus?: 'like' | 'dislike' | null; // Track user's interaction
  isApproved?: boolean; // Moderation status
  approvedBy?: string; // Admin who approved it
  approvedAt?: string; // When it was approved
  rejectionReason?: string; // Reason for rejection (if rejected)
}

// Lost and Found Items
export interface LostItem {
  id: string;
  title: string;
  description: string;
  category: 'lost' | 'found';
  imageUrl?: string;
  postedBy: string;
  phone: string;
  email?: string;
  timestamp: string;
  location?: string;
}

// Student Deals / Student Discounts
export interface StudentDeal {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string; // Optional URL to the deal or merchant
  universityId?: string; // Optionally limit deal to a university
  postedBy?: string;
  phone?: string;
  active?: boolean; // whether the deal is currently active
  discount?: number; // Discount percentage (e.g., 20 for 20% OFF)
  timestamp?: string; // ISO date string
}

// Contact Form Submissions
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  timestamp: string; // ISO date string
  read: boolean; // Whether admin has marked as read
}

