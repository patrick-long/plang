import {
	AssignmentExpression,
	BinaryExpression,
	CallExpression,
	Expression,
	Identifier,
	ObjectLiteral,
} from "../../ast/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import {
	FunctionValue,
	MAKE_NULL,
	NativeFunctionValue,
	NumberValue,
	ObjectValue,
	RuntimeValue,
} from "../values.ts";

export function evaluateIdentifier(
	identifer: Identifier,
	environment: Environment
): RuntimeValue {
	return environment.lookupVariable(identifer.symbol);
}

export function evaluateBinaryExpression(
	binaryOperation: BinaryExpression,
	environment: Environment
): RuntimeValue {
	const leftOperand = evaluate(
		binaryOperation.left,
		environment
	) as NumberValue;
	const rightOperand = evaluate(
		binaryOperation.right,
		environment
	) as NumberValue;

	if (leftOperand.type === "number" && rightOperand.type === "number") {
		return evaluateNumericBinaryExpression(
			leftOperand,
			rightOperand,
			binaryOperation.operator
		);
	}

	return MAKE_NULL();
}

function evaluateNumericBinaryExpression(
	leftOperand: NumberValue,
	rightOperand: NumberValue,
	operator: string
): NumberValue {
	let result: NumberValue = { type: "number", value: 0 };

	if (operator === "+") {
		result.value = leftOperand.value + rightOperand.value;
	} else if (operator === "-") {
		result.value = leftOperand.value - rightOperand.value;
	} else if (operator === "*") {
		result.value = leftOperand.value * rightOperand.value;
	} else if (operator === "/") {
		// TODO: division by 0 checks
		result.value = leftOperand.value / rightOperand.value;
	} else if (operator === "%") {
		result.value = leftOperand.value % rightOperand.value;
	}

	return result;
}

export function evaluateAssignmentExpression(
	assignmentExpression: AssignmentExpression,
	environment: Environment
): RuntimeValue {
	if (assignmentExpression.assignee.kind !== "Identifier") {
		throw new Error(
			`Invalid left hand side inside assignment expression: ${JSON.stringify(
				assignmentExpression.assignee
			)}`
		);
	}

	const assigneeIdentifier = (assignmentExpression.assignee as Identifier)
		.symbol;
	return environment.assignVariable(
		assigneeIdentifier,
		evaluate(assignmentExpression.value, environment)
	);
}

export function evaluateObjectExpression(
	objectLiteral: ObjectLiteral,
	environment: Environment
): RuntimeValue {
	const objectValue: ObjectValue = { type: "object", properties: new Map() };

	for (const { key, value } of objectLiteral.properties) {
		// If syntax is { foo }, then lookup variable "foo" in scope to set as value
		const runtimeValue = !value
			? environment.lookupVariable(key)
			: evaluate(value, environment);

		objectValue.properties.set(key, runtimeValue);
	}

	return objectValue;
}

export function evaluateCallExpression(
	callExpression: CallExpression,
	environment: Environment
): RuntimeValue {
	const args = callExpression.arguments.map((arg: Expression) =>
		evaluate(arg, environment)
	);
	const func = evaluate(callExpression.caller, environment);

	if (func.type === "native-function") {
		const result = (func as NativeFunctionValue).call(args, environment);
		return result;
	}

	if (func.type === "function") {
		const fn = func as FunctionValue;
		const scope = new Environment(fn.declarationEnv);

		// Create the variables for the parameter list
		for (let i = 0; i < fn.params.length; i++) {
			const varName = fn.params[i];
			scope.declareVariable(varName, args[i], false);
		}

		let result: RuntimeValue = MAKE_NULL();

		// Evaluate statements within function body
		for (const statement of fn.body) {
			result = evaluate(statement, scope);
		}

		return result;
	}

	throw new Error(
		`Cannot call value that is not a function; ${JSON.stringify(func)}`
	);
}
