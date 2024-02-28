import axios from "axios";
import { ethers } from "hardhat";

const MAX_GAS_GWEI = 150;
const NETWORKS = {
    POLYGON: "polygon",
    MUMBAI_STG: "mumbai-stg",
    MUMBAI_DEV: "mumbai-dev",
};
  
/*
 * polygon mainnet or mumbaiのガス代を計算する
 * @param network ネットワーク名
 * @return ガス代
 */
export const calcMaxGas = async (network: string) => {
  let maxFeePerGas = ethers.utils.parseUnits(MAX_GAS_GWEI.toString(), "gwei");
  let maxPriorityFeePerGas = ethers.utils.parseUnits(MAX_GAS_GWEI.toString(), "gwei");
  try {
    const { data } = await axios({
      method: "get",
      url:
        network === NETWORKS.POLYGON
          ? "https://gasstation.polygon.technology/v2"
          : network === NETWORKS.MUMBAI_STG || network === NETWORKS.MUMBAI_DEV
            ? "https://gasstation-testnet.polygon.technology/v2"
            : "",
    });
    const maxFee = Math.ceil(data.fast.maxFee);
    const maxPriorityFee = Math.ceil(data.fast.maxPriorityFee);
    if (maxFee > MAX_GAS_GWEI) throw Error("maxFee が MAX_GAS_GWEI を超えています。");
    if (maxPriorityFee > MAX_GAS_GWEI) throw Error("maxFeePerGas が MAX_GAS_GWEI を超えています。");
    maxFeePerGas = ethers.utils.parseUnits(maxFee.toString(), "gwei");
    maxPriorityFeePerGas = ethers.utils.parseUnits(maxPriorityFee.toString(), "gwei");
  } catch (e) {
    console.log(e);
    if (e instanceof Error) throw Error(`"ガス代を取得できませんでした。\n\n${e.message}`);
    throw Error("ガス代を取得できませんでした。");
  }
  return { maxFeePerGas, maxPriorityFeePerGas };
};