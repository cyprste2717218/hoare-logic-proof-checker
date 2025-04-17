import { describe, expect, test } from '@jest/globals';
import { handleCheckProofValidity } from "../../src/utilities/proof-handle-utilities"
import { validProofData, invalidProofData } from '../__mocks__/test-data/proof-data';

describe('Proof Validation', () => {

	describe('Valid Proofs', () => {
		test('adds 1 + 2 to equal 3', () => {
			expect(handleCheckProofValidity(1, 2)).toBe(3);
		});
	})

	describe('Invalid Proofs', () => {

	})


});