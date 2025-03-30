type CommonProps = {
	borderWidth: string;
	borderColour: string;
};

type KeyProps = 'valid' | 'invalidSyntax' | 'invalidProof' | 'unchecked';

type ConfigProps = {
	[key in KeyProps]: CommonProps;
};

const options: ConfigProps = {
	valid: {
		borderWidth: 'border-3',
		borderColour: 'border-green-400', // Border-[color]-[shade]
	},
	invalidSyntax: {
		borderWidth: 'border-3',
		borderColour: 'border-red-400',
	},
	invalidProof: {
		borderWidth: 'border-3',
		borderColour: 'border-red-400',
	},
	unchecked: {
		borderWidth: 'border',
		borderColour: 'border-input',
	},
};

export {options, type CommonProps};
