import {
	type LawTypeKeys,
	type AllRegexChecks,
	type DiagnosticsType,
} from '@/models/misc';

function doHoareLawChecks(
	textLine: string,
	law: LawTypeKeys,
	checks: AllRegexChecks,
): DiagnosticsType {
	// Methods for checking different parts of proof line, i.e. pre-condition, program body and post-condition

	function doPreConditionChecks(textLine: string): DiagnosticsType {
		function extractPreConditionBody(text: string): string | undefined {
			const match = /{([^{}]+)}/.exec(text);
			return match?.[1];
		}

		const diagnostics: DiagnosticsType = {
			isValid: true,
			errors: [] as string[],
		};

		// Check pre-condition opening and closing braces present
		if (!checks.preConditionOpenCloseBraces.expression.test(textLine)) {
			// If opening and closing braces are not present
			console.log('precondition does not have both opening and closing braces');

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
			diagnostics.errors.push(
				'Unable to retrieve location of precondition from hoare triple',
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
		function returnProgramBodySyntaxCheck(
			law: LawTypeKeys,
			programBody: string,
			diagnostics: DiagnosticsType,
		): DiagnosticsType {
			function assignProgramBodySyntaxCheck(
				law: LawTypeKeys,
				programBody: string,
			): boolean {
				switch (law) {
					case 'hskip': {
						return checks.programBodyHskip.expression.test(programBody);
					}

					case 'hassign': {
						return checks.programBodyHassign.expression.test(programBody);
					}

					default: {
						console.log(
							`no applicable syntax check for program body using hoare law ${law}`,
						);
						return false;
					}
				}
			}

			switch (law) {
				case 'hskip': {
					if (!assignProgramBodySyntaxCheck(law, programBody)) {
						console.log('program body does not match expected syntax');

						diagnostics.errors.push(checks.programBodyHskip.message);
						diagnostics.isValid = false;
					}

					break;
				}

				case 'hassign': {
					if (!assignProgramBodySyntaxCheck(law, programBody)) {
						console.log('program body does not match expected syntax');

						diagnostics.errors.push(checks.programBodyHassign.message);
						diagnostics.isValid = false;
					}

					break;
				}

				default: {
					console.log(
						`no applicable syntax check for program body using hoare law ${law}`,
					);
					diagnostics.errors.push(
						'check of program body syntax failed as law call is currently unsupported',
					);
					diagnostics.isValid = false;
				}
			}

			return diagnostics;
		}

		function extractProgramBody(text: string): string | undefined {
			const match = /{[^{}]*}([^{]*){/.exec(text);
			return match?.[1].trim();
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

		// Check syntax of program body based on hoare law call type (differing syntax requirements for different hoare law calls, i.e. hassign versus hskip)
		return returnProgramBodySyntaxCheck(law, programBody, diagnostics);
	}

	function doPostConditionChecks(textLine: string): DiagnosticsType {
		function extractFromSecondOpenBraceRegex(text: string): string | undefined {
			const match = /{[^{]*({.*$)/.exec(text);

			return match?.[1];
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

			diagnostics.errors.push(checks.postConditionOpenCloseBraces.message);
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
	const programBodyDiagnostics: DiagnosticsType = doProgramBodyChecks(textLine);

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

export {doHoareLawChecks};
