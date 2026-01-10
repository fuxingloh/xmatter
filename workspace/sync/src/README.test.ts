import { expect, it } from "vitest";

import { validate } from "./README";

it.each([
  {
    valid: true,
    readme: {
      title: "Ethereum (ETH)",
      frontmatter: {
        symbol: "ETH",
        decimals: 1,
      },
    },
  },
  {
    valid: true,
    readme: {
      title: "(ETH)",
      frontmatter: {
        symbol: "ETH",
        decimals: 0,
      },
    },
  },
  {
    valid: true,
    readme: {
      title: "Ethereum (ETH)",
      frontmatter: {
        symbol: "ETH",
        decimals: 18,
      },
    },
  },
  {
    valid: true,
    readme: {
      title: "Ethereum (ETH)",
      frontmatter: {
        symbol: "ETH",
        decimals: 18,
        tags: ["ethereum", "eth"],
      },
    },
  },
  {
    valid: true,
    readme: {
      title: "Ethereum (ETH)",
      frontmatter: {
        symbol: "ETH",
        decimals: 18,
        links: [
          {
            name: "explorer",
            url: "https://etherscan.io",
          },
        ],
      },
    },
  },
  {
    valid: false,
    readme: {
      title: "Ethereum (ETH)",
      frontmatter: {
        symbol: "ETH ",
        decimals: 0,
      },
    },
  },
  {
    valid: false,
    readme: {
      title: "Ethereum (ETH)",
      frontmatter: {
        symbol: "ETH",
        decimals: -1,
      },
    },
  },
  {
    valid: false,
    readme: {
      title: "Ethereum ",
      frontmatter: {
        symbol: "ETH",
        decimals: 0,
      },
    },
  },
  {
    valid: false,
    readme: {
      title: "Ethereum (ETH)",
      frontmatter: {
        symbol: "ETH",
        decimals: -1,
      },
    },
  },
  {
    valid: false,
    readme: {
      title: "Ethereum (ETH)",
      frontmatter: {
        symbol: "ETH",
        decimals: 0.5,
      },
    },
  },
  {
    valid: false,
    readme: {
      frontmatter: {
        symbol: "ETH",
        decimals: 18,
      },
    },
  },
  {
    valid: false,
    readme: {
      title: "",
      frontmatter: {
        symbol: "ETH",
        decimals: 18,
      },
    },
  },
  {
    valid: false,
    readme: {
      title: "ETH",
      frontmatter: {
        decimals: 18,
      },
    },
  },
])("should be validate README", async ({ readme, valid }) => {
  expect(validate(readme)).toBe(valid);
});
