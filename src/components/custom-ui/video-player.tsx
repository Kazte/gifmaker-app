import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/app.store";
import usePlaybackStore from "@/store/playback.store";

interface VideoPlayerProps {
	className?: string;
}

export default function VideoPlayer({ className }: VideoPlayerProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const playbackStore = usePlaybackStore();
	const appStore = useAppStore();

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const handleSeekEvent = (event: CustomEvent) => {
			const time = event.detail.time;
			const videoTime = Math.max(0, Math.min(time, video.duration));

			video.currentTime = videoTime;
		};

		const handleUpdateEvent = (event: CustomEvent) => {
			const time = event.detail.time;
			const targetTime = Math.max(0, Math.min(time, video.duration));

			if (Math.abs(video.currentTime - targetTime) > 0.5) {
				video.currentTime = targetTime;
			}
		};

		const handleSpeedEvent = (event: CustomEvent) => {
			video.playbackRate = event.detail.speed;
		};

		window.addEventListener("playback-seek", handleSeekEvent as EventListener);

		window.addEventListener(
			"playback-update",
			handleUpdateEvent as EventListener,
		);

		window.addEventListener(
			"playback-speed",
			handleSpeedEvent as EventListener,
		);

		return () => {
			window.removeEventListener(
				"playback-seek",
				handleSeekEvent as EventListener,
			);
			window.removeEventListener(
				"playback-update",
				handleUpdateEvent as EventListener,
			);
			window.removeEventListener(
				"playback-speed",
				handleSpeedEvent as EventListener,
			);
		};
	}, []);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		if (playbackStore.isPlaying) {
			video.play().catch(console.error);
		} else {
			video.pause();
		}
	}, [playbackStore.isPlaying]);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		video.volume = playbackStore.volume;
		video.muted = playbackStore.muted;
		video.playbackRate = playbackStore.speed;
	}, [playbackStore.volume, playbackStore.muted, playbackStore.speed]);

	return (
		// biome-ignore lint/a11y/useMediaCaption: <explanation>
		<video
			ref={videoRef}
			src={appStore.videoUrl}
			className={cn("max-w-full max-h-full object-contain", className)}
			playsInline
			preload="auto"
			controls={false}
			disablePictureInPicture
			disableRemotePlayback
			aria-label="Video Player"
			style={{
				pointerEvents: "none",
			}}
			onLoadedData={() => {
				const video = videoRef.current;
				if (video) {
					playbackStore.setDuration(video.duration);
				}
			}}
			onContextMenu={(e) => e.preventDefault()}
		/>
	);
}
