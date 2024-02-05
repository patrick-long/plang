import process, { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import Parser from "./parser/parser.ts";
import { evaluate } from "./runtime/interpreter.ts";

/**
 * Creates a CLI REPL for user input. Instantiates a new Parser and creates a Program from
 * user input by calling `parser.produceAST()` with the user's input.
 * Exits Node process with '0' if successful, and with '1' if an error is caught.
 */
async function repl() {
	const parser = new Parser();
	const rl = readline.createInterface({ input, output });

	console.log("Repl v0.1");

	while (true) {
		try {
			const userInput = await rl.question("> ");

			if (!userInput || userInput.includes("exit")) {
				console.log("Exiting repl...");
				process.exit(0);
			}

			const program = parser.produceAST(userInput);

			console.log("program", JSON.stringify(program, null, 2));

			const result = evaluate(program);

			console.log("result", JSON.stringify(result, null, 2));
		} catch (error) {
			console.error(error);
			console.log("Exiting repl...");
			process.exit(1);
		}
	}
}

repl();
