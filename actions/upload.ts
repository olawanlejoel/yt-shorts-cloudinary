'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function upload(formData: FormData) {
	const file = formData.get('video') as File;
	const buffer: Buffer = Buffer.from(await file.arrayBuffer());

	// Sanitize the public_id (file name) if needed
	const safePublicId = file.name.replace(/[^a-zA-Z0-9-_]/g, '_');

	const uploadResponse = await new Promise<{
		secure_url: string;
		public_id: string;
	}>((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					resource_type: 'video',
					public_id: safePublicId,
					raw_convert: 'google_speech:vtt', // Request transcription
				},
				(error, result) => {
					if (error) {
						reject(`Upload failed: ${error.message}`);
					} else {
						resolve(result);
					}
				}
			)
			.end(buffer);
	});

	// Return the original URL and the video ID
	return {
		originalUrl: uploadResponse.secure_url,
		videoId: uploadResponse.public_id,
	};
}
