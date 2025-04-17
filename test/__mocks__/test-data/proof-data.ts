const validProofData = {
	skipLaw: {
		proofOne: ['x=1 -> x=1 :arith', '{x=1} x=1 {x=1} :hskip 1'],
		proofTwo: ['x=1 /\\ y=2 -> x=1 /\\ y=2 :arith', '{x=1 /\\ y=2} x=1 /\\ y=2 {x=1 /\\ y=2} :hskip 1'],
		proofThree: ['x>4 /\\ y=2 /\\ z=3 -> x>4 /\\ y=2 /\\ z=3  :arith', '{x>4 /\\ y=2 /\\ z=3} x>4 /\\ y=2 /\\ z=3 {x>4 /\\ y=2 /\\ z=3} :hskip 1']
	},
}

const invalidProofData = {
	skipLaw: {
		proofOne: [],
		proofTwo: [],
		proofThree: []
	}
}

export { validProofData, invalidProofData };