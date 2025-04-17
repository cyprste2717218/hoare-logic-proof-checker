import { describe, expect, test } from '@jest/globals';
import { handleCheckProofValidity } from "../../../src/utilities/proof-handle-utilities"
import { invalidProofData } from '../../__mocks__/test-data/proof-data';


describe('Skip Law Invalid Proofs', () => {
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

	test('should invalidate proof with alphabetic character as variable domain', () => {

		const inputData = invalidProofData.skipLaw.proofThree;
		return handleCheckProofValidity(inputData).then(
			(result: boolean) => { expect(result).toEqual(false) }
		);

	});
})