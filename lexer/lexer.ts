export enum TokenType {
	// Literal Types
	Number,
	Identifier,
	Null,

	// Keywords
	Let,

	// Grouping & Operators
	Equals,
	OpenParen,
	CloseParen,
	BinaryOperator,
	EndFile,
}

const KEYWORDS: Record<string, TokenType> = {
	let: TokenType.Let,
	null: TokenType.Null,
};

export interface Token {
	value: string;
	type: TokenType;
}

/**
 * Creates and returns Token instance out of value and token params.
 * @param value
 * @param type
 * @returns {Token} token
 */
function token(value: string = "", type: TokenType): Token {
	return { value, type };
}

/**
 * Returns true if the `source` string is an alphabetical character. Returns false otherwise.
 * @param source
 * @returns {boolean} boolean
 */
function isAlphabetic(source: string): boolean {
	return source.toUpperCase() !== source.toLowerCase();
}

/**
 * Returns true if the `source` string is a numeric character. Returns false otherwise.
 * @param source
 * @returns {boolean} boolean
 */
function isInt(source: string): boolean {
	const char = source.charCodeAt(0);
	const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];

	return char >= bounds[0] && char <= bounds[1];
}

/**
 * Returns true if the `source` string is a skippable character. Returns false otherwise.
 * @param source
 * @returns {boolean} boolean
 */
function isSkippable(source: string): boolean {
	return source === "" || source === "\n" || source === "\t" || source === " ";
}

/**
 * Creates an array of Token instances based on the `sourceCode` passed to the function.
 * @param sourceCode
 * @returns {Token[]} array of Tokens
 * @throws {Error} when unrecognized character is found in `sourceCode`
 */
export function tokenize(sourceCode: string): Token[] {
	const tokens = new Array<Token>();
	const src = sourceCode.split("");

	// Build each token until end of file
	while (src.length > 0) {
		if (src[0] === "(") {
			tokens.push(token(src.shift(), TokenType.OpenParen));
		} else if (src[0] === ")") {
			tokens.push(token(src.shift(), TokenType.CloseParen));
		} else if (
			src[0] === "+" ||
			src[0] === "-" ||
			src[0] === "*" ||
			src[0] === "/" ||
			src[0] === "%"
		) {
			tokens.push(token(src.shift(), TokenType.BinaryOperator));
		} else if (src[0] === "=") {
			tokens.push(token(src.shift(), TokenType.Equals));
		} else {
			// Handle multicharacter tokens (<=, ++, let)
			// Build number token
			if (isInt(src[0])) {
				let num = "";

				while (src.length > 0 && isInt(src[0])) {
					num += src.shift();
				}

				tokens.push(token(num, TokenType.Number));
			}
			// Build identifier token
			else if (isAlphabetic(src[0])) {
				let word = "";

				while (src.length > 0 && isAlphabetic(src[0])) {
					word += src.shift();
				}

				// Check for reserved keywords and push reserved keyword
				const reserved = KEYWORDS[word];

				if (typeof reserved === "number") {
					tokens.push(token(word, reserved));
				} else {
					tokens.push(token(word, TokenType.Identifier));
				}
			}
			// Skip skippable tokens
			else if (isSkippable(src[0])) {
				// Skip the current character
				src.shift();
			} else {
				throw new Error(
					`Unrecognized character found in source code: "${src[0]}"`
				);
			}
		}
	}

	tokens.push(token("EndFile", TokenType.EndFile));

	return tokens;
}
