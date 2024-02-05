import type {
	Statement,
	Program,
	Expression,
	BinaryExpression,
	NumericLiteral,
	Identifier,
} from "../ast/ast.ts";
import { tokenize, type Token, TokenType } from "../lexer/lexer.ts";

export default class Parser {
	private tokens: Token[] = [];

	private notEndFile(): boolean {
		return this.tokens[0].type !== TokenType.EndFile;
	}

	private statement(): Statement {
		// TODO: Function declaration statements, try/catch blocks, while loops, et cetera
		return this.parseExpression();
	}

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

	private next(): Token {
		return this.tokens[0];
	}

	private eat(): Token {
		return this.tokens.shift();
	}

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
