const validProofData = {
	skipLaw: {
		proofOne: ['x=1 -> x=1 :arith', '{x=1} x=1 {x=1} :hskip 1'],
		proofTwo: ['x=1 /\\ y=2 -> x=1 /\\ y=2 :arith', '{x=1 /\\ y=2} x=1 /\\ y=2 {x=1 /\\ y=2} :hskip 1'],
		proofThree: ['x>4 /\\ y=2 /\\ z=3 -> x>4 /\\ y=2 /\\ z=3  :arith', '{x>4 /\\ y=2 /\\ z=3} x>4 /\\ y=2 /\\ z=3 {x>4 /\\ y=2 /\\ z=3} :hskip 1'],
		proofFour: ['a<=6 /\\ b>3 /\\ c<=2 -> a<=6 /\\ b>3 /\\ c<=2 :arith', '{a<=6 /\\ b>3 /\\ c<=2} a<=6 /\\ b>3 /\\ c<=2 {a<=6 /\\ b>3 /\\ c<=2} :hskip 1']
	},
}

const invalidProofData = {
	skipLaw: {
		proofOne: ['x>3 -> x<3 :arith', '{x<3} x<3 {x<3} :hskip 1'],
		proofTwo: ['a>1 /\\ b<3 -> b>1 /\\ a<3 :arith', '{a>1 /\\ b<3} a>1 /\\ b<3 {a>1 /\\ b<3} :hskip 1'],
		proofThree: ['a<g -> a<g :arith', '{a<g} a<g {a<g} :hskip 1'],
		proofFour: ['x=1 /\\ y>3 /\\ z=6 /\\ w=2 -> x=1 /\\ y>3 /\\ z=6 /\\ w=2  :arith', '{x=1 /\\ y>3 /\\ z=6 /\\ w=2} x=1 /\\ y>3 /\\ z=6 /\\ w=2  {x=1 /\\ y>3 /\\ z=6 /\\ w=2} :hskip 1']
	}
}

export { validProofData, invalidProofData };