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

type ErrorMsg = {
	messages: string[];
	lineNumber: number;
};

export type {CurrentProofStateType, CurrentPageContentType, ErrorMsg};
