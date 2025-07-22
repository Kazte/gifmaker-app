import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { ArrowRightIcon, LoaderIcon, TrashIcon, VideoIcon } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import PlaybackControls from "./components/custom-ui/playback-controls";
import Timeline from "./components/custom-ui/timeline";
import VideoPlayer from "./components/custom-ui/video-player";
import { Button } from "./components/ui/button";
import {
	Dropzone,
	DropzoneContent,
	DropzoneEmptyState,
} from "./components/ui/shadcn-io/dropzone";
import { converToGif, initFFmpeg } from "./lib/ffmpeg";
import useAppStore from "./store/app.store";
import usePlaybackStore from "./store/playback.store";

function App() {
	const appStore = useAppStore();
	const playbackStore = usePlaybackStore();
	const ffmpegRef = useRef<FFmpeg | null>(null);

	const load = useCallback(async () => {
		try {
			appStore.setState("loading");

			const ffmpeg = await initFFmpeg();
			ffmpegRef.current = ffmpeg;

			ffmpeg.on("log", (log) => {
				console.log("ffmpeg log", log);
			});

			appStore.setState("ready");
		} catch (e) {
			console.error("FFmpeg initialization error:", e);
			appStore.setError(e instanceof Error ? e.message : "Unknown error");
			appStore.setState("error");
		}
	}, [appStore]);

	const transcode = async () => {
		if (!ffmpegRef.current) {
			appStore.setError("FFmpeg not initialized");
			appStore.setState("error");
			return;
		}

		try {
			appStore.setState("executing");
			appStore.setProgress(0);

			const blob = await converToGif(
				appStore.files?.[0]!,
				{
					speed: playbackStore.speed,
					trimStart: playbackStore.trimStart,
					trimEnd: playbackStore.trimEnd,
				},
				(progress) => {
					appStore.setProgress(progress);
				},
			);

			// download the video
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = "output.gif";
			link.click();

			// clean up
			URL.revokeObjectURL(link.href);
		} catch (e) {
			console.error("Transcoding error:", e);
			appStore.setError(e instanceof Error ? e.message : "Transcoding failed");
			appStore.setState("error");
		} finally {
			appStore.setState("ready");
			appStore.setProgress(0);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: This is a one-time effect
	useEffect(() => {
		load();
	}, []);

	if (appStore.state === "idle") {
		return null;
	}

	if (appStore.state === "loading") {
		return (
			<div className="flex flex-col justify-center items-center min-h-dvh gap-2">
				<LoaderIcon className="animate-spin" />
				<p>Loading ffmpeg...</p>
			</div>
		);
	}

	if (appStore.state === "executing") {
		return (
			<div className="flex flex-col justify-center items-center min-h-dvh gap-2">
				<LoaderIcon className="animate-spin" />
				<p>Converting to GIF...</p>
				<p className="text-sm text-gray-500">
					{Math.round(appStore.progress)}%
				</p>
			</div>
		);
	}

	if (appStore.state === "error") {
		return (
			<div className="flex flex-col justify-center items-center min-h-dvh gap-2">
				<p>Error</p>
				<p className="text-sm text-gray-500">{appStore.error}</p>
			</div>
		);
	}

	const handleDrop = (files: File[]) => {
		appStore.setFiles(files);
		appStore.setVideoUrl(URL.createObjectURL(files[0]));
	};

	return (
		<>
			<header className="flex justify-between items-center min-h-16 px-4 border-b">
				<div className="flex items-center gap-2">
					<VideoIcon className="w-6 h-6" />
					<h1 className="text-2xl font-bold">gifmaker</h1>
				</div>
				<div className="flex items-center gap-2">
					<Button
						onClick={() => appStore.setFiles(undefined)}
						variant="outline"
						disabled={!appStore.files}
					>
						<TrashIcon />
						Delete
					</Button>
					<Button onClick={transcode} disabled={!appStore.files}>
						<ArrowRightIcon />
						Transcode
					</Button>
				</div>
			</header>
			{appStore.files ? (
				<main className="flex-1 flex flex-col items-center justify-center p-4 gap-2">
					<VideoPlayer />
					<Timeline />
					<PlaybackControls />
				</main>
			) : (
				<main className="flex flex-col justify-center items-center gap-4 flex-grow m-10">
					<Dropzone
						maxFiles={1}
						maxSize={1 * 1024 * 1024 * 1024} // 1GB
						accept={{ "video/*": [] }}
						onDrop={handleDrop}
						src={appStore.files}
						onError={console.error}
						className="cursor-pointer"
					>
						<DropzoneEmptyState />
						<DropzoneContent />
					</Dropzone>
				</main>
			)}
		</>
	);
}

export default App;
