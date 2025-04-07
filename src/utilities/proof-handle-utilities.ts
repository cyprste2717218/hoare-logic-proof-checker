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
			function doHoareLawChecks(textLine: string): DiagnosticsType {
				// Methods for checking different parts of proof line, i.e. pre-condition, program body and post-condition

				function doPreConditionChecks(textLine: string): DiagnosticsType {
					function extractPreConditionBody(text: string): string | undefined {
						const match = /{([^{}]+)}/.exec(text);
						return match ? match[1] : undefined;
					}

					const diagnostics: DiagnosticsType = {
						isValid: true,
						errors: [] as string[],
					};

					// Check pre-condition opening and closing braces present
					if (!checks.preConditionOpenCloseBraces.expression.test(textLine)) {
						// If opening and closing braces are not present
						console.log(
							'precondition does not have both opening and closing braces',
						);

						diagnostics.errors.push(checks.preConditionOpenCloseBraces.message);
						diagnostics.isValid = false;

						return diagnostics;
					}

					console.log('precondition has both opening and closing braces');

					// Retrieve expression between precondition braces and then check expression in pre-condition matches expected syntax
					const preConditionBody = extractPreConditionBody(textLine);
					console.log('precondition body:', preConditionBody);

					if (!preConditionBody) {
						console.error(
							`Error: Attempt to extract precondition body failed:${preConditionBody}`,
						);
						diagnostics.isValid = false;
						return diagnostics;
					}

					if (!checks.preConditionBody.expression.test(preConditionBody)) {
						console.log('precondition body does not match expected syntax');

						diagnostics.errors.push(checks.preConditionBody.message);
						diagnostics.isValid = false;

						return diagnostics;
					}

					console.log('precondition body matches expected syntax');
					console.log('textLine is:', textLine);

					// No errors in precondition checks so return unchanged diagnostics object

					return diagnostics;
				}

				function doProgramBodyChecks(textLine: string): DiagnosticsType {
					function extractProgramBody(text: string): string | undefined {
						const match = /{[^{}]*}([^{]*){/.exec(text);
						return match ? match[1].trim() : undefined;
					}

					// Retrieve program expression between pre-condition and post-condition and then check it matches expected syntax

					const diagnostics: DiagnosticsType = {
						isValid: true,
						errors: [] as string[],
					};

					const programBody = extractProgramBody(textLine);
					console.log('program body:', programBody);

					if (!programBody) {
						console.error(
							`Error: Attempt to extract program body failed:${programBody}`,
						);
						diagnostics.errors.push(
							'Unable to retrieve location of program from hoare triple, ensure the program is enclosed between the precondition and postcondition',
						);
						diagnostics.isValid = false;

						return diagnostics;
					}

					if (!checks.programBody.expression.test(programBody)) {
						console.log('program body does not match expected syntax');

						diagnostics.errors.push(checks.programBody.message);
						diagnostics.isValid = false;

						return diagnostics;
					}

					console.log('program body matches expected syntax');

					return diagnostics;
				}

				function doPostConditionChecks(textLine: string): DiagnosticsType {
					function extractFromSecondOpenBraceRegex(
						text: string,
					): string | undefined {
						const match = /{[^{]*{(.*$)/.exec(text);
						return match ? `{${match[1]}` : undefined;
					}

					function extractPostConditionBody(text: string): string | undefined {
						const match = /{([^{}]+)}/.exec(text);
						return match ? match[1] : undefined;
					}

					const diagnostics: DiagnosticsType = {
						isValid: true,
						errors: [] as string[],
					};

					const startOfPostConditionString =
						extractFromSecondOpenBraceRegex(textLine);

					if (!startOfPostConditionString) {
						console.error(
							`Error: Attempt to extract string from start of postcondition failed:${startOfPostConditionString}`,
						);
						diagnostics.isValid = false;
						return diagnostics;
					}

					console.log(
						'string starting with postcondition:',
						startOfPostConditionString,
					);

					if (
						!checks.postConditionOpenCloseBraces.expression.test(
							startOfPostConditionString,
						)
					) {
						// If opening and closing braces are not present
						console.log(
							'postcondition does not have both opening and closing braces',
						);

						diagnostics.errors.push(
							checks.postConditionOpenCloseBraces.message,
						);
						diagnostics.isValid = false;

						return diagnostics;
					}

					console.log('postcondition has both opening and closing braces');

					// Retrieve expression between postcondition braces and then check expression in post-condition matches expected syntax
					const postConditionBody = extractPostConditionBody(
						startOfPostConditionString,
					);
					console.log('postcondition body:', postConditionBody);

					if (!postConditionBody) {
						console.error(
							`Error: Attempt to extract postcondition body failed:${postConditionBody}`,
						);
						diagnostics.isValid = false;
						return diagnostics;
					}

					if (!checks.postConditionBody.expression.test(postConditionBody)) {
						console.log('postcondition body does not match expected syntax');

						diagnostics.errors.push(checks.postConditionBody.message);
						diagnostics.isValid = false;

						return diagnostics;
					}

					console.log('postcondition body matches expected syntax');
					console.log('textLine is:', textLine);

					// No errors in postcondition checks so return unchanged diagnostics object
					return diagnostics;
				}

				// Perform checks for match up against each part of syntax in sequential order, i.e. precondition, program body, postcondition

				// 1). gather any pre-condition check errors
				const preConditionDiagnostics: DiagnosticsType =
					doPreConditionChecks(textLine);

				if (
					preConditionDiagnostics.errors.length > 0 &&
					!preConditionDiagnostics.isValid
				) {
					// Early return if errors present in precondition checks
					return preConditionDiagnostics;
				}

				// 2). gather any program body check errors
				const programBodyDiagnostics: DiagnosticsType =
					doProgramBodyChecks(textLine);

				if (
					programBodyDiagnostics.errors.length > 0 &&
					!programBodyDiagnostics.isValid
				) {
					// Early return if errors present in program body checks
					return programBodyDiagnostics;
				}

				// 3). gather any postcondition check errors
				const postConditionDiagnostics: DiagnosticsType =
					doPostConditionChecks(textLine);

				if (
					postConditionDiagnostics.errors.length > 0 &&
					!postConditionDiagnostics.isValid
				) {
					// Early return if errors present in program body checks
					return postConditionDiagnostics;
				}

				// No errors detected on proof line for hoare law call so return unchanged diagnostics object

				return {
					isValid: true,
					errors: [] as string[],
				};
			}

			function doOtherLawChecks(textLine: string): DiagnosticsType {
				// To-do: to be further instantiated
				console.log(textLine);

				// Check for presence of syntax errors, 'reading' proof line from left to right

				/* 	for (const checkName of checkKeys) {
					if (!checks[checkName].expression.test(textLine)) {
						diagnostics.errors.push(checks[checkName].message);
						diagnostics.isValid = false;
					}
				}
 				*/
				return {
					isValid: true,
					errors: [] as string[],
				};
			}

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
				// Type CheckKeys = keyof typeof allChecks;

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

			const checks: AllRegexChecks = getRelevantChecks(
				law as unknown as LawTypeKeys,
			);

			type CheckKeys = keyof typeof checks;
			// Const checkKeys: CheckKeys[] = [];

			// Retrieving detected errors depending on parsing as instantiation of hoare law, e.g. hskip, or other law, e.g. arith, subst
			if (lawGroup === 'hoareLaws') {
				const diagnostics: DiagnosticsType = doHoareLawChecks(textLine);
				return diagnostics;
			}

			const diagnostics: DiagnosticsType = doOtherLawChecks(textLine);
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
