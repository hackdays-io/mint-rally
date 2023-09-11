export namespace NFT {
  export interface Metadata {
    tokenId?: number;
    name: string;
    image: string;
    description: string;
    external_link: string;
    traits: {
      EventName: string;
      EventGroupId: string;
      RequiredParticipateCount: number;
    };
  }

  export interface NFTImage {
    name: string;
    image: string;
    description: string;
    requiredParticipateCount: number;
    fileObject?: File | null;
  }
  export interface NFTHolder {
    holderAddress: string;
    tokenId: number;
  }
  export interface NFTHolderWithEventId {
    eventId: number;
    holderAddress: string;
    tokenId: number;
  }
}
