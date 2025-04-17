import { describe, expect, test } from '@jest/globals';
import { handleCheckProofValidity } from "../../../src/utilities/proof-handle-utilities"
import { validProofData, invalidProofData } from '../../__mocks__/test-data/proof-data';

describe('Skip Law Proof Validation (Unit Tests)', () => {

	describe('Valid Proofs', () => {
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
	})

	describe('Invalid Proofs', () => {
		test('should invalidate single expression hskip proof with conflicting variable domains in supporting implies statement', () => {

			const inputData = invalidProofData.skipLaw.proofOne;
			return handleCheckProofValidity(inputData).then(
				(result: boolean) => { expect(result).toEqual(false) }
			);

		});

		test('should invalidate multi expression (length two) hskip proof with different variable domains in supporting implies statement', () => {

			const inputData = invalidProofData.skipLaw.proofTwo;
			return handleCheckProofValidity(inputData).then(
				(result: boolean) => { expect(result).toEqual(false) }
			);

		});
	})


});