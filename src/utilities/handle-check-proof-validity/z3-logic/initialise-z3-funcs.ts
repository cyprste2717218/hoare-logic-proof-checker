/* eslint-disable @typescript-eslint/naming-convention -- Needed as export names from Z3 package are uppercase and renaming to strictCamelCase aliases could be confusing */

/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package */

import {init} from 'z3-solver';
import {preloadZ3Wasm} from '@/utilities/handle-check-proof-validity/z3-logic/preload-z3-wasm';

export type Z3LoadProgress = {
	loaded: number;
	total: number | undefined;
	phase: 'download' | 'starting';
};

let z3Context: any;
let z3Api: Awaited<ReturnType<typeof init>> | undefined;
let z3InitPromise: Promise<void> | undefined;

/**
 * Clears cached Z3 initialization so the next `ensureZ3Ready` runs again (e.g. after a failed load).
 */
export function resetZ3Initialization(): void {
	z3InitPromise = undefined;
	z3Api = undefined;
	z3Context = undefined;
}

/**
 * Ensures `z3-solver` `init()` has completed once (browser: optional WASM preload + `wasmBinary` injection).
 * Safe to call from multiple places; shares one in-flight promise.
 */
export async function ensureZ3Ready(
	onProgress?: (progress: Z3LoadProgress) => void,
): Promise<void> {
	z3InitPromise ??= runZ3Initialization(onProgress).catch((error: unknown) => {
		z3InitPromise = undefined;
		z3Api = undefined;
		throw error instanceof Error ? error : new Error(String(error));
	});
	await z3InitPromise;
}

async function runZ3Initialization(
	onProgress?: (progress: Z3LoadProgress) => void,
): Promise<void> {
	if (z3Api) {
		return;
	}

	if (typeof globalThis.initZ3 !== 'function') {
		onProgress?.({loaded: 0, total: undefined, phase: 'download'});
		z3Api = await init();
		onProgress?.({loaded: 1, total: 1, phase: 'starting'});
		return;
	}

	onProgress?.({loaded: 0, total: undefined, phase: 'download'});
	const {arrayBuffer} = await preloadZ3Wasm(
		'/z3-built.wasm',
		(loaded, total) => {
			onProgress?.({loaded, total, phase: 'download'});
		},
	);

	const wasmBinary = new Uint8Array(arrayBuffer);
	const originalInitZ3 = globalThis.initZ3;
	globalThis.initZ3 = (opts: Record<string, unknown> = {}) =>
		// Emscripten factory; global script is untyped
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- initZ3 from z3-built.js
		originalInitZ3({...opts, wasmBinary});

	try {
		onProgress?.({
			loaded: wasmBinary.byteLength,
			total: wasmBinary.byteLength,
			phase: 'starting',
		});
		z3Api = await init();
	} finally {
		globalThis.initZ3 = originalInitZ3;
	}
}

async function getZ3Context() {
	if (!z3Context) {
		await ensureZ3Ready();
		if (!z3Api) {
			throw new Error('Z3 failed to initialize');
		}

		const {Context} = z3Api;

		// @ts-expect-error z3 package doesn't provide typing for these constructs at current v4.14.1
		z3Context = new Context('main');
	}

	return z3Context;
}

async function initialiseContext() {
	const context = await getZ3Context();

	const {Int, And, Solver, Not, Implies} = context;

	return [Int, And, Solver, Not, Implies];
}

export {initialiseContext};
