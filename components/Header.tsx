import React, { useState, useEffect, useRef } from 'react';
import { User, Notification } from '../types';

type AppView = 'main' | 'roommateFinder' | 'blog' | 'events' | 'jobs' | 'auth' | 'admin' | 'profile' | 'spotlight' | 'services';

const HouseIcon = () => (
    <svg aria-hidden="true" className="inline-block" width="0.8em" height="0.8em" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'translateY(-0.05em)'}}>
      <path d="M12 7.5l-7 6h2v7.5h10v-7.5h2l-7-6z" />
      <circle cx="12" cy="4" r="2" />
    </svg>
);

// --- Time formatting helper ---
const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

// --- Sub-components for Header ---
const NotificationMenu = ({ notifications, onMarkAsRead, user, onNavigate }: { notifications: Notification[], onMarkAsRead: () => void, user: User | null, onNavigate: (view: AppView) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const hasUnread = user ? notifications.some(n => !n.read) : false;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        if (user) {
            if (!isOpen && hasUnread) {
                onMarkAsRead();
            }
            setIsOpen(prev => !prev);
        } else {
            onNavigate('auth');
        }
    };

    const iconMap = {
        news: 'fa-newspaper',
        job: 'fa-briefcase',
        hostel: 'fa-hotel',
        roommate: 'fa-users',
    };

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={handleToggle} className="relative text-2xl text-white hover:text-unistay-yellow transition-colors" aria-label="Notifications">
                <i className="fas fa-bell"></i>
                {hasUnread && <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-unistay-navy" aria-hidden="true"></span>}
            </button>
            {isOpen && user && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-md shadow-lg text-unistay-navy z-50 overflow-hidden animate-slide-in-down" style={{ animationDuration: '0.3s' }}>
                    <div className="p-3 font-bold border-b text-sm">Notifications</div>
                    {notifications.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto no-scrollbar">
                            {notifications.map(notif => (
                                <div key={notif.id} className="flex items-start gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                                    <div className="w-8 flex justify-center pt-1">
                                        <i className={`fas ${iconMap[notif.type]} text-unistay-navy/60`}></i>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm leading-snug">{notif.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{timeSince(notif.timestamp)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="p-4 text-sm text-gray-500 text-center">No new notifications.</p>
                    )}
                </div>
            )}
        </div>
    );
};


const UserMenu = ({ user, isAdmin, onLogout, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigate = (view: AppView) => {
        setIsOpen(false);
        onNavigate(view);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2" aria-label="Open user menu">
                <div className="w-10 h-10 rounded-full bg-unistay-yellow flex items-center justify-center font-bold text-unistay-navy text-xl">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-md shadow-lg py-1 text-unistay-navy z-50 animate-slide-in-down" style={{ animationDuration: '0.3s' }}>
                    <div className="px-4 py-2 border-b">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                    </div>
                    <button onClick={() => handleNavigate('profile')} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 font-medium">My Profile</button>
                    {isAdmin && (
                        <button onClick={() => handleNavigate('admin')} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100">Admin Dashboard</button>
                    )}
                    <button onClick={onLogout} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 text-red-600">Logout</button>
                </div>
            )}
        </div>
    );
};


// --- Main Header Component ---
interface HeaderProps {
    onNavigate: (view: AppView) => void;
    currentView: AppView;
    user: User | null;
    isAdmin: boolean;
    onLogout: () => void;
    notifications: Notification[];
    onMarkNotificationsAsRead: () => void;
    onScrollToContact?: () => void;
    onScrollToSpotlight?: () => void;
    onScrollToServices?: () => void;
}

