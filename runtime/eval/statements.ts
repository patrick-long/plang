import {
	FunctionDeclaration,
	Program,
	VariableDeclaration,
} from "../../ast/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import {
	FunctionValue,
	MAKE_NULL,
	NullValue,
	RuntimeValue,
} from "../values.ts";

export function evaluateProgram(
	program: Program,
	environment: Environment
): RuntimeValue {
	const { body } = program;
	let lastEvaluted: RuntimeValue = { type: "null", value: "null" } as NullValue;

	for (const node of body) {
		lastEvaluted = evaluate(node, environment);
	}

	return lastEvaluted;
}

export function evaluateVariableDeclaration(
	variableDeclaration: VariableDeclaration,
	environment: Environment
): RuntimeValue {
	const value = variableDeclaration.value
		? evaluate(variableDeclaration.value, environment)
		: MAKE_NULL();

	return environment.declareVariable(
		variableDeclaration.identifier,
		value,
		variableDeclaration.constant
	);
}

export function evaluateFunctionDeclaration(
	functionDeclaration: FunctionDeclaration,
	environment: Environment
): RuntimeValue {
	const func: FunctionValue = {
		type: "function",
		name: functionDeclaration.name,
		params: functionDeclaration.params,
		declarationEnv: environment,
		body: functionDeclaration.body,
	};

	return environment.declareVariable(functionDeclaration.name, func, true);
}
