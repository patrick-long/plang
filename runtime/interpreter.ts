import { RuntimeValue, NumberValue, NullValue, MAKE_NULL } from "./values.ts";
import {
	BinaryExpression,
	Identifier,
	NumericLiteral,
	Program,
	Statement,
} from "../ast/ast.ts";
import Environment from "./environment.ts";

export function evaluate(
	astNode: Statement,
	environment: Environment
): RuntimeValue {
	switch (astNode.kind) {
		case "Program":
			return evaluateProgram(astNode as Program, environment);
		case "NumericLiteral":
			const numberValue: NumberValue = {
				type: "number",
				value: (astNode as NumericLiteral).value,
			};

			return numberValue;
		case "Identifier":
			return evaluateIdentifier(astNode as Identifier, environment);
		case "BinaryExpression":
			return evaluateBinaryExpression(astNode as BinaryExpression, environment);
		default:
			throw new Error(
				`This AST Node has not yet been setup for interpretation: '${JSON.stringify(
					astNode
				)}'`
			);
	}
}

function evaluateProgram(
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

function evaluateIdentifier(
	identifer: Identifier,
	environment: Environment
): RuntimeValue {
	return environment.lookupVariable(identifer.symbol);
}

function evaluateBinaryExpression(
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
