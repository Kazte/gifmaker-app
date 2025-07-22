import { useCallback, useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface DraggableTrimMarkerProps {
	position: number; // 0-1 representing position on timeline
	color: "green" | "red";
	onDrag: (position: number) => void;
	timelineRef: React.RefObject<HTMLDivElement | null>;
	title?: string;
	ariaLabel?: string;
}

export function DraggableTrimMarker({
	position,
	color,
	onDrag,
	timelineRef,
	title,
	ariaLabel,
}: DraggableTrimMarkerProps) {
	const [isDragging, setIsDragging] = useState(false);
	const isDraggingRef = useRef(false);

	const calculatePositionFromMouse = useCallback(
		(clientX: number): number => {
			if (!timelineRef.current) return position;

			const rect = timelineRef.current.getBoundingClientRect();
			const newPosition = (clientX - rect.left) / rect.width;
			return Math.max(0, Math.min(1, newPosition));
		},
		[timelineRef, position],
	);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		isDraggingRef.current = true;
		setIsDragging(true);
	}, []);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDraggingRef.current) return;

			e.preventDefault();
			const newPosition = calculatePositionFromMouse(e.clientX);
			onDrag(newPosition);
		},
		[calculatePositionFromMouse, onDrag],
	);

	const handleMouseUp = useCallback(() => {
		isDraggingRef.current = false;
		setIsDragging(false);
	}, []);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
				e.preventDefault();
				e.stopPropagation();
				const step = 0.01; // 1% of timeline
				const newPosition =
					e.key === "ArrowLeft"
						? Math.max(0, position - step)
						: Math.min(1, position + step);
				onDrag(newPosition);
			}
		},
		[position, onDrag],
	);

	// Global mouse event listeners
	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "grabbing";

			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
				document.body.style.cursor = "default";
			};
		}
	}, [isDragging, handleMouseMove, handleMouseUp]);

	const baseClasses =
		"absolute w-1 transition-colors cursor-grab active:cursor-grabbing hover:w-2";
	const colorClasses = {
		green: "bg-green-500 hover:bg-green-400",
		red: "bg-red-500 hover:bg-red-400",
	};

	return (
		<div
			className={cn(
				baseClasses,
				colorClasses[color],
				isDragging && "w-2 shadow-lg",
			)}
			style={{
				left: `${position * 100}%`,
				top: "-4px",
				height: "calc(100% + 8px)",
				zIndex: isDragging ? 20 : 10,
			}}
			onMouseDown={handleMouseDown}
			onKeyDown={handleKeyDown}
			tabIndex={0}
			role="slider"
			aria-label={ariaLabel}
			aria-valuemin={0}
			aria-valuemax={1}
			aria-valuenow={position}
			title={title}
		/>
	);
}
