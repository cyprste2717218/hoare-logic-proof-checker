type CurrentProofStateType =
	| 'Valid'
	| 'Invalid - Syntax Error'
	| 'Invalid - Proof Error'
	| 'Unchecked';

export type {CurrentProofStateType};
