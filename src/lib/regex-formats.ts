/* eslint-disable no-useless-escape */
import type {LawType, AllRegexChecks} from '@/models/misc';

const validRegexFormats: LawType = {
	hoareLaws: {
		// Pattern matches {expr1} expr2 {expr3} :hskip <int>
		hskip: '/^\{([^{}]+)\}\s*([^{}]+)\s*\{([^{}]+)\}\s*:hskip\s+\d+$/',
		// Pattern matches {expr1} expr2 {expr3} :hseq <int>
		hseq: '/^\{([^{}]+)\}\s*([^{}]+)\s*\{([^{}]+)\}\s*:hseq\s+\d+$/',
		// Pattern matches {expr1} expr2 {expr3} :hassign <int>
		hassign: '/^\{([^{}]+)\}\s*([^{}]+)\s*\{([^{}]+)\}\s*:hassign\s+\d+$/',
		// Pattern matches {expr1} expr2 {expr3} :hcond <int> <int>
		hcond: '/.*:hcond\s*[0-9]{1,2}\s*[0-9]{1,2}$/',
		// Pattern matches {expr1} expr2 {expr3} :hwhile <int>
		hwhile: '/^\{([^{}]+)\}\s*([^{}]+)\s*\{([^{}]+)\}\s*:hskip\s+\d+$/',
	},
	other: {
		// Pattern matches: expr1 :arith
		arith: '/.*:arith$/',
		// Pattern matches: expr1 :subst <int>
		subst: '/.*:subst\s*[0-9]{1,2}$/',
		// Pattern matches: expr1 :simpf <int>
		simpf: '/.*:simpf\s*[0-9]{1,2}$/',
	},
};

const allChecks: AllRegexChecks = {
	preConditionOpenCloseBraces: {
		expression: /^{[^{}]*}/,
		message:
			"Precondition does not contain both closing and opening braces, '{}'",
	},
	preConditionBody: {
		expression:
			/^(?:[a-zA-Z]+(?:[<>]=?|=)[a-zA-Z\d](?:\s*\/\\\s*[a-zA-Z]+(?:[<>]=?|=)[a-zA-Z\d])*|T)$/,
		message:
			'Precondition body is incorrectly formatted, should be singular/list of expressions of form <expr><operator><expr> delimited by /\\, e.g. x=2 /\\ y>=3',
	},
	postConditionOpenCloseBraces: {
		expression: /^{[^{}]*}.*$/,
		message:
			"Postcondition does not contain both closing and opening braces, '{}'",
	},
	postConditionBody: {
		expression:
			/^[a-zA-Z]+(?:[<>]=?|=)[a-zA-Z\d](?:\s*\/\\\s*[a-zA-Z]+(?:[<>]=?|=)[a-zA-Z\d])*$/,
		message:
			'Postcondition body is incorrectly formatted, should be singular/list of expressions of form <expr><operator><expr> delimited by /\\, e.g. x=2 /\\ y>=3',
	},
	programBody: {
		expression:
			/^[a-zA-Z]+(?:[<>]=?|=|:=)[a-zA-Z\d](?:\s*\/\\\s*[a-zA-Z]+(?:[<>]=?|=|:=)[a-zA-Z\d])*$/,
		message:
			'Program supplied to triple is incorrectly formatted, should be a single expression or a list of expressions of the form <expr><operator><expr> delimited by /\\, e.g. x:=3',
	},
};

export {validRegexFormats, allChecks};
