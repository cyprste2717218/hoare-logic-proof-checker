import {handleDelimiterArith} from '@/utilities/handle-check-proof-validity/check-proof-content/arith-law-logic/handle-delimeter-arith';
import type {
	ArithObjType,
	SplitReturnObjType,
	SplitOperatorType,
} from '@/models/hoare-law-z3-models';
import {type LawTypeHoare} from '@/models/misc';

function splitAroundOperator(
	text: string,
	splitOperator: SplitOperatorType,
): SplitReturnObjType {
	// Remove any whitespace from the beginning and end
	const trimmedText = text.trim();

	// Split the string at the operator, e.g. '=' sign
	const parts = trimmedText.split(splitOperator);

	// If specified operator not present, return empty strings
	if (parts.length < 2) {
		return {
			variable: '',
			operator: '',
			variableValue: '',
		};
	}

	// Return an object with the left and right sides, trimmed of whitespace
	return {
		variable: parts[0].trim(),
		operator: splitOperator,
		variableValue: parts.slice(1).join(splitOperator).trim(), // Join remaining parts in case there are multiple of same operator
	};
}

async function checkArithLawCallValidity(
	arithObj: ArithObjType,
	tripleLaw: LawTypeHoare,
): Promise<boolean> {
	async function checkPendingResult(
		pendingResult: boolean | undefined,
	): Promise<boolean> {
		if (pendingResult === undefined) {
			console.error(
				"Unexpected response of 'undefined' from handleAndDelimeterArith func call",
			);
			return false;
		}

		return pendingResult;
	}

	function containsAndDelimiter(str: string): boolean {
		return str.includes('/\\');
	}

	// Parsing expr1 and expr2 for number on right handside of respective statements, e.g. x=1 -> x=1, y>1 -> y>1

	const {expr1, expr2} = arithObj;

	// Only hskip laws at current support arith law calls that can contain '/\' delimited expressions after the -> operator
	if (tripleLaw === 'hskip') {
		// Note: expressionsContainAnd is checking that both sides of the implies statement have /\ operators as app currently only supports checking of proofs which describe state of all proof variables before and after the implies operator for arith calls. Extending what the arith call can validate would mean extending the below definition of expressionsContainAnd and further error handling, of which is not implemented at this time.

		const expressionsContainAnd =
			containsAndDelimiter(expr1) && containsAndDelimiter(expr2 as string);

		if (expressionsContainAnd) {
			console.log(
				"both left and right handside of implies statement contain '/\\' delimeters",
			);
		} else {
			console.log(
				"implies statement left and right handside expressions do not contain '/\\' delimeters",
			);
		}
	}

	const pendingResult: boolean | undefined = await handleDelimiterArith(
		{
			expr1,
			expr2,
		},
		tripleLaw,
	);

	const result: boolean = await checkPendingResult(pendingResult);

	return result;
}

export {checkArithLawCallValidity, splitAroundOperator};
