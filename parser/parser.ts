import type {
	Statement,
	Program,
	Expression,
	BinaryExpression,
	NumericLiteral,
	Identifier,
	NullLiteral,
} from "../ast/ast.ts";
import { tokenize, type Token, TokenType } from "../lexer/lexer.ts";

export default class Parser {
	private tokens: Token[] = [];

	/**
	 * Returns false if the next Token in `tokens` is of type 'EndFile'.
	 * @returns {boolean} boolean
	 */
	private notEndFile(): boolean {
		return this.tokens[0].type !== TokenType.EndFile;
	}

	/**
	 * Parses an expression and returns it as a Statement.
	 * @returns {Statement} statement
	 */
	private statement(): Statement {
		// TODO: Function declaration statements, try/catch blocks, while loops, et cetera
		return this.parseExpression();
	}

	/**
	 * Parses an additive expression and returns the result.
	 * @returns {Expression} parsed expression
	 */
	private parseExpression(): Expression {
		return this.parseAdditiveExpression();
	}

	// // Orders of Precedence (in order of parsing)
	// ComparisonExpression
	// LogicalExpression
	// FunctionCall
	// MemberExpression
	// AssignmentExpression
	// AdditiveExpression
	// MultiplicativeExpression
	// UnaryExpression
	// PrimaryExpression

	/**
	 * Parses left side of an expression as a multiplicative expression. Recursively parses
	 * right side of expression as multiplicative expression if operator is either '+' or '-'.
	 * @returns {Expression} parsed multiplicative expression
	 */
	private parseAdditiveExpression(): Expression {
		let left = this.parseMultiplicativeExpression();

		while (this.next().value === "+" || this.next().value === "-") {
			const operator = this.eat().value;
			const right = this.parseMultiplicativeExpression();

			left = {
				kind: "BinaryExpression",
				left,
				right,
				operator,
			} as BinaryExpression;
		}

		return left;
	}

	/**
	 * Parses left side of an expression as a primary expression. Recursively parses
	 * right side of expression as primary expression if operator is '*', '/' or '%'.
	 * @returns {Expression} parsed primary expression
	 */
	private parseMultiplicativeExpression(): Expression {
		let left = this.parsePrimaryExpression();

		while (
			this.next().value === "*" ||
			this.next().value === "/" ||
			this.next().value === "%"
		) {
			const operator = this.eat().value;
			const right = this.parsePrimaryExpression();

			left = {
				kind: "BinaryExpression",
				left,
				right,
				operator,
			} as BinaryExpression;
		}

		return left;
	}

	/**
	 * Parses next token in `tokens` into appropriate expression interface.
	 * Expression interface options: Identifier, NumericLiteral
	 * @returns {Expression} primary expression (Identifier, NumericLiteral)
	 * @throws {Error} when unexpected token is found during parsing
	 */
	private parsePrimaryExpression(): Expression {
		const token = this.next().type;

		switch (token) {
			case TokenType.Identifier:
				const identifier: Identifier = {
					kind: "Identifier",
					symbol: this.eat().value,
				};

				return identifier;
			case TokenType.Number:
				const numericLiteral: NumericLiteral = {
					kind: "NumericLiteral",
					value: parseFloat(this.eat().value),
				};

				return numericLiteral;
			case TokenType.Null:
				this.eat(); // advance past 'null' keyword
				const nullLiteral: NullLiteral = { kind: "NullLiteral", value: "null" };

				return nullLiteral;
			case TokenType.OpenParen:
				const parentheticalValue = this.parentheticalValue();

				return parentheticalValue;
			default:
				throw new Error(
					`Unexpected token found during parsing: '${JSON.stringify(
						this.next()
					)}'`
				);
		}
	}

	/**
	 * Returns the token at the front of the `tokens` queue.
	 * @returns {Token} token
	 */
	private next(): Token {
		return this.tokens[0];
	}

	/**
	 * Returns the shifted token from the front of the `tokens` queue.
	 * @returns {Token} token
	 */
	private eat(): Token {
		return this.tokens.shift();
	}

	/**
	 * Parses parenthetical expression by calling `this.parseExpression()` after removing open parenthesis.
	 * Checks to make sure a close parenthesis is present to match the open parenthesis. Otherwise,
	 * function will throw an error.
	 * @returns {Expression} parenthetical expression
	 * @throws {Error} when no closing parenthesis is found during parsing
	 */
	private parentheticalValue(): Expression {
		const _openParenthesis = this.eat();
		const expression = this.parseExpression();
		const closeParenthesis = this.eat();

		if (!closeParenthesis || closeParenthesis.type !== TokenType.CloseParen) {
			throw new Error(
				`Unexpected token found during parsing: '${JSON.stringify(
					closeParenthesis
				)}'. Expected ')'.`
			);
		}

		return expression;
	}

	/**
	 * Tokenizes source code until EndFile character is found. Creates a Program out of the
	 * tokenized source code and returns the Program.
	 * @param source
	 * @returns {Program} program
	 */
	public produceAST(source: string): Program {
		this.tokens = tokenize(source);

		const program: Program = {
			kind: "Program",
			body: [],
		};

		// Parse until end of file
		while (this.notEndFile()) {
			program.body.push(this.statement());
		}

		return program;
	}
}
