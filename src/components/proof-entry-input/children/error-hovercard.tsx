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

function AllErrorHoverCards({
	className,
	errorMessages,
	totalNumLines,
}: AllErrorHoverCardProps) {
	const errorLines: number[] = [];
	const hoverCards: HoverCardArray = [];

	for (const message of errorMessages) {
		errorLines.push(message.lineNumber);
	}

	let i = 1;

	while (i <= totalNumLines) {
		let item = <div></div>;

		if (errorLines.includes(i)) {
			item = (
				<ErrorHoverCard
					messages={errorMessages[i - 1].messages}
					lineNumber={errorMessages[i - 1].lineNumber}
				/>
			);
		}

		hoverCards.push(item);
		i++;
	}

	return (
		<div
			className={`${className} ${cn('py-2 px-2 text-slate-400 resize-none text-sm leading-7 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 field-sizing-content rounded-l-md border-r-0 bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm')}`}
		>
			{hoverCards}
		</div>
	);
}

function ErrorHoverCard({messages, lineNumber}: ErrorHoverCardProps) {
	const allErrorMessages = messages.map((message) => {
		return <div>{`-` + message + `\n`}</div>;
	});

	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				<Button variant="link">
					<TriangleAlert />
				</Button>
			</HoverCardTrigger>
			<HoverCardContent className="w-80">
				<b>Error:</b> Syntax Error:
				{allErrorMessages}
				Line: {lineNumber}
			</HoverCardContent>
		</HoverCard>
	);
}

export {ErrorHoverCard, AllErrorHoverCards};
