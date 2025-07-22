import { create } from "zustand";
import type { PlaybackControls, PlaybackState } from "@/types/playback";

interface PlaybackStore extends PlaybackState, PlaybackControls {
	setDuration: (duration: number) => void;
	setCurrentTime: (time: number) => void;
}

let playbackTimer: number | null = null;

const startTimer = (store: () => PlaybackStore) => {
	if (playbackTimer) cancelAnimationFrame(playbackTimer);

	// Use requestAnimationFrame for smoother updates
	const updateTime = () => {
		const state = store();
		if (state.isPlaying && state.currentTime < state.duration) {
			const now = performance.now();
			const delta = (now - lastUpdate) / 1000; // Convert to seconds
			lastUpdate = now;

			const newTime = state.currentTime + delta * state.speed;
			if (newTime >= state.duration) {
				// When video completes, pause and reset playhead to start
				state.pause();
				state.setCurrentTime(0);
				// Notify video elements to sync with reset
				window.dispatchEvent(
					new CustomEvent("playback-seek", { detail: { time: 0 } }),
				);
			} else {
				state.setCurrentTime(newTime);
				// Notify video elements to sync
				window.dispatchEvent(
					new CustomEvent("playback-update", { detail: { time: newTime } }),
				);
			}
		}
		playbackTimer = requestAnimationFrame(updateTime);
	};

	let lastUpdate = performance.now();
	playbackTimer = requestAnimationFrame(updateTime);
};

const stopTimer = () => {
	if (playbackTimer) {
		cancelAnimationFrame(playbackTimer);
		playbackTimer = null;
	}
};

const usePlaybackStore = create<PlaybackStore>((set, get) => ({
	isPlaying: false,
	currentTime: 0,
	duration: 0,
	volume: 1,
	speed: 1,
	muted: false,
	previousVolume: 1,
	trimStart: 0,
	trimEnd: 0,

	play: () => {
		set({ isPlaying: true });
		startTimer(get);
	},
	pause: () => {
		set({ isPlaying: false });
		stopTimer();
	},
	toggle: () => {
		const { isPlaying } = get();
		if (isPlaying) {
			get().pause();
		} else {
			get().play();
		}
	},
	seek: (time: number) => {
		const { duration } = get();
		const clampedTime = Math.max(0, Math.min(time, duration));
		set({ currentTime: clampedTime });

		// notify video elements to sync
		const playbackSeekEvent = new CustomEvent("playback-seek", {
			detail: { time: clampedTime },
		});
		window.dispatchEvent(playbackSeekEvent);
	},

	setVolume: (volume: number) => {
		set((state) => ({
			volume: Math.max(0, Math.min(volume, 1)),
			muted: volume === 0,
			previousVolume: volume > 0 ? volume : state.previousVolume,
		}));
	},

	setSpeed: (speed: number) => {
		const newSpeed = Math.max(0.1, Math.min(speed, 5));
		set({ speed: newSpeed });

		const playbackSpeedEvent = new CustomEvent("playback-speed", {
			detail: { speed: newSpeed },
		});
		window.dispatchEvent(playbackSpeedEvent);
	},

	setDuration: (duration: number) => set({ duration, trimEnd: duration }),

	setCurrentTime: (time: number) => set({ currentTime: time }),

	mute: () => {
		const { volume, previousVolume } = get();

		set({
			muted: true,
			volume: 0,
			previousVolume: volume > 0 ? volume : previousVolume,
		});
	},

	unmute: () => {
		const { previousVolume } = get();

		set({
			muted: false,
			volume: previousVolume ?? 1,
		});
	},

	toggleMute: () => {
		const { muted } = get();

		if (muted) {
			get().unmute();
		} else {
			get().mute();
		}
	},

	setTrimStart: (time: number) => {
		const { duration, trimEnd } = get();
		const clampedTime = Math.max(0, Math.min(time, trimEnd || duration));
		set({ trimStart: clampedTime });
	},

	setTrimEnd: (time: number) => {
		const { duration, trimStart } = get();
		const clampedTime = Math.max(trimStart, Math.min(time, duration));
		set({ trimEnd: clampedTime });
	},

	resetTrim: () => {
		const { duration } = get();
		set({ trimStart: 0, trimEnd: duration });
	},
}));

export default usePlaybackStore;
