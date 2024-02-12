import fs from "fs";
import path from "path";

import Parser from "../parser/parser.ts";
import Environment from "../runtime/environment.ts";
import { evaluate } from "../runtime/interpreter.ts";

test("main test file should be read and used as input to create a new program", () => {
	const parser = new Parser();
	const environment = new Environment();

	const filePath = path.resolve(__dirname, "fixtures/mainTest.txt");
	const input = fs.readFileSync(filePath, { encoding: "utf8" });

	try {
		const program = parser.produceAST(input);
		const result = evaluate(program, environment);
		console.log(result);
	} catch (error) {
		console.error(error);
		console.log("Exiting repl...");
		process.exit(1);
	}

	// const expectedResult =

	// expect(results).toEqual(expectedResult);
});
