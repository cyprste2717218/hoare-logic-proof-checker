import {useState, useEffect} from 'react';
import {TextArea} from './textarea';
import {type CurrentProofStateType} from '@/models/misc';
import {
	options,
	type CommonProps as BorderStylesType,
} from '@/lib/proof-entry-config-options';

export function ProofEntryInput({
	currentProofState,
}: {
	currentProofState: CurrentProofStateType;
}) {
	const [value, setValue] = useState('');
	const [customBorderStyles, setCustomBorderStyles] = useState<string>(
		handleStylesFormat(options.unchecked),
	);

	// Utility function to make styles parsable for new proof entry box state depending on if checked proof is valid or not
	function handleStylesFormat(obj: BorderStylesType) {
		const styles = Object.values(obj).join(' ');

		return styles;
	}

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
		}
	}, [currentProofState]);

	return (
		<TextArea
			name="proof-entry-input-textarea"
			value={value}
			currentProofState={currentProofState}
			onValueChange={(value: string) => {
				setValue(value);
			}}
			numOfLines={10}
			className={customBorderStyles}
		/>
	);
}
