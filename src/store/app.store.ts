import { create } from "zustand";

export type AppState = {
	state: "idle" | "loading" | "ready" | "error" | "executing";
	error: string | null;
	progress: number;
	files: File[] | undefined;
	videoUrl: string | undefined;
};

export type AppActions = {
	setState: (state: AppState["state"]) => void;
	setError: (error: string | null) => void;
	setProgress: (progress: number) => void;
	setFiles: (files: File[] | undefined) => void;
	setVideoUrl: (videoUrl: string | undefined) => void;
};

export interface AppStore extends AppState, AppActions {}

const useAppStore = create<AppStore>((set) => ({
	state: "idle",
	error: null,
	progress: 0,
	files: undefined,
	videoUrl: undefined,
	setState: (state: AppState["state"]) => set({ state }),
	setError: (error: string | null) => set({ error }),
	setProgress: (progress: number) => set({ progress }),
	setFiles: (files: File[] | undefined) => set({ files }),
	setVideoUrl: (videoUrl: string | undefined) => set({ videoUrl }),
}));

export default useAppStore;
