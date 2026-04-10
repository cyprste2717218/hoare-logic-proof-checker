/// <reference types="vite/client" />

type InitZ3ModuleArg = Record<string, unknown> & {
	wasmBinary?: Uint8Array;
};

type InitZ3Factory = (moduleArg?: InitZ3ModuleArg) => Promise<unknown>;

declare global {
	// Emscripten factory from `public/z3-built.js` (script tag in index.html)
	// eslint-disable-next-line no-var -- TypeScript global merge for browser script
	var initZ3: InitZ3Factory | undefined;
}

export {};
