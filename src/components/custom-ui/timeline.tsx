import { formatTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import usePlaybackStore from "@/store/playback.store";
import { useCallback, useEffect, useRef, useState } from "react";

interface TimelineProps {
	className?: string;
}

export default function Timeline({ className }: TimelineProps) {
	const playbackStore = usePlaybackStore();
	const timelineRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const progressPercentage =
		playbackStore.duration > 0
			? (playbackStore.currentTime / playbackStore.duration) * 100
			: 0;

	const handleSeek = useCallback(
		(clientX: number) => {
			if (!timelineRef.current || playbackStore.duration === 0) return;

			const rect = timelineRef.current.getBoundingClientRect();
			const percentage = Math.max(
				0,
				Math.min(1, (clientX - rect.left) / rect.width),
			);
			const newTime = percentage * playbackStore.duration;

			playbackStore.seek(newTime);
		},
		[playbackStore],
	);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			setIsDragging(true);
			handleSeek(e.clientX);
		},
		[handleSeek],
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (isDragging) {
				handleSeek(e.clientX);
			}
		},
		[isDragging, handleSeek],
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, handleMouseMove, handleMouseUp]);

	// Generate time markers
	const generateTimeMarkers = () => {
		const markers: React.ReactElement[] = [];
		const duration = playbackStore.duration;
		if (duration === 0) return markers;

		const markerCount = Math.min(5, Math.floor(duration / 30));
		const interval = duration / markerCount;

		for (let i = 0; i <= markerCount; i++) {
			const time = i * interval;
			const percentage = (time / duration) * 100;

			markers.push(
				<div
					key={i}
					className="absolute flex flex-col items-center"
					style={{ left: `${percentage}%` }}
				>
					<div className="w-px h-2 bg-muted-foreground/40" />
					<span className="text-xs text-muted-foreground/60 mt-0.5 select-none">
						{formatTime(time)}
					</span>
				</div>,
			);
		}

		return markers;
	};

	return (
		<div className={cn("bg-background border-t p-3", className)}>
			{/* Timeline Track */}
			<div className="relative">
				{/* Time markers - simplified */}
				<div className="relative h-4 mb-2">{generateTimeMarkers()}</div>

				{/* Main timeline bar - minimal */}
				{/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
				<div
					ref={timelineRef}
					className="relative h-6 bg-muted rounded cursor-pointer group"
					onMouseDown={handleMouseDown}
				>
					{/* Progress track */}
					<div
						className="absolute inset-y-0 left-0 bg-primary rounded transition-all duration-100"
						style={{ width: `${progressPercentage}%` }}
					/>

					{/* Playhead - simplified */}
					<div
						className="absolute top-1/2 -translate-y-1/2 w-0.5 h-8 bg-primary-foreground transition-all duration-100"
						style={{ left: `${progressPercentage}%` }}
					>
						{/* Simple playhead handle */}
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary-foreground rounded-full" />
					</div>

					{/* Minimal hover effect */}
					<div className="absolute inset-0 bg-primary/10 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
				</div>

				{/* Minimal time display */}
				<div className="flex items-center justify-center mt-2">
					<div className="text-xs text-muted-foreground font-mono">
						{formatTime(playbackStore.currentTime)} /{" "}
						{formatTime(playbackStore.duration)}
					</div>
				</div>
			</div>
		</div>
	);
}
