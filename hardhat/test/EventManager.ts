import { expect } from "chai";
import { ethers } from "hardhat";

describe("CreateEventRecord", () => {
  it("Should create", async () => {
    const eventManagerContractFactory = await ethers.getContractFactory(
      "EventManager"
    );

    const eventManagerContract = await eventManagerContractFactory.deploy();
    const eventManager = await eventManagerContract.deployed();

    // does not exist any groups
    const groupsBeforeCreate = await eventManager.getGroups();
    expect(groupsBeforeCreate.length).to.equal(0);

    const txn = await eventManager.createGroup("group1");
    await txn.wait();
    const groupsAfterCreate = await eventManager.getGroups();
    expect(groupsAfterCreate.length).to.equal(1);
    expect(groupsAfterCreate[0].name).to.equal("group1");
  });
});
