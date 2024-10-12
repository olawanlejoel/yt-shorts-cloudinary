'use client';

import { upload } from '../actions/upload';
import { useState, useEffect } from 'react';

export default function Home() {
	const [videoUrl, setVideoUrl] = useState<string | null>(null); // Store video URL
	const [videoId, setVideoId] = useState<string | null>(null);
	const [transformedVideoUrl, setTransformedVideoUrl] = useState<string | null>(
		null
	);
	const [loading, setLoading] = useState(false);

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

	// Apply smart cropping and transform the video
	useEffect(() => {
		const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

		// Construct the Cloudinary video URL with subtitles overlay
		const subtitlePublicId = `${videoId}.transcript`;
		const generatedVideoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/c_fill,w_720,h_1280/l_subtitles:${subtitlePublicId},g_south,y_30/${videoId}.mp4`;

		// Set the transformed video URL with subtitles
		setTransformedVideoUrl(generatedVideoUrl);
	}, [videoId]);

	// Function to handle download of the transformed video
	const handleDownload = async () => {
		if (transformedVideoUrl) {
			// Fetch the video from the URL
			const response = await fetch(transformedVideoUrl, {
				method: 'GET',
				mode: 'cors',
			});

			// Create a blob from the response
			const blob = await response.blob();

			// Create a URL for the blob object
			const blobUrl = window.URL.createObjectURL(blob);

			// Create a link element and trigger the download
			const a = document.createElement('a');
			a.href = blobUrl;
			a.download = `optimized_video`;
			document.body.appendChild(a);
			a.click();

			// Clean up the URL object
			window.URL.revokeObjectURL(blobUrl);
			document.body.removeChild(a);
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

			{videoUrl && transformedVideoUrl && (
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
							src={transformedVideoUrl}
							controls
							className="w-full max-w-md border-4 rounded"
						/>
						{/* Add a download button */}
						<div className="text-center mt-4">
							<button
								onClick={handleDownload}
								className="bg-green-600 text-white p-2 rounded-md"
							>
								Download Video
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
