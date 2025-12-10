import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';

import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedContent from './components/FeaturedContent';
import CommunityHub from './components/CommunityHub';
import Services from './components/Services';
import ServicePage from './components/ServicePage';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import HostelDetailModal from './components/HostelDetailModal';
import RoommateFinder from './components/RoommateFinder';
import RoommateMatchPage from './components/RoommateMatchPage';
import BlogPage from './components/BlogPage';
import NewsArticlePage from './components/NewsArticlePage';
import EventsPage from './components/EventsPage';
import JobsPage from './components/JobsPage';
import AuthPage from './components/AuthPage';
import AdminDashboard from './components/AdminDashboard';
import ProfilePage from './components/ProfilePage';
import Spinner from './components/Spinner';
import Notifier from './components/Notifier';
import { NotificationProvider } from './hooks/useNotifier';
import { initializeLazyLoadObserver } from './utils/lazyLoadingUtils';

import { 
    UNIVERSITIES, 
    SERVICES
} from './constants';
import { University, Hostel, NewsItem, Job, Event, User, RoommateProfile, Notification } from './types';

import { supabase } from './services/supabase';
import { authService, formatUser } from './services/authService';
// Switch from mockDbService to live dbService
import { 
    hostelService, newsService, eventService, jobService, roommateProfileService, 
    hostelHandler, newsHandler, eventHandler, jobHandler, 
    confessionHandler, confessionService, spotlightService, spotlightHandler,
    studentDealsService, studentDealsHandler
} from './services/dbService';
import { contactService, contactHandler } from './services/contactService';

type AppView = 'main' | 'roommateFinder' | 'roommateMatch' | 'blog' | 'newsArticle' | 'events' | 'jobs' | 'auth' | 'admin' | 'profile' | 'service' | 'spotlight' | 'services';


