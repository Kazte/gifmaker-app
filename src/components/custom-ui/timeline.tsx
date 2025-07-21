import { cn } from "@/lib/utils";

interface TimelineProps {
	className?: string;
}

export default function Timeline({ className }: TimelineProps) {
	return (
		<section className={cn("relative h-1.5 w-full bg-muted/50", className)}>
			<div className="absolute inset-0 bg-primary/50" />
		</section>
	);
}
