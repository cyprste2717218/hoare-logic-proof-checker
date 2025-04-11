// @ts-nocheck

// @ts-expect-error
import { init, sat } from 'z3-solver';
import type { CollectedTripleProofLines } from '@/models/misc';
import type {
	HoareLawStructure,
	OtherLawStructure,
	ProofLawDetails,
} from '@/models/hoare-law-z3-models';



async function checkHskipLawProof(
	collectedTripleProofDetails: CollectedTripleProofLines,
): Promise<boolean> {
	async function checkArithLawCallValidity(arithObj: {
		expr1: string;
		expr2: string;
	}): Promise<boolean> {
		async function waitforSolverRes(
			rightExpr1: number,
			rightExpr2: number,
		): Promise<boolean> {


			const { Context } = await init();

			// @ts-expect-error z3 package doesn't provide typing for these constructs at current v4.14.1
			const { Solver, Int, Not, Implies, And, Bool } = new Context('main');


			const isTrue = Bool.const('isTrue');
			const x = Int.const('x');
			const y = Int.const('y');

			const firstStatement = And(x.gt(rightExpr1 - 1), x.lt(rightExpr1 + 1));
			const secondStatement = And(y.gt(rightExpr2 - 1), y.lt(rightExpr2 + 1));
			const thirdStatement = isTrue.eq(true);

			const solver = new Solver();
			// Solver.add(firstImplies)
			// solver.add(Implies(firstImplies, secondImplies));
			// solver.add(Not(x.add(2).le(y.sub(10)))); // x + 2 <= y - 10

			solver.add(firstStatement, secondStatement);
			solver.add(
				And(thirdStatement, Implies(firstStatement, secondStatement)).eq(true),
			);

			const result = await solver.check();

			if (result === 'sat') {
				const model = solver.model();
				const xValue = model.get(x).toString();
				const yValue = model.get(y).toString();
				console.log('xValue:', xValue);
				console.log('yValue:', yValue);

				// Check xValue and yValue found to satisfy constraints are the same as rightExpr1 and rightExpr2

				if (xValue === rightExpr1 && yValue === rightExpr2) {
					return true;
				}

				console.error(
					"Error: Values discovered to satisfy constraints for arith law call in skip law call proof don't match ones passed to method, hence not a display of validity in this instance",
				);
				return false;
			}

			return false;
		}

		function splitAroundEquals(text: string): {
			leftSide: string;
			rightSide: string;
		} {
			// Remove any whitespace from the beginning and end
			const trimmedText = text.trim();

			// Split the string at the '=' sign
			const parts = trimmedText.split('=');

			// If there's no '=' sign, return empty strings
			if (parts.length < 2) {
				return {
					leftSide: '',
					rightSide: '',
				};
			}

			// Return an object with the left and right sides, trimmed of whitespace
			return {
				leftSide: parts[0].trim(),
				rightSide: parts.slice(1).join('=').trim(), // Join remaining parts in case there are multiple '=' signs
			};
		}

		// Parsing expr1 andn expr2 for number on right handside of respective equal statements

		const { expr1, expr2 } = arithObj;

		const rightExpr1 = Number(splitAroundEquals(expr1).rightSide);
		const rightExpr2 = Number(splitAroundEquals(expr2).rightSide);

		console.log('expression1 right expr:', rightExpr1);
		console.log('expression2 right expr', rightExpr2);

		// Dispatching to Z3 to check satisfiability of overall implication statement
		const dispatchResult: boolean = await waitforSolverRes(
			rightExpr1,
			rightExpr2,
		);

		if (!dispatchResult) {
			console.log('sat checker of arith law returned invalid result');
			return false;
		}

		console.log('sat checker of arith law returned valid result');
		return true;
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
		const { expr1, expr2 } = decomposeArithLawLine(arithProofLine);

		const skipLawProofLine: string = formattedProofContent.hoareLaw.line;
		console.log('skipLawProofLine before being sent:', skipLawProofLine);
		const { precondition, program, postcondition } =
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

	let arithLawCheckResult: boolean;

	try {
		const pendingArithLawCheckResult: boolean = await checkArithLawCallValidity(
			passedSkipLawChecks.arith,
		);
		arithLawCheckResult = pendingArithLawCheckResult;

		if (!(arithLawCheckResult || !arithLawCheckResult)) {
			// To-do: need to display a system error banner in UI with this error message in this situation
			throw new Error(
				'Error: Checking Arith law call validity function didnt return a boolean value',
			);
		}
	} catch (error) {
		console.error('arith law check failed:', error);
		return false;
	}
	// Return proof as valid if arithLawCheckResult is true, otherwise proof is invalid

	if (!arithLawCheckResult) {
		return false;
	}

	console.log('arith law proof line validity check passed!');
	return true;
}

export { checkHskipLawProof };
