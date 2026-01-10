import { expect, it } from "@jest/globals";

import { getFrontmatter, getIndex, getInstalledNamespaces } from "./index";

it("should getIndex of eip155:1/erc20", async () => {
  const collection = await getIndex("eip155:1", "erc20");
  expect(collection).toStrictEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: "_erc20",
        path: "eip155:1/erc20:0x00000000008943c65cAf789FFFCF953bE156f6f8",
        fields: expect.any(Object),
      }),
    ]),
  );
});

it("should getFrontmatter of eip155:1/erc20:0x00000000008943c65cAf789FFFCF953bE156f6f8", async () => {
  const frontmatterContent = await getFrontmatter("eip155:1/erc20:0x00000000008943c65cAf789FFFCF953bE156f6f8");
  expect(frontmatterContent).toStrictEqual({
    fileId: expect.stringMatching(/[0-f]{64}/),
    type: "_erc20",
    path: "eip155:1/erc20:0x00000000008943c65cAf789FFFCF953bE156f6f8",
    modifiedDate: expect.any(Number),
    fields: {
      caip2: "eip155:1",
      namespace: "erc20",
      title: "Dharma USD Coin",
      symbol: "dUSDC",
      decimals: 8,
      links: [
        {
          name: "explorer",
          url: "https://etherscan.io/token/0x00000000008943c65cAf789FFFCF953bE156f6f8",
        },
      ],
      images: [
        {
          type: "icon",
          mime: "image/png",
          size: {
            width: 512,
            height: 512,
          },
          path: expect.stringMatching(/[0-9a-f]{64}\.png/),
        },
      ],
    },
    html: "<h1>Dharma USD Coin</h1>",
  });
});

it("should getFrontmatter of eip155:1/erc20:0", async () => {
  const frontmatterContent = await getFrontmatter("eip155:1/erc20:0");
  expect(frontmatterContent).toBeUndefined();
});

it("should getInstalledNamespaces()", async () => {
  const namespaces = await getInstalledNamespaces();
  expect(namespaces).toStrictEqual(
    expect.arrayContaining([
      {
        caip2: "eip155:1",
        dir: "_slip44",
        namespace: "slip44",
        package: "@crypto-frontmatter/eip155-1",
      },
      {
        caip2: "eip155:1",
        dir: "_erc20",
        namespace: "erc20",
        package: "@crypto-frontmatter/eip155-1",
      },
      {
        caip2: "eip155:10",
        dir: "_erc20",
        namespace: "erc20",
        package: "@crypto-frontmatter/eip155-10",
      },
      {
        caip2: "eip155:1313161554",
        dir: "_erc20",
        namespace: "erc20",
        package: "@crypto-frontmatter/eip155-1313161554",
      },
      {
        caip2: "eip155:137",
        dir: "_erc20",
        namespace: "erc20",
        package: "@crypto-frontmatter/eip155-137",
      },
      {
        caip2: "eip155:42161",
        dir: "_erc20",
        namespace: "erc20",
        package: "@crypto-frontmatter/eip155-42161",
      },
      {
        caip2: "eip155:42220",
        dir: "_erc20",
        namespace: "erc20",
        package: "@crypto-frontmatter/eip155-42220",
      },
      {
        caip2: "eip155:43114",
        dir: "_erc20",
        namespace: "erc20",
        package: "@crypto-frontmatter/eip155-43114",
      },
      {
        caip2: "eip155:56",
        dir: "_erc20",
        namespace: "erc20",
        package: "@crypto-frontmatter/eip155-56",
      },
      {
        caip2: "eip155:8453",
        dir: "_erc20",
        namespace: "erc20",
        package: "@crypto-frontmatter/eip155-8453",
      },
      {
        caip2: "tip474:728126428",
        dir: "_trc10",
        namespace: "trc10",
        package: "@crypto-frontmatter/tip474-728126428",
      },
      {
        caip2: "tip474:728126428",
        dir: "_trc20",
        namespace: "trc20",
        package: "@crypto-frontmatter/tip474-728126428",
      },
    ]),
  );
});
