import { RuntimeValue, NumberValue, NullValue } from "./values.ts";
import {
	BinaryExpression,
	NumericLiteral,
	Program,
	Statement,
} from "../ast/ast.ts";

export function evaluate(astNode: Statement): RuntimeValue {
	switch (astNode.kind) {
		case "Program":
			return evaluateProgram(astNode as Program);
		case "NumericLiteral":
			const numberValue: NumberValue = {
				type: "number",
				value: (astNode as NumericLiteral).value,
			};

			return numberValue;
		case "NullLiteral":
			const nullValue: NullValue = {
				type: "null",
				value: "null",
			};

			return nullValue;
		case "BinaryExpression":
			return evaluateBinaryExpression(astNode as BinaryExpression);
		default:
			throw new Error(
				`This AST Node has not yet been setup for interpretation: '${JSON.stringify(
					astNode
				)}'`
			);
	}
}

function evaluateProgram(program: Program): RuntimeValue {
	const { body } = program;
	let lastEvaluted: RuntimeValue = { type: "null", value: "null" } as NullValue;

	for (const node of body) {
		lastEvaluted = evaluate(node);
	}

	return lastEvaluted;
}

function evaluateBinaryExpression(
	binaryOperation: BinaryExpression
): RuntimeValue {
	const leftOperand = evaluate(binaryOperation.left) as NumberValue;
	const rightOperand = evaluate(binaryOperation.right) as NumberValue;

	if (leftOperand.type === "number" && rightOperand.type === "number") {
		return evaluateNumericBinaryExpression(
			leftOperand,
			rightOperand,
			binaryOperation.operator
		);
	}

	const nullValue: NullValue = { type: "null", value: "null" };
	return nullValue;
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
