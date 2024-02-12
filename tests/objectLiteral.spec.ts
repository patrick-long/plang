import fs from "fs";
import path from "path";

import Parser from "../parser/parser.ts";
import Environment from "../runtime/environment.ts";
import { evaluate } from "../runtime/interpreter.ts";

test("objectLiteral.txt test file should be read and used as input to create a new program", () => {
	let result;
	const parser = new Parser();
	const environment = new Environment();

	const filePath = path.resolve(__dirname, "fixtures/mainTest.txt");
	const input = fs.readFileSync(filePath, { encoding: "utf8" });

	try {
		const program = parser.produceAST(input);
		result = evaluate(program, environment);
	} catch (error) {
		console.error(error);
		console.log("Exiting repl...");
		process.exit(1);
	}

	const expectedProperties = new Map();
	expectedProperties.set("x", { type: "number", value: 100 });
	expectedProperties.set("y", { type: "number", value: 32 });
	expectedProperties.set("foo", { type: "number", value: 45 });

	const complexProperties = new Map();
	complexProperties.set("bar", { type: "boolean", value: true });

	expectedProperties.set("complex", {
		type: "object",
		properties: complexProperties,
	});

	const expectedResult = {
		type: "object",
		properties: expectedProperties,
	};

	expect(result).toEqual(expectedResult);
});
