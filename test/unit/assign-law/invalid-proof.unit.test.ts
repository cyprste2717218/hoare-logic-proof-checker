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

})