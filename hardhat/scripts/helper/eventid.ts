import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import fowarderABI from "./fowarder_oldabi.json";
import mintNFTOldABI from "./mintnft_oldabi.json";
import mintNFTNewABI from "../../artifacts/contracts/MintNFT.sol/MintNFT.json";
import { txHash } from "./txhashes";

const methodId2Name = (methodId: string) => {
  switch (methodId) {
    case "0xfa86623b":
      return "newMintParticipateNFT";
    case "0x72746a8d":
      return "oldMintParticipateNFT";
    case "0x47153f82":
      return "execute";
    default:
      break;
  }
};

async function main() {
  const newMintNFTInterface = new ethers.utils.Interface(mintNFTNewABI.abi);
  const oldMintNFTInterface = new ethers.utils.Interface(mintNFTOldABI.abi);
  const fowarderInterface = new ethers.utils.Interface(fowarderABI.abi);

  const provider = ethers.provider;

  const tokenId_eventId: number[] = [];
  for (let index = 0; index < txHash.length; index++) {
    const _txHash = txHash[index];
    const tr = await provider.getTransactionReceipt(_txHash);
    const tx = await provider.getTransaction(_txHash);

    const tokenId = BigNumber.from(tr.logs[0].topics[3]).toNumber();
    let eventId = 0;

    const method = methodId2Name(tx.data.slice(0, 10));

    if (method === "newMintParticipateNFT") {
      const decodedInput = newMintNFTInterface.parseTransaction({
        data: tx.data,
      });
      eventId = decodedInput.args._eventId.toNumber();
    } else if (method === "oldMintParticipateNFT") {
      const decodedInput = oldMintNFTInterface.parseTransaction({
        data: tx.data,
      });
      eventId = decodedInput.args._eventId.toNumber();
    } else if (method === "execute") {
      const decodedInput = fowarderInterface.parseTransaction({
        data: tx.data,
      });
      const reqData = decodedInput.args.req.data;
      const method = methodId2Name(reqData.slice(0, 10));
      if (method === "newMintParticipateNFT") {
        const decodedInput = newMintNFTInterface.parseTransaction({
          data: reqData,
        });
        eventId = decodedInput.args._eventId.toNumber();
      } else if (method === "oldMintParticipateNFT") {
        const decodedInput = oldMintNFTInterface.parseTransaction({
          data: reqData,
        });
        eventId = decodedInput.args._eventId.toNumber();
      }
    } else {
      console.log("method not found");
    }

    tokenId_eventId.push(eventId);

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  console.log(JSON.stringify(tokenId_eventId));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
