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
		return this.parsePrimaryExpression();
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
