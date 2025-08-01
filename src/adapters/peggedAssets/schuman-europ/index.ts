const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x888883b5F5D21fb10Dfeb70e8f9722B9FB0E5E51"],
  },
  polygon: {
    issued: ["0x888883b5F5D21fb10Dfeb70e8f9722B9FB0E5E51"],
  },
};



import { addChainExports } from "../helper/getSupply";
import { ChainContracts } from "../peggedAsset.type";
export default addChainExports(chainContracts, undefined, { pegType: 'peggedEUR'});
