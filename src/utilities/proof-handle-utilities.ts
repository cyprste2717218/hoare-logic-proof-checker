/* eslint-disable no-useless-escape */

import type {ErrorMsg} from '@/models/misc';

type LawType = keyof typeof validRegexFormats;

type RegexFormats = {
	arith: string;
	hskip: string;
};

type HandleProofCheckProps = {
	proofContent: string;
};

const validRegexFormats: RegexFormats = {
	// Pattern matches: expr1 :arith <int>
	arith: '/^[a-z]=[0-9]+\s*→\s*[a-z]=[0-9]+\s*:arith$/',
	// Pattern matches {expr1} expr2 {expr3} :hskip <int>
	hskip: '/^\{([^{}]+)\}\s*([^{}]+)\s*\{([^{}]+)\}\s*:hskip\s+\d+$/',
};

function handleProofSyntaxCheck({
	proofContent,
}: HandleProofCheckProps): ErrorMsg[] {
	const lawSuffixs: LawType[] = ['arith', 'hskip'];
	const errors: ErrorMsg[] = [];

	// Format the proof into array of proof lines and check for syntax errors
	const formattedProofLines = formatProof(proofContent);

	console.log('formatted proof lines:', formattedProofLines);
	const syntaxErrors: ErrorMsg[] = hasFormatErrors(
		formattedProofLines,
		lawSuffixs,
	);

	// Check for any syntax errors and return them, or if no errors return formatted proof lines
	if (syntaxErrors.length > 0) {
		// If the above yields an error then do the following to-dos:
		// to-do: pass up error message objects to new state for error msgs in App.tsx
		// to-do: set currentProofState to 'Invalid - Syntax Error'
		errors.push(...syntaxErrors);
		console.log('Proof does not adhere to syntax');
	} else {
		console.log('Proof adheres to syntax');
	}

	return errors;
}

function formatProof(text: string): string[] {
	const lines: string[] = text.split('\n');
	const trimmedLines: string[] = lines.map((line) => line.trim());

	return trimmedLines;
}

function hasFormatErrors(
	trimmedLines: string[],
	lawSuffixes: LawType[],
): ErrorMsg[] {
	// Check each lines syntax matches up to expected format, if not set the errorMessage
	const errorMessages: ErrorMsg[] = [];

	for (const line of trimmedLines) {
		const lineFormatResult = parseProofLineFormat(line, lawSuffixes);
		if (!lineFormatResult.isValid) {
			const allErrorMessagesForLine: ErrorMsg = {
				messages: lineFormatResult.errors,
				lineNumber: trimmedLines.indexOf(line) + 1,
			};
			errorMessages.push(allErrorMessagesForLine);
		}
	}

	return errorMessages;
}

type DiagnosticsType = {
	isValid: boolean;
	errors: string[];
};

function parseProofLineFormat(
	textLine: string,
	lawSuffixs: LawType[],
): DiagnosticsType {
	type RegexCheckItem = {
		expression: RegExp;
		message: string;
	};

	type AllRegexChecks = Record<string, RegexCheckItem>;

	// Checks if line ends with a particular law suffix
	function checkLawIsPassed(textLine: string, suffix: LawType): boolean {
		const regExPattern = new RegExp(`^.*:${suffix}\\s+\\d+(?:\\s+\\d+)?$`);
		return regExPattern.test(textLine);
	}

	// Checks line adheres to spec for a proof line containing that law
	function checkSpecificLawRegex(
		textLine: string,
		law: LawType,
	): DiagnosticsType {
		function doLawSpecificChecks(
			textLine: string,
			law: LawType,
		): DiagnosticsType {
			function getRelevantChecks(law: string): AllRegexChecks {
				const allChecks: AllRegexChecks = {
					startsBrace: {
						expression: /^{/,
						message: "Must start with '{'",
					},
					firstExpression: {
						expression: /^{([^{}]+)}/,
						message: 'Invalid first expression format',
					},
					middleExpression: {
						expression: /^{[^{}]+}\s*([^{}]+)\s*{/,
						message: 'Invalid middle expression format',
					},
					secondBrace: {
						expression: /{[^{}]*}$/,
						message: 'Must end with properly closed expression in braces',
					},
					endsWithHskip: {
						expression: /:hskip\s+\d+$/,
						message: "Must end with ':hskip' followed by a number",
					},
					hasNumber: {
						expression: /\d+$/,
						message: '',
					},
				};
				type CheckKeys = keyof typeof allChecks;

				let lawChecksList: CheckKeys[] = [];
				const returnChecks: AllRegexChecks = {};
				switch (law) {
					case 'hskip': {
						lawChecksList = [
							'startsBrace',
							'firstExpression',
							'middleExpression',
							'secondBrace',
							'endsWithHskip',
							'hasNumber',
						];
						break;
					}

					case 'arith': {
						lawChecksList = [];
						break;
					}

					default: {
						lawChecksList = [];
					}
				}

				for (const check of lawChecksList) {
					returnChecks[check] = allChecks[check];
					continue;
				}

				return returnChecks;
			}

			const diagnostics: DiagnosticsType = {
				isValid: true,
				errors: [] as string[],
			};

			const checks: AllRegexChecks = getRelevantChecks(law);

			type CheckKeys = keyof typeof checks;
			const checkKeys: CheckKeys[] = [];

			// Check for presence of syntax errors, 'reading' proof line from left to right

			for (const checkName of checkKeys) {
				if (!checks[checkName].expression.test(textLine)) {
					diagnostics.errors.push(checks[checkName].message);
					diagnostics.isValid = false;
				}
			}

			return diagnostics;
		}

		const retrievedDiagnostics: DiagnosticsType = {
			isValid: true,
			errors: [],
		};
		const lawRegex = new RegExp(validRegexFormats[law]);

		if (!lawRegex.test(textLine)) {
			// Do law specific checks
			const {isValid, errors} = doLawSpecificChecks(textLine, law);

			// Set new values for validity and syntax errors discovered
			retrievedDiagnostics.isValid = isValid;
			retrievedDiagnostics.errors = errors;
		}

		return retrievedDiagnostics;
	}

	const retrievedDiagnostics: DiagnosticsType = {
		isValid: true,
		errors: [],
	};

	for (const law of lawSuffixs) {
		console.log('Checking each law suffix, currently checking:', law);
		if (checkLawIsPassed(textLine, law)) {
			// Pass law suffix to method to check against specific regex for expression using that law
			console.log('law:', law, 'is present in textline:', textLine);
			const {isValid, errors} = checkSpecificLawRegex(textLine, law);
			retrievedDiagnostics.isValid = isValid;
			retrievedDiagnostics.errors = errors;
			break;
		} else {
			retrievedDiagnostics.isValid = false;
			retrievedDiagnostics.errors = [
				"Line does not end with a recognised law suffix, e.g. ':hskip <int>'",
			];
		}
	}

	// Setting retrievedDiagnostics to state no rule is recognised after doing initial regex parse with all applicable law suffixes

	return retrievedDiagnostics;
}

export default handleProofSyntaxCheck;
