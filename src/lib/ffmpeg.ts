import wasmURL from "@ffmpeg/core/wasm?url";
import coreURL from "@ffmpeg/core?url";
import { FFmpeg } from "@ffmpeg/ffmpeg";

let ffmpeg: FFmpeg | null = null;

export const initFFmpeg = async (): Promise<FFmpeg> => {
	if (ffmpeg) return ffmpeg;

	try {
		ffmpeg = new FFmpeg();

		ffmpeg = new FFmpeg();

		await ffmpeg.load({ coreURL, wasmURL });

		console.log("FFmpeg loaded successfully");
		return ffmpeg;
	} catch (error) {
		console.error("Failed to initialize FFmpeg:", error);
		ffmpeg = null; // Reset on error
		throw error;
	}
};

export async function converToGif(
	file: File,
	speed: number = 1,
	onProgress?: (progress: number) => void,
): Promise<Blob> {
	const ffmpeg = await initFFmpeg();

	const inputName = "input.mp4";
	const outputName = "output.gif";

	if (onProgress) {
		ffmpeg.on("progress", (progress) => {
			onProgress(progress.progress * 100);
		});
	}

	await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));

	await ffmpeg.exec([
		"-i",
		inputName,
		"-vf",
		`fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse,setpts=${
			1 / speed
		}*PTS`,
		"-c:v",
		"gif",
		"-loop",
		"0",
		outputName,
	]);

	const fileData = await ffmpeg.readFile(outputName);
	const blob = new Blob([fileData as unknown as ArrayBuffer], {
		type: "image/gif",
	});

	ffmpeg.deleteFile(inputName);
	ffmpeg.deleteFile(outputName);

	return blob;
}
