import { RuntimeValue, NumberValue } from "./values.ts";
import {
	AssignmentExpression,
	BinaryExpression,
	CallExpression,
	Identifier,
	NumericLiteral,
	ObjectLiteral,
	Program,
	Statement,
	VariableDeclaration,
} from "../ast/ast.ts";
import Environment from "./environment.ts";
import {
	evaluateProgram,
	evaluateVariableDeclaration,
} from "./eval/statements.ts";
import {
	evaluateBinaryExpression,
	evaluateIdentifier,
	evaluateAssignmentExpression,
	evaluateObjectExpression,
	evaluateCallExpression,
} from "./eval/expressions.ts";

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
		case "ObjectLiteral":
			return evaluateObjectExpression(astNode as ObjectLiteral, environment);
		case "MemberExpression":
		case "CallExpression":
			return evaluateCallExpression(astNode as CallExpression, environment);
		case "Identifier":
			return evaluateIdentifier(astNode as Identifier, environment);
		case "BinaryExpression":
			return evaluateBinaryExpression(astNode as BinaryExpression, environment);
		case "VariableDeclaration":
			return evaluateVariableDeclaration(
				astNode as VariableDeclaration,
				environment
			);
		case "AssignmentExpression":
			return evaluateAssignmentExpression(
				astNode as AssignmentExpression,
				environment
			);
		default:
			throw new Error(
				`This AST Node has not yet been setup for interpretation: '${JSON.stringify(
					astNode
				)}'`
			);
	}
}
