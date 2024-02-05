import process, { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import Parser from "./parser/parser.ts";

async function repl() {
	const parser = new Parser();
	const rl = readline.createInterface({ input, output });

	console.log("Repl v0.1");

	while (true) {
		const userInput = await rl.question("> ");

		if (!userInput || userInput.includes("exit")) {
			process.exit(0);
		}

		const program = parser.produceAST(userInput);

		console.log(program);
	}
}

repl();
