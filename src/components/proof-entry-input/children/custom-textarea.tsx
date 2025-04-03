import {forwardRef} from 'react';
import {cn} from '@/lib/utils';

type CustomTextAreaProps = {
	handleTextAreaChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void; // eslint-disable-next-line @typescript-eslint/ban-types
	ref: React.RefObject<HTMLTextAreaElement | null>;
	proofContent: string;
	handleTextAreaScroll: () => void;
} & React.ComponentProps<'textarea'>;

const CustomTextArea = forwardRef<HTMLTextAreaElement, CustomTextAreaProps>(
	(
		{
			name,
			handleTextAreaChange,
			handleTextAreaScroll,
			placeholder,
			proofContent,
			className,
			...props
		},
		ref,
	) => {
		return (
			<textarea
				name={name}
				onChange={handleTextAreaChange}
				ref={ref}
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
	},
);

CustomTextArea.displayName = 'CustomTextArea';

export {CustomTextArea};
