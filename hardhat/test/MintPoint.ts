import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import {
  MintPoint,
  // eslint-disable-next-line node/no-missing-import
} from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish, BytesLike, Signer, utils } from "ethers";

const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;
const MINTER_ROLE = utils.keccak256(utils.toUtf8Bytes("MINTER_ROLE"));

const deployMintPoint = async () => {
  const MintPointFactory = await ethers.getContractFactory("MintPoint");
  const deployedMintPoint: MintPoint = (await upgrades.deployProxy(
    MintPointFactory,
    [],
    {
      initializer: "initialize",
    }
  )) as any;
  await deployedMintPoint.deployed();

  console.log("mintPoint address:", deployedMintPoint.address);

  return deployedMintPoint;
};

const deployAll = async () => {
  const mintPoint = await deployMintPoint();
  return [mintPoint];
};

describe("MintPoint", () => {
  let mintPoint: MintPoint;

  let organizer: SignerWithAddress;
  let participant1: SignerWithAddress;

  before(async () => {
    [organizer, participant1] = await ethers.getSigners();
    [mintPoint] = await deployAll();
  });

  describe("initialize", () => {
    it("name", async () => {
      expect(await mintPoint.name()).to.equal("MintPoint");
    });

    it("symbol", async () => {
      expect(await mintPoint.symbol()).to.equal("MNT");
    });

    it("decimals", async () => {
      expect(await mintPoint.tokenIds()).to.equal(1);
    });

    it("DEFAULT_ADMIN_ROLE", async () => {
      expect(
        await mintPoint.hasRole(DEFAULT_ADMIN_ROLE, organizer.address)
      ).to.equal(true);
    });

    it("MINTER_ROLE", async () => {
      expect(await mintPoint.hasRole(MINTER_ROLE, organizer.address)).to.equal(
        true
      );
    });
  });

  describe("mint", () => {
    it("should mint a token", async () => {
      await(
        await mintPoint.connect(organizer)
        .mint(participant1.address, 0, ethers.utils.parseEther("1"))
      ).wait();
    });
  });
});
