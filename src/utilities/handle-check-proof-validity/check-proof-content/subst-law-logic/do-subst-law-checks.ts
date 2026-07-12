import type {
	ArithAndSubstDetails,
	ProofAssignLawDetails,
} from '@/models/hoare-law-z3-models';

function doSubstLawChecks(
	assignLawDetails: ProofAssignLawDetails,
): ArithAndSubstDetails | undefined {
	function handleDecomposeExtractContent(
		substitutionProofLine: string,
		hoareTripleProgamBody: string,
	):
		| {
				substPreCondition: string;
				substPostCondition: string;
				substVariable: string;
				substAssignment: string;
				hoareVariable: string;
				hoareAssignment: string;
		  }
		| undefined {
		function extractSubstLineParts(input: string): [string, string, string] {
			try {
				// Initialize array with empty strings
				const result: string[] = ['', '', ''];

				// Get content before arrow
				const arrowSplit = input.split('->');
				if (arrowSplit.length > 0) {
					result[0] = arrowSplit[0].trim();
				}

				// Get parentheses content
				const parenthesesRegex = /\((.*?)\)/;
				const parenthesesMatch = parenthesesRegex.exec(input);

				const pendingParenthesesMatch: string | undefined =
					parenthesesMatch?.[1]?.trim();
				if (pendingParenthesesMatch) {
					result[1] = pendingParenthesesMatch;
				}

				// Get bracket content
				const bracketsRegex = /\[(.*?)]/;
				const bracketsMatch = bracketsRegex.exec(input);

				const pendingBracketsMatch: string | undefined =
					bracketsMatch?.[1]?.trim();
				if (pendingBracketsMatch) {
					result[2] = pendingBracketsMatch;
				}

				return result as [string, string, string];
			} catch (error) {
				console.error(
					'Error parsing substitution proof line into sub-expressions:',
					error,
				);
				return ['', '', ''];
			}
		}

		function extractContentAroundSyntaxOper(
			input: string,
			syntaxOper: string,
		): [string, string] {
			try {
				// Escape special regex characters in the syntax operator expression passed
				const escapedExpression = syntaxOper.replaceAll(
					/[.*+?^${}()|[\]\\]/g,
					'\\$&',
				);

				// Create regex pattern that captures content before and after
				const pattern = new RegExp(`^(.*?)${escapedExpression}(.*)$`);

				// Execute the regex
				const match = input.match(pattern);

				if (match) {
					// Return trimmed content before and after
					return [match[1].trim(), match[2].trim()];
				}

				// Return empty strings if no match found
				return ['', ''];
			} catch (error) {
				console.error(
					`Error extracting content around syntax operator ${syntaxOper}:`,
					error,
				);
				return ['', ''];
			}
		}

		const substProofLineParts = extractSubstLineParts(substitutionProofLine);
		const substPreCondition = substProofLineParts[0];
		const substPostCondition = substProofLineParts[1];
		const substProgramBody = substProofLineParts[2];

		if (
			substPreCondition === '' ||
			substPostCondition === '' ||
			substProgramBody === ''
		) {
			console.error('Error in doSubstLawChecks: substProofLineParts is empty');
			return;
		}

		// Handling substitution proof line call body decomposing
		const decomposedSubstProgramBody = extractContentAroundSyntaxOper(
			substProgramBody,
			'|>',
		);
		const substVariable = decomposedSubstProgramBody[0];
		const substAssignment = decomposedSubstProgramBody[1];

		if (substVariable === '' || substAssignment === '') {
			console.error(
				'Error in doSubstLawChecks: decomposedSubstProgramBody is empty',
			);
			return;
		}

		// Handling hoare triple program body decomposing
		const decomposedHoareProgramBody = extractContentAroundSyntaxOper(
			hoareTripleProgamBody,
			':=',
		);
		const hoareVariable = decomposedHoareProgramBody[0];
		const hoareAssignment = decomposedHoareProgramBody[1];

		if (hoareVariable === '' || hoareAssignment === '') {
			console.error(
				'Error in doSubstLawChecks: decomposedHoareProgramBody is empty',
			);
			return;
		}

		return {
			substPreCondition,
			substPostCondition,
			substVariable,
			substAssignment,
			hoareVariable,
			hoareAssignment,
		};
	}

	function extractBeforeArithSuffix(input: string): string {
		const pattern = /^(.*?)(?=:arith|$)/;
		const match = pattern.exec(input);
		return match ? match[1].trim() : '';
	}

	try {
		// Decompose and extract content from substitution proof line as well as the variable and value of the program body expression in the hoare triple, for use in following comparison checks

		const extractedContent = handleDecomposeExtractContent(
			assignLawDetails.substitutionExpression,
			assignLawDetails.hoareLaw.program,
		);

		if (!extractedContent) {
			console.error(
				'Error retrieving components of substitution proof line and hoare triple program body',
			);
			return;
		}

		const {
			substPreCondition,
			substPostCondition,
			substVariable,
			substAssignment,
			hoareVariable,
			hoareAssignment,
		} = extractedContent;

		const precondition = assignLawDetails.hoareLaw.precondition;
		const postcondition = assignLawDetails.hoareLaw.postcondition;

		// Check before implies content (precondition) in subst call matches with precondition triple

		if (precondition !== substPreCondition) {
			console.error(
				'Error: precondition in subst call does not match with precondition in hoare triple',
			);
			return;
		}

		// Check postcondition content in subst call (content in parentheses following implies operator) matches with postcondition of hoare triple

		if (postcondition !== substPostCondition) {
			console.error(
				'Error: postcondition in subst call does not match with postcondition in hoare triple',
			);
			return;
		}

		// Check variable referenced before subst operator (|> in subst expression) matches assigned variable in program body of triple

		if (hoareVariable !== substVariable) {
			console.error(
				'Error: variable in subst call does not match with variable in hoare triple',
			);
			return;
		}

		// Check assignment expression following subst operator (|> in subst expression) matches expression assigned to variable in program body

		if (hoareAssignment !== substAssignment) {
			console.error(
				'Error: assignment in subst call does not match with assignment in hoare triple',
			);
			return;
		}

		const arithExpression = extractBeforeArithSuffix(
			assignLawDetails.arithExpression,
		);

		if (arithExpression === '') {
			console.error(
				'Error in doSubstLawChecks: arithExpression is empty after attempt to remove :arith suffix',
			);
			return;
		}

		return {
			arithExpression,
			subst: {
				substPrecondition: substPreCondition,
				substPostcondition: substPostCondition,
				substVariable,
				substAssignment,
			},
		};
	} catch (error) {
		console.error('Error in doSubstLawChecks:', error);
	}
}

export {doSubstLawChecks};
