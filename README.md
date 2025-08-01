# peggedassets-server

## How to list a new pegged asset

1. Fork this repository.
2. `npm i` in root folder.
3. Create folder in `src/adapters/peggedAssets` with the same name as the CoinGecko id for the pegged asset.
4. In that folder, write an adapter in Typescript and name it index.ts (see below for spec).
5. In `src/adapters/peggedAssets`, `npm i` and then test your adapter with `npx ts-node test YOURPEGGEDASSET/index peggedXYZ`, where "peggedXYZ" is the key of the balance object returned by your adapter. or `npx ts-node --transpile-only test.ts YOURPEGGEDASSET peggedXYZ`
6. Import your adapter in `src/adapters/peggedAssets/index.ts` and then add it to the exports.
7. (Optional) if the pegged asset has a ChainLink price feed or a liquid Uniswap V3 pool, you can add the ChainLink smart contract/Uniswap V3 pool info to `src/adapters/peggedAssets/prices/index.ts`.

After submitting a PR, you can submit basic info about the pegged asset (website, ticker, icon, etc.) in the [Defillama Discord](https://discord.defillama.com/).

## Pegged asset adapters

An adapter is a Typescript file that exports an object in the following format:

    const  adapter: PeggedIssuanceAdapter = {
      [chain1]: {
        minted: async fn,
        unreleased: async fn,
        [bridgedFromChain1]: async fn,
        [bridgedFromChain2]: async fn,
        .
        .
      },
      [chain2]: {
        minted: async fn,
        unreleased: async fn,
      },
    .
    .
    }

The `minted` and `unreleased` properties are required to be present on every chain object. `minted` means pegged assets that have been issued on that chain (not bridged from anywhere). `unreleased` means pegged assets that are in a reserve wallet and have never been circulating. If either of these are 0, you can use `async () => ({})`.

The `bridgedFromChain` properties are optional. The property name should simply be the name of the chain the pegged assets are bridged from.

The async functions should take timestamp, ethBlock, and chainBlocks as parameters, just like Defillama TVL Adapters. They must return an object `{ peggedXYZ: x }`, where `peggedXYZ` is a supported pegged asset type, and `x` is a Number. Currently we support `peggedUSD`, `peggedEUR`,`peggedVAR` (variable peg) and more you can see the full list here https://github.com/DefiLlama/peggedassets-server/blob/master/src/adapters/peggedAssets/peggedAsset.type.ts#L7
If we are not supporting a particular peggedTYPE, please inform us on discord.

you can use this shorthand:

```typescript
const chainContracts = {
  ethereum: {
    issued: ["0xe2f2a5c287993345a840db3b0845fbc70f5935a5"],
    unreleased: [
      "0xAEf566ca7E84d1E736f999765a804687f39D9094",
      "0x0B663CeaCEF01f2f88EB7451C70Aa069f19dB997",
    ],
  },
  xdai: {
    bridgedFromETH: ["0x7300AaFC0Ef0d47Daeb850f8b6a1931b40aCab33"],
  },
  polygon: {
    issued: ["0xE840B73E5287865EEc17d250bFb1536704B43B21"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);  // assumes pegType to be peggedUSD and 18 decimals 
export default adapter;



// with different pegType or decimals
export default addChainExports(chainContracts, undefined, { pegType: 'peggedEUR', decimals: 9})
```




Here is an example adapter with vannila code :
	
```typescript
    const sdk = require("@defillama/sdk");
    import {
      ChainBlocks,
      PeggedIssuanceAdapter,
    } from "../peggedAsset.type";

    const chainContracts = {
	    ethereum: {
	        issued: "0x853d955acef822db058eb8505911ed77f175b99e",
	    },
	    bsc: {
	        bridgedFromETH: "0x90c97f71e18723b0cf0dfa30ee176ab653e89f40",
	    },
    };

    async function ethereumMinted() {
    return async function (
        _timestamp: number,
        _ethBlock: number,
        _chainBlocks: ChainBlocks
    ) {
        const totalSupply = (
          await sdk.api.abi.call({
            abi: "erc20:totalSupply",
            target: chainContracts.ethereum.issued,
            block: _ethBlock,
            chain: "ethereum",
          })
        ).output;
        return { peggedUSD: totalSupply / 10 ** 18 };
      };
    }

    async function bridgedFromEthereum(chain: string, decimals: number, address: string) {
    return async function (
        _timestamp: number,
        _ethBlock: number,
        chainBlocks: ChainBlocks
    ) {
        const totalSupply = (
          await sdk.api.abi.call({
            abi: "erc20:totalSupply",
            target: address,
            block: chainBlocks[chain],
            chain: chain,
          })
        ).output;
        return { peggedUSD: totalSupply / 10 ** decimals };
      };
    }

    const adapter: PeggedIssuanceAdapter = {
      ethereum: {
        minted: ethereumMinted(),
      },
      bsc: {
        ethereum: bridgedFromEthereum("bsc", 18, chainContracts.bsc.bridgedFromETH),
      },
    };

    export default adapter;


```