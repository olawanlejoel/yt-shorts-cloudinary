'use client';

import { upload } from '../actions/upload';
import { useState } from 'react';

export default function Home() {
	const [videoUrl, setVideoUrl] = useState<string | null>(null); // Store video URL
	const [videoId, setVideoId] = useState<string | null>(null); // Store video ID
	const [loading, setLoading] = useState(false);
	const [cloudName] = useState<string>(
		`${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`
	);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);
		const formData = new FormData(event.currentTarget);

		try {
			const result = await upload(formData); // Upload the video
			setVideoUrl(result.originalUrl); // Set the video URL in state
			setVideoId(result.videoId); // Set the video ID for further transformations
		} catch (error) {
			console.error('Upload failed', error);
		} finally {
			setLoading(false); // Stop loading state
		}
	};

	return (
		<div className="min-h-screen flex-col items-center justify-between p-10 mt-14">
			<h1 className="text-3xl font-semibold text-center pb-5">
				Generate YouTube Shorts with Subtitles using Cloudinary
			</h1>
			<div className="flex justify-center my-10 items-center ">
				<form onSubmit={handleSubmit} className="border p-2 rounded">
					<input type="file" name="video" accept="video/*" required />
					<button
						type="submit"
						className="bg-blue-800 text-white p-2 rounded-md"
						disabled={loading}
					>
						{loading ? 'Uploading...' : 'Upload'}
					</button>
				</form>
			</div>

			{videoUrl && (
				<div className="flex justify-center space-x-4 mt-10">
					<div>
						<h2 className="text-lg font-bold text-center mb-4">
							Uploaded Video
						</h2>
						<video
							src={videoUrl}
							controls
							className="w-full max-w-md border-4 rounded"
						/>
					</div>
					<div>
						<h2 className="text-lg font-bold text-center mb-4">
							Transformed Video
						</h2>
						<video
							crossOrigin="anonymous"
							controls
							className="w-full max-w-md border-4 rounded"
						>
							<source
								id="mp4"
								src={`https://res.cloudinary.com/${cloudName}/video/upload/c_fill,w_720,h_1280/${videoId}.mp4`}
								type="video/mp4"
							/>
							<track
								label="English"
								kind="subtitles"
								srcLang="en"
								src={`https://res.cloudinary.com/${cloudName}/raw/upload/${videoId}.vtt`}
								default
							/>
						</video>
					</div>
				</div>
			)}
		</div>
	);
}
