import * as DialogPrimitive from '@radix-ui/react-dialog';
import {Button} from '@/components/base/button.js';
import {cn} from '@/lib/utils.js';
import type {Z3LoadProgress} from '@/utilities/handle-check-proof-validity/z3-logic/initialise-z3-funcs';

type Z3ReadyOverlayProps = {
	open: boolean;
	progress: Z3LoadProgress | undefined;
	error: Error | undefined;
	onRetry: () => void;
};

function statusText(
	progress: Z3LoadProgress | undefined,
	error: Error | undefined,
) {
	if (error) {
		return error.message;
	}

	if (!progress) {
		return 'Preparing the proof validator…';
	}

	if (progress.phase === 'starting') {
		return 'Starting the Z3 solver…';
	}

	if (progress.total === undefined) {
		return 'Downloading Z3 WebAssembly module…';
	}

	return 'Downloading Z3 WebAssembly module…';
}

function Z3ReadyOverlay({open, progress, error, onRetry}: Z3ReadyOverlayProps) {
	const determinatePercent =
		progress &&
		progress.phase === 'download' &&
		progress.total !== undefined &&
		progress.total > 0
			? Math.min(100, Math.round((progress.loaded / progress.total) * 100))
			: undefined;

	const indeterminate = !error && determinatePercent === undefined;

	return (
		<DialogPrimitive.Root open={open} modal>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay
					className={cn(
						'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[100] bg-black/60',
					)}
				/>
				<DialogPrimitive.Content
					aria-describedby={undefined}
					className={cn(
						'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 bg-background fixed top-1/2 left-1/2 z-[100] grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-6 shadow-lg duration-200',
					)}
					onEscapeKeyDown={(keyboardEvent: KeyboardEvent) => {
						keyboardEvent.preventDefault();
					}}
					onInteractOutside={(pointerEvent: Event) => {
						pointerEvent.preventDefault();
					}}
					onPointerDownOutside={(pointerEvent: Event) => {
						pointerEvent.preventDefault();
					}}
				>
					<DialogPrimitive.Title className="text-foreground text-lg leading-none font-semibold">
						Proof validator not ready
					</DialogPrimitive.Title>
					<p className="text-muted-foreground text-sm">
						The Hoare logic proof checker needs the Z3 WebAssembly module before
						you can enter proofs or run validity checks. Please wait.
					</p>
					<p className="text-foreground text-sm">
						{statusText(progress, error)}
					</p>
					{error ? (
						<Button type="button" variant="outline" onClick={onRetry}>
							Retry
						</Button>
					) : (
						<div className="space-y-2">
							<div
								className="bg-muted h-2 w-full overflow-hidden rounded-full"
								role="progressbar"
								aria-valuemin={0}
								aria-valuemax={100}
								aria-valuenow={determinatePercent}
								aria-valuetext={
									determinatePercent === undefined
										? 'Loading'
										: `${determinatePercent}%`
								}
							>
								<div
									className={cn(
										'bg-primary h-full rounded-full transition-[width] duration-300 ease-out',
										indeterminate && 'z3-wasm-progress-indeterminate w-1/3',
									)}
									style={
										!indeterminate && determinatePercent !== undefined
											? {width: `${determinatePercent}%`}
											: undefined
									}
								/>
							</div>
							{determinatePercent !== undefined && (
								<p className="text-muted-foreground text-xs tabular-nums">
									{determinatePercent}%
								</p>
							)}
						</div>
					)}
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}

export {Z3ReadyOverlay};
