import {useState} from 'react';
import {TextArea} from './textarea';

export function ProofEntryInput() {
	const [value, setValue] = useState('');
	return (
		<TextArea
			name="proof-entry-input-textarea"
			value={value}
			onValueChange={(value: string) => {
				setValue(value);
			}}
			numOfLines={10}
		/>
	);
}
