export type ValueType = "null" | "number" | "boolean";

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

export function MAKE_NULL(): NullValue {
	return { type: "null", value: null };
}

export function MAKE_NUMBER(value = 0): NumberValue {
	return { type: "number", value };
}

export function MAKE_BOOL(value = true): BooleanValue {
	return { type: "boolean", value };
}
