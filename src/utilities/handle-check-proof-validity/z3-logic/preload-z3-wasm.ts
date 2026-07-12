/* eslint-disable no-await-in-loop -- stream must be consumed sequentially */
export type PreloadZ3WasmMode = 'determinate' | 'indeterminate';

export type PreloadZ3WasmResult = {
	arrayBuffer: ArrayBuffer;
	mode: PreloadZ3WasmMode;
};

async function readStreamToChunks(
	reader: ReadableStreamDefaultReader<Uint8Array>,
	onChunk: (byteLength: number) => void,
): Promise<Uint8Array[]> {
	const chunks: Uint8Array[] = [];
	let streamDone = false;
	while (!streamDone) {
		const chunk = await reader.read();
		streamDone = chunk.done;
		if (streamDone) {
			break;
		}

		const value = chunk.value!;
		chunks.push(value);
		onChunk(value.byteLength);
	}

	return chunks;
}

function mergeChunks(
	chunks: Uint8Array[],
	totalByteLength: number,
): ArrayBuffer {
	const merged = new Uint8Array(totalByteLength);
	let offset = 0;
	for (const chunk of chunks) {
		merged.set(chunk, offset);
		offset += chunk.byteLength;
	}

	return merged.buffer;
}

/**
 * Fetches the Z3 WASM binary and reports byte progress when Content-Length is available.
 * Without a known total, streams the body and reports loaded bytes with total undefined (indeterminate UI).
 */
export async function preloadZ3Wasm(
	wasmUrl: string,
	onProgress?: (loaded: number, total: number | undefined) => void,
): Promise<PreloadZ3WasmResult> {
	const response = await fetch(wasmUrl, {credentials: 'same-origin'});
	if (!response.ok) {
		throw new Error(
			`Failed to fetch WASM (${response.status} ${response.statusText})`,
		);
	}

	const contentLength = response.headers.get('content-length');
	const parsedTotal = contentLength
		? Number.parseInt(contentLength, 10)
		: Number.NaN;
	const total =
		Number.isFinite(parsedTotal) && parsedTotal > 0 ? parsedTotal : undefined;
	const body = response.body;

	if (!body) {
		onProgress?.(0, undefined);
		const arrayBuffer = await response.arrayBuffer();
		onProgress?.(arrayBuffer.byteLength, arrayBuffer.byteLength);
		return {arrayBuffer, mode: 'indeterminate'};
	}

	if (total === undefined) {
		onProgress?.(0, undefined);
		const reader = body.getReader();
		let loaded = 0;
		const chunks = await readStreamToChunks(reader, (delta) => {
			loaded += delta;
			onProgress?.(loaded, undefined);
		});
		return {
			arrayBuffer: mergeChunks(chunks, loaded),
			mode: 'indeterminate',
		};
	}

	const reader = body.getReader();
	let loaded = 0;
	const chunks = await readStreamToChunks(reader, (delta) => {
		loaded += delta;
		onProgress?.(loaded, total);
	});
	return {
		arrayBuffer: mergeChunks(chunks, loaded),
		mode: 'determinate',
	};
}
