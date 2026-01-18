import Ajv from "ajv";

const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    title: {
      type: "string",
      minLength: 1,
      pattern: "^(?!\\s)(?!.*\\s$).*$",
    },
    frontmatter: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          minLength: 1,
          pattern: "^(?!\\s)(?!.*\\s$).*$",
        },
        decimals: {
          type: "number",
          minimum: 0,
          maximum: 256,
          multipleOf: 1,
        },
        tags: {
          type: "array",
          items: {
            type: "string",
          },
        },
        links: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              url: {
                type: "string",
              },
            },
            required: ["name", "url"],
          },
        },
      },
      required: ["symbol", "decimals"],
    },
  },
  required: ["title", "frontmatter"],
};

const ajv = new Ajv();

export const validate = ajv.compile(schema);

export function getValidateErrors(): string {
  return ajv.errorsText(validate.errors);
}

export interface README {
  frontmatter: {
    symbol: string;
    decimals: number;
    tags?: string[];
    links?: {
      name: string;
      url: string;
    }[];
  };
  title: string;
  body?: string;
}
