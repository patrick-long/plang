import { BinaryExpression, Identifier } from "../../ast/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { MAKE_NULL, NumberValue, RuntimeValue } from "../values.ts";

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
