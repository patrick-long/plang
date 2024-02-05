import { RuntimeValue } from "./values.ts";

export default class Environment {
	private parent?: Environment;
	private variables: Map<string, RuntimeValue>;

	constructor(parentEnvironment?: Environment) {
		this.parent = parentEnvironment;
		this.variables = new Map();
	}

	public declareVariable(
		variableName: string,
		value: RuntimeValue
	): RuntimeValue {
		if (this.variables.has(variableName)) {
			throw new Error(
				`Cannot declare variable ${variableName}. It is already defined.`
			);
		}

		this.variables.set(variableName, value);
		return value;
	}

	public assignVariable(
		variableName: string,
		value: RuntimeValue
	): RuntimeValue {
		const environment = this.resolve(variableName);
		environment.variables.set(variableName, value);

		return value;
	}

	public resolve(variableName: string): Environment {
		if (this.variables.has(variableName)) {
			return this;
		}

		if (!this.parent) {
			throw new Error(
				`Cannot resolve ${variableName}. It does not exist in the current scope.`
			);
		}

		return this.parent.resolve(variableName);
	}

	public lookupVariable(variableName: string): RuntimeValue {
		const environment = this.resolve(variableName);
		return environment.variables.get(variableName);
	}
}
