import { BigNumber } from "ethers";

export namespace Event {
  export interface EventGroup {
    groupId: BigNumber;
    name: string;
  }
  export interface EventRecord {
    eventRecordId: BigNumber;
    groupId: BigNumber;
    name: string;
    description: string;
    date: string;
    useMtx: boolean;
  }
}
