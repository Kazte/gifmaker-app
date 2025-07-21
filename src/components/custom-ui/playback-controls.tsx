import {
	Pause,
	Play,
	Settings,
	SkipBack,
	SkipForward,
	Volume2,
	VolumeX,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import usePlaybackStore from "@/store/playback.store";

interface PlaybackControlsProps {
	className?: string;
}

export default function PlaybackControls({ className }: PlaybackControlsProps) {
	const playbackStore = usePlaybackStore();
	const [showSpeedMenu, setShowSpeedMenu] = useState(false);

	const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

	const handleSkipBackward = () => {
		playbackStore.seek(Math.max(0, playbackStore.currentTime - 10));
	};

	const handleSkipForward = () => {
		playbackStore.seek(
			Math.min(playbackStore.duration, playbackStore.currentTime + 10),
		);
	};

	const handleVolumeChange = (value: number[]) => {
		playbackStore.setVolume(value[0]);
	};

	const handleSpeedChange = (speed: number) => {
		playbackStore.setSpeed(speed);
		setShowSpeedMenu(false);
	};

	return (
		<div
			className={cn(
				"flex items-center justify-between bg-gray-900 border-t border-gray-700 px-4 py-3",
				className,
			)}
		>
			{/* Left Section - Playback Controls */}
			<div className="flex items-center space-x-3">
				{/* Skip Backward */}
				<Button
					variant="ghost"
					size="sm"
					onClick={handleSkipBackward}
					className="text-gray-300 hover:text-white hover:bg-gray-700"
				>
					<SkipBack className="h-4 w-4" />
				</Button>

				{/* Play/Pause */}
				<Button
					variant="ghost"
					size="sm"
					onClick={playbackStore.toggle}
					className="text-gray-300 hover:text-white hover:bg-gray-700 px-3"
				>
					{playbackStore.isPlaying ? (
						<Pause className="h-5 w-5" />
					) : (
						<Play className="h-5 w-5 ml-0.5" />
					)}
				</Button>

				{/* Skip Forward */}
				<Button
					variant="ghost"
					size="sm"
					onClick={handleSkipForward}
					className="text-gray-300 hover:text-white hover:bg-gray-700"
				>
					<SkipForward className="h-4 w-4" />
				</Button>

				{/* Time Display */}
				<div className="text-sm text-gray-300 font-mono min-w-[120px]">
					{formatTime(playbackStore.currentTime)} /{" "}
					{formatTime(playbackStore.duration)}
				</div>
			</div>

			{/* Center Section - Speed Control */}
			<div className="flex items-center space-x-4">
				{/* Speed Control */}
				<div className="relative">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowSpeedMenu(!showSpeedMenu)}
						className="text-gray-300 hover:text-white hover:bg-gray-700 min-w-[60px]"
					>
						<Settings className="h-4 w-4 mr-1" />
						{playbackStore.speed}x
					</Button>

					{/* Speed Menu */}
					{showSpeedMenu && (
						<div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-2 z-10">
							<div className="text-xs text-gray-400 mb-2 text-center">
								Playback Speed
							</div>
							<div className="grid grid-cols-4 gap-1">
								{speedOptions.map((speed) => (
									<Button
										key={speed}
										variant={
											playbackStore.speed === speed ? "default" : "ghost"
										}
										size="sm"
										onClick={() => handleSpeedChange(speed)}
										className={cn(
											"text-xs h-8 w-12",
											playbackStore.speed === speed
												? "bg-blue-600 text-white"
												: "text-gray-300 hover:text-white hover:bg-gray-700",
										)}
									>
										{speed}x
									</Button>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Right Section - Volume Control */}
			<div className="flex items-center space-x-3">
				{/* Volume Control */}
				<div className="flex items-center space-x-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={playbackStore.toggleMute}
						className="text-gray-300 hover:text-white hover:bg-gray-700"
					>
						{playbackStore.muted || playbackStore.volume === 0 ? (
							<VolumeX className="h-4 w-4" />
						) : (
							<Volume2 className="h-4 w-4" />
						)}
					</Button>

					<div className="w-20">
						<Slider
							value={[playbackStore.muted ? 0 : playbackStore.volume]}
							onValueChange={handleVolumeChange}
							max={1}
							step={0.1}
							className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white"
						/>
					</div>

					<span className="text-xs text-gray-400 min-w-[30px]">
						{Math.round((playbackStore.muted ? 0 : playbackStore.volume) * 100)}
						%
					</span>
				</div>
			</div>

			{/* Speed Menu Backdrop */}
			{showSpeedMenu && (
				<div
					className="fixed inset-0 z-0"
					onClick={() => setShowSpeedMenu(false)}
				/>
			)}
		</div>
	);
}
