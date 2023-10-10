// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import {
  deployEventManager,
  deployForwarder,
  deployMintNFT,
  deployOperationController,
  deploySecretPhraseVerifier,
} from "./helper/deploy";

async function main() {
  const forwarder = await deployForwarder();
  const secretPhraseVerifier = await deploySecretPhraseVerifier();
  const operationController = await deployOperationController();

  const mintNFT = await deployMintNFT({
    forwarderAddress: forwarder.address,
    secretPhraseVerifierAddress: secretPhraseVerifier.address,
    operationControllerAddress: operationController.address,
  });

  const eventManager = await deployEventManager({
    mtxPrice: 500000,
    maxMintLimit: 1000000,
    operationControllerAddress: operationController.address,
  });

  await mintNFT.setEventManagerAddr(eventManager.address);
  await eventManager.setMintNFTAddr(mintNFT.address);

  console.log("----------\nFor Contract env\n----------");
  console.log(`LOCAL_FORWARDER_ADDRESS=${forwarder.address}`);
  console.log(
    `LOCAL_SECRETPHRASE_VERIFIER_ADDRESS=${secretPhraseVerifier.address}`
  );
  console.log(
    `LOCAL_OPERATION_CONTROLLER_ADDRESS=${operationController.address}`
  );
  console.log(`LOCAL_MINTNFT_ADDRESS=${mintNFT.address}`);
  console.log(`LOCAL_EVENTMANAGER_ADDRESS=${eventManager.address}`);

  console.log("----------\nFor Frontend env\n----------");
  console.log(`NEXT_PUBLIC_CONTRACT_FORWARDER_ADDRESS=${forwarder.address}`);
  console.log(
    `NEXT_PUBLIC_CONTRACT_SECRET_PHRASE_VERIFIER=${secretPhraseVerifier.address}`
  );
  console.log(
    `NEXT_PUBLIC_CONTRACT_OPERATION_CONTROLLER=${operationController.address}`
  );
  console.log(`NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER=${mintNFT.address}`);
  console.log(`NEXT_PUBLIC_CONTRACT_EVENT_MANAGER=${eventManager.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
