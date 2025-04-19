import { describe, expect, test } from '@jest/globals';
import { handleCheckProofValidity } from "../../../src/utilities/proof-handle-utilities"
import { validProofData } from '../../__mocks__/test-data/proof-data';

describe.skip('Assign Law Valid Proofs', () => {
	test('should validate single expression addition hassign proof', () => {

		const inputData = validProofData.assignLaw.proofOne;
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(true) }
		);

	});

	test('should validate multi-variable expression hassign proof asserting for validity over domain of values', () => {

		const inputData = validProofData.assignLaw.proofTwo;
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(true) }
		);

	});

	test('should validate single expression hassign proof asserting for validity over domain of values', () => {

		const inputData = validProofData.assignLaw.proofThree;
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(true) }
		);

	});

})