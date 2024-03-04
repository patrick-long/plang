import { Statement } from "../ast/ast.ts";
import Environment from "./environment.ts";

export type ValueType =
	| "null"
	| "number"
	| "boolean"
	| "object"
	| "native-function"
	| "function";

export interface RuntimeValue {
	type: ValueType;
}

export interface NullValue extends RuntimeValue {
	type: "null";
	value: null;
}

export interface NumberValue extends RuntimeValue {
	type: "number";
	value: number;
}

export interface BooleanValue extends RuntimeValue {
	type: "boolean";
	value: boolean;
}

export interface ObjectValue extends RuntimeValue {
	type: "object";
	properties: Map<string, RuntimeValue>;
}

export type FunctionCall = (
	args: RuntimeValue[],
	environment: Environment
) => RuntimeValue;

export interface NativeFunctionValue extends RuntimeValue {
	type: "native-function";
	call: FunctionCall;
}

export interface FunctionValue extends RuntimeValue {
	type: "function";
	name: string;
	params: string[];
	declarationEnv: Environment;
	body: Statement[];
}

export function MAKE_NULL(): NullValue {
	return { type: "null", value: null };
}

export function MAKE_NUMBER(value = 0): NumberValue {
	return { type: "number", value };
}

export function MAKE_BOOL(value = true): BooleanValue {
	return { type: "boolean", value };
}

export function MAKE_NATIVE_FUNCTION(call: FunctionCall): NativeFunctionValue {
	return { type: "native-function", call };
}
