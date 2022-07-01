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

    const txn1 = await eventManager.createGroup("group1");
    await txn1.wait();
    const groupsAfterCreate = await eventManager.getGroups();
    expect(groupsAfterCreate.length).to.equal(1);
    expect(groupsAfterCreate[0].name).to.equal("group1");

    const eventRecordsBeforeCreate = await eventManager.getEventRecords();
    expect(eventRecordsBeforeCreate.length).to.equal(0);

    const txn2 = await eventManager.createEventRecord(
      groupsAfterCreate[0].groupId.toNumber(),
      "event1",
      "event1 description",
      "2022-07-3O",
      "18:00",
      "21:00",
      "hackdays"
    );
    await txn2.wait();
    const eventRecordsAfterCreate = await eventManager.getEventRecords();
    expect(eventRecordsAfterCreate.length).to.equal(1);
    expect(eventRecordsAfterCreate[0].groupId).to.equal(
      groupsAfterCreate[0].groupId.toNumber()
    );
    expect(eventRecordsAfterCreate[0].name).to.equal("event1");
    expect(eventRecordsAfterCreate[0].description).to.equal(
      "event1 description"
    );
    expect(eventRecordsAfterCreate[0].date).to.equal("2022-07-3O");
    expect(eventRecordsAfterCreate[0].startTime).to.equal("18:00");
    expect(eventRecordsAfterCreate[0].endTime).to.equal("21:00");
  });
});
