import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import {
  SubscriptionNFT
} from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const deploySubscriptionNFT = async () => {
  const SubscriptionNFTFactory = await ethers.getContractFactory("SubscriptionNFT");
  const deployedSubscriptionNFT: SubscriptionNFT = (await upgrades.deployProxy(
    SubscriptionNFTFactory,
    [],
    {
      initializer: "initialize",
    }
  )) as any;
  await deployedSubscriptionNFT.deployed();

  console.log("SubscriptionNFT address:", deployedSubscriptionNFT.address);

  return deployedSubscriptionNFT;
};

//  describe("SubscriptionNFT", function () {
//    let subscriptionNFT: SubscriptionNFT;
//   let owner: SignerWithAddress, addr1: SignerWithAddress;

//   before(async function () {
//     [owner, addr1] = await ethers.getSigners();
//     subscriptionNFT = await deploySubscriptionNFT();
//   });

//   describe("Contract deployment", function () {
//     it("Should set the right owner", async function () {
//       expect(await subscriptionNFT.owner()).to.equal(owner.address);
//     });

//     it("Should have the correct name and symbol", async function () {
//       expect(await subscriptionNFT.name()).to.equal("SubscriptionNFT");
//       expect(await subscriptionNFT.symbol()).to.equal("SNFT");
//     });
//   });

//   describe("Minting NFT", function () {
//     it("Should mint an NFT to the specified address", async function () {
//       const tokenURI = "https://example.com/nft";
//       await expect(subscriptionNFT.mintNFT(addr1.address, tokenURI))
//         .to.emit(subscriptionNFT, "Transfer")
//         .withArgs(ethers.constants.AddressZero, addr1.address, 1);

//       expect(await subscriptionNFT.tokenURI(1)).to.equal(tokenURI);
//     });
//   });
// });
