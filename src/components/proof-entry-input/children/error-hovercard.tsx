import {TriangleAlert} from 'lucide-react';
import {type ReactElement} from 'react';
import {cn} from '@/lib/utils';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/base/hover-card';
import {Button} from '@/components/base/button';
import type {ErrorMsg} from '@/models/misc';

type AllErrorHoverCardProps = {
	className: string;
	errorMessages: ErrorMsg[];
	totalNumLines: number;
};

type HoverCardArray = ReactElement[];

type ErrorHoverCardProps = ErrorMsg;

type GenerateHoverCardsProps = {
	errorMessages: ErrorMsg[];
	totalNumLines: number;
};

// To-do: move this function to utilities dir
function generateHoverCards({
	errorMessages,
	totalNumLines,
}: GenerateHoverCardsProps): HoverCardArray {
	const errorLines: number[] = [];
	const returnedHoverCards: HoverCardArray = [];

	for (const message of errorMessages) {
		errorLines.push(message.lineNumber);
	}

	let i = 1;
	while (i <= totalNumLines) {
		let item = (
			<div
				className="text-sm leading-7 [&:not(:first-child)]:mt-6"
				key={`empty-error-item-line-${i}`}
			></div>
		);

		if (errorLines.includes(i)) {
			const findErrorByLine = (
				lineNumber: number,
				errorMessages: ErrorMsg[],
			): ErrorMsg | undefined => {
				return errorMessages.find((error) => error.lineNumber === lineNumber);
			};

			const result = findErrorByLine(i, errorMessages);

			if (result) {
				const {messages, lineNumber} = result;
				item = (
					<div className="h-5">
						<ErrorHoverCard
							messages={messages}
							lineNumber={lineNumber}
							key={`error-item-line-${i}`}
						/>
					</div>
				);
			} else {
				throw new Error(
					'Error: unable to find Error object for given line number',
				);
			}
		}

		returnedHoverCards.push(item);
		i++;
	}

	return returnedHoverCards;
}

function AllErrorHoverCards({
	className,
	errorMessages,
	totalNumLines,
}: AllErrorHoverCardProps) {
	let hoverCards: HoverCardArray = [];

	// Handling any errors encountered generating hover cards to render, in which case not rendering elements
	try {
		hoverCards = generateHoverCards({errorMessages, totalNumLines});
	} catch {
		console.error('Error encountered genereating error hover cards');
	}

	return (
		<div
			className={`${className} ${cn('py-2 px-2 w-20 text-slate-400 resize-none text-sm leading-7 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 field-sizing-content rounded-r-md border-l-0 bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm')}`}
		>
			{hoverCards}
		</div>
	);
}

function ErrorHoverCard({messages, lineNumber}: ErrorHoverCardProps) {
	const allErrorMessages = messages.map((message) => {
		return <div key={`error-message-${message}`}>{`-` + message + `\n`}</div>;
	});

	return (
		<HoverCard>
			<HoverCardTrigger>
				<Button variant="link">
					<TriangleAlert color="#ca1b00" />
				</Button>
			</HoverCardTrigger>
			<HoverCardContent>
				<b>Error:</b> Syntax Error:
				{allErrorMessages}
				Line: {lineNumber}
			</HoverCardContent>
		</HoverCard>
	);
}

export {ErrorHoverCard, AllErrorHoverCards};
