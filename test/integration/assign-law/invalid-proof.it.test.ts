import { describe, expect, test } from '@jest/globals';
import { handleCheckProofValidity } from "../../../src/utilities/proof-handle-utilities"
import { invalidProofData } from '../../__mocks__/test-data/proof-data';


describe('Assign Law Invalid Proofs', () => {
	test('should invalidate clearly false two variable proof, i.e. execution of program from precondition does not support evidence for postcondition', () => {

		const inputData = invalidProofData.assignLaw.proofOne;
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(false) }
		);

	});

	test('should invalidate clearly false two variable proof, i.e. execution of program from precondition does not support evidence for postcondition', () => {
		const inputData = invalidProofData.assignLaw.proofOne;
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(false) }
		);
	});

	test('should invalidate when postcondition does not match variable assignment', () => {
		const inputData = invalidProofData.assignLaw.proofTwo;
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(false) }
		);
	});

	test('should invalidate when arithmetic in postcondition does not match assignment', () => {
		const inputData = invalidProofData.assignLaw.proofThree;
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(false) }
		);
	});

	test('should invalidate when multiple conjunctions are not preserved after assignment', () => {
		const inputData = invalidProofData.assignLaw.proofFour;
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(false) }
		);
	});

	test('should invalidate when assigned expression does not match postcondition value', () => {
		const inputData = invalidProofData.assignLaw.proofFive;
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(false) }
		);
	});

	test('should invalidate when unrelated variables change values', () => {
		const inputData = invalidProofData.assignLaw.proofSix;
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(false) }
		);
	});

	test('should invalidate when precondition constraints are violated in postcondition', () => {
		const inputData = invalidProofData.assignLaw.proofSeven;
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(false) }
		);
	});
});