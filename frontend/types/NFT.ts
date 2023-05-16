export namespace NFT {
  export interface Metadata {
    tokenId: number;
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
}
