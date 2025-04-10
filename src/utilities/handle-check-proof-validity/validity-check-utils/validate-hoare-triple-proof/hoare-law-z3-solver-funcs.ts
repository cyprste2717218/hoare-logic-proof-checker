// Import {init} from 'z3-solver';
import type {CollectedTripleProofLines} from '@/models/misc';
import type {
	HoareLawStructure,
	OtherLawStructure,
	ProofLawDetails,
} from '@/models/hoare-law-z3-models';

function checkHskipLawProof(
	collectedTripleProofDetails: CollectedTripleProofLines,
): boolean {
	function checkArithLawCallValidity(arithObj: {
		expr1: string;
		expr2: string;
	}): boolean {
		// Parsing expr1 and expr2 into individual characters

		const {expr1, expr2} = arithObj;

		const expr1Chars = expr1.split('');
		const expr2Chars = expr2.split('');

		console.log('expression1 chars:', expr1Chars);
		console.log('expression2 chars:', expr2Chars);

		// Revise below to make fit the function
		/* 	const sort = Z3.Int.sort();
		const x = Z3.Int.const('x');
		const y = Z3.Int.const('y');
		const g = Z3.Function.declare('g', sort, sort);
		const conjecture = Z3.Implies(x.eq(y), g.call(x).eq(g.call(y)));
		Z3.solve(Z3.Not(conjecture)); */

		return false;
	}

	function doSkipLawChecks(
		formattedProofContent: CollectedTripleProofLines,
	): ProofLawDetails | undefined {
		function decomposeArithLawLine(proofLine: string): OtherLawStructure {
			function splitAroundImplication(text: string): string[] {
				const pattern = /^(.*?)\s*(->)\s*(.*?)(?:\s*:arith)?$/;
				const match = pattern.exec(text);

				if (!match) {
					return ['', '', ''];
				}

				// For the expression here of the form P -> Q
				// match[1] is P, match[2] is '->', match[3] is Q
				return [match[1].trim(), match[2], match[3].trim()];
			}

			console.log('proof line passed to decomposeArithLawLine is:', proofLine);
			const returnStructure: string[] = splitAroundImplication(proofLine);
			console.log('arith law line split up:', returnStructure);
			return {
				expr1: returnStructure[0],
				operator: returnStructure[1],
				expr2: returnStructure[2],
			};
		}

		function decomposeSkipLawLine(proofLine: string): HoareLawStructure {
			function splitHoareTriple(text: string): string[] {
				const pattern = /{(.*?)}(.*?){(.*?)}/;
				const match = pattern.exec(text);

				if (!match) {
					return ['', '', ''];
				}

				// For Hoare triple of form {P} C {Q}
				// match[1] is precondition (P), match[2] is program (C), match[3] is postcondition (Q)
				return [match[1].trim(), match[2].trim(), match[3].trim()];
			}

			const returnStructure: string[] = splitHoareTriple(proofLine);
			console.log('skip law line split up:', returnStructure);
			return {
				precondition: returnStructure[0],
				program: returnStructure[1],
				postcondition: returnStructure[2],
			};
		}

		const arithProofLine: string =
			formattedProofContent.supportingProofLine.line;
		console.log('arithProofLine before being sent:', arithProofLine);
		const {expr1, expr2} = decomposeArithLawLine(arithProofLine);

		const skipLawProofLine: string = formattedProofContent.hoareLaw.line;
		console.log('skipLawProofLine before being sent:', skipLawProofLine);
		const {precondition, program, postcondition} =
			decomposeSkipLawLine(skipLawProofLine);

		// Check arith law proof line has same expression before and after ->
		if (expr1 !== expr2) {
			return;
		}

		console.log(
			`${expr1} === ${expr2} first equality check for hskip of arith call`,
		);

		// Check precondition is same as postcondition
		if (precondition !== postcondition) {
			return;
		}

		console.log(
			`${precondition} === ${postcondition} second equality check for hskip of precond and postcond`,
		);

		// Check program is same as precondition (comparing to precondition or postcondition is of no impact here, equivalent result either way)
		if (program !== precondition) {
			return;
		}

		console.log(
			`${program} === ${precondition} third equality check for hskip of program and precond`,
		);

		// Check statement in arith call is the same as the precondition and postcondition
		if (expr1 !== precondition) {
			return;
		}

		console.log(
			`${expr1} === ${precondition} fourth equality check for hskip of expr1 in arith and precond in hskip`,
		);
		console.log('all equality checks passed for hskip');

		return {
			arith: {
				expr1,
				expr2,
			},
			hskip: {
				precondition,
				program,
				postcondition,
			},
		};
	}

	// Check that content in precondition, postcondition, program body in hskip proof line call and statement body of arith proof line call is the same
	const passedSkipLawChecks: ProofLawDetails | undefined = doSkipLawChecks(
		collectedTripleProofDetails,
	);

	if (!passedSkipLawChecks) {
		console.error('hskip law checks failed');
		return false;
	}

	// Given previous check passes, check if arith proof line is valid via discharge to Z3 SMT solver (i.e. checking validity of implies statement)
	const arithLawCheckResult: boolean = checkArithLawCallValidity(
		passedSkipLawChecks.arith,
	);

	// Return proof as valid if arithLawCheckResult is true, otherwise proof is invalid

	if (!arithLawCheckResult) {
		return false;
	}

	console.log('arith law proof line validity check passed!');
	return true;
}

export {checkHskipLawProof};
