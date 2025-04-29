import { handleProofSyntaxCheck } from "../../../src/utilities/proof-handle-utilities"

describe('Proof Syntax Validation Tests', () => {
	describe('Precondition Tests', () => {
		it('should accept valid preconditions', () => {
			const validProofs = [
				"{x=0}x:=x+1{x=1} :hassign 0",
				"{x>=3}x:=x+1{x>=4} :hassign 0",
				"{x=2/\\y>4}x:=x+1{x=3/\\y>4} :hassign 0"
			];

			validProofs.forEach(proof => {
				const result = handleProofSyntaxCheck({ proofContent: proof });
				expect(result.syntaxErrors).toHaveLength(0);
			});
		});

		it('should reject invalid preconditions', () => {
			const invalidProofs = [
				"x=0}x:=x+1{x=1} :hassign 0",
				"{x=0x:=x+1{x=1} :hassign 0",
				"x=0x:=x+1{x=1} :hassign 0",
				"{x=0}}x:=x+1{x=1} :hassign 0",
				"{{x=0}x:=x+1{x=1} :hassign 0"
			];

			invalidProofs.forEach(proof => {
				const result = handleProofSyntaxCheck({ proofContent: proof });
				expect(result.syntaxErrors).toHaveLength(1);
				expect(result.syntaxErrors[0].messages).toContain(
					"Precondition does not contain both closing and opening braces, '{}'"
				);
			});
		});
	});

	describe('Postcondition Tests', () => {
		it('should accept valid postconditions', () => {
			const validProofs = [
				"{x=0}x:=x+1{x=1} :hassign 0",
				"{x=0}x:=x+1{x>=3} :hassign 0",
				"{x=0}x:=x+1{x=2/\\y>4} :hassign 0"
			];

			validProofs.forEach(proof => {
				const result = handleProofSyntaxCheck({ proofContent: proof });
				expect(result.syntaxErrors).toHaveLength(0);
			});
		});

		it('should reject invalid postconditions', () => {
			const invalidProofs = [
				"{x=0}x:=x+1x=1} :hassign 0",
				"{x=0}x:=x+1{x=1 :hassign 0",
				"{x=0}x:=x+1x=1 :hassign 0",
				"{x=0}x:=x+1{x=1}} :hassign 0",
				"{x=0}x:=x+1{{x=1} :hassign 0"
			];

			invalidProofs.forEach(proof => {
				const result = handleProofSyntaxCheck({ proofContent: proof });
				expect(result.syntaxErrors).toHaveLength(1);
				expect(result.syntaxErrors[0].messages).toContain(
					"Postcondition does not contain both closing and opening braces, '{}'"
				);
			});
		});
	});

	describe('Assignment Statement Tests', () => {
		it('should accept valid formats of assignment statements', () => {
			const validProofs = [
				"{x=0}x:=2{x=2} :hassign 0",
				"{y=0}y:=3{y=3} :hassign 0",
				"{x=0 /\\ y=0}x:=y+2{x=2} :hassign 0",
				"{z=0}z:=a*b{z=3} :hassign 0",
				"{x=1 /\\ w=0 /\\ y=1}w:=x-y{w=3} :hassign 0",
			];

			validProofs.forEach(proof => {
				const result = handleProofSyntaxCheck({ proofContent: proof });
				expect(result.syntaxErrors).toHaveLength(0);
			});
		});

		it('should reject invalid assignment statements', () => {
			const invalidProofs = [
				"{x=0}x:{x=1} :hassign 0",
				"{x=0}:=2{x=1} :hassign 0",
				"{x=0}x:=y+2+{x=1} :hassign 0",
				"{x=0}xy:=2{x=1} :hassign 0",
				"{x=0}2:=x{x=1} :hassign 0",
				"{x=0}x:={x=1} :hassign 0"
			];

			invalidProofs.forEach(proof => {
				const result = handleProofSyntaxCheck({ proofContent: proof });
				expect(result.syntaxErrors.length).toBeGreaterThan(0);
			});
		});
	});

	describe('Skip Statement Tests', () => {
		it('should accept valid skip statements', () => {
			const validProofs = [
				"{x=0}x=0{x=0} :hskip 0",
				"{y>=3}y>=3{y>=3} :hskip 0",
				"{x=2/\\y>=3}x=2/\\y>=3{x=2/\\y>=3} :hskip 0"
			];

			validProofs.forEach(proof => {
				const result = handleProofSyntaxCheck({ proofContent: proof });
				expect(result.syntaxErrors).toHaveLength(0);
			});
		});

		it('should reject invalid skip statements', () => {
			const invalidProofs = [
				"{x=0}x{x=0} :hskip 0",
				"{x=0}=0{x=0} :hskip 0",
				"{x=0}x=0\\\\y>=3{x=0} :hskip 0",
				"{x=0}x==0{x=0} :hskip 0"
			];

			invalidProofs.forEach(proof => {
				const result = handleProofSyntaxCheck({ proofContent: proof });
				expect(result.syntaxErrors.length).toBeGreaterThan(0);
			});
		});
	});

	describe('Law Suffix Tests', () => {
		it('should accept valid law suffixes', () => {
			const validProofs = [
				"{x=0}x:=x+1{x=1} :hassign 0",
				"{x=0}x=0{x=0} :hskip 0",
				"x=1->x=1 :arith"
			];

			validProofs.forEach(proof => {
				const result = handleProofSyntaxCheck({ proofContent: proof });
				expect(result.syntaxErrors).toHaveLength(0);
			});
		});

		it('should reject invalid law suffixes', () => {
			const invalidProofs = [
				"{x=0}x:=x+1{x=1} :invalid 0",
				"{x=0}x:=x+1{x=1} hassign 0",
				"{x=0}x:=x+1{x=1} :hassign",
				"{x=0}x:=x+1{x=1}"
			];

			invalidProofs.forEach(proof => {
				const result = handleProofSyntaxCheck({ proofContent: proof });
				expect(result.syntaxErrors).toHaveLength(1);
				expect(result.syntaxErrors[0].messages).toContain(
					"Line does not end with a recognised law suffix, e.g. ':hskip <int>'"
				);
			});
		});
	});

	describe('Multiple Line Tests', () => {
		it('should accept valid multiple line proofs', () => {
			const validProof = `x=1->x=1 :arith
{x=1}x:=x+1{x=2} :hassign 0
{x=2}x=2{x=2} :hskip 1`;

			const result = handleProofSyntaxCheck({ proofContent: validProof });
			expect(result.syntaxErrors).toHaveLength(0);
			expect(result.formattedProofLines).toHaveLength(3);
		});

		it('should identify errors in multiple line proofs', () => {
			const invalidProof = `x=1->x=1 :invalid
{x=1x:=x+1{x=2} :hassign 0
{x=2}x=2{x=2}`;

			const result = handleProofSyntaxCheck({ proofContent: invalidProof });
			expect(result.syntaxErrors.length).toBeGreaterThan(1);
		});
	});

	describe('Whitespace Handling Tests', () => {
		it('should handle various whitespace patterns', () => {
			const proofs = [
				"   {x=0}   x:=x+1   {x=1}    :hassign 0   ",
				"{x=0}x:=x+1{x=1}:hassign 0",
				`{x=0}    x:=x+1    {x=1}    :hassign 0
                {x=1}    x=1    {x=1}    :hskip 1`
			];

			proofs.forEach(proof => {
				const result = handleProofSyntaxCheck({ proofContent: proof });
				expect(result.syntaxErrors).toHaveLength(0);
			});
		});
	});
});
