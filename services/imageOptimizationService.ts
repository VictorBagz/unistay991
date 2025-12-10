/**
 * Image Optimization Service
 * Compresses images before upload to reduce file sizes
 * and improve page load performance
 */

export const imageOptimizationService = {
    /**
     * Compress an image file before upload
     * @param file - The image file to compress
     * @param maxWidth - Maximum width in pixels (default: 1920)
     * @param quality - JPEG/WebP quality (0-1, default: 0.78)
     * @returns Compressed file blob
     */
    async compressImage(
        file: File,
        maxWidth: number = 1920,
        quality: number = 0.78
    ): Promise<File> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Calculate new dimensions
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    // Create canvas and draw resized image
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Failed to get canvas context'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    // Determine output format
                    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                    let mimeType = 'image/jpeg';
                    let outputQuality = quality;

                    if (fileExt === 'png') {
                        mimeType = 'image/png';
                    } else if (fileExt === 'webp') {
                        mimeType = 'image/webp';
                    } else if (fileExt === 'avif') {
                        mimeType = 'image/avif';
                        outputQuality = quality; // AVIF handles quality similarly
                    }

                    // Convert canvas to blob
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Failed to create blob from canvas'));
                                return;
                            }

                            // Only use compressed version if it's smaller
                            if (blob.size < file.size) {
                                const compressedFile = new File([blob], file.name, {
                                    type: mimeType,
                                    lastModified: Date.now(),
                                });
                                resolve(compressedFile);
                            } else {
                                // Use original if compression didn't help
                                resolve(file);
                            }
                        },
                        mimeType,
                        outputQuality
                    );
                };

                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };

                img.src = event.target?.result as string;
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsDataURL(file);
        });
    },

    /**
     * Compress multiple images
     * @param files - Array of files to compress
     * @param maxWidth - Maximum width in pixels
     * @param quality - Compression quality
     * @returns Array of compressed files
     */
    async compressMultipleImages(
        files: File[],
        maxWidth: number = 1920,
        quality: number = 0.78
    ): Promise<File[]> {
        return Promise.all(
            files.map((file) => this.compressImage(file, maxWidth, quality))
        );
    },

    /**
     * Get file size in human-readable format
     */
    getFileSizeString(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Get compression stats
     */
    getCompressionStats(originalSize: number, compressedSize: number) {
        const saved = originalSize - compressedSize;
        const percentReduction = Math.round((saved / originalSize) * 100);
        return {
            originalSize: this.getFileSizeString(originalSize),
            compressedSize: this.getFileSizeString(compressedSize),
            saved: this.getFileSizeString(saved),
            percentReduction,
        };
    },
};
