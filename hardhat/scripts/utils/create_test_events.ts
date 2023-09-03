import dotenv from "dotenv";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { generateProof } from "../../test/helper/secret_phrase";
// eslint-disable-next-line node/no-missing-import
import { EventManager } from "../typechain";
dotenv.config();

type eventParams = {
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  mintLimit: number;
  useMtx: boolean;
  secretPhrase?: string;
  attributes: any;
};
class EventCreator {
  relayer: SignerWithAddress | undefined;
  organizer: SignerWithAddress | undefined;
  eventManager: EventManager | undefined;
  publicInputCalldata: any | undefined;

  public async init() {
    [this.organizer, this.relayer] = await ethers.getSigners();
    console.log("relayer address:", this.relayer.address);
    console.log("organizer address:", this.organizer.address);
    if (!process.env.LOCAL_CONTRACT_EVENT_MANAGER_ADDRESS) {
      throw new Error("LOCAL_CONTRACT_EVENT_MANAGER_ADDRESS is undefined");
    }
    this.eventManager = await ethers.getContractAt(
      "EventManager",
      process.env.LOCAL_CONTRACT_EVENT_MANAGER_ADDRESS!
    );

    const { publicInputCalldata: _publicInputCalldata } = await generateProof();
    this.publicInputCalldata = _publicInputCalldata;
  }

  public async createEvents(_events: eventParams[]) {
    // create new group
    console.log("creating group...");
    const datestring = new Date().toISOString().replace(/:/g, "-");
    const txn1 = await this.eventManager.createGroup(`group-${datestring}`);
    await txn1.wait();
    console.log("created group1");
    console.log("creating events...");
    const groupsAfterCreate = await this.eventManager.getGroups();
    const groupId = groupsAfterCreate[groupsAfterCreate.length - 1].groupId;
    for (const event of _events) {
      console.log("creating event: ", event.name);
      const txn = await this.eventManager.createEventRecord(
        groupId.toNumber(),
        event.name,
        event.description,
        event.date,
        event.mintLimit,
        event.useMtx,
        this.publicInputCalldata[0],
        event.attributes,
        {
          gasLimit: 30000000,
          from: this.organizer!.address,
        }
      );
      txn.wait();
    }
    console.log("created events");
  }
}

const main = async () => {
  console.log("start");
  const creator = new EventCreator();
  await creator.init();
  console.log("initialized");
  const events: eventParams[] = [];
  for (let i = 0; i < 150; i++) {
    events.push({
      name: "Event" + i,
      description: "Event description" + i,
      date: "2022-09-01",
      startTime: "00:00",
      endTime: "12:00",
      mintLimit: 1,
      useMtx: false,
      attributes: [
        {
          metaDataURL: "ipfs://hogehoge/count0.json",
          requiredParticipateCount: 0,
        },
      ],
    });
  }
  await creator.createEvents(events);
  console.log("events created.");
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .then(() => {
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  });
