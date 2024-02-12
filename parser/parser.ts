import type {
	Statement,
	Program,
	Expression,
	BinaryExpression,
	NumericLiteral,
	Identifier,
	VariableDeclaration,
	AssignmentExpression,
	Property,
	ObjectLiteral,
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
		switch (this.next().type) {
			case TokenType.Let:
			case TokenType.Const:
				return this.parseVariableDeclaration();
			default:
				return this.parseExpression();
		}
	}

	private parseVariableDeclaration(): Statement {
		const statement = this.eat();
		const isConstant = statement.type === TokenType.Const;
		const identifier = this.expect(
			TokenType.Identifier,
			"Expected identifier following let or const keyword."
		).value;

		if (this.next().type === TokenType.Semicolon) {
			this.eat(); // advance past semicolon

			if (isConstant) {
				throw new Error(
					"Expected variable assignment following const keyword. Found ';'"
				);
			}

			return {
				kind: "VariableDeclaration",
				identifier,
				constant: false,
			} as VariableDeclaration;
		}

		this.expect(
			TokenType.Equals,
			"Expected assignment operator following identifier in variable declaration."
		);

		const declaration: VariableDeclaration = {
			kind: "VariableDeclaration",
			value: this.parseExpression(),
			identifier,
			constant: isConstant,
		};

		this.expect(
			TokenType.Semicolon,
			"Variable declaration statement must end with semicolon"
		);

		return declaration;
	}

	private expect(tokenType: TokenType, errorMessage: string) {
		const nextToken = this.eat();

		if (nextToken.type !== tokenType) {
			throw new Error(errorMessage);
		}

		return nextToken;
	}

	/**
	 * Parses an additive expression and returns the result.
	 * @returns {Expression} parsed expression
	 */
	private parseExpression(): Expression {
		return this.parseAssignmentExpression();
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

	private parseAssignmentExpression(): Expression {
		const left = this.parseObjectExpression();

		if (this.next().type === TokenType.Equals) {
			this.eat(); // advance past equal sign
			const right = this.parseAssignmentExpression();
			return {
				kind: "AssignmentExpression",
				assignee: left,
				value: right,
			} as AssignmentExpression;
		}

		return left;
	}

	private parseObjectExpression(): Expression {
		if (this.next().type !== TokenType.OpenCurlyBracket) {
			return this.parseAdditiveExpression();
		}

		this.eat(); // advance past open bracket
		const properties = new Array<Property>();

		while (
			this.notEndFile() &&
			this.next().type !== TokenType.CloseCurlyBracket
		) {
			// { key: value, key2: value2, key3, key4 }
			const key = this.expect(
				TokenType.Identifier,
				"Object literal key expected."
			).value;

			// Allows shorthand key: value -> key
			if (this.next().type === TokenType.Comma) {
				this.eat(); // advance past comma
				properties.push({
					kind: "Property",
					key,
					value: undefined,
				});
				continue;
				// Allows shorthand { key }
			} else if (this.next().type === TokenType.CloseCurlyBracket) {
				properties.push({
					kind: "Property",
					key,
					value: undefined,
				});
				continue;
			}

			// Allows syntax {key: value }
			this.expect(
				TokenType.Colon,
				"Missing colon following identifier in Object Expression."
			);
			const value = this.parseExpression();

			properties.push({ kind: "Property", value, key });

			if (this.next().type !== TokenType.CloseCurlyBracket) {
				this.expect(
					TokenType.Comma,
					"Expected comma or closing bracket following property in object."
				);
			}
		}

		this.expect(
			TokenType.CloseCurlyBracket,
			"Object literal missing closing brace. Expecting: '}'."
		);

		return { kind: "ObjectLiteral", properties } as ObjectLiteral;
	}

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
