import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, upgrades } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { OperationController } from "../typechain";
import { expect } from "chai";

describe("OperationController", function () {
  let operationController: OperationController;
  let organizer: SignerWithAddress;
  let participant1: SignerWithAddress;

  before(async () => {
    [organizer, participant1] = await ethers.getSigners();
    const OperationControllerFactory = await ethers.getContractFactory(
      "OperationController"
    );
    const deployedOperationController: any = await upgrades.deployProxy(
      OperationControllerFactory,
      { initializer: "initialize" }
    );
    operationController = deployedOperationController;
    await operationController.deployed();
  });

  describe("Deployment", function () {
    it("should set the right owner", async function () {
      expect(await operationController.owner()).to.equal(organizer.address);
    });

    it("should set the pause state to false", async function () {
      expect(await operationController.paused()).to.equal(false);
    });
  });

  describe("Pause", function () {
    it("should revert if not called by owner", async function () {
      await expect(
        operationController.connect(participant1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should set the pause state to true", async function () {
      await operationController.pause();
      expect(await operationController.paused()).to.equal(true);
    });
  });

  describe("Unpause", function () {
    it("should revert if not called by owner", async function () {
      await expect(
        operationController.connect(participant1).unpause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should set the pause state to false", async function () {
      await operationController.unpause();
      expect(await operationController.paused()).to.equal(false);
    });
  });
});
