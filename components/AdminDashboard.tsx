import React, { useState, useEffect } from 'react';
import { Hostel, NewsItem, Event, Job, University, RoommateProfile, StudentSpotlight, LostItem, StudentDeal, ContactSubmission } from '../types';
import Spinner from './Spinner';
import { hostelService, newsService, eventService, jobService, roommateProfileService } from '../services/dbService';
import { contactService } from '../services/contactService';
import { storageService } from '../services/storageService.ts';
import { useNotifier } from '../hooks/useNotifier';

interface UploadedImage {
    file: File;
    previewUrl: string;
}

// --- Helper Components ---
// FIX: Add explicit types to helper components to prevent type inference issues.
const Input = (props: React.ComponentPropsWithoutRef<'input'>) => <input {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-unistay-yellow focus:border-unistay-yellow" />;
const Textarea = (props: React.ComponentPropsWithoutRef<'textarea'>) => {
    const { className, ...rest } = props;
    const baseClasses = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-unistay-yellow focus:border-unistay-yellow";
    const mergedClasses = className ? `${baseClasses} ${className}` : baseClasses;
    return <textarea {...rest} rows={4} className={mergedClasses} />;
};
const Select = (props: React.ComponentPropsWithoutRef<'select'>) => <select {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-unistay-yellow focus:border-unistay-yellow" />;

interface ButtonProps {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
}

const Button = ({ children, onClick, className = 'bg-unistay-navy text-white hover:bg-opacity-90', type = 'button', disabled = false, loading = false }: ButtonProps) => (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`px-4 py-2 font-semibold rounded-md transition-all duration-200 disabled:bg-opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}>
        {loading ? <Spinner color={className.includes('text-unistay-navy') ? 'navy' : 'white'} size="sm" /> : children}
    </button>
);

const ActionButton = ({ icon, onClick, colorClass = 'text-gray-500 hover:text-unistay-navy', loading = false }) => (
    <button onClick={onClick} disabled={loading} className={`p-1 ${colorClass} transition-colors disabled:text-gray-400 disabled:cursor-not-allowed w-6 h-6 flex items-center justify-center`}>
        {loading ? <Spinner color="navy" size="sm" /> : <i className={`fas ${icon}`}></i>}
    </button>
);

// --- NEW: Statistics Components ---
const StatCard = ({ icon, title, value }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-6 transform hover:-translate-y-1 transition-transform duration-300">
        <div className="bg-unistay-yellow/20 text-unistay-navy rounded-full h-16 w-16 flex items-center justify-center flex-shrink-0">
            <i className={`fas ${icon} text-3xl`}></i>
        </div>
        <div>
            <p className="text-gray-500 font-semibold">{title}</p>
            <p className="text-4xl font-extrabold text-unistay-navy">{value}</p>
        </div>
    </div>
);

const DashboardStats = ({ stats, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    const statItems = [
        { icon: 'fa-hotel', title: 'Total Hostels', value: stats.hostels },
        { icon: 'fa-users', title: 'Roommate Profiles', value: stats.roommateProfiles },
        { icon: 'fa-newspaper', title: 'News Articles', value: stats.news },
        { icon: 'fa-calendar-alt', title: 'Upcoming Events', value: stats.events },
        { icon: 'fa-briefcase', title: 'Job Listings', value: stats.jobs },
    ];

    return (
        <div>
            <h2 className="text-3xl font-bold text-unistay-navy mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statItems.map((stat, index) => (
                    <div key={stat.title} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <StatCard {...stat} />
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Form Components ---

interface NewsFormData {
    id?: string;
    title: string;
    description: string;
    source: string;
    images: UploadedImage[];
    imageUrl?: string;
    inlineImages?: UploadedImage[]; // Images to be embedded in the middle of the description
}

interface NewsFormProps {
    item?: NewsFormData;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

const NewsForm: React.FC<NewsFormProps> = ({ item, onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState<NewsFormData>({
        title: item?.title || '',
        description: item?.description || '',
        source: item?.source || '',
        featured: item?.featured || false,
        images: item?.imageUrl ? [{ file: null as any, previewUrl: item.imageUrl }] : [],
        inlineImages: []
    });
    const [descriptionPreview, setDescriptionPreview] = useState(false);
    const [lastInsertedImage, setLastInsertedImage] = useState<number | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Helper function to apply formatting to selected text
    const applyFormatting = (format: 'bold' | 'italic' | 'break') => {
        const textarea = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
        if (!textarea) {
            alert('Cannot find text area');
            return;
        }

        // Ensure textarea has focus
        textarea.focus();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        if (!selectedText && format !== 'break') {
            alert('Please select text to format');
            return;
        }

        let formattedText = '';
        if (format === 'bold') {
            formattedText = `**${selectedText}**`;
        } else if (format === 'italic') {
            formattedText = `*${selectedText}*`;
        } else if (format === 'break') {
            formattedText = '\n\n';
        }

        const newDescription = 
            textarea.value.substring(0, start) + 
            formattedText + 
            textarea.value.substring(end);

        setFormData(prev => ({ ...prev, description: newDescription }));
        
        // Reset selection and show visual feedback
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = start + formattedText.length;
            textarea.selectionEnd = start + formattedText.length;
            
            // Show brief visual feedback for new paragraph
            if (format === 'break') {
                const originalBg = textarea.style.backgroundColor;
                textarea.style.backgroundColor = '#fff3cd';
                setTimeout(() => {
                    textarea.style.backgroundColor = originalBg;
                }, 300);
            }
        }, 0);
    };

    // Handle keyboard shortcuts for formatting
    const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            applyFormatting('break');
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            applyFormatting('bold');
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            applyFormatting('italic');
        }
    };

    // Function to insert an inline image marker at cursor position
    const insertInlineImage = (imageIndex: number) => {
        const textarea = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
        if (!textarea) {
            alert('Please focus on the article text area first');
            return;
        }

        // Ensure textarea has focus and proper cursor position
        textarea.focus();
        const start = textarea.selectionStart;
        const imageMarker = `\n[IMAGE_${imageIndex}]\n`;
        
        const newDescription = 
            textarea.value.substring(0, start) + 
            imageMarker + 
            textarea.value.substring(start);

        setFormData(prev => ({ ...prev, description: newDescription }));
        setLastInsertedImage(imageIndex);

        // Clear the message after 2 seconds
        setTimeout(() => setLastInsertedImage(null), 2000);
        
        // Show visual feedback with highlight
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = start + imageMarker.length;
            textarea.selectionEnd = start + imageMarker.length;
            
            // Highlight the inserted image marker temporarily
            const originalBg = textarea.style.backgroundColor;
            textarea.style.backgroundColor = '#d1ecf1';
            setTimeout(() => {
                textarea.style.backgroundColor = originalBg;
            }, 400);
        }, 0);
    };

    // Function to parse markdown-like text for preview and inline images
    const renderMarkdownPreview = (text: string) => {
        const elements: React.ReactNode[] = [];
        const parts = text.split(/(\[IMAGE_\d+\])/);
        
        parts.forEach((part, idx) => {
            if (part.match(/\[IMAGE_\d+\]/)) {
                // Extract image index from marker
                const imageIndex = parseInt(part.match(/\d+/)?.[0] || '0');
                if (formData.inlineImages?.[imageIndex]) {
                    elements.push(
                        <div key={`inline-img-${idx}`} className="my-4 flex justify-center">
                            <img 
                                src={formData.inlineImages[imageIndex].previewUrl} 
                                alt={`Inline image ${imageIndex + 1}`}
                                className="max-w-full h-auto rounded-lg shadow-md max-h-96"
                            />
                        </div>
                    );
                }
            } else {
                // Regular text with formatting
                const paragraphs = part.split('\n\n').filter(p => p.trim());
                paragraphs.forEach((paragraph, pIdx) => {
                    if (paragraph.trim()) {
                        let content = paragraph
                            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*([^*]+)\*/g, '<em>$1</em>');
                        elements.push(
                            <p key={`p-${idx}-${pIdx}`} className="mb-4" dangerouslySetInnerHTML={{ __html: content }} />
                        );
                    }
                });
            }
        });
        
        return elements.length > 0 ? elements : <p className="text-gray-400">Preview will appear here...</p>;
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isInline: boolean = false) => {
        const files = e.target.files;
        if (!files) return;

        // Convert FileList to array and process each file
        Array.from(files).forEach((file: File) => {
            // Create a local URL for preview
            const imageUrl = URL.createObjectURL(file);
            if (isInline) {
                // Add to inline images
                setFormData(prev => ({
                    ...prev,
                    inlineImages: [...(prev.inlineImages || []), { file, previewUrl: imageUrl }]
                }));
            } else {
                // Add to main images (featured image)
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, { file, previewUrl: imageUrl }]
                }));
            }
        });
    };

    const removeImage = (index: number, isInline: boolean = false) => {
        if (isInline) {
            setFormData(prev => ({
                ...prev,
                inlineImages: (prev.inlineImages || []).filter((_, i) => i !== index)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.images.length === 0) {
            alert('Please upload at least one featured image');
            return;
        }

        try {
            // Upload featured images (main image)
            const newImages = formData.images.filter(img => img.file);
            let imageUrl = item?.imageUrl;

            if (newImages.length > 0) {
                const files = newImages.map(img => img.file);
                const timestamp = new Date().getTime();
                const newsFolder = `${item?.id || timestamp}`;
                const uploadedUrls = await storageService.uploadMultipleImages(files, 'news', newsFolder);
                imageUrl = uploadedUrls[0];

                if (item?.id && item.imageUrl) {
                    try {
                        await storageService.deleteImage(item.imageUrl, 'news');
                    } catch (error) {
                        console.warn('Failed to delete old news image:', error);
                    }
                }
            }

            // Upload inline images and build description with image URLs
            let finalDescription = formData.description;
            if (formData.inlineImages && formData.inlineImages.length > 0) {
                // Upload all inline images (new and existing)
                const inlineImagesToUpload: Array<{ file: File; originalIndex: number }> = [];
                
                // Collect only new files that need to be uploaded
                formData.inlineImages.forEach((img, idx) => {
                    if (img.file) {
                        inlineImagesToUpload.push({ file: img.file, originalIndex: idx });
                    }
                });
                
                // If there are new images to upload
                if (inlineImagesToUpload.length > 0) {
                    const inlineFiles = inlineImagesToUpload.map(item => item.file);
                    const timestamp = new Date().getTime();
                    const newsFolder = `${item?.id || timestamp}`;
                    const uploadedInlineUrls = await storageService.uploadMultipleImages(inlineFiles, 'news', newsFolder);
                    
                    // Create a map of original index to uploaded URL
                    const imageUrlMap: { [key: number]: string } = {};
                    inlineImagesToUpload.forEach((item, uploadIdx) => {
                        imageUrlMap[item.originalIndex] = uploadedInlineUrls[uploadIdx];
                    });
                    
                    // Replace image markers with actual URLs using the correct mapping
                    finalDescription = finalDescription.replace(/\[IMAGE_(\d+)\]/g, (match, imageIdx) => {
                        const idx = parseInt(imageIdx);
                        const url = imageUrlMap[idx];
                        return url ? `[INLINE_IMAGE:${url}]` : match;
                    });
                } else if (formData.inlineImages.length > 0) {
                    // If no new images but inline images array has URLs (for editing existing articles)
                    // This handles the case where images already have previewUrl but no new file
                    finalDescription = finalDescription.replace(/\[IMAGE_(\d+)\]/g, (match, imageIdx) => {
                        const idx = parseInt(imageIdx);
                        const img = formData.inlineImages[idx];
                        // If previewUrl starts with http, it's already an uploaded URL
                        if (img?.previewUrl && img.previewUrl.startsWith('http')) {
                            return `[INLINE_IMAGE:${img.previewUrl}]`;
                        }
                        return match;
                    });
                }
            }

            // Submit with image URL and description with inline images
            onSubmit({
                ...formData,
                description: finalDescription,
                imageUrl,
                timestamp: new Date().toISOString(),
                images: undefined,
                inlineImages: undefined
            });
        } catch (error) {
            console.error('Error uploading news images:', error);
            alert('Failed to upload images. Please try again.');
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <Input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
            
            {/* Description with Formatting Tools */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Article Content</label>
                <div className="flex gap-2 items-center flex-wrap bg-white p-3 rounded border border-gray-300 shadow-sm">
                    <button 
                        type="button" 
                        onClick={() => applyFormatting('bold')}
                        className="px-3 py-1 bg-unistay-yellow text-unistay-navy rounded hover:bg-yellow-400 font-bold transition-colors flex items-center gap-2"
                        title="Make selected text bold (Ctrl+B)"
                    >
                        <i className="fas fa-bold"></i> Bold
                    </button>
                    <button 
                        type="button" 
                        onClick={() => applyFormatting('italic')}
                        className="px-3 py-1 bg-unistay-yellow text-unistay-navy rounded hover:bg-yellow-400 font-bold transition-colors flex items-center gap-2"
                        title="Make selected text italic (Ctrl+I)"
                    >
                        <i className="fas fa-italic"></i> Italic
                    </button>
                    <div className="border-l border-gray-300 h-6"></div>
                    <button 
                        type="button" 
                        onClick={() => applyFormatting('break')}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors font-semibold flex items-center gap-2"
                        title="Insert a new paragraph (Ctrl+Enter)"
                    >
                        <i className="fas fa-enter"></i> New Paragraph
                    </button>
                    <div className="ml-auto text-xs text-gray-500 italic">
                        💡 Shortcuts: <code className="bg-gray-100 px-2 py-1 rounded">Ctrl+B</code> bold • <code className="bg-gray-100 px-2 py-1 rounded">Ctrl+I</code> italic • <code className="bg-gray-100 px-2 py-1 rounded">Ctrl+Enter</code> new paragraph
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={() => setDescriptionPreview(!descriptionPreview)}
                    className="text-sm text-unistay-yellow hover:text-unistay-navy transition-colors font-semibold flex items-center gap-2"
                >
                    {descriptionPreview ? <i className="fas fa-eye text-green-500"></i> : <i className="fas fa-eye-slash text-gray-400"></i>}
                    {descriptionPreview ? 'Preview ON' : 'Preview OFF'}
                </button>
            </div>

            <Textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                onKeyDown={handleDescriptionKeyDown}
                placeholder="Write your article here... Use **text** for bold, *text* for italic. Press Ctrl+Enter for new paragraph." 
                required 
                className="!border-2 !border-gray-300 !p-3 !rounded-md !text-sm !font-mono focus:!border-unistay-yellow focus:!ring-2 focus:!ring-unistay-yellow/50"
            />
            
            {descriptionPreview && (
                <div className="p-4 bg-white border border-gray-300 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3">Preview</h3>
                    <div className="text-gray-700 space-y-2">
                        {renderMarkdownPreview(formData.description)}
                    </div>
                </div>
            )}
            
            {/* Inline Images Section */}
            <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <i className="fas fa-images text-blue-600"></i>Inline Images (Optional)
                    </h3>
                    <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-semibold">Click to Insert at Cursor</span>
                </div>
                <p className="text-sm text-gray-700 mb-3 italic">
                    📍 Click the cursor in your article text above, then click an image below to place it exactly where you want.
                </p>
                
                {lastInsertedImage !== null && (
                    <div className="p-3 bg-green-100 border-2 border-green-400 rounded-lg text-green-800 font-semibold flex items-center gap-2 animate-pulse">
                        <i className="fas fa-check-circle"></i>
                        Image #{lastInsertedImage + 1} inserted at cursor position! Check preview to see it.
                    </div>
                )}
                
                <Input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, true)}
                    className="w-full border-2 border-blue-300 focus:border-blue-600"
                />
                
                {/* Inline Image Preview Grid with Enhanced UI */}
                {formData.inlineImages && formData.inlineImages.length > 0 && (
                    <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <i className="fas fa-mouse-pointer text-blue-600"></i>
                            {formData.inlineImages.length} image{formData.inlineImages.length !== 1 ? 's' : ''} ready to insert:
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {formData.inlineImages.map((img, index) => (
                                <div key={index} className="relative group">
                                    <div 
                                        onClick={() => insertInlineImage(index)}
                                        className="relative h-40 overflow-hidden rounded-lg cursor-pointer shadow-lg transform transition-all hover:scale-105 hover:shadow-xl border-2 border-blue-300 hover:border-blue-600"
                                    >
                                        <img
                                            src={img.previewUrl}
                                            alt={`Inline ${index + 1}`}
                                            className="w-full h-full object-cover transition-opacity group-hover:opacity-70"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex flex-col items-center justify-center transition-all gap-2">
                                            <span className="text-white font-bold text-lg bg-blue-600 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg flex items-center gap-2">
                                                <i className="fas fa-plus"></i> Insert
                                            </span>
                                            <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                                at cursor position
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index, true)}
                                        className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110 border-2 border-white"
                                        title="Remove this image"
                                    >
                                        <i className="fas fa-trash text-xs" />
                                    </button>
                                    <div className="mt-2 text-xs font-semibold text-center text-blue-700 bg-blue-100 py-1 rounded">
                                        #{index + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {(!formData.inlineImages || formData.inlineImages.length === 0) && (
                    <div className="py-8 text-center text-gray-600 border-2 border-dashed border-blue-300 rounded-lg bg-white">
                        <i className="fas fa-image text-4xl text-blue-300 mb-3 block"></i>
                        <p className="font-semibold">No images uploaded yet</p>
                        <p className="text-sm mt-1">Upload images above to add them to your article</p>
                    </div>
                )}
            </div>
            
            {/* Featured Image Upload Section */}
            <div className="space-y-4 p-4 bg-white border border-gray-300 rounded-lg">
                <h3 className="font-semibold text-gray-700">
                    <i className="fas fa-image mr-2 text-unistay-yellow"></i>Featured Image (Required)
                </h3>
                <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="w-full"
                    required={formData.images.length === 0}
                />
                
                {/* Featured Image Preview Grid */}
                {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {formData.images.map((img, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={img.previewUrl}
                                    alt={`Featured ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index, false)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <i className="fas fa-times" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Input name="source" value={formData.source} onChange={handleChange} placeholder="Source" required />
            
            <div className="flex items-center my-4">
                <input
                    id="featured"
                    name="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="h-4 w-4 text-unistay-yellow focus:ring-unistay-yellow border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
                    Set as Featured News
                </label>
            </div>
            
            <div className="flex gap-2 justify-end">
                <Button onClick={onCancel} className="bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</Button>
                <Button type="submit" loading={isSubmitting}>{item ? 'Update' : 'Add'} News</Button>
            </div>
        </form>
    );
};