const App = () => {
  // --- Refs ---
  const contactFormRef = useRef<HTMLDivElement>(null);
  const studentDealsRef = useRef<HTMLDivElement>(null);
  const communityHubRef = useRef<HTMLDivElement>(null);
  const studentSpotlightRef = useRef<HTMLDivElement>(null);

  // --- State Management ---
  const [currentView, setCurrentView] = useState<AppView>('main');
  const [selectedUniversity, setSelectedUniversity] = useState<University>(UNIVERSITIES[0]);
  const [viewingHostel, setViewingHostel] = useState<Hostel | null>(null);
  const [viewingNewsArticle, setViewingNewsArticle] = useState<NewsItem | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [savedHostels, setSavedHostels] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('unistay_saved_hostels');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (error) {
      console.error("Failed to parse saved hostels from localStorage", error);
      return new Set();
    }
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);


  // Data state
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [roommateProfiles, setRoommateProfiles] = useState<RoommateProfile[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);

  // New community hub sections state
  const [deals, setDeals] = useState<any[]>([
    {
      id: '1',
      title: 'Pizza Hut Discount',
      description: 'Get 30% off on your first order with student ID',
      discount: 30,
      imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop',
      postedBy: 'John Doe',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: 'Gym Membership Special',
      description: 'Student gym membership at half price for 3 months',
      discount: 50,
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
      postedBy: 'Jane Smith',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'Movie Tickets',
      description: 'Student discount on weekday movie tickets',
      discount: 25,
      imageUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=300&fit=crop',
      postedBy: 'Admin',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [lostItems, setLostItems] = useState<any[]>([
    {
      id: '1',
      title: 'Lost: Blue Backpack',
      description: 'Lost near the library on Monday. Contains laptop and textbooks.',
      category: 'lost',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
      postedBy: 'Sarah Johnson',
      phone: '+234 (0) 810 123 4567',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: 'Found: Black Wallet',
      description: 'Found in the cafeteria. Contains ID and some cards. Contact to claim.',
      category: 'found',
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop',
      postedBy: 'Michael Chen',
      phone: '+234 (0) 805 987 6543',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [studentSpotlights, setStudentSpotlights] = useState<any[]>([]);

  // Spotlights are now managed via database (spotlightHandler from dbService)

  const [confessions, setConfessions] = useState<any[]>([]);
  const [pendingConfessions, setPendingConfessions] = useState<any[]>([]);

  // Use DB-backed confessionHandler (from dbService)
  // We'll keep a local wrapper to update UI state when DB events arrive
  // initial fetch and realtime subscription handled in effect below

  // Normalize likes/dislikes from DB (handles numbers, arrays, JSON strings)
  const normalizeCount = (v: any): number => {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    if (Array.isArray(v)) {
      // if array of numbers, sum; otherwise use length
      if (v.every((x: any) => typeof x === 'number')) return v.reduce((s: number, x: number) => s + x, 0);
      return v.length;
    }
    if (typeof v === 'string') {
      // try JSON parse (e.g. stored as '[0]')
      try {
        const p = JSON.parse(v);
        return normalizeCount(p);
      } catch (e) {
        // fallback: try parseInt
        const n = parseInt(v, 10);
        return Number.isNaN(n) ? 0 : n;
      }
    }
    if (typeof v === 'object') {
      if ('length' in v && typeof v.length === 'number') return v.length;
      return 0;
    }
    return 0;
  };

  // --- Lost & Found handlers
  const lostFoundHandler = {
    add: async (item: Omit<any, 'id'>) => {
      const newItem = { ...item, id: `lostfound-${Date.now()}`, timestamp: new Date().toISOString() };
      setLostItems(prev => [newItem, ...prev]);
    },
    update: async (item: any) => {
      setLostItems(prev => prev.map(li => li.id === item.id ? { ...li, ...item } : li));
    },
    remove: async (id: string) => {
      setLostItems(prev => prev.filter(li => li.id !== id));
    }
  };
  
  // --- Effects ---
  // Listen to auth state changes and load initial data
  useEffect(() => {
    // Initialize lazy loading for images
    initializeLazyLoadObserver({ rootMargin: '50px' });

    let isSubscribed = true;

    const initializeApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = formatUser(session?.user || null);
        
        if (isSubscribed) {
          setCurrentUser(user);
          setIsAdmin(user?.email === 'admin@unistay.com' || user?.email === 'victorbaguma34@gmail.com');
          
          if (!user) {
            setSavedHostels(new Set());
            setNotifications([]);
          }
          
          await refreshAllData();
            // Fetch confessions from DB (only approved ones for public display)
            try {
              const confs = await confessionService.getApproved();
              if (isSubscribed) {
                // Map DB rows to the shape expected by UI (normalize counts)
                const mapped = confs.map(c => ({
                  id: c.id,
                  content: c.content,
                  timestamp: c.timestamp,
                  likes: normalizeCount((c as any).likes),
                  dislikes: normalizeCount((c as any).dislikes),
                  comments: [],
                  userLikeStatus: null
                }));
                setConfessions(mapped);
              }
            } catch (err) {
              console.error('Failed to load confessions:', err);
            }

            // Fetch pending confessions for admin (if user is admin)
            if (user?.email === 'admin@unistay.com' || user?.email === 'victorbaguma34@gmail.com' || user?.email === 'drilebaroy33@gmail.com') {
              try {
                const pending = await confessionService.getPending();
                if (isSubscribed) {
                  const mapped = pending.map(c => ({
                    id: c.id,
                    content: c.content,
                    timestamp: c.timestamp,
                    likes: normalizeCount((c as any).likes),
                    dislikes: normalizeCount((c as any).dislikes),
                    comments: [],
                    userLikeStatus: null
                  }));
                  setPendingConfessions(mapped);
                }
              } catch (err) {
                console.error('Failed to load pending confessions:', err);
              }
            }

            setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = formatUser(session?.user || null);
      if (isSubscribed) {
        setCurrentUser(user);
        setIsAdmin(user?.email === 'admin@unistay.com' || user?.email === 'victorbaguma34@gmail.com' || user?.email === 'drilebaroy33@gmail.com');
        
        if (!user) {
          setSavedHostels(new Set());
          setNotifications([]);
        }
      }
    });

    initializeApp();

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, []);

  // Realtime subscriptions for confessions and comments using refs for safe cleanup
  const confessionsSubRef = React.useRef<(() => void) | null>(null);
  const commentsSubRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    // subscribe to confessions table changes
    confessionsSubRef.current = confessionHandler.subscribeConfessions((payload: any) => {
      try {
        const ev = payload.eventType || payload.event || payload.type;
        const record = payload.new || payload.record || payload;
        if (!record) return;

        // For INSERT: only add if explicitly approved
        if (ev === 'INSERT' || payload.eventType === 'INSERT') {
          // Only add to public display if is_approved is explicitly true
          const isApproved = record.is_approved === true || record.isApproved === true;
          if (isApproved) {
            setConfessions(prev => [{
              id: record.id,
              content: record.content,
              timestamp: record.timestamp,
              likes: normalizeCount(record.likes),
              dislikes: normalizeCount(record.dislikes),
              comments: [],
              userLikeStatus: null
            }, ...prev]);
          } else {
            // Add to pending confessions for admin if not approved
            setPendingConfessions(prev => [{
              id: record.id,
              content: record.content,
              timestamp: record.timestamp,
              likes: normalizeCount(record.likes),
              dislikes: normalizeCount(record.dislikes),
              comments: [],
              userLikeStatus: null
            }, ...prev]);
          }
        } else if (ev === 'UPDATE') {
          // If confession was approved, move from pending to public
          const isApproved = record.is_approved === true || record.isApproved === true;
          if (isApproved) {
            setConfessions(prev => {
              // Check if already in public
              if (prev.some(c => c.id === record.id)) {
                // Just update likes/dislikes
                return prev.map(c => c.id === record.id ? { ...c, likes: normalizeCount(record.likes), dislikes: normalizeCount(record.dislikes) } : c);
              } else {
                // Add newly approved confession to public
                return [{
                  id: record.id,
                  content: record.content,
                  timestamp: record.timestamp,
                  likes: normalizeCount(record.likes),
                  dislikes: normalizeCount(record.dislikes),
                  comments: [],
                  userLikeStatus: null
                }, ...prev];
              }
            });
            // Remove from pending
            setPendingConfessions(prev => prev.filter(c => c.id !== record.id));
          } else {
            // Update likes/dislikes in public confessions only
            setConfessions(prev => prev.map(c => c.id === record.id ? { ...c, likes: normalizeCount(record.likes), dislikes: normalizeCount(record.dislikes) } : c));
          }
        } else if (ev === 'DELETE') {
          const confId = payload.old?.id || payload.record?.id || record.id;
          setConfessions(prev => prev.filter(c => c.id !== confId));
          setPendingConfessions(prev => prev.filter(c => c.id !== confId));
        }
      } catch (err) {
        console.error('Error handling confession realtime payload', err);
      }
    });

    // subscribe to comments changes
    commentsSubRef.current = confessionHandler.subscribeComments((payload: any) => {
      try {
        const record = payload.new || payload.record || payload;
        const ev = payload.eventType || payload.event || payload.type;
        if (!record) return;
        if (ev === 'INSERT') {
          const confessionId = record.confession_id || record.confessionId;
          setConfessions(prev => prev.map(c => c.id === confessionId ? { ...c, comments: [...(c.comments || []), { id: record.id, content: record.content, userName: record.user_name || record.userName, timestamp: record.timestamp }] } : c));
        }
      } catch (err) {
        console.error('Error handling comment realtime payload', err);
      }
    });

    return () => {
      confessionsSubRef.current && confessionsSubRef.current();
      commentsSubRef.current && commentsSubRef.current();
    };
  }, []);

  // Persist saved hostels to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('unistay_saved_hostels', JSON.stringify(Array.from(savedHostels)));
    } catch (error) {
      console.error("Failed to save hostels to localStorage", error);
    }
  }, [savedHostels]);

  // Generate mock notifications when user logs in and data is available
  useEffect(() => {
    if (currentUser && !isLoading && notifications.length === 0) {
      const currentUserProfile = roommateProfiles.find(p => p.id === currentUser?.id);
      const newNotifs: Notification[] = [];
      if (news.length > 0) {
          newNotifs.push({
              id: `notif-news-${news[0].id}`, type: 'news',
              message: `New article posted: "${news[0].title}"`,
              timestamp: new Date(new Date().getTime() - 1000 * 60 * 3), // 3 mins ago
              read: false,
          });
      }
      if (jobs.length > 0) {
          newNotifs.push({
              id: `notif-job-${jobs[0].id}`, type: 'job',
              message: `New opportunity: ${jobs[0].title} at ${jobs[0].company}`,
              timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 1), // 1 hour ago
              read: false,
          });
      }
      if (roommateProfiles.length > 1 && currentUserProfile) {
           newNotifs.push({
              id: `notif-roommate-${Date.now()}`, type: 'roommate',
              message: `You have new potential roommate matches!`,
              timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 5), // 5 hours ago
              read: false,
          });
      }
      setNotifications(newNotifs.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()));
    }
  }, [currentUser, isLoading, news, jobs, roommateProfiles]);

  // Handle URL parameters to navigate to specific articles when shared links are clicked
  useEffect(() => {
    if (isLoading) return; // Wait for data to load

    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const articleId = params.get('articleId');

    // If a view param is provided, navigate to it. Special-case newsArticle which may include articleId.
    if (view) {
      if (view === 'newsArticle' && articleId && news.length > 0) {
        const article = news.find(n => n.id === articleId);
        if (article) {
          setViewingNewsArticle(article);
          setCurrentView('newsArticle');
          window.scrollTo(0, 0);
        }
      } else {
        // Cast cautiously to AppView; unknown values will be ignored by the rest of the app.
        setCurrentView(view as AppView);
        // When navigating to another view from URL, scroll to top for clarity
        window.scrollTo(0, 0);
      }
    }
  }, [isLoading, news]);


  const refreshAllData = async () => {
    // Re-fetch all data to reflect changes made in the admin panel
    const [hostelsData, newsData, eventsData, jobsData, profilesData, contactData, spotlightData, dealsData] = await Promise.all([
        hostelService.getAll(),
        newsService.getAll(),
        eventService.getAll(),
        jobService.getAll(),
        roommateProfileService.getAll(),
        contactService.getAll(),
        spotlightService.getAll(),
        studentDealsService.getAll()
    ]);
    setHostels(hostelsData);
    setNews(newsData);
    setEvents(eventsData);
    setJobs(jobsData);
    setRoommateProfiles(profilesData);
    setContactMessages(contactData);
    setStudentSpotlights(spotlightData);
    setDeals(dealsData);
  };

  // --- Modal Handlers ---
  const handleViewHostel = (hostel: Hostel) => setViewingHostel(hostel);
  const handleCloseModal = () => setViewingHostel(null);
  
  // --- Profile Update Handler ---
  const handleProfileUpdate = async (profileData: RoommateProfile): Promise<void> => {
    await roommateProfileService.set(profileData);
    const updatedProfiles = await roommateProfileService.getAll();
    setRoommateProfiles(updatedProfiles);
  };
  
  // --- Navigation ---
  const handleNavigation = (view: AppView) => {
    const updateURLForView = (viewName?: string, extras?: Record<string,string>) => {
      const params = new URLSearchParams(window.location.search);
      if (viewName) params.set('view', viewName);
      else params.delete('view');
      // Keep articleId only when navigating to newsArticle via explicit param
      if (viewName !== 'newsArticle') params.delete('articleId');
      if (extras) {
      Object.entries(extras).forEach(([k,v]) => params.set(k,v));
      }
      const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    };
    if (view === 'admin' && isAdmin) {
      setCurrentView('admin');
      updateURLForView('admin');
    } else if (view === 'spotlight') {
        // Scroll to spotlight section if on main page, otherwise navigate to main first
        if (currentView === 'main') {
            communityHubRef.current?.scrollIntoView({ behavior: 'smooth' });
        updateURLForView('main');
        } else {
            setCurrentView('main');
            // Scroll after state update completes
            setTimeout(() => {
                communityHubRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        updateURLForView('main');
        }
    } else if (view !== 'admin') {
      setCurrentView(view);
      updateURLForView(view);
      window.scrollTo(0, 0);
    }
  };

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    handleNavigation('service');
  };

  // --- Save Hostel Handler ---
  const handleToggleSaveHostel = (hostelId: string) => {
    if (!currentUser) {
        handleNavigation('auth');
        return;
    }
    setSavedHostels(prevSaved => {
        const newSaved = new Set(prevSaved);
        if (newSaved.has(hostelId)) {
            newSaved.delete(hostelId);
        } else {
            newSaved.add(hostelId);
        }
        return newSaved;
    });
  };
  
  const handleAuthSuccess = () => {
      // The onAuthStateChange listener handles setting the user.
      // We just need to navigate away from the auth page.
      handleNavigation('main');
  }
  
  const handleLogout = async () => {
      await authService.logout();
      // The onAuthStateChange listener will handle state cleanup.
      handleNavigation('auth');
  }
  
  const handleMarkNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleScrollToContact = () => {
    if (contactFormRef.current) {
      contactFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScrollToSpotlight = () => {
    if (studentSpotlightRef.current) {
      studentSpotlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // If we're not on the main view, navigate there first then scroll after a short delay
    if (currentView !== 'main') {
      setCurrentView('main');
      setTimeout(() => {
        studentSpotlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  };

  const handleScrollToDeals = () => {
    if (studentDealsRef.current) {
      studentDealsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScrollToServices = () => {
    // Prefer element by id (Services component sets id="services")
    const el = document.getElementById('services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (currentView !== 'main') {
      setCurrentView('main');
      setTimeout(() => {
        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  };

  // --- Page Content ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-unistay-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  // Determine if top padding is needed based on the current view, as some views have their own headers.
  const requiresPadding = currentView === 'main';

  return (
    <NotificationProvider>
      <div className={`bg-white font-sans antialiased ${requiresPadding ? 'pt-20' : ''}`}>
        <Analytics />
        <Notifier />
        <Header
          onNavigate={handleNavigation}
          currentView={currentView}
          user={currentUser}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
          onScrollToContact={handleScrollToContact}
          onScrollToSpotlight={handleScrollToSpotlight}
          onScrollToServices={handleScrollToServices}
        />

        <main>
          {currentView === 'main' && (
            <>
              <Hero 
                hostels={hostels}
                onHostelSelect={handleViewHostel}
              />
              <FeaturedContent
                universities={UNIVERSITIES}
                selectedUniversity={selectedUniversity}
                onSelectUniversity={setSelectedUniversity}
                hostels={hostels}
                onViewHostel={handleViewHostel}
                savedHostelIds={savedHostels}
                onToggleSave={handleToggleSaveHostel}
              />
              <CommunityHub
                ref={communityHubRef}
                news={news}
                events={events}
                jobs={jobs}
                universities={UNIVERSITIES}
                onNavigateToBlog={() => handleNavigation('blog')}
                onNavigateToEvents={() => handleNavigation('events')}
                onNavigateToJobs={() => handleNavigation('jobs')}
                user={currentUser}
                onNavigate={handleNavigation}
                deals={deals}
                lostItems={lostItems}
                studentSpotlights={studentSpotlights}
                confessions={confessions}
                studentDealsRef={studentDealsRef}
                studentSpotlightRef={studentSpotlightRef}
                confessionHandler={confessionHandler}
              />
              <Services services={SERVICES} selectedUniversity={selectedUniversity} onServiceSelect={handleServiceSelect} />
            </>
          )}
          
          {currentView === 'blog' && <BlogPage news={news} onNavigateHome={() => handleNavigation('main')} />}
          {currentView === 'newsArticle' && <NewsArticlePage news={viewingNewsArticle} onNavigateHome={() => { setViewingNewsArticle(null); handleNavigation('blog'); }} />}
          {currentView === 'events' && <EventsPage events={events} onNavigateHome={() => handleNavigation('main')} />}
          {currentView === 'jobs' && <JobsPage jobs={jobs} onNavigateHome={() => handleNavigation('main')} />}
          
          {currentView === 'roommateFinder' && currentUser && (
            <RoommateFinder
              currentUser={currentUser}
              currentUserProfile={roommateProfiles.find(p => p.id === currentUser.id) || null}
              onProfileUpdate={handleProfileUpdate}
              profiles={roommateProfiles}
              universities={UNIVERSITIES}
              onNavigateHome={() => handleNavigation('main')}
              onNavigateToProfile={() => handleNavigation('profile')}
            />
          )}

          {currentView === 'roommateMatch' && currentUser && (
            <RoommateMatchPage
              currentUser={roommateProfiles.find(p => p.id === currentUser.id) || null}
              profiles={roommateProfiles}
              universities={UNIVERSITIES}
              onNavigateHome={() => handleNavigation('main')}
              onNavigateToProfile={() => handleNavigation('profile')}
            />
          )}
          
          {currentView === 'auth' && <AuthPage onAuthSuccess={handleAuthSuccess} onNavigateHome={() => handleNavigation('main')} />}
          
          {currentView === 'admin' && isAdmin && (
            <AdminDashboard
              onExitAdminMode={() => handleNavigation('main')}
              content={{
                hostels: { items: hostels, handler: hostelHandler, universities: UNIVERSITIES },
                news: { items: news, handler: newsHandler },
                events: { items: events, handler: eventHandler },
                jobs: { items: jobs, handler: jobHandler },
                roommateProfiles: { items: roommateProfiles },
                contactMessages: { items: contactMessages, handler: contactHandler },
                spotlights: { items: studentSpotlights, handler: spotlightHandler },
                lostFound: { items: lostItems, handler: lostFoundHandler },
                studentDeals: { items: deals, handler: studentDealsHandler },
                pendingConfessions: { items: pendingConfessions, handler: confessionHandler }
              }}
              onDataChange={refreshAllData}
            />
          )}

          {currentView === 'profile' && currentUser && (
              <ProfilePage
                  user={currentUser}
                  profile={roommateProfiles.find(p => p.id === currentUser.id)}
                  onNavigate={handleNavigation}
                  onSignOut={handleLogout}
                  universities={UNIVERSITIES}
                  onDataChange={refreshAllData}
                  savedHostels={Array.from(savedHostels).map(id => hostels.find(h => h.id === id)).filter(Boolean) as Hostel[]}
                  onToggleSaveHostel={handleToggleSaveHostel}
                  confessions={confessions}
                  confessionHandler={confessionHandler}
                  allProfiles={roommateProfiles}
              />
          )}

          {currentView === 'service' && selectedService && (
            <ServicePage
              service={selectedService}
              university={selectedUniversity}
              onNavigateHome={() => handleNavigation('main')}
            />
          )}

        </main>

        {viewingHostel && <HostelDetailModal hostel={viewingHostel} onClose={handleCloseModal} />}
        
        {currentView !== 'admin' && currentView !== 'auth' && currentView !== 'roommateFinder' && currentView !== 'roommateMatch' && currentView !== 'profile' && currentView !== 'newsArticle' && currentView !== 'service' && (
          <>
            <div ref={contactFormRef}>
              <ContactForm />
            </div>
            <Footer
              onNavigateToRoommateFinder={() => handleNavigation('roommateFinder')}
              onNavigateToBlog={() => handleNavigation('blog')}
              onNavigateToAuth={() => handleNavigation('auth')}
              onNavigateToHostels={() => handleNavigation('main')}
              onScrollToContact={handleScrollToContact}
              onScrollToDeals={handleScrollToDeals}
              user={currentUser}
            />
          </>
        )}
      </div>
    </NotificationProvider>
  );
};

export default App;