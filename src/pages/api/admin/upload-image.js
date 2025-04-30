import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConfig } from '../../../config/cloudinary';

export const prerender = false;

cloudinary.config({
    cloud_name: cloudinaryConfig.cloud_name,
    api_key: cloudinaryConfig.api_key,
    api_secret: cloudinaryConfig.api_secret,
});

export const POST = async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
        return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { upload_preset: cloudinaryConfig.upload_preset },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(buffer);
        });

        return new Response(JSON.stringify({ secure_url: result.secure_url }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message || 'Error al subir la imagen' }), { status: 500 });
    }
}; 