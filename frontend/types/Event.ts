import { BigNumber } from "ethers";

export namespace Event {
  export interface EventGroup {
    groupId: BigNumber;
    name: string;
    ownerAddress: string;
  }
  export interface EventRecord {
    eventRecordId: BigNumber;
    groupId: BigNumber;
    name: string;
    description: string;
    date: string;
    useMtx: boolean;
  }

  export interface CreateEventRecordParams {
    groupId: string;
    eventName: string;
    description: string;
    date: Date;
    startTime: string; // "18:00"
    endTime: string; // "21:00"
    secretPhrase: string;
    mintLimit: number;
    useMtx: boolean;
    attributes: { metaDataURL: string; requiredParticipateCount: number }[];
  }
}