interface EventFormData {
    id?: string;
    title: string;
    dateInput: string;
    location: string;
    images: UploadedImage[];
    date?: string;
    imageUrl?: string;
    price?: string;
    description?: string;
    contacts?: string[];
    phone?: string;
    email?: string;
    time?: string;
}

interface EventFormProps {
    item?: EventFormData;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ item, onSubmit, onCancel, isSubmitting }) => {
    const toInputDate = (dateStr: string) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';
    const [formData, setFormData] = useState<EventFormData>({
        title: item?.title || '',
        dateInput: item ? toInputDate(item.date) : '',
        location: item?.location || '',
        price: item?.price || 'Free Entry',
        description: item?.description || '',
        contacts: item?.contacts || [''],
        phone: item?.phone || '',
        email: item?.email || '',
        time: item?.time || '',
        images: item?.imageUrl ? [{ file: null as any, previewUrl: item.imageUrl }] : []
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file: File) => {
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, { file, previewUrl: imageUrl }]
            }));
        });
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.images.length === 0) {
            alert('Please upload at least one image');
            return;
        }

        try {
            // Upload images to events bucket
            const files = formData.images.map(img => img.file);
            const timestamp = new Date().getTime();
            const eventFolder = `${item?.id || timestamp}`;
            const uploadedUrls = await storageService.uploadMultipleImages(files, 'events', eventFolder);

            // If updating, delete old images
            if (item?.id && item.imageUrl) {
                try {
                    await storageService.deleteImage(item.imageUrl, 'events');
                } catch (error) {
                    console.warn('Failed to delete old event image:', error);
                }
            }

            const eventDate = new Date(`${formData.dateInput}T12:00:00`);
            const processedEvent = {
                ...formData,
                date: eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                day: eventDate.toLocaleDateString('en-US', { day: '2-digit' }),
                month: eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
                imageUrl: uploadedUrls[0], // Use first uploaded image as primary
                price: formData.price || 'Free Entry',
                description: formData.description?.trim(),
                contacts: formData.contacts?.filter(contact => contact.trim()),
                phone: formData.phone?.trim(),
                email: formData.email?.trim(),
                time: formData.time,
                images: undefined // Remove the temporary images array
            };
            delete processedEvent.dateInput;
            onSubmit(processedEvent);
        } catch (error) {
            console.error('Error uploading event images:', error);
            alert('Failed to upload images. Please try again.');
        }
    };

    const addContact = () => {
        setFormData(prev => ({
            ...prev,
            contacts: [...(prev.contacts || []), '']
        }));
    };

    const removeContact = (index: number) => {
        setFormData(prev => ({
            ...prev,
            contacts: prev.contacts?.filter((_, i) => i !== index) || []
        }));
    };

    const updateContact = (index: number, value: string) => {
        const newContacts = [...(formData.contacts || [])];
        newContacts[index] = value;
        setFormData(prev => ({
            ...prev,
            contacts: newContacts
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <Input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="dateInput" type="date" value={formData.dateInput} onChange={handleChange} required />
                <Input name="time" type="time" value={formData.time} onChange={handleChange} placeholder="Time" required />
            </div>

            <Input name="location" value={formData.location} onChange={handleChange} placeholder="Location" required />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Input 
                        name="price" 
                        value={formData.price} 
                        onChange={handleChange} 
                        placeholder="Entrance Fee (e.g., 10000 or 'Free Entry')" 
                    />
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, price: 'Free Entry' }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-unistay-yellow hover:text-unistay-navy"
                    >
                        Set as Free
                    </button>
                </div>
            </div>

            <Textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Event Description" 
                required 
            />

            {/* Contact Information */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="Contact Phone" 
                    />
                    <Input 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="Contact Email" 
                    />
                </div>

                {/* Contact Persons */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm text-gray-700">Contact Persons</label>
                        <button
                            type="button"
                            onClick={addContact}
                            className="text-sm text-unistay-yellow hover:text-unistay-navy transition-colors"
                        >
                            <i className="fas fa-plus mr-1"></i>
                            Add Contact
                        </button>
                    </div>
                    {formData.contacts?.map((contact, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                value={contact}
                                onChange={(e) => updateContact(index, e.target.value)}
                                placeholder="Contact Person Name"
                            />
                            <button
                                type="button"
                                onClick={() => removeContact(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
                <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full"
                    required={formData.images.length === 0}
                />
                
                {/* Image Preview Grid */}
                {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {formData.images.map((img, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={img.previewUrl}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <i className="fas fa-times" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
                <Button onClick={onCancel} className="bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</Button>
                <Button type="submit" loading={isSubmitting}>{item ? 'Update' : 'Add'} Event</Button>
            </div>
        </form>
    );
};

interface JobFormData {
    id?: string;
    title: string;
    deadline: string;
    company: string;
    images: UploadedImage[];
    imageUrl?: string;
}

interface JobFormProps {
    item?: JobFormData;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

const JobForm: React.FC<JobFormProps> = ({ item, onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState<JobFormData>({
        title: item?.title || '',
        deadline: item?.deadline || '',
        company: item?.company || '',
        images: []
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file: File) => {
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, { file, previewUrl: imageUrl }]
            }));
        });
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.images.length === 0) {
            alert('Please upload at least one image');
            return;
        }

        try {
            // Upload images to jobs bucket
            const files = formData.images.map(img => img.file);
            const timestamp = new Date().getTime();
            const jobFolder = `${item?.id || timestamp}`;
            const uploadedUrls = await storageService.uploadMultipleImages(files, 'jobs', jobFolder);

            // If updating, delete old images
            if (item?.id && item.imageUrl) {
                try {
                    const oldImagePath = item.imageUrl.split('/').slice(-2).join('/');
                    await storageService.deleteImage(oldImagePath, 'jobs');
                } catch (error) {
                    console.warn('Failed to delete old job image:', error);
                }
            }

            // Submit with uploaded image URL
            onSubmit({
                ...formData,
                imageUrl: uploadedUrls[0], // Use first uploaded image as primary
                images: undefined // Remove the temporary images array
            });
        } catch (error) {
            console.error('Error uploading job images:', error);
            alert('Failed to upload images. Please try again.');
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <Input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
            <Input name="deadline" value={formData.deadline} onChange={handleChange} placeholder="Deadline (e.g., July 15th)" required />
            <Input name="company" value={formData.company} onChange={handleChange} placeholder="Company" required />
            
            {/* Image Upload Section */}
            <div className="space-y-4">
                <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full"
                    required={formData.images.length === 0}
                />
                
                {/* Image Preview Grid */}
                {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {formData.images.map((img, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={img.previewUrl}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <i className="fas fa-times" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-2 justify-end">
                <Button onClick={onCancel} className="bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</Button>
                <Button type="submit" loading={isSubmitting}>{item ? 'Update' : 'Add'} Job</Button>
            </div>
        </form>
    );
};

// --- Deals Form ---
interface DealFormData {
    id?: string;
    title: string;
    description?: string;
    link?: string;
    imageUrl?: string;
    imageUrls?: string[];
    images?: UploadedImage[];
    active?: boolean;
    discount?: number; // Percentage discount (e.g., 20 for 20% OFF)
}

interface DealFormProps {
    item?: DealFormData;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

const DealsForm: React.FC<DealFormProps> = ({ item, onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState<DealFormData>({
        title: item?.title || '',
        description: item?.description || '',
        link: item?.link || '',
        imageUrl: item?.imageUrl || '',
        imageUrls: item?.imageUrls || [],
        images: item?.imageUrl ? [{ file: null as any, previewUrl: item.imageUrl }] : [],
        active: item?.active ?? true,
        discount: item?.discount || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: value ? parseInt(value, 10) : 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file: File) => {
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), { file, previewUrl: imageUrl }]
            }));
        });
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if ((formData.images || []).length === 0) {
            alert('Please upload at least one image');
            return;
        }

        try {
            const files = (formData.images || []).map(img => img.file);
            const timestamp = new Date().getTime();
            const dealFolder = `${item?.id || timestamp}`;
            const uploadedUrls = await storageService.uploadMultipleImages(files, 'news', dealFolder);

            // If updating, delete old images
            if (item?.id && item.imageUrl) {
                try {
                    await storageService.deleteImage(item.imageUrl, 'news');
                } catch (error) {
                    console.warn('Failed to delete old deal image:', error);
                }
            }

            onSubmit({ 
                ...formData, 
                imageUrl: uploadedUrls[0],
                imageUrls: uploadedUrls,
                timestamp: new Date().toISOString(),
                images: undefined
            });
        } catch (err) {
            console.error('Failed to upload deal images', err);
            alert('Failed to upload images');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <Input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
            <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Short description" />
            <Input name="link" value={formData.link} onChange={handleChange} placeholder="External link (optional)" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage (%)</label>
                    <Input 
                        type="number" 
                        name="discount" 
                        min="0" 
                        max="100" 
                        value={formData.discount || ''} 
                        onChange={handleChange} 
                        placeholder="e.g., 20" 
                    />
                </div>
            </div>

            {/* Multiple Images Upload Section */}
            <div className="space-y-4 p-4 bg-white border border-gray-300 rounded-lg">
                <h3 className="font-semibold text-gray-700">
                    <i className="fas fa-images mr-2 text-unistay-yellow"></i>Deal Images (Multiple)
                </h3>
                <Input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="w-full"
                    required={(formData.images || []).length === 0}
                />
                
                {/* Image Preview Grid */}
                {(formData.images || []).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {formData.images.map((img, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={img.previewUrl}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <i className="fas fa-times" />
                                </button>
                                <div className="mt-1 text-xs text-center text-gray-600">
                                    Image {index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <input id="active" name="active" type="checkbox" checked={!!formData.active} onChange={handleChange} className="h-4 w-4 text-unistay-yellow" />
                <label htmlFor="active" className="text-sm">Active</label>
            </div>
            <div className="flex gap-2 justify-end">
                <Button onClick={onCancel} className="bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</Button>
                <Button type="submit" loading={isSubmitting}>{item ? 'Update' : 'Add'} Deal</Button>
            </div>
        </form>
    );
};

// --- Spotlight Form ---
interface SpotlightFormData {
    id?: string;
    name: string;
    major?: string;
    bio?: string;
    imageUrl?: string;
    gender?: 'male' | 'female' | 'other';
    universityId?: string;
}

interface SpotlightFormProps {
    item?: SpotlightFormData;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    universities?: Array<{ id: string; name: string }>;
}

const SpotlightForm: React.FC<SpotlightFormProps> = ({ item, onSubmit, onCancel, isSubmitting, universities = [] }) => {
    const [formData, setFormData] = useState<SpotlightFormData>({
        name: item?.name || '',
        major: item?.major || '',
        bio: item?.bio || '',
        imageUrl: item?.imageUrl || '',
        gender: item?.gender || 'other',
        universityId: item?.universityId || (universities.length > 0 ? universities[0].id : '')
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const file = files[0];
        setImageFile(file);
        const preview = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, imageUrl: preview }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let imageUrl = formData.imageUrl;
            if (imageFile) {
                // reuse 'news' bucket for spotlight images to avoid expanding storage type union
                const uploaded = await storageService.uploadMultipleImages([imageFile], 'news', `${item?.id || Date.now()}`);
                imageUrl = uploaded[0];
            }

            onSubmit({
                ...formData,
                imageUrl,
                date: new Date().toLocaleDateString(),
                votes: (item && item.votes) || 0,
            });
        } catch (err) {
            console.error('Failed to upload spotlight image', err);
            alert('Failed to upload image.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Full name" required />
            <Input name="major" value={formData.major} onChange={handleChange} placeholder="Major / Course" />
            
            {/* University Selector */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">University</label>
                <Select 
                    name="universityId" 
                    value={formData.universityId || ''} 
                    onChange={handleChange}
                    required
                >
                    <option value="">Select a university</option>
                    {universities?.map(uni => (
                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                    ))}
                </Select>
            </div>

            <Textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Short bio / reason for nomination" />

            {/* Gender Selector */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <div className="flex gap-6">
                    {(['female', 'male', 'other'] as const).map(option => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                value={option}
                                checked={formData.gender === option}
                                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                                className="h-4 w-4 text-unistay-yellow focus:ring-unistay-yellow border-gray-300"
                            />
                            <span className="text-sm text-gray-700 capitalize">
                                {option === 'female' ? '👩 Woman Crush Wednesday' : option === 'male' ? '👨 Man Crush Monday' : 'Other'}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
                {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="preview" className="w-32 h-32 object-cover rounded-md mt-2" />
                )}
            </div>

            <div className="flex gap-2 justify-end">
                <Button onClick={onCancel} className="bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</Button>
                <Button type="submit" loading={isSubmitting}>{item ? 'Update' : 'Nominate'}</Button>
            </div>
        </form>
    );
};

interface LostFoundFormData {
    id?: string;
    title: string;
    description: string;
    category: 'lost' | 'found';
    imageUrl: string;
    postedBy: string;
    phone: string;
    email?: string;
    location?: string;
}

interface LostFoundFormProps {
    item?: LostFoundFormData;
    onSubmit: (data: LostFoundFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

const LostFoundForm: React.FC<LostFoundFormProps> = ({ item, onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = React.useState<LostFoundFormData>(
        item || {
            title: '',
            description: '',
            category: 'lost',
            imageUrl: '',
            postedBy: '',
            phone: '',
            email: '',
            location: ''
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.description.trim() || !formData.postedBy.trim() || !formData.phone.trim() || !formData.imageUrl) {
            alert('Please fill all required fields');
            return;
        }
        onSubmit(formData);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const uploadedImages = await storageService.uploadMultipleImages([file], 'news', 'lostfound');
            if (uploadedImages.length > 0) {
                setFormData(prev => ({ ...prev, imageUrl: uploadedImages[0] }));
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload image');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Input
                    label="Title *"
                    placeholder="e.g., Blue Backpack Lost in Library"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
            </div>

            <div>
                <Textarea
                    label="Description *"
                    placeholder="Describe the item in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <div className="space-y-2">
                        {(['lost', 'found'] as const).map((option) => (
                            <label key={option} className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="category"
                                    value={option}
                                    checked={formData.category === option}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'lost' | 'found' }))}
                                    className="h-4 w-4 text-unistay-yellow focus:ring-unistay-yellow border-gray-300"
                                />
                                <span className="text-sm text-gray-700 capitalize">
                                    {option === 'lost' ? '🔍 Lost Item' : '📦 Found Item'}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <Input
                        label="Location (Optional)"
                        placeholder="e.g., Library, Near Gate A"
                        value={formData.location || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Input
                        label="Contact Name *"
                        placeholder="Your name"
                        value={formData.postedBy}
                        onChange={(e) => setFormData(prev => ({ ...prev, postedBy: e.target.value }))}
                    />
                </div>

                <div>
                    <Input
                        label="Phone Number *"
                        placeholder="e.g., +256 700 000000"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                </div>
            </div>

            <div>
                <Input
                    label="Email (Optional)"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
            </div>

            <div>
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
                {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="preview" className="w-32 h-32 object-cover rounded-md mt-2" />
                )}
            </div>

            <div className="flex gap-2 justify-end">
                <Button onClick={onCancel} className="bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</Button>
                <Button type="submit" loading={isSubmitting}>{item ? 'Update' : 'Post'}</Button>
            </div>
        </form>
    );
};

interface HostelFormData {
    id?: string;
    name: string;
    location: string;
    priceRange: string;
    images: UploadedImage[];
    imageUrls?: string[];
    rating: number;
    universityId: string;
    description: string;
    amenities: Array<{ name: string; icon: string }>;
    isRecommended: boolean;
}

interface HostelFormProps {
    item?: HostelFormData;
    onSubmit: (data: HostelFormData & { imageUrl: string; imageUrls: string[] }) => void;
    onCancel: () => void;
    universities: Array<{ id: string; name: string }>;
    isSubmitting: boolean;
}

// Replace your HostelForm component with this fixed version

const HostelForm: React.FC<HostelFormProps> = ({ item, onSubmit, onCancel, universities, isSubmitting }) => {
    // Ensure we always have a valid UUID for universityId
    const defaultUniversity = universities.find(u => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(u.id));
    const defaultUniversityId = defaultUniversity?.id || '123e4567-e89b-12d3-a456-426614174001';

    // FIX: Ensure images is always initialized as an array
    const [formData, setFormData] = useState<HostelFormData>({
        name: item?.name || '', 
        location: item?.location || '', 
        priceRange: item?.priceRange || '', 
        images: item?.images || [], // FIX: Add fallback to empty array
        rating: item?.rating || 4.0, 
        universityId: item?.universityId || defaultUniversityId,
        description: item?.description || '', 
        amenities: item?.amenities || [], // FIX: Add fallback to empty array
        isRecommended: item?.isRecommended || false
    });
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // Convert FileList to array and process each file
        Array.from(files).forEach((file: File) => {
            // Create a local URL for preview
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), { file, previewUrl: imageUrl } as UploadedImage] // FIX: Add fallback
            }));
        });
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index) // FIX: Add fallback
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleAmenityChange = (index: number, field: 'name' | 'icon', value: string) => {
        const newAmenities = [...(formData.amenities || [])]; // FIX: Add fallback
        newAmenities[index][field] = value;
        setFormData(prev => ({ ...prev, amenities: newAmenities }));
    };

    const addAmenity = () => {
        setFormData(prev => ({ ...prev, amenities: [...(prev.amenities || []), { name: '', icon: 'fas fa-check' }] })); // FIX: Add fallback
    };

    const removeAmenity = (index: number) => {
        const newAmenities = (formData.amenities || []).filter((_, i) => i !== index); // FIX: Add fallback
        setFormData(prev => ({ ...prev, amenities: newAmenities }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // FIX: Add safe length check
        if (!formData.images || formData.images.length === 0) {
            alert('Please upload at least one image');
            return;
        }
        
        try {
            // Upload all images to Supabase storage in the hostels bucket
            const files = formData.images.map(img => img.file);
            
            // Create a unique folder for each hostel using timestamp
            const timestamp = new Date().getTime();
            const hostelFolder = `${item?.id || timestamp}`;
            
            const uploadedUrls = await storageService.uploadMultipleImages(files, 'hostels', hostelFolder);
            
            // If we're updating an existing hostel, delete old images if they've changed
            if (item?.id && item.imageUrls) {
                const oldUrls = new Set(item.imageUrls);
                const newUrls = new Set(uploadedUrls);
                const urlsToDelete = item.imageUrls.filter(url => !newUrls.has(url));
                
                // Delete old images that are no longer used
                await Promise.all(
                    urlsToDelete.map(async (url) => {
                        try {
                            await storageService.deleteImage(url, 'hostels');
                        } catch (error) {
                            console.warn('Failed to delete old image:', url, error);
                        }
                    })
                );
            }

            // Prepare the hostel data with both imageUrl and imageUrls
            const hostelData = {
                ...formData,
                rating: formData.rating,
                imageUrl: uploadedUrls[0],
                imageUrls: uploadedUrls,
                images: undefined
            };
            
            onSubmit(hostelData);
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Failed to upload images. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Hostel Name" required />
                <div className="space-y-4">
                    <Input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full"
                        required={(formData.images?.length || 0) === 0}
                    />
                    
                    {/* FIX: Add safe length check */}
                    {formData.images && formData.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                            {formData.images.map((img, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={img.previewUrl}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <i className="fas fa-times" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <Input name="location" value={formData.location} onChange={handleChange} placeholder="Location" required />
                <Input name="priceRange" value={formData.priceRange} onChange={handleChange} placeholder="Price Range (e.g., 800K - 1.4M)" required />
                <Input name="rating" type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={handleChange} placeholder="Rating" required />
                <Select name="universityId" value={formData.universityId} onChange={handleChange}>
                    {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </Select>
            </div>
            <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
            <div>
                <h4 className="font-semibold mb-2">Amenities</h4>

                {/* Predefined amenity options */}
                <div className="mb-3">
                    {(() => {
                        const AMENITY_OPTIONS = [
                            { name: 'Wifi', icon: 'fas fa-wifi' },
                            { name: 'Swimming Pool', icon: 'fas fa-water' },
                            { name: 'Laundry', icon: 'fas fa-tshirt' },
                            { name: 'Parking', icon: 'fas fa-parking' },
                            { name: 'Canteen', icon: 'fa fa-shopping-bag' },
                            { name: 'Security', icon: 'fas fa-shield-alt' },
                            { name: 'Restaurant', icon: 'fas fa-utensils' },
                            { name: 'Study Area', icon: 'fas fa-book' },
                            { name: 'TV', icon: 'fas fa-tv' },
                            { name: 'Shuttle', icon: 'fas fa-bus' },
                            { name: 'Girls Only', icon: 'fa fa-female' },
                            { name: 'Boys Only', icon: 'fa fa-male' },
                            { name: 'Mixed', icon: 'fa fa-users' },
                            { name: 'Gym', icon: 'fa fa-dumbbell' },
                        ];

                        // FIX: Add safe check for amenities
                        const isSelected = (name) => (formData.amenities || []).some(a => a.name === name);
                        const toggleAmenityOption = (opt) => {
                            const amenities = formData.amenities || [];
                            const existsIndex = amenities.findIndex(a => a.name === opt.name);
                            if (existsIndex >= 0) {
                                const newAmenities = amenities.filter((_, i) => i !== existsIndex);
                                setFormData({ ...formData, amenities: newAmenities });
                            } else {
                                setFormData({ ...formData, amenities: [...amenities, { name: opt.name, icon: opt.icon }] });
                            }
                        };

                        return (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {AMENITY_OPTIONS.map(opt => (
                                    <button
                                        key={opt.name}
                                        type="button"
                                        onClick={() => toggleAmenityOption(opt)}
                                        className={`flex items-center gap-3 p-2 rounded-md border transition-colors text-sm text-gray-700 ${isSelected(opt.name) ? 'bg-unistay-yellow text-unistay-navy border-unistay-yellow' : 'bg-white hover:bg-gray-50'}`}
                                    >
                                        <i className={`${opt.icon} w-5 text-lg`} />
                                        <span>{opt.name}</span>
                                    </button>
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {/* FIX: Add safe check for amenities */}
                <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.amenities || []).map((amenity, index) => (
                        <div key={`${amenity.name}-${index}`} className="flex items-center gap-2 bg-white border rounded-full px-3 py-1 text-sm shadow-sm">
                            <i className={`${amenity.icon} text-sm`} />
                            <span className="whitespace-nowrap">{amenity.name}</span>
                            <button type="button" onClick={() => removeAmenity(index)} className="ml-1 text-red-500 hover:text-red-700">
                                <i className="fas fa-times" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Input id="customAmenityName" placeholder="Custom amenity (e.g., Rooftop)" />
                    <Button onClick={() => {
                        const input = (document.getElementById('customAmenityName') as HTMLInputElement);
                        if (!input) return;
                        const val = input.value.trim();
                        if (!val) return;
                        setFormData({ ...formData, amenities: [...(formData.amenities || []), { name: val, icon: 'fas fa-check' }] });
                        input.value = '';
                    }} className="bg-unistay-yellow text-unistay-navy hover:bg-yellow-400"><i className="fas fa-plus mr-2"></i>Add Amenity</Button>
                </div>
            </div>
            <div className="flex items-center">
                <input id="isRecommended" name="isRecommended" type="checkbox" checked={formData.isRecommended} onChange={handleChange} className="h-4 w-4 text-unistay-yellow focus:ring-unistay-yellow border-gray-300 rounded" />
                <label htmlFor="isRecommended" className="ml-2 text-sm font-medium text-gray-700">Mark as Recommended</label>
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t">
                <Button onClick={onCancel} className="bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</Button>
                <Button type="submit" loading={isSubmitting}>{item ? 'Update' : 'Add'} Hostel</Button>
            </div>
        </form>
    );
};

// --- Contact Messages Form (Read-Only Display) ---
interface ContactMessagesFormProps {
    item?: ContactSubmission;
    onSubmit?: (data: any) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

const ContactMessagesForm: React.FC<ContactMessagesFormProps> = ({ item, onCancel, isSubmitting = false }) => {
    if (!item) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Select a message to view details</p>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Contact messages are read-only. Use the delete button to remove messages.
                </p>
            </div>

            {/* Sender header */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                <div className="h-12 w-12 rounded-full bg-unistay-navy text-white flex items-center justify-center font-bold text-lg">
                    {item.name ? item.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'U'}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-unistay-navy">{item.name}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            item.read ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>{item.read ? '✓ Read' : '○ Unread'}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        <a href={`mailto:${item.email}`} className="hover:underline">{item.email}</a>
                        <span className="mx-2">•</span>
                        <a href={`tel:${item.phone}`} className="hover:underline">{item.phone}</a>
                    </div>
                </div>
            </div>

            {/* Message area (messenger-style) */}
            <div className="flex flex-col gap-4">
                <div className="max-w-3xl">
                    <div className="text-sm text-gray-500 mb-2">Subject</div>
                    <div className="mb-4 text-base font-medium text-unistay-navy">{item.subject}</div>

                    <div className="flex">
                        <div className="rounded-lg bg-gray-100 p-4 shadow-sm max-w-3xl text-gray-800">
                            <p className="whitespace-pre-wrap">{item.message}</p>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">Submitted: {formatDate(item.timestamp)}</div>
                </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
                <Button onClick={onCancel} className="bg-gray-200 text-gray-800 hover:bg-gray-300">Close</Button>
            </div>
        </div>
    );
};

// --- Content Manager (Generic) ---

function ContentManager({ title, items, handler, columns, FormComponent, universities = [], onDataChange }) {
    const [editingItem, setEditingItem] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const { notify } = useNotifier();
    
    // Pagination: 10 items per page for Hostels section
    const itemsPerPage = title === 'Manage Hostels' ? 10 : items.length;
    
    // Filter items based on search query (for Hostels only)
    const filteredItems = title === 'Manage Hostels' 
        ? items.filter(item => 
            item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : items;
    
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const displayedItems = filteredItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsAdding(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setDeletingId(id);
            try {
                await handler.remove(id);
                notify({ message: 'Item deleted successfully!', type: 'success' });
                onDataChange();
            } catch (err) {
                notify({ message: err, type: 'error' });
            } finally {
                setDeletingId(null);
            }
        }
    };

    const handleAdd = () => {
        setEditingItem(null);
        setIsAdding(true);
    };

    const handleCancel = () => {
        setEditingItem(null);
        setIsAdding(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(0); // Reset to first page when searching
    };

    const handleSubmit = async (item) => {
        setIsSubmitting(true);
        try {
            // For hostels, the form component handles the image upload
            // so we just need to save the data
            if (item.id) {
                await handler.update(item.id, item);
                notify({ message: 'Item updated successfully!', type: 'success' });
            } else {
                await handler.add(item);
                notify({ message: 'Item added successfully!', type: 'success' });
            }
            onDataChange();
            handleCancel();
        } catch (err) {
            notify({ message: err, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formProps = {
        onSubmit: handleSubmit,
        onCancel: handleCancel,
        item: editingItem,
        isSubmitting,
        ...(universities.length > 0 && { universities }) // Conditionally add universities prop
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-unistay-navy">{title}</h2>
                <Button onClick={handleAdd} className="bg-unistay-yellow text-unistay-navy hover:bg-yellow-400" disabled={isSubmitting || deletingId !== null}>
                    <i className="fas fa-plus mr-2"></i>Add New
                </Button>
            </div>
            
            {/* Search Bar for Hostels */}
            {title === 'Manage Hostels' && (
                <div className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <i className="fas fa-search text-gray-400 text-lg"></i>
                        <input
                            type="text"
                            placeholder="Search by hostel name or location..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-unistay-yellow focus:border-unistay-yellow outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <div className="text-sm text-gray-600 mt-2">
                            Found {filteredItems.length} hostel{filteredItems.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            )}
            
            {(isAdding || editingItem) && <FormComponent {...formProps} />}
            
            {/* No Results Message */}
            {title === 'Manage Hostels' && searchQuery && filteredItems.length === 0 && (
                <div className="bg-white shadow rounded-lg p-8 text-center">
                    <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No hostels found</h3>
                    <p className="text-gray-500">No hostels match your search query. Try different keywords.</p>
                </div>
            )}
            
            {displayedItems.length > 0 && (
                <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            {columns.map(col => <th key={col.header} className="p-4 font-semibold text-sm">{col.header}</th>)}
                            <th className="p-4 font-semibold text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedItems.map(item => (
                            <tr key={item.id} onClick={() => handleEdit(item)} className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer">
                                {columns.map(col => (
                                   <td key={col.accessor} className="p-4 text-sm text-gray-700 align-top">
                                       {typeof item[col.accessor] === 'boolean' ? 
                                           (item[col.accessor] ? 
                                               <span className="flex items-center justify-center"><i className="fas fa-star text-unistay-yellow"></i></span> :
                                               <span className="flex items-center justify-center"><i className="fas fa-minus text-gray-300"></i></span>) :
                                           col.accessor === 'discount' && item[col.accessor] ? 
                                               `${item[col.accessor]}% OFF` :
                                               item[col.accessor]
                                       }
                                   </td>
                                ))}
                                <td className="p-4 text-right">
                                    <div className="flex gap-3 justify-end">
                                        <ActionButton icon="fa-pencil-alt" onClick={(e) => { e.stopPropagation(); handleEdit(item); }} />
                                        <ActionButton icon="fa-trash" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} colorClass="text-red-500 hover:text-red-700" loading={deletingId === item.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
            
            {/* Pagination Controls for Hostels */}
            {title === 'Manage Hostels' && totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="px-4 py-2 bg-unistay-navy text-white rounded-lg hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        <i className="fas fa-chevron-left"></i>
                        Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">
                            Page <span className="text-unistay-navy">{currentPage + 1}</span> of <span className="text-unistay-navy">{totalPages}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                            (Showing {displayedItems.length} of {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''})
                        </span>
                    </div>
                    
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage === totalPages - 1}
                        className="px-4 py-2 bg-unistay-navy text-white rounded-lg hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        Next
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </div>
    );
}

// --- Confessions Moderation Component ---
const ConfessionsModerationPanel = ({ items = [], handler, onDataChange }: { items: any[]; handler: any; onDataChange?: () => void }) => {
    const [loading, setLoading] = React.useState<string | null>(null);
    const { notify } = useNotifier();

    const handleApprove = async (confessionId: string, adminEmail: string) => {
        setLoading(confessionId);
        try {
            await handler.approve(confessionId, adminEmail);
            notify('Confession approved!', 'success');
            onDataChange?.();
        } catch (error) {
            console.error('Error approving confession:', error);
            notify('Failed to approve confession', 'error');
        } finally {
            setLoading(null);
        }
    };

    const handleReject = async (confessionId: string) => {
        setLoading(confessionId);
        try {
            await handler.reject(confessionId);
            notify('Confession rejected', 'success');
            onDataChange?.();
        } catch (error) {
            console.error('Error rejecting confession:', error);
            notify('Failed to reject confession', 'error');
        } finally {
            setLoading(null);
        }
    };

    if (items.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <i className="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">All Clear!</h2>
                <p className="text-gray-600">No pending confessions to moderate.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Confessions ({items.length})</h2>
            {items.map((confession) => (
                <div key={confession.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                    <div className="mb-4">
                        <p className="text-gray-800 italic text-lg mb-3">{confession.content}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>
                                <i className="fas fa-clock mr-2"></i>
                                {new Date(confession.timestamp).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={() => handleApprove(confession.id, 'admin@unistay.com')}
                            disabled={loading === confession.id}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                        >
                            {loading === confession.id ? <Spinner color="white" size="sm" /> : <i className="fas fa-check"></i>}
                            Approve
                        </button>
                        <button
                            onClick={() => handleReject(confession.id)}
                            disabled={loading === confession.id}
                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                        >
                            {loading === confession.id ? <Spinner color="white" size="sm" /> : <i className="fas fa-times"></i>}
                            Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Main Dashboard Component ---

type Section = 'Dashboard' | 'Hostels' | 'News' | 'Events' | 'Jobs' | 'Deals' | 'Spotlights' | 'LostFound' | 'ContactMessages' | 'Confessions';

interface AdminDashboardProps {
    onExitAdminMode: () => void;
    content: {
        hostels: { items: Hostel[]; handler: any; universities: University[] };
        news: { items: NewsItem[]; handler: any };
        events: { items: Event[]; handler: any };
        jobs: { items: Job[]; handler: any };
        roommateProfiles: { items: RoommateProfile[] };
        contactMessages?: { items: ContactSubmission[]; handler: any };
        spotlights?: { items: StudentSpotlight[]; handler: any };
        lostFound?: { items: LostItem[]; handler: any };
        studentDeals?: { items: StudentDeal[]; handler: any };
        pendingConfessions?: { items: any[]; handler: any };
    };
    onDataChange: () => void;
}


const AdminDashboard = ({ onExitAdminMode, content, onDataChange }: AdminDashboardProps) => {
    const [activeSection, setActiveSection] = useState<Section>('Dashboard');
    const [stats, setStats] = useState({ hostels: 0, news: 0, events: 0, jobs: 0, roommateProfiles: 0 });
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (activeSection !== 'Dashboard') return;
            setIsLoadingStats(true);
            try {
                const [hostelsCount, newsCount, eventsCount, jobsCount, profilesCount] = await Promise.all([
                    hostelService.getCounts(),
                    newsService.getCounts(),
                    eventService.getCounts(),
                    jobService.getCounts(),
                    roommateProfileService.getCounts()
                ]);
                setStats({
                    hostels: hostelsCount,
                    news: newsCount,
                    events: eventsCount,
                    jobs: jobsCount,
                    roommateProfiles: profilesCount
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                 setStats({ hostels: 0, news: 0, events: 0, jobs: 0, roommateProfiles: 0 });
            } finally {
                setIsLoadingStats(false);
            }
        };
        fetchStats();
    }, [activeSection]);


    const sections = {
        Hostels: {
            title: 'Manage Hostels',
            items: [...content.hostels.items].reverse(),
            handler: content.hostels.handler,
            columns: [
                { header: 'Name', accessor: 'name' },
                { header: 'University', accessor: 'universityId' },
                { header: 'Price Range', accessor: 'priceRange' },
                { header: 'Recommended', accessor: 'isRecommended' },
            ],
            FormComponent: HostelForm,
            universities: content.hostels.universities,
        },
        News: {
            title: 'Manage News',
            items: [...content.news.items].sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()),
            handler: content.news.handler,
            columns: [
                { header: 'Title', accessor: 'title' },
                { header: 'Source', accessor: 'source' },
                { header: 'Featured', accessor: 'featured' },
            ],
            FormComponent: NewsForm,
        },
        Events: {
            title: 'Manage Events',
            items: [...content.events.items].sort((a, b) => {
                // Sort by date
                const aTime = new Date(a.date || 0).getTime();
                const bTime = new Date(b.date || 0).getTime();
                return bTime - aTime; // Latest first
            }),
            handler: content.events.handler,
            columns: [
                { header: 'Title', accessor: 'title' },
                { header: 'Date', accessor: 'date' },
                { header: 'Location', accessor: 'location' },
            ],
            FormComponent: EventForm,
        },
        Jobs: {
            title: 'Manage Jobs',
            items: content.jobs.items,
            handler: content.jobs.handler,
            columns: [
                { header: 'Title', accessor: 'title' },
                { header: 'Company', accessor: 'company' },
                { header: 'Deadline', accessor: 'deadline' },
            ],
            FormComponent: JobForm,
        },
        Deals: {
            title: 'Manage Student Deals',
            items: content.studentDeals?.items || [],
            handler: content.studentDeals?.handler,
            columns: [
                { header: 'Title', accessor: 'title' },
                { header: 'Discount', accessor: 'discount' },
                { header: 'Active', accessor: 'active' },
                { header: 'Link', accessor: 'link' },
            ],
            FormComponent: DealsForm,
            universities: content.hostels.universities,
        },
        Spotlights: {
            title: 'Manage Student Spotlights',
            items: [...(content.spotlights?.items || [])].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()),
            handler: content.spotlights?.handler,
            columns: [
                { header: 'Name', accessor: 'name' },
                { header: 'Major', accessor: 'major' },
                { header: 'University', accessor: 'universityId' },
                { header: 'Gender', accessor: 'gender' },
                { header: 'Votes', accessor: 'votes' },
            ],
            FormComponent: SpotlightForm,
            universities: content.hostels.universities,
        },
        LostFound: {
            title: 'Manage Lost & Found',
            items: content.lostFound?.items || [],
            handler: content.lostFound?.handler,
            columns: [
                { header: 'Title', accessor: 'title' },
                { header: 'Category', accessor: 'category' },
                { header: 'Posted By', accessor: 'postedBy' },
                { header: 'Phone', accessor: 'phone' },
                { header: 'Date', accessor: 'timestamp' },
            ],
            FormComponent: LostFoundForm,
        },
        ContactMessages: {
            title: 'Contact Form Submissions',
            items: content.contactMessages?.items || [],
            handler: content.contactMessages?.handler,
            columns: [
                { header: 'Name', accessor: 'name' },
                { header: 'Email', accessor: 'email' },
                { header: 'Subject', accessor: 'subject' },
                { header: 'Status', accessor: 'read' },
                { header: 'Date', accessor: 'timestamp' },
            ],
            FormComponent: ContactMessagesForm,
        },
        Confessions: {
            title: 'Moderate Confessions',
            items: content.pendingConfessions?.items || [],
            handler: content.pendingConfessions?.handler,
            columns: [
                { header: 'Content', accessor: 'content' },
                { header: 'Submitted', accessor: 'timestamp' },
                { header: 'Actions', accessor: 'actions' },
            ],
            FormComponent: null, // No form for confessions
            isPendingView: true,
        },
    };
    
    const icons = {
        Dashboard: 'fa-tachometer-alt',
        Hostels: 'fa-hotel',
        News: 'fa-newspaper',
        Events: 'fa-calendar-alt',
        Jobs: 'fa-briefcase',
        Deals: 'fa-tags',
        Spotlights: 'fa-star',
        LostFound: 'fa-search',
        ContactMessages: 'fa-envelope',
        Confessions: 'fa-user-secret',
    };
    
    const navItems: Section[] = ['Dashboard', 'Hostels', 'News', 'Events', 'Jobs', 'Deals', 'Spotlights', 'LostFound', 'ContactMessages', 'Confessions'];

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Make sidebar narrow on small screens and expand on md+ */}
            <aside className="w-16 md:w-64 bg-unistay-navy text-white flex flex-col p-3 md:p-4">
                <div className="text-center py-3 mb-6">
                    {/* show small icon on narrow screens, full label on md+ */}
                    <i className="fas fa-user-shield text-xl md:hidden" aria-hidden="true"></i>
                    <h1 className="hidden md:block text-3xl font-extrabold">Admin</h1>
                </div>
                <nav className="flex-grow">
                    {navItems.map(section => (
                        <button
                            key={section}
                            onClick={() => setActiveSection(section)}
                            className={`w-full text-left py-3 my-1 rounded-lg transition-colors flex items-center gap-3 px-2 md:px-4 justify-center md:justify-start ${
                                activeSection === section ? 'bg-unistay-yellow text-unistay-navy font-bold' : 'hover:bg-white/10'
                            }`}
                        >
                            <i className={`fas ${icons[section]} w-5 text-center`}></i>
                            {/* hide label on small screens to save space */}
                            <span className="hidden md:inline">{section}</span>
                        </button>
                    ))}
                </nav>
                <div className="pt-4 border-t border-white/20">
                    <button
                        onClick={onExitAdminMode}
                        className="w-full text-left py-3 my-1 rounded-lg transition-colors flex items-center gap-3 px-2 md:px-4 justify-center md:justify-start hover:bg-white/10"
                    >
                        <i className="fas fa-arrow-left w-5 text-center"></i>
                        <span className="hidden md:inline">Back to Site</span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {activeSection === 'Dashboard' ? (
                     <DashboardStats 
                        stats={stats} 
                        isLoading={isLoadingStats} 
                     />
                ) : activeSection === 'Confessions' ? (
                    <ConfessionsModerationPanel 
                        items={sections[activeSection].items} 
                        handler={sections[activeSection].handler}
                        onDataChange={onDataChange}
                    />
                ) : (
                    <ContentManager {...sections[activeSection]} onDataChange={onDataChange} />
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;