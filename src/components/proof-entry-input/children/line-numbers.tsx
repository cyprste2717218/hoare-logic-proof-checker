import {forwardRef, type RefObject} from 'react';
import {cn} from '@/lib/utils';

type LineNumbersProps = {
	className: string;
	children: React.ReactNode;
	// Note: Disabling ban-types rule for next line below only as can't allow for ref to be undefined due to how react handles mount/unmount of refs, i.e. requi possible null type
	// eslint-disable-next-line @typescript-eslint/ban-types
	ref: RefObject<HTMLDivElement | null>;
};

type LineNumberElemProps = {
	count: number;
};

const LineNumbers = forwardRef<HTMLDivElement, LineNumbersProps>(
	({children, className}, ref) => {
		return (
			<div
				className={`${className} ${cn('py-2 px-2 text-slate-400 resize-none text-sm leading-7 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 field-sizing-content rounded-l-md border-r-0 bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm')}`}
				ref={ref}
			>
				{children}
			</div>
		);
	},
);

function LineNumber({count}: LineNumberElemProps) {
	return (
		<div key={'lineNum-' + count}>
			<p className="text-sm leading-7 [&:not(:first-child)]:mt-6">{count}</p>
		</div>
	);
}

export {LineNumbers, LineNumber};
