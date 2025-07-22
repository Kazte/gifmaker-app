import {
	PauseIcon,
	PlayIcon,
	SkipBackIcon,
	ScissorsIcon,
	RotateCcwIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import usePlaybackStore from "@/store/playback.store";
import { formatTime } from "@/lib/time";

interface PlaybackControlsProps {
	className?: string;
}

export default function PlaybackControls({ className }: PlaybackControlsProps) {
	const playbackStore = usePlaybackStore();

	function handlePlay() {
		playbackStore.toggle();
	}

	function handleSetTrimStart() {
		playbackStore.setTrimStart(playbackStore.currentTime);
	}

	function handleSetTrimEnd() {
		playbackStore.setTrimEnd(playbackStore.currentTime);
	}

	function handleResetTrim() {
		playbackStore.resetTrim();
	}

	const hasTrimPoints =
		playbackStore.trimStart > 0 ||
		playbackStore.trimEnd < playbackStore.duration;

	return (
		<section className={cn("flex flex-col gap-2 p-4", className)}>
			<div className="flex items-center justify-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={handleSetTrimStart}
					title="Set trim start at current time (Press I)"
				>
					<ScissorsIcon className="w-4 h-4 mr-1" />
					In
				</Button>
				<Button variant="outline" size="sm">
					<SkipBackIcon />
				</Button>
				<Button variant="outline" size="sm" onClick={handlePlay}>
					{playbackStore.isPlaying ? <PauseIcon /> : <PlayIcon />}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={handleSetTrimEnd}
					title="Set trim end at current time (Press O)"
				>
					<ScissorsIcon className="w-4 h-4 mr-1" />
					Out
				</Button>
			</div>
		</section>
	);
}
