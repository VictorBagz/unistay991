
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface FooterProps {
    onNavigateToRoommateFinder: () => void;
    onNavigateToBlog: () => void;
    onNavigateToAuth: () => void;
    onNavigateToHostels?: () => void;
    onScrollToContact?: () => void;
    onScrollToDeals?: () => void;
    user: User | null;
}

const Footer = ({ onNavigateToRoommateFinder, onNavigateToBlog, onNavigateToAuth, onNavigateToHostels, onScrollToContact, onScrollToDeals, user }: FooterProps) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleCampusGuideClick = () => {
        document.getElementById('campus-guide')?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const handleStudentDealsClick = () => {
        if (user) {
            onScrollToDeals?.();
        } else {
            onNavigateToAuth();
        }
    };

    const handleAppStoreClick = (e: React.MouseEvent) => {
        e.preventDefault();
        alert('📱 Coming Soon!\n\nOur mobile app is still under construction and will be available soon on the App Store. Thank you for your patience!');
    };

    const handleGooglePlayClick = (e: React.MouseEvent) => {
        e.preventDefault();
        alert('📱 Coming Soon!\n\nOur mobile app is still under construction and will be available soon on Google Play. Thank you for your patience!');
    };

    const links = {
        'UniStay': [
            { text: 'Hostels', action: onNavigateToHostels || scrollToTop },
            { text: 'Contact', action: onScrollToContact || (() => {}) },
            { text: 'Blog', action: onNavigateToBlog }
        ],
        'For Students': [
            { text: 'Find a Roommate', action: user ? onNavigateToRoommateFinder : onNavigateToAuth },
            { text: 'Student Deals', action: handleStudentDealsClick },
            !user && { text: 'Login / Sign Up', action: onNavigateToAuth }
        ].filter(Boolean),
        'Support': [
            { text: 'Help Center', href: '#' },
            { text: 'FAQs', href: '#' },
            { text: 'Terms of Service', href: '#' },
            { text: 'Privacy Policy', href: '#' }
        ]
    };

    const socialIcons = [
        { icon: 'fab fa-facebook-f', href: 'https://www.facebook.com/share/1F8wDkxS8r/', name: 'Facebook' },
        { icon: 'fa-brands fa-x-twitter', href: 'https://x.com/uni_nav1', name: 'Twitter' },
        { icon: 'fab fa-instagram', href: 'https://www.instagram.com/accounts/login/?next=%2Funistay_navigator%2F&source=omni_redirect', name: 'Instagram' },
        { icon: 'fab fa-whatsapp', href: 'https://whatsapp.com/channel/0029VbBJkVYLikgDIbagef1J', name: 'WhatsApp' }
    ];

    return (
        <footer className="bg-unistay-navy text-white relative">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    <div className="col-span-2 md:col-span-4 lg:col-span-1">
                        <div className="flex items-center select-none">
                            <img src="/images/hostels/unistay.png" alt="UniStay Logo" className="h-10" />
                        </div>
                        <p className="mt-4 text-gray-300 text-sm">Your partner in finding the perfect student accommodation.</p>
                    </div>

                    {Object.entries(links).map(([title, items]) => (
                        <div key={title}>
                            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">{title}</h3>
                            <ul className="mt-4 space-y-3">
                                {items.map(item => (
                                    <li key={item.text}>
                                        {item.action ? (
                                            <button onClick={item.action} className="text-base text-left text-gray-300 hover:text-unistay-yellow transition-colors duration-200">{item.text}</button>
                                        ) : (
                                            <a href={item.href} className="text-base text-gray-300 hover:text-unistay-yellow transition-colors duration-200">{item.text}</a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    
                    <div>
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Get the App</h3>
                        <div className="mt-4 space-y-3">
                            <button onClick={handleAppStoreClick} aria-label="Download on the App Store"><img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" className="h-10 cursor-pointer hover:opacity-80 transition-opacity" /></button>
                             <button onClick={handleGooglePlayClick} aria-label="Get it on Google Play"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-10 cursor-pointer hover:opacity-80 transition-opacity" /></button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-white/10 pt-8">
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase text-center mb-6">Our Sponsors</h3>
                        <div className="flex justify-center items-center space-x-8">
                            <a href="#" className="hover:opacity-80 transition-opacity duration-200">
                                <img src="/images/hostels/rugbyinkitchen.png" alt="Rugby in Kitchen" className="h-16 object-contain" />
                            </a>
                            <a href="#" className="hover:opacity-80 transition-opacity duration-200">
                                <img src="/images/hostels/kampanisLogo.jpg" alt="Kampanis" className="h-16 object-contain" />
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-col items-center space-y-6">
                        <div className="flex space-x-6">
                            {socialIcons.map(social => (
                                <a key={social.name} href={social.href} className="text-gray-400 hover:text-unistay-yellow transition-colors duration-200">
                                    <span className="sr-only">{social.name}</span>
                                    <i className={`${social.icon} text-xl`}></i>
                                </a>
                            ))}
                        </div>
                        <p className="text-base text-gray-400 text-center">&copy; {new Date().getFullYear()} UniStay. All rights reserved.</p>
                    </div>
                </div>
            </div>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 bg-unistay-yellow text-unistay-navy h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-300 animate-fade-in"
                    aria-label="Go to top"
                >
                    <i className="fas fa-arrow-up text-2xl"></i>
                </button>
            )}
        </footer>
    );
};

export default Footer;
