import React, { useEffect, useState } from 'react';
import { NewsItem } from '../types';
import { formatTimeAgo } from '../utils/dateUtils';
import { setArticleMetaTags, resetMetaTags } from '../utils/metaTags';

interface NewsArticlePageProps {
    news: NewsItem | null;
    onNavigateHome: () => void;
}

const NewsArticlePage = ({ news, onNavigateHome }: NewsArticlePageProps) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (news) {
            setArticleMetaTags(news);
        }
        return () => {
            resetMetaTags();
        };
    }, [news]);

    // Function to parse markdown-like text to HTML and handle inline images
    const renderMarkdownContent = (text: string) => {
        if (!text) return '';

        // Split text into paragraphs first (double newline indicates paragraph break)
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
        
        const result: string[] = [];
        
        paragraphs.forEach((paragraph) => {
            // Split each paragraph by inline image markers
            const parts = paragraph.split(/(\[INLINE_IMAGE:[^\]]+\])/);
            let paragraphHtml = '';
            
            parts.forEach((part, idx) => {
                if (part.startsWith('[INLINE_IMAGE:')) {
                    // Extract the image URL
                    const imageUrl = part.slice(14, -1); // Remove [INLINE_IMAGE: and ]
                    // Close paragraph, add image, then reopen paragraph
                    if (paragraphHtml.trim()) {
                        result.push(`<p class="text-gray-600 leading-relaxed mb-4">${paragraphHtml}</p>`);
                        paragraphHtml = '';
                    }
                    result.push(`<div class="my-6 flex justify-center"><img src="${imageUrl}" alt="Article image" class="max-w-full h-auto rounded-lg shadow-md max-h-96" /></div>`);
                } else if (part.trim()) {
                    // Regular text with formatting
                    let formattedPart = part
                        // Escape HTML special characters first (but not already formatted content)
                        .replace(/([^>])</g, '$1&lt;')
                        .replace(/([^>])>/g, '$1&gt;')
                        // Apply bold formatting: **text** -> <strong>text</strong>
                        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                        // Apply italic formatting: *text* -> <em>text</em>
                        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                        // Handle newlines within paragraph -> <br>
                        .replace(/\n/g, '<br class="mb-2" />');
                    paragraphHtml += formattedPart;
                }
            });
            
            // Add any remaining paragraph content
            if (paragraphHtml.trim()) {
                result.push(`<p class="text-gray-600 leading-relaxed mb-4">${paragraphHtml}</p>`);
            }
        });
        
        return result.join('');
    };

    const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => {
        if (!news) return;

        // UPDATED: Use new /article/:id URL format for better social sharing
        const baseUrl = window.location.origin;
        const shareUrl = `${baseUrl}/article/${news.id}`;
        const url = encodeURIComponent(shareUrl);
        const title = encodeURIComponent(news.title);
        
        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`,
            whatsapp: `https://api.whatsapp.com/send?text=${title}%20${url}`
        };

        window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    };

    const handleCopyLink = () => {
        if (!news) return;

        // UPDATED: Use new /article/:id URL format
        const baseUrl = window.location.origin;
        const shareUrl = `${baseUrl}/article/${news.id}`;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = shareUrl;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (!news) return null;

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
                    <h1 className="text-2xl font-bold text-unistay-navy">Article</h1>
                    <button 
                        onClick={onNavigateHome} 
                        className="font-semibold text-unistay-navy hover:text-unistay-yellow transition-colors flex items-center gap-2"
                    >
                        <i className="fas fa-arrow-left"></i>
                        Back to Blog
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                {/* Featured Image */}
                <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                    <img 
                        src={news.imageUrl.replace('/100/100', '/800/600')} 
                        alt={news.title} 
                        className="w-full h-96 object-cover"
                    />
                </div>

                {/* Metadata */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                    <div>
                        <h1 className="text-4xl font-extrabold text-unistay-navy mb-4">{news.title}</h1>
                        <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500">
                            <p>{news.timestamp ? formatTimeAgo(news.timestamp) : 'Recently posted'}</p>
                            <p>Source: {news.source}</p>
                        </div>
                    </div>
                </div>

                {/* Article Content */}
                <article className="prose prose-lg max-w-none mb-12">
                    <div 
                        className="space-y-4 text-gray-700"
                        dangerouslySetInnerHTML={{ 
                            __html: renderMarkdownContent(news.description)
                        }}
                    />
                </article>

                {/* Share Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-12">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-3">
                                <i className="fas fa-share mr-2"></i>Share this article:
                            </p>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => handleShare('twitter')}
                                    className="text-gray-600 hover:text-[#1DA1F2] transition-colors text-lg"
                                    aria-label="Share on Twitter"
                                    title="Share on Twitter"
                                >
                                    <i className="fab fa-twitter"></i>
                                </button>
                                <button 
                                    onClick={() => handleShare('facebook')}
                                    className="text-gray-600 hover:text-[#4267B2] transition-colors text-lg"
                                    aria-label="Share on Facebook"
                                    title="Share on Facebook"
                                >
                                    <i className="fab fa-facebook"></i>
                                </button>
                                <button 
                                    onClick={() => handleShare('linkedin')}
                                    className="text-gray-600 hover:text-[#0077b5] transition-colors text-lg"
                                    aria-label="Share on LinkedIn"
                                    title="Share on LinkedIn"
                                >
                                    <i className="fab fa-linkedin"></i>
                                </button>
                                <button 
                                    onClick={() => handleShare('whatsapp')}
                                    className="text-gray-600 hover:text-[#25D366] transition-colors text-lg"
                                    aria-label="Share on WhatsApp"
                                    title="Share on WhatsApp"
                                >
                                    <i className="fab fa-whatsapp"></i>
                                </button>
                                <button 
                                    onClick={handleCopyLink}
                                    className={`text-lg transition-colors ${copied ? 'text-green-500' : 'text-gray-600 hover:text-unistay-navy'}`}
                                    aria-label="Copy link"
                                    title={copied ? 'Link copied!' : 'Copy link'}
                                >
                                    <i className={`fas ${copied ? 'fa-check' : 'fa-link'}`}></i>
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={onNavigateHome}
                            className="bg-unistay-navy hover:bg-opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                            aria-label="Back to blog"
                        >
                            <i className="fas fa-arrow-left"></i>
                            Back to Blog
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NewsArticlePage;