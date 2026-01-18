import { runExit } from "clipanion";

import { EthereumOptimism } from "./repo/ethereum-optimism/ethereum-optimism.github.io";
import { TrustWalletAssets } from "./repo/trustwallet/assets";

void runExit([TrustWalletAssets, EthereumOptimism]);
