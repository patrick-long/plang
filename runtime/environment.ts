import {
	MAKE_BOOL,
	MAKE_NATIVE_FUNCTION,
	MAKE_NULL,
	MAKE_NUMBER,
	RuntimeValue,
} from "./values.ts";

function initGlobalEnvironment(environment: Environment) {
	environment.declareVariable("true", MAKE_BOOL(), true);
	environment.declareVariable("false", MAKE_BOOL(false), true);
	environment.declareVariable("null", MAKE_NULL(), true);

	function print(args: RuntimeValue[]) {
		console.log(...args);
		return MAKE_NULL();
	}

	function time(_args: RuntimeValue[]) {
		return MAKE_NUMBER(Date.now());
	}

	environment.declareVariable("print", MAKE_NATIVE_FUNCTION(print), true);
	environment.declareVariable("time", MAKE_NATIVE_FUNCTION(time), true);
}

export default class Environment {
	private parent?: Environment;
	private variables: Map<string, RuntimeValue>;
	private constants: Set<string>;

	constructor(parentEnvironment?: Environment) {
		this.parent = parentEnvironment;
		this.variables = new Map();
		this.constants = new Set();

		if (!this.parent) {
			initGlobalEnvironment(this);
		}
	}

	public declareVariable(
		variableName: string,
		value: RuntimeValue,
		isConstant: boolean
	): RuntimeValue {
		if (this.variables.has(variableName)) {
			throw new Error(
				`Cannot declare variable ${variableName}. It is already defined.`
			);
		}

		if (isConstant) {
			this.constants.add(variableName);
		}

		this.variables.set(variableName, value);

		return value;
	}

	public assignVariable(
		variableName: string,
		value: RuntimeValue
	): RuntimeValue {
		const environment = this.resolve(variableName);

		if (environment.constants.has(variableName)) {
			throw new Error(
				`Cannot reassign constant value. Attempting to reassign constant: '${variableName}'`
			);
		}

		environment.variables.set(variableName, value);

		return value;
	}

	public resolve(variableName: string): Environment {
		if (this.variables.has(variableName) || this.constants.has(variableName)) {
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