const Header = ({ onNavigate, currentView, user, isAdmin, onLogout, notifications, onMarkNotificationsAsRead, onScrollToContact, onScrollToSpotlight, onScrollToServices }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [communityHubDropdownOpen, setCommunityHubDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCommunityHubDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
    
    const navLinks: { text: string; view?: AppView; action?: () => void }[] = [
        { text: 'Hostels', view: 'main' },
        { text: 'Roommates', action: () => onNavigate('roommateMatch') },
        { text: 'Community Hub', action: onScrollToSpotlight },
        { text: 'Contact Us', action: onScrollToContact },
    ];

  const communityHubLinks = [
    { text: 'News', action: () => onNavigate('blog') },
    { text: 'Events', action: () => onNavigate('events') },
    { text: 'Jobs', action: () => onNavigate('jobs') },
  ];

  const isActive = (view: AppView) => {
      if(currentView === 'main' && view === 'main') return true;
      return currentView === view;
  }
  
  const handleMobileNav = (view: AppView) => {
      onNavigate(view);
      setMobileMenuOpen(false);
  }
  
  const isHomePage = currentView === 'main';

  if (currentView === 'admin' || currentView === 'auth' || currentView === 'profile') return null;

  return (
    <header className={`bg-unistay-navy text-white shadow-lg ${isHomePage ? 'fixed' : 'sticky'} top-0 left-0 right-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <button onClick={() => onNavigate('main')} className="flex items-center select-none" aria-label="Go to homepage">
              <img src="/images/hostels/unistay.png" alt="UniStay Logo" className="h-10" />
            </button>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((item) => (
              <div key={item.text} className="relative">
                {item.text === 'Community Hub' ? (
                  <div 
                    ref={dropdownRef}
                    onMouseEnter={() => setCommunityHubDropdownOpen(true)}
                    onMouseLeave={() => setCommunityHubDropdownOpen(false)}
                    className="relative"
                  >
                    <button 
                      onClick={() => item.action && item.action()}
                      className={`font-medium transition-all duration-200 px-1 pb-2 pt-1 border-b-2 flex items-center gap-1 ${
                        item.view && isActive(item.view)
                          ? 'text-unistay-yellow border-unistay-yellow'
                          : 'border-transparent hover:text-unistay-yellow'
                      }`}
                    >
                      {item.text}
                      <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${communityHubDropdownOpen ? 'rotate-180' : ''}`}></i>
                    </button>

                    {/* Dropdown Menu */}
                    {communityHubDropdownOpen && (
                      <div className="absolute left-0 mt-0 w-40 bg-white rounded-lg shadow-xl z-40 overflow-hidden animate-fade-in">
                        {communityHubLinks.map((link, index) => (
                          <button
                            key={link.text}
                            onClick={() => {
                              link.action();
                              setCommunityHubDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-unistay-navy font-medium hover:bg-unistay-yellow/10 transition-colors ${
                              index !== communityHubLinks.length - 1 ? 'border-b border-gray-100' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <i className={`fas ${
                                link.text === 'News' ? 'fa-newspaper' : 
                                link.text === 'Events' ? 'fa-calendar-alt' : 
                                'fa-briefcase'
                              } text-unistay-yellow`}></i>
                              {link.text}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => item.action ? item.action() : (item.view && onNavigate(item.view))} 
                    className={`font-medium transition-all duration-200 px-1 pb-2 pt-1 border-b-2 ${
                      item.view && isActive(item.view)
                        ? 'text-unistay-yellow border-unistay-yellow'
                        : 'border-transparent hover:text-unistay-yellow'
                    }`}
                  >
                    {item.text}
                  </button>
                )}
              </div>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <NotificationMenu 
                notifications={notifications} 
                onMarkAsRead={onMarkNotificationsAsRead}
                user={user}
                onNavigate={onNavigate}
            />
            {user ? (
                <UserMenu user={user} isAdmin={isAdmin} onLogout={onLogout} onNavigate={onNavigate} />
            ) : (
                <button onClick={() => onNavigate('auth')} className="hidden md:block bg-unistay-yellow text-unistay-navy font-bold py-2 px-6 rounded-full hover:bg-yellow-400 transition-colors">
                    Login
                </button>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white text-2xl focus:outline-none" aria-label="Open menu" aria-expanded={mobileMenuOpen}>
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>
            {/* Mobile Menu - slide-in panel from right */}
            <div className="md:hidden">
                {/* Backdrop */}
                <div
                    className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden={!mobileMenuOpen}
                />

                {/* Panel */}
                <aside
                    className={`fixed top-0 right-0 h-full w-4/5 max-w-xs bg-unistay-navy text-white z-50 transform transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    role="dialog"
                    aria-modal="true"
                    aria-hidden={!mobileMenuOpen}
                >
                    <div className="p-4 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div />
                            <button onClick={() => setMobileMenuOpen(false)} className="text-white text-2xl p-2" aria-label="Close menu">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <nav className="flex flex-col gap-4 mt-2">
                            {navLinks.map((item) => (
                                <button
                                    key={item.text}
                                    onClick={() => item.action ? (item.action(), setMobileMenuOpen(false)) : handleMobileNav(item.view!)}
                                    className={`w-full text-left font-medium text-lg px-2 py-3 rounded-md transition-colors ${item.view && isActive(item.view) ? 'text-unistay-yellow' : 'text-white hover:text-unistay-yellow'}`}
                                >
                                    {item.text}
                                </button>
                            ))}

                            {!user && (
                                <button onClick={() => { handleMobileNav('auth'); }} className="mt-4 bg-unistay-yellow text-unistay-navy font-bold py-2 px-6 rounded-full w-full">
                                    Login
                                </button>
                            )}
                        </nav>

                        <div className="mt-auto" />
                    </div>
                </aside>
            </div>
    </header>
  );
};

export default Header;