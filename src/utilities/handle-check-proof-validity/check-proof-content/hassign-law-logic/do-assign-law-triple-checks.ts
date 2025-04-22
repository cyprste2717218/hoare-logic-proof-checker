/* eslint-disable @typescript-eslint/no-unsafe-return -- temporary fix */

import {decomposeHoareLawLine} from '../../z3-logic/common-funcs';
import type {CollectedTripleProofLines} from '@/models/misc';
import {type ProofAssignLawDetails} from '@/models/hoare-law-z3-models';

function doAssignLawTripleChecks(
	formattedProofContent: CollectedTripleProofLines,
): ProofAssignLawDetails | undefined {
	function extractAlphabeticalChars(input: string): string[] {
		const regex = /[a-zA-Z]/g;
		const matches = input.match(regex) ?? [];
		return [...new Set(matches)];
	}

	function areArraysEqual(arr1: string[], arr2: string[]): boolean {
		if (arr1.length !== arr2.length) {
			console.error('Error in areArraysEqual: arrays are not of equal length');
			return false;
		}

		const set1 = new Set(arr1);
		return arr2.every((item) => set1.has(item));
	}

	function arrayContainsOnlyElementsFrom(
		arrayToCheck: string[],
		sourceArray: string[],
	): boolean {
		const sourceSet = new Set(sourceArray);
		return arrayToCheck.every((item) => sourceSet.has(item));
	}

	const assignLawProofLine: string = formattedProofContent.hoareLaw.line;
	console.log('assignLawProofLine before being sent:', assignLawProofLine);
	const {precondition, program, postcondition} =
		decomposeHoareLawLine(assignLawProofLine);

	// Check precondition and program body contain the same variable declarations

	const preCondVars = extractAlphabeticalChars(precondition);
	const programBodyVars = extractAlphabeticalChars(program);

	if (preCondVars.length === 0 || programBodyVars.length === 0) {
		console.error(
			'Error retrieving variables declared in the precondition or program body as no returned values for one or both arrays precondition and program body list arrays',
		);
		return;
	}

	console.log('preCondVars:', preCondVars);
	console.log('programBodyVars:', programBodyVars);
	if (!areArraysEqual(preCondVars, programBodyVars)) {
		console.error(
			"The exact same variables declared in precondition aren't referred to in the program body",
		);
		return;
	}

	console.log(
		'precondition and program body contain the same variable declarations in hassign law call',
	);

	// Check postcondition doesnt reference any variables not contained in the program body
	const postCondVars = extractAlphabeticalChars(postcondition);

	if (!arrayContainsOnlyElementsFrom(postCondVars, programBodyVars)) {
		console.error(
			'Error: postcondition contains variables not declared in program body',
		);
		return;
	}

	console.log('Postcondition does not contain any unexpected variable names');

	// If previous checks pass, assign shorthand to substitution and arith expression lines for return obj
	const substitutionExpression: string =
		formattedProofContent.supportingProofLine.line;

	const arithExpression =
		formattedProofContent.furtherSupportingProofLine?.line ?? '';

	if (substitutionExpression === undefined) {
		console.error(
			'Error: substitution expression is undefined in hassign law call',
		);
		return;
	}

	if (arithExpression === '') {
		console.error('Error: arith expression is undefined in hassign law call');
		return;
	}

	return {
		substitutionExpression,
		arithExpression,
		hoareLaw: {
			precondition,
			program,
			postcondition,
		},
	};
}

export {doAssignLawTripleChecks};
