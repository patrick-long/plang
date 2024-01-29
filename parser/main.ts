import Parser from "./parser";

async function repl() {
	const parser = new Parser();

	console.log("Repl v0.1");

	while (true) {
		// USE READLINE!!! built into Node.js :)
		// const input =  // TODO: get user input from node
		// if (!input || input.includes("exit")) {
		// 	// TODO: stop node server
		// }
		// const program = parser.produceAST(input);
		// console.log({ program });
	}
}

repl();
