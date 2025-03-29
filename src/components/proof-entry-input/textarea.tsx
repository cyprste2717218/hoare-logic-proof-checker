import * as React from 'react';
import {useMemo, useRef} from 'react';
import {cn} from '@/lib/utils';
import {type CurrentProofStateType} from '@/models/misc';

type WrapperTextAreaProps = {
	children: React.ReactNode;
};

type CustomTextAreaProps = {
	handleTextAreaChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void; // eslint-disable-next-line @typescript-eslint/ban-types
	textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
	handleTextAreaScroll: () => void;
} & React.ComponentProps<'textarea'>;

type TextAreaProps = {
	value: string;
	numOfLines: number;
	onValueChange: (value: string) => void;
	placeholder?: string;
	name?: string;
	currentProofState: CurrentProofStateType;
} & React.ComponentProps<'textarea'>;

type LineNumbersProps = {
	className: string;
	children: React.ReactNode;
} & React.ComponentProps<'div'>;

type LineNumberElemProps = {
	count: number;
};

type ProofOutcomeTextProps = {
	currentProofState: CurrentProofStateType;
};

function TextArea({
	className,
	value,
	numOfLines,
	onValueChange,
	placeholder = 'Enter Your Proof Here',
	name,
	currentProofState,
	...props
}: TextAreaProps) {
	const lineCount = useMemo(() => value.split('\n').length, [value]);
	const linesArr = useMemo(
		() =>
			Array.from({length: Math.max(numOfLines, lineCount)}, (_, i) => i + 1),
		[lineCount, numOfLines],
	);

	const lineCounterRef = useRef<HTMLDivElement>(null);
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	const handleTextAreaChange = (
		event: React.ChangeEvent<HTMLTextAreaElement>,
	) => {
		onValueChange(event.target.value);
	};

	const handleTextAreaScroll = () => {
		if (lineCounterRef.current && textAreaRef.current) {
			lineCounterRef.current.scrollTop = textAreaRef.current.scrollTop;
		}
	};

	return (
		<WrapperTextArea>
			<div className="flex flex-row">
				<LineNumbers className={cn(className)} ref={lineCounterRef}>
					{linesArr.map((count) => (
						<LineNumber key={count} count={count} />
					))}
				</LineNumbers>
				<CustomTextArea
					name={name}
					handleTextAreaChange={handleTextAreaChange}
					textAreaRef={textAreaRef}
					handleTextAreaScroll={handleTextAreaScroll}
					placeholder={placeholder}
					value={value}
					className={cn(className)}
					{...props}
				/>
			</div>
			<ProofOutcomeText currentProofState={currentProofState} />
		</WrapperTextArea>
	);
}

function WrapperTextArea({children}: WrapperTextAreaProps) {
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				flexDirection: 'column',
			}}
		>
			{children}
		</div>
	);
}

function LineNumbers({children, className}: LineNumbersProps) {
	return (
		<div
			className={`${className} ${cn('py-2 px-2 text-slate-400 resize-none text-sm leading-7 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 field-sizing-content rounded-l-md border-r-0 bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm')}`}
		>
			{children}
		</div>
	);
}

function LineNumber({count}: LineNumberElemProps) {
	return (
		<div key={count}>
			<p className="text-sm leading-7 [&:not(:first-child)]:mt-6">{count}</p>
		</div>
	);
}

function CustomTextArea({
	name,
	handleTextAreaChange,
	textAreaRef,
	handleTextAreaScroll,
	placeholder,
	value,
	className,
	...props
}: CustomTextAreaProps) {
	return (
		<textarea
			name={name}
			onChange={handleTextAreaChange}
			ref={textAreaRef}
			onScroll={handleTextAreaScroll}
			placeholder={placeholder}
			value={value}
			wrap="off"
			data-slot="textarea"
			className={`${className} ${cn(
				'resize-none text-sm leading-7 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content w-full rounded-r-md border-l-0 bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
			)}`}
			style={{lineHeight: '28px', height: 'auto', minHeight: '28px'}}
			{...props}
		/>
	);
}

function ProofOutcomeText({currentProofState}: ProofOutcomeTextProps) {
	let message = '';

	switch (currentProofState) {
		case 'Valid': {
			message = 'Provided Proof is Valid!';
			break;
		}

		case 'Invalid - Syntax Error':
		case 'Invalid - Proof Error': {
			message = 'Provided Proof is not valid';
			break;
		}

		case 'Unchecked': {
			message =
				'Detected change to proof body,  run checker again to assure validity';
			break;
		}
	}

	return (
		<div className="text-left m-3 ml-2">
			<p className={cn('text-sm text-slate-500')}>{message}</p>
		</div>
	);
}

export {TextArea};
