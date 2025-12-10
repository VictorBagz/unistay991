import { StorageError } from '@supabase/storage-js';
import { supabase } from './supabase';
import { imageOptimizationService } from './imageOptimizationService';

type ContentType = 'hostels' | 'events' | 'news' | 'jobs';

function getBucketForContentType(type: ContentType): string {
    switch (type) {
        case 'news':
            return 'news_uploads';
        default:
            return 'uploads';
    }
}

function getFolder(type: ContentType): string {
    // For news, we don't need a type folder since it has its own bucket
    return type === 'news' ? '' : type;
}

export const storageService = {
    async uploadImage(file: File, contentType: ContentType, folder: string): Promise<string> {
        try {
            if (!file || !(file instanceof File)) {
                throw new Error('Invalid file provided');
            }

            // Validate file type and size
            if (!file.type.startsWith('image/')) {
                throw new Error('File must be an image');
            }

            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                throw new Error('File size must be less than 5MB');
            }

            const fileExt = file.name.split('.').pop()?.toLowerCase();
            if (!fileExt || !['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'].includes(fileExt)) {
                throw new Error('Invalid file type. Supported types: jpg, jpeg, png, gif, webp, avif');
            }

            // Optimize image before upload (compress to reduce file size)
            let fileToUpload = file;
            try {
                const originalSize = file.size;
                fileToUpload = await imageOptimizationService.compressImage(file, 1920, 0.78);
                const compressedSize = fileToUpload.size;
                
                if (compressedSize < originalSize) {
                    const stats = imageOptimizationService.getCompressionStats(originalSize, compressedSize);
                    console.log(
                        `Image optimized: ${file.name} - ${stats.originalSize} → ${stats.compressedSize} (${stats.percentReduction}% reduction)`
                    );
                }
            } catch (compressionError) {
                console.warn('Image compression failed, uploading original:', compressionError);
                // Continue with original file if compression fails
            }

            // Create a unique filename
            const timestamp = new Date().getTime();
            const randomString = Math.random().toString(36).substring(2);
            const fileName = `${timestamp}-${randomString}.${fileExt}`;
            
            // Construct the full path
            const folderPath = getFolder(contentType);
            const uploadPath = folder ? `${folderPath}/${folder}/${fileName}` : `${folderPath}/${fileName}`;

            // Get the appropriate bucket for this content type
            const bucket = getBucketForContentType(contentType);

            // Upload the file with proper content type
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(uploadPath, fileToUpload, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: fileToUpload.type
                });

            if (error) {
                throw new Error(`Failed to upload image: ${error.message}`);
            }

            if (!data?.path) {
                throw new Error('Upload succeeded but no path returned');
            }

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(data.path);

            if (!publicUrl) {
                throw new Error('Failed to get public URL for uploaded file');
            }

            return publicUrl;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown upload error';
            console.error('Image upload error:', message);
            throw new Error(message);
        }
    },

    async uploadMultipleImages(files: File[], contentType: ContentType, folder: string): Promise<string[]> {
        const uploadPromises = files.map(file => this.uploadImage(file, contentType, folder));
        return Promise.all(uploadPromises);
    },

    async deleteImage(url: string, contentType: ContentType): Promise<void> {
        try {
            // Get the appropriate bucket for this content type
            const bucket = getBucketForContentType(contentType);

            // Extract the path from the URL
            const urlParts = url.split('/');
            const bucketIndex = urlParts.indexOf(bucket);
            
            if (bucketIndex === -1) {
                throw new Error('Invalid storage URL format');
            }

            const path = urlParts.slice(bucketIndex + 1).join('/');
            if (!path) {
                throw new Error('Invalid image path');
            }

            // For the news bucket, we don't need to verify the path prefix
            if (contentType !== 'news' && !path.startsWith(contentType + '/')) {
                throw new Error(`Image path does not match content type ${contentType}`);
            }

            const { error } = await supabase.storage
                .from(bucket)
                .remove([path]);

            if (error) {
                throw new Error(`Failed to delete image: ${error.message}`);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown deletion error';
            console.error('Image deletion error:', message);
            throw new Error(message);
        }
    }
};