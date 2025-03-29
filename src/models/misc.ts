type CurrentProofStateType =
	| 'Valid'
	| 'Invalid - Syntax Error'
	| 'Invalid - Proof Error'
	| 'Unchecked'
	| 'Unchecked - Change Present';

export type {CurrentProofStateType};
