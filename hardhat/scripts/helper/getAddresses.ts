import { network } from "hardhat";

export const mintNFTAddress = () => {
  let contractAddress = "";
  switch (network.name) {
    case "mumbai":
      contractAddress = process.env.MUMBAI_MINTNFT_ADDRESS!;
      break;
    case "polygon":
      contractAddress = process.env.POLYGON_MINTNFT_ADDRESS!;
      break;
    case "local":
      contractAddress = process.env.LOCAL_MINTNFT_ADDRESS!;
      break;
    default:
      break;
  }

  return contractAddress;
};

export const eventManagerAddress = () => {
  let contractAddress = "";
  switch (network.name) {
    case "mumbai":
      contractAddress = process.env.MUMBAI_EVENTMANAGER_ADDRESS!;
      break;
    case "polygon":
      contractAddress = process.env.POLYGON_EVENTMANAGER_ADDRESS!;
      break;
    case "local":
      contractAddress = process.env.LOCAL_EVENTMANAGER_ADDRESS!;
      break;
    default:
      break;
  }

  return contractAddress;
};
