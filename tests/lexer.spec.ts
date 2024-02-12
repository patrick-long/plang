import fs from "fs";
import path from "path";

import { tokenize } from "../lexer/lexer.ts";

test("lexer should properly tokenize .txt file", () => {
	const filePath = path.resolve(__dirname, "fixtures/lexer.txt");
	const lines = fs
		.readFileSync(filePath, { encoding: "utf8" })
		.trim()
		.split("\r\n");

	const results = [];

	lines.forEach((line: string) => {
		for (const token of tokenize(line)) {
			results.push(token);
		}
	});

	const expectedResult = [
		{ value: "let", type: 2 },
		{ value: "x", type: 1 },
		{ value: "=", type: 3 },
		{ value: "45", type: 0 },
		{ value: "*", type: 6 },
		{ value: "(", type: 4 },
		{ value: "45", type: 0 },
		{ value: "/", type: 6 },
		{ value: "3", type: 0 },
		{ value: ")", type: 5 },
		{ value: "EndFile", type: 7 },
	];

	expect(results).toEqual(expectedResult);
});
