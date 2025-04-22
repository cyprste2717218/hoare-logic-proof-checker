import { describe, expect, test } from '@jest/globals';
import { handleCheckProofValidity } from "../../../src/utilities/proof-handle-utilities"
import { validProofData } from '../../__mocks__/test-data/proof-data';

describe.skip('Skip Law Valid Proofs', () => {
	test('should validate single expression hskip proof', () => {

		const inputData = validProofData.skipLaw.proofOne;
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(true) }
		);

	});

	test('should validate multiple expression (length two) hskip proof', () => {

		const inputData = validProofData.skipLaw.proofTwo;
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(true) }
		);

	});

	test('should validate multiple expression (length three) hskip proof', () => {

		const inputData = validProofData.skipLaw.proofThree;
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(true) }
		);

	});

	test('should validate expressions using <= and >= operators in hskip proof', () => {

		const inputData = validProofData.skipLaw.proofFour
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(true) }
		);

	});
})