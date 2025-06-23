import {
	type ArithAndSubstDetails,
	type ArithLawExpr,
} from '@/models/hoare-law-z3-models';

function doSupportingArithLawChecks(
	relevantProofDetails: ArithAndSubstDetails,
): ArithLawExpr | undefined {
	function handleDecomposeExtractContent(
		arithProofLine: string,
		substitutionPostCondition: string,
	):
		| {
			arithPreCondition: string;
			arithAssignExpr: string;
			arithResultDomain: string;
			substResultDomain: string;
		}
		| undefined {
		function extractFromEqualityOperator(input: string): string {
			try {
				// Match any of the equality operators and everything after
				const pattern = /([<>]=?|=).*$/;
				const match = pattern.exec(input);

				return match ? match[0].trim() : '';
			} catch (error) {
				console.error('Error extracting content:', error);
				return '';
			}
		}

		function extractArithLineParts(input: string): [string, string, string] {

			/**
			 * Removes all whitespace characters from a string and returns the concatenated result.
			 * @param input - The input string to process
			 * @returns The input string with all whitespace characters removed
			 */
			function removeAllWhitespace(input: string): string {
				return input.replace(/\s+/g, '');
			}

			try {
				// Remove any whitespace from the ends
				const trimmedInput = input.trim();

				// Match pattern: content before ->, content after -> but before operator, and content including/after operator
				const pattern = /^(.*?)->\s*(.*?)(?=\s*([<>]=?|=))(.*?)$/;

				const match = pattern.exec(trimmedInput);

				if (match) {

					match[4] = removeAllWhitespace(match[4])

					return [
						match[1].trim(), // Before ->
						match[2].trim(), // Between -> and equality operator
						match[4].trim(), // Equality operator and after
					];
				}

				return ['', '', ''];
			} catch (error) {
				console.error('Error extracting content:', error);
				return ['', '', ''];
			}
		}

		const extractedArithLineParts = extractArithLineParts(arithProofLine);
		const arithPreCondition = extractedArithLineParts[0];
		const arithAssignExpr = extractedArithLineParts[1];
		const arithResultDomain = extractedArithLineParts[2];

		const substResultDomain = extractFromEqualityOperator(
			substitutionPostCondition,
		);

		if (
			arithPreCondition === '' ||
			arithAssignExpr === '' ||
			arithResultDomain === '' ||
			substResultDomain === ''
		) {
			console.error(
				'Error: at least one arith proof line details (and/or the postcondition result domain from substitution proof line) are an empty string',
			);
			return undefined;
		}

		return {
			arithPreCondition,
			arithAssignExpr,
			arithResultDomain,
			substResultDomain,
		};
	}

	try {
		// Decompose arith proof line call body into arith expression and variable assignment

		// - retrieving substitution line parts
		const {
			substPrecondition,
			substPostcondition,
			substVariable,
			substAssignment,
		} = relevantProofDetails.subst;

		if (
			substPrecondition === '' ||
			substPostcondition === '' ||
			substVariable === '' ||
			substAssignment === ''
		) {
			console.error(
				'Error: at least one subst proof line details are an empty string',
			);
			return undefined;
		}

		console.log(
			'subst line parts succesfully retrieved from doSupportingArithLawChecks args',
		);

		// - retrieving arith line parts and additional substitution line part from further processing of substPostCondition
		const arithProofLine = relevantProofDetails.arithExpression;
		if (arithProofLine === '') {
			console.error('Error: arith proof line is an empty string');
			return undefined;
		}

		console.log(
			'arith proof line succesfully retrieved from doSupportingArithLawChecks args',
		);

		const extractedParts = handleDecomposeExtractContent(
			arithProofLine,
			substPostcondition,
		);
		if (!extractedParts) {
			console.error(
				'Error: extractedParts in doSupportingArithLawChecks is undefined',
			);
			return undefined;
		}

		const {
			arithPreCondition,
			arithAssignExpr,
			arithResultDomain,
			substResultDomain,
		} = extractedParts;

		console.log(
			'arith proof line parts succesfully extracted from handleDecomposeExtractContent (in doSupportingArithLawChecks',
		);

		// Check precondition from substitution proof line matches precondition defined in arith proof line
		if (substPrecondition !== arithPreCondition) {
			console.error(
				'Error: precondition in arith call does not match with precondition in subst call',
			);
			return;
		}

		console.log('substPrecondition matches arithPreCondition');

		// Check substitution expression matches expression in arith proof line
		if (substAssignment !== arithAssignExpr) {
			console.log(
				`Error: substitution expression ${arithAssignExpr} in arith call does not match with expression ${substAssignment} in subst call`,
			);
			console.error(
				`Error: substitution expression ${arithAssignExpr} in arith call does not match with expression ${substAssignment} in subst call`,
			);
			return;
		}

		console.log('substitution expression matches assignment expression');

		// Check result of assignment expression to variable in postcondition of arith proof line matches postcondition value in substitution proof line

		console.log(
			'substResultDomain is:',
			substResultDomain,
			'and arithResultDomain is:',
			arithResultDomain,
		);
		if (substResultDomain !== arithResultDomain) {
			console.error(
				'Error: result of assignment expression in arith call does not match with postcondition in subst call',
			);
			return;
		}

		console.log('substitution result domain matches assignment result domain');

		const arithAfterImplies = arithAssignExpr + arithResultDomain;
		const splitUpArithAfterImplies = arithAfterImplies.split('');

		return {
			arith: {
				expr1: arithPreCondition,
				expr2: splitUpArithAfterImplies,
			},
		};
	} catch (error) {
		console.log('Error during doSupportingArithLawChecks', error);
	}
}

export { doSupportingArithLawChecks };
