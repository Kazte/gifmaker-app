import { useCallback, useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import usePlaybackStore from "@/store/playback.store";
import { DraggableTrimMarker } from "./draggable-trim-marker";

interface TimelineProps {
	className?: string;
}

export default function Timeline({ className }: TimelineProps) {
	const playbackStore = usePlaybackStore();
	const [isDragging, setIsDragging] = useState(false);
	const timelineRef = useRef<HTMLDivElement>(null);
	const isDraggingRef = useRef(false);

	const calculateTimeFromPosition = useCallback(
		(clientX: number) => {
			if (!timelineRef.current) return 0;

			const rect = timelineRef.current.getBoundingClientRect();
			const position = (clientX - rect.left) / rect.width;
			const clampedPosition = Math.max(0, Math.min(1, position));
			return clampedPosition * playbackStore.duration;
		},
		[playbackStore.duration],
	);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			isDraggingRef.current = true;
			setIsDragging(true);
			const time = calculateTimeFromPosition(e.clientX);
			playbackStore.seek(time);
		},
		[calculateTimeFromPosition, playbackStore],
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDraggingRef.current) return;

			e.preventDefault();
			const time = calculateTimeFromPosition(e.clientX);
			playbackStore.seek(time);
		},
		[calculateTimeFromPosition, playbackStore],
	);

	const handleMouseUp = useCallback(() => {
		isDraggingRef.current = false;
		setIsDragging(false);
	}, []);

	// Global mouse event listeners for drag functionality
	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "grabbing";

			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};
		} else {
			document.body.style.cursor = "default";
		}
	}, [isDragging, handleMouseMove, handleMouseUp]);

	// Prevent drag on timeline click
	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			if (!isDragging) {
				const time = calculateTimeFromPosition(e.clientX);
				playbackStore.seek(time);
			}
		},
		[isDragging, calculateTimeFromPosition, playbackStore],
	);

	// Keyboard accessibility support
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
				e.preventDefault();
				const step = playbackStore.duration * 0.01; // 1% of duration
				const newTime =
					e.key === "ArrowLeft"
						? Math.max(0, playbackStore.currentTime - step)
						: Math.min(
								playbackStore.duration,
								playbackStore.currentTime + step,
							);
				playbackStore.seek(newTime);
			} else if (e.key === "i" || e.key === "I") {
				// Set trim start at current time
				e.preventDefault();
				playbackStore.setTrimStart(playbackStore.currentTime);
			} else if (e.key === "o" || e.key === "O") {
				// Set trim end at current time
				e.preventDefault();
				playbackStore.setTrimEnd(playbackStore.currentTime);
			}
		},
		[playbackStore],
	);

	// Handle draggable trim markers
	const handleTrimStartDrag = useCallback(
		(position: number) => {
			const newTime = position * playbackStore.duration;
			// Ensure trim start doesn't exceed trim end
			const maxTime = playbackStore.trimEnd || playbackStore.duration;
			const clampedTime = Math.min(newTime, maxTime - 0.1); // Leave 0.1s minimum gap
			playbackStore.setTrimStart(Math.max(0, clampedTime));
		},
		[playbackStore],
	);

	const handleTrimEndDrag = useCallback(
		(position: number) => {
			const newTime = position * playbackStore.duration;
			// Ensure trim end doesn't go below trim start
			const minTime = playbackStore.trimStart;
			const clampedTime = Math.max(newTime, minTime + 0.1); // Leave 0.1s minimum gap
			playbackStore.setTrimEnd(Math.min(playbackStore.duration, clampedTime));
		},
		[playbackStore],
	);

	return (
		<div
			ref={timelineRef}
			className={cn("relative h-8 w-full cursor-pointer", className)}
			onMouseDown={handleMouseDown}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			tabIndex={0}
			role="slider"
			aria-label="Video timeline"
			aria-valuemin={0}
			aria-valuemax={playbackStore.duration}
			aria-valuenow={playbackStore.currentTime}
		>
			<div className="absolute inset-0 bg-primary/20" />

			{playbackStore.duration > 0 && (
				<div
					className="absolute h-full bg-green-500/30"
					style={{
						left: `${(playbackStore.trimStart / playbackStore.duration) * 100}%`,
						width: `${((playbackStore.trimEnd - playbackStore.trimStart) / playbackStore.duration) * 100}%`,
					}}
				/>
			)}

			{playbackStore.duration > 0 && (
				<DraggableTrimMarker
					position={playbackStore.trimStart / playbackStore.duration}
					color="green"
					onDrag={handleTrimStartDrag}
					timelineRef={timelineRef}
					title="Drag to adjust trim start (or press I to set at current time)"
					ariaLabel="Trim start position"
				/>
			)}

			{playbackStore.duration > 0 && (
				<DraggableTrimMarker
					position={playbackStore.trimEnd / playbackStore.duration}
					color="red"
					onDrag={handleTrimEndDrag}
					timelineRef={timelineRef}
					title="Drag to adjust trim end (or press O to set at current time)"
					ariaLabel="Trim end position"
				/>
			)}

			<div
				className="absolute h-full bg-primary w-1 cursor-grab active:cursor-grabbing transition-colors z-10"
				style={{
					left: `${(playbackStore.currentTime / playbackStore.duration) * 100}%`,
				}}
			/>
			<p className="text-xs text-muted-foreground absolute top-0 left-1/2 transform -translate-x-1/2">
				{formatTime(playbackStore.currentTime, "HH:MM:SS:CS")} /{" "}
				{formatTime(playbackStore.duration, "HH:MM:SS:CS")}
			</p>
		</div>
	);
}
