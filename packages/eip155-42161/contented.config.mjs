import config from "@workspace/contented-config";

export default config("eip155:42161", [
  {
    namespace: "slip44",
  },
  {
    namespace: "erc20",
  },
]);
