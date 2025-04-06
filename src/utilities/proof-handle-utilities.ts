/* eslint-disable no-useless-escape */


import type {ErrorMsg} from '@/models/misc';

type LawType = {
	hoareLaws: {
		hskip: string;
	};
	other: {
		arith: string;
	};
};

type LawTypeKeys = keyof LawType['hoareLaws'] | keyof LawType['other'];

type HandleProofCheckProps = {
	proofContent: string;
};

const validRegexFormats: LawType = {
	hoareLaws: {
		// Pattern matches {expr1} expr2 {expr3} :hskip <int>
		hskip: '/^\{([^{}]+)\}\s*([^{}]+)\s*\{([^{}]+)\}\s*:hskip\s+\d+$/',
	},
	other: {
		// Pattern matches: expr1 :arith <int>
		arith: '/^[a-z]=[0-9]+\s*→\s*[a-z]=[0-9]+\s*:arith$/',
	},
};

function handleProofSyntaxCheck({
	proofContent,
}: HandleProofCheckProps): ErrorMsg[] {
	const lawSuffixs: LawTypeKeys[] = [
		...(Object.keys(validRegexFormats.hoareLaws) as LawTypeKeys[]),
		...(Object.keys(validRegexFormats.other) as LawTypeKeys[]),
	];
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
	lawSuffixes: LawTypeKeys[],
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
	lawSuffixs: LawTypeKeys[],
): DiagnosticsType {
	type RegexCheckItem = {
		expression: RegExp;
		message: string;
	};

	type AllRegexChecks = Record<string, RegexCheckItem>;

	// Checks if line ends with a particular law suffix
	function checkLawIsPassed(textLine: string, suffix: LawTypeKeys): boolean {
		const regExPattern = new RegExp(`^.*:${suffix}\\s+\\d+(?:\\s+\\d+)?$`);
		return regExPattern.test(textLine);
	}

	// Checks line adheres to spec for a proof line containing that law
	function checkSpecificLawRegex(
		textLine: string,
		law: LawTypeKeys,
	): DiagnosticsType {
		function checkLawGroup(key: LawTypeKeys): keyof LawType {
			if (key in validRegexFormats.hoareLaws) {
				return 'hoareLaws';
			}

			return 'other';
		}

		function doLawSpecificChecks(
			textLine: string,
			lawGroup: keyof LawType,
			law: LawTypeKeys,
		): DiagnosticsType {
			function getRelevantChecks(law: LawTypeKeys): AllRegexChecks {
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
						expression: /^{[^{}]*}[^{}]*{[^{}]*}$/,
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
							'preConditionOpenCloseBraces',
							'preConditionBody',
							'programBody',
							'postConditionOpenCloseBraces',
							'postConditionBody',
						];
						break;
					}

					case 'arith': {
						lawChecksList = [];
						break;
					}

				}

				for (const check of lawChecksList) {
					returnChecks[check] = allChecks[check];
					continue;
				}

				return returnChecks;
			}

			// Methods for extracting specific sections of proof lines
			function extractBeforeSuffix(
				text: string,
				suffix: string,
			): string | undefined {
				const regex = new RegExp(`^(.*?)\s*:${suffix}\s(\d+(?:\s\d+)?)$`);
				const match = text.match(regex);
				return match ? match[1] : undefined;
			}

			function extractPreConditionBody(text: string): string | undefined {
				const match = /{([^{}]+)}/.exec(text);
				return match ? match[1] : undefined;
			}

			/* function extractProgramBody(text: string): string | undefined {
				const match = text.match(/{([^{}]+)}/g);
				return match ? match[1] : undefined;
			}

			function extractPostConditionBody(text: string): string | undefined {
				const match = /{[^{}]+}\s*{([^{}]+)}/.exec(text);
				return match ? match[1] : undefined;
			} */

			const diagnostics: DiagnosticsType = {
				isValid: true,
				errors: [] as string[],
			};

			const checks: AllRegexChecks = getRelevantChecks(
				law as unknown as LawTypeKeys,
			);

			type CheckKeys = keyof typeof checks;
			const checkKeys: CheckKeys[] = [];

			// To-do: refactor this into functions to pass functions etc.
			if (lawGroup === 'hoareLaws') {
				console.log(
					'this is the textLine and the law just before running extractBeforeHSuffix:',
					textLine,
					law,
				);
				// Extract string with law suffix removed for syntax parsing
				const removedLawSuffix = extractBeforeSuffix(textLine, law);

				if (removedLawSuffix) {
					textLine = removedLawSuffix;
				} else {
					console.error('Unable to extract textLine without law suffix');
				}

				// Check pre-condition opening and closing braces present
				if (checks.preConditionOpenCloseBraces.expression.test(textLine)) {
					console.log('precondition has both opening and closing braces');

					// Retrieve expression between precondition braces and check expression in pre-condition matches expected syntax
					const preConditionBody = extractPreConditionBody(textLine);
					console.log('precondition body:', preConditionBody);

					if (preConditionBody) {
						if (checks.preConditionBody.expression.test(preConditionBody)) {
							console.log('precondition body matches expected syntax');
							console.log('textLine is:', textLine);

							// Check postcondition opening and closing braces present
							if (
								checks.postConditionOpenCloseBraces.expression.test(textLine)
							) {
								console.log(
									'postcondition has both opening and closing braces',
								);
							} else {
								console.log(
									'postcondition does not have both opening and closing braces',
								);
								diagnostics.errors.push(
									checks.postConditionOpenCloseBraces.message,
								);
							}
						} else {
							console.log('precondition body does not match expected syntax');
							diagnostics.errors.push(checks.preConditionBody.message);
						}
					} else {
						console.error(
							`Error: Attempt to extract precondition body failed:${preConditionBody}`,
						);
					}
				} else {
					// If opening and closing braces are not present
					console.log(
						'precondition does not have both opening and closing braces',
					);

					diagnostics.errors.push(checks.preConditionOpenCloseBraces.message);
				}

				// Check expression matches expected format

				diagnostics.isValid = false;
			} else {
				// Check for presence of syntax errors, 'reading' proof line from left to right

				for (const checkName of checkKeys) {
					if (!checks[checkName].expression.test(textLine)) {
						diagnostics.errors.push(checks[checkName].message);
						diagnostics.isValid = false;
					}
				}
			}

			return diagnostics;
		}

		const retrievedDiagnostics: DiagnosticsType = {
			isValid: true,
			errors: [],
		};

		const lawGroup = checkLawGroup(law);

		const lawRegex = new RegExp(
			validRegexFormats[lawGroup][
				law as keyof (typeof validRegexFormats)[typeof lawGroup]
			],
		);

		if (!lawRegex.test(textLine)) {
			// Do law specific checks
			const {isValid, errors} = doLawSpecificChecks(textLine, lawGroup, law);

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
