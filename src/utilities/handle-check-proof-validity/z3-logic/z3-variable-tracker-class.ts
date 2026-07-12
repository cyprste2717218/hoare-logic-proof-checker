/* eslint-disable @typescript-eslint/no-unsafe-assignment -- lack of typing in Z3 package  */
import {type Z3Variable} from '@/models/hoare-law-z3-models';

class Z3VariableTracker {
	private readonly variables = new Map<string, Z3Variable>();

	addVariable(programVarName: string, variable: any, type: Z3Variable['type']) {
		this.variables.set(programVarName, {variable, programVarName, type});
	}

	getVariable(name: string): Z3Variable | undefined {
		return this.variables.get(name);
	}

	getAllVariables(): Z3Variable[] {
		return Array.from(this.variables.values());
	}
}

export const tracker = new Z3VariableTracker();
