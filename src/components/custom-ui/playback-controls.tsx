import { PlayIcon, SkipBackIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface PlaybackControlsProps {
	className?: string;
}

export default function PlaybackControls({ className }: PlaybackControlsProps) {
	return (
		<section className={cn("flex items-center gap-2", className)}>
			<div className="flex items-center gap-2">
				<Button variant="outline" size="icon">
					<SkipBackIcon />
				</Button>
				<Button variant="outline" size="icon">
					<PlayIcon />
				</Button>
			</div>
		</section>
	);
}
