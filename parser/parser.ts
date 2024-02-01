import type {
	Statement,
	Program,
	Expression,
	BinaryExpression,
	NumericLiteral,
	Identifier,
} from "../ast/ast";
import { tokenize, type Token, TokenType } from "../lexer/lexer";

export default class Parser {
	private tokens: Token[] = [];

	private notEndFile(): boolean {
		return this.tokens[0].type !== TokenType.EndFile;
	}

	private statement(): Statement {
		// TODO: Function declaration statements, try/catch blocks, while loops, et cetera
		return this.parseExpression();
	}

	private parseExpression(): Expression { return {} as Expression }

	private parsePrimaryExpression(): Expression {
		const token = this.next().type;

		switch (token) {
			case TokenType.Identifier:
				return { kind: "Identifier", symbol: this.eat().value } as Identifier;
			case TokenType.Number:
				return {
					kind: "NumericLiteral",
					value: parseFloat(this.eat().value),
				} as NumericLiteral;
			default:
				throw new Error(
					`Unexpected token found during parsing: '${this.next()}'`
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
