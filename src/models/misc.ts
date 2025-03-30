type CurrentProofStateType =
	| 'Valid'
	| 'Invalid - Syntax Error'
	| 'Invalid - Proof Error'
	| 'Unchecked'
	| 'Unchecked - Change Present';

type CurrentPageContentType =
	| 'Hoare Logic Proof Validator'
	| 'Reference Guide'
	| 'Settings';

export type {CurrentProofStateType, CurrentPageContentType};
