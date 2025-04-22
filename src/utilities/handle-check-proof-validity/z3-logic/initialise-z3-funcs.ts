/* eslint-disable @typescript-eslint/naming-convention -- Needed as export names from Z3 package are uppercase and renaming to strictCamelCase aliases could be confusing */

/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */
/* eslint-disable @typescript-eslint/no-unsafe-return -- lack of typing in Z3 package */

// @ts-expect-error z3-solver is not recognising 'sat' as a valid export
import {init, sat} from 'z3-solver';

let z3Context: any = null;

async function getZ3Context() {
	if (!z3Context) {
		const {Context} = await init();

		// @ts-expect-error z3 package doesn't provide typing for these constructs at current v4.14.1
		z3Context = new Context('main');
	}

	return z3Context;
}

async function initialiseContext() {
	const context = await getZ3Context();

	const {Int, And, Solver, Not, Implies} = context;

	return [Int, And, Solver, Not, Implies];
}

export {initialiseContext};
