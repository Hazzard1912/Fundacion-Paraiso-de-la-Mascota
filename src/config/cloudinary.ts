export const cloudinaryConfig = {
    cloudName: import.meta.env.PUBLICCLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.CLOUDINARY_API_SECRET,
    uploadPreset: 'pet_images'
};