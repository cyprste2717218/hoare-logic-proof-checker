import * as React from 'react';
import {useMemo, useRef, useEffect, useState} from 'react';
import {cn} from '@/lib/utils';
import {type CurrentProofStateType} from '@/models/misc';
import {
	options,
	type CommonProps as BorderStylesType,
} from '@/lib/proof-entry-config-options';

type WrapperTextAreaProps = {
	children: React.ReactNode;
};

type CustomTextAreaProps = {
	handleTextAreaChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void; // eslint-disable-next-line @typescript-eslint/ban-types
	textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
	proofContent: string;
	handleTextAreaScroll: () => void;
} & React.ComponentProps<'textarea'>;

type TextAreaProps = {
	numOfLines: number;
	placeholder?: string;
	name?: string;
	currentProofState: CurrentProofStateType;
	proofContent: string;
	setCurrentProofState: React.Dispatch<
		React.SetStateAction<CurrentProofStateType>
	>;
	setProofContent: React.Dispatch<React.SetStateAction<string>>;
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
	numOfLines,
	placeholder = 'Enter Your Proof Here',
	name,
	currentProofState,
	proofContent,
	setCurrentProofState,
	setProofContent,
	...props
}: TextAreaProps) {
	useEffect(() => {
		switch (currentProofState) {
			case 'Valid': {
				setCustomBorderStyles(handleStylesFormat(options.valid));
				break;
			}

			case 'Invalid - Syntax Error': {
				setCustomBorderStyles(handleStylesFormat(options.invalidSyntax));
				break;
			}

			case 'Invalid - Proof Error': {
				setCustomBorderStyles(handleStylesFormat(options.invalidProof));
				break;
			}

			case 'Unchecked': {
				setCustomBorderStyles(handleStylesFormat(options.unchecked));
				break;
			}

			case 'Unchecked - Change Present': {
				setCustomBorderStyles(handleStylesFormat(options.unchecked));
				break;
			}
		}
	}, [currentProofState]);

	const [customBorderStyles, setCustomBorderStyles] = useState<string>(
		handleStylesFormat(options.unchecked),
	);

	const lineCount = useMemo(
		() => proofContent.split('\n').length,
		[proofContent],
	);
	const linesArr = useMemo(
		() =>
			Array.from({length: Math.max(numOfLines, lineCount)}, (_, i) => i + 1),
		[lineCount, numOfLines],
	);

	const lineCounterRef = useRef<HTMLDivElement>(null);
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	const onValueChange = (value: string) => {
		setProofContent(value);
		setCurrentProofState('Unchecked - Change Present');
	};

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

	// Utility function to make styles parsable for new proof entry box state depending on if checked proof is valid or not
	function handleStylesFormat(obj: BorderStylesType) {
		const styles = Object.values(obj).join(' ');

		return styles;
	}

	return (
		<WrapperTextArea>
			<div className="flex flex-row">
				<LineNumbers className={cn(customBorderStyles)} ref={lineCounterRef}>
					{linesArr.map((count) => (
						<LineNumber key={count} count={count} />
					))}
				</LineNumbers>
				<CustomTextArea
					name={name}
					proofContent={proofContent}
					handleTextAreaChange={handleTextAreaChange}
					textAreaRef={textAreaRef}
					handleTextAreaScroll={handleTextAreaScroll}
					placeholder={placeholder}
					className={cn(customBorderStyles)}
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
	proofContent,
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
			value={proofContent}
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
			message = '';
			break;
		}

		case 'Unchecked - Change Present': {
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
