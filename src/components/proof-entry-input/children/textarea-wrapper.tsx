import * as React from 'react';
import {useMemo, useRef, useEffect, useState} from 'react';
import {cn} from '@/lib/utils';
import {type CurrentProofStateType, type ErrorMsg} from '@/models/misc';
import {
	options,
	type CommonProps as BorderStylesType,
} from '@/lib/proof-entry-config-options';
import {ProofOutcomeText} from '@/components/proof-entry-input/children/proof-outcome-text';
import {
	LineNumbers,
	LineNumber,
} from '@/components/proof-entry-input/children/line-numbers';
import {AllErrorHoverCards} from '@/components/proof-entry-input/children/error-hovercard';
import {CustomTextArea} from '@/components/proof-entry-input/children/custom-textarea';

type WrapperTextAreaProps = {
	children: React.ReactNode;
};

type TextAreaProps = {
	numOfLines: number;
	placeholder?: string;
	name?: string;
	currentProofState: CurrentProofStateType;
	proofContent: string;
	proofErrors: ErrorMsg[];
	setCurrentProofState: React.Dispatch<
		React.SetStateAction<CurrentProofStateType>
	>;
	setProofContent: React.Dispatch<React.SetStateAction<string>>;
} & React.ComponentProps<'textarea'>;

function TextAreaWrapper({
	className,
	numOfLines,
	placeholder = 'Enter Your Proof Here',
	name,
	currentProofState,
	proofContent,
	proofErrors,
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
				<AllErrorHoverCards
					className={cn(customBorderStyles)}
					errorMessages={proofErrors}
					totalNumLines={lineCount}
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

export {TextAreaWrapper};
