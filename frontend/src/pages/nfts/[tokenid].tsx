import { Box, Container, Heading, Text } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { FC } from "react";
import {
  getNFTDataFromTokenID,
  getOwnerOfTokenId,
} from "src/libs/contractMethods";
import { NFT } from "types/NFT";
import { ipfs2http } from "utils/ipfs2http";

type Props = {
  address?: string;
  tokenid?: string;
  nft?: NFT.Metadata | null;
};
export const getServerSideProps: GetServerSideProps = async (context) => {
  const address = context.query.address;
  const props: Props = {
    address: String(address),
  };
  if (context.query.tokenid) {
    props.tokenid = String(context.query.tokenid);
    const data = await getNFTDataFromTokenID(BigNumber.from(props.tokenid));
    if (data) {
      props.nft = data;
    }
    const owner = await getOwnerOfTokenId(BigNumber.from(props.tokenid));
    if (owner) {
      props.address = owner;
    }
  }
  console.log(props);
  return {
    props: props,
  };
};

const Entity: FC<Props> = (props: Props) => {
  return (
    <Container maxW="1000">
      {props.nft && (
        <NextSeo
          title={`${props.nft.name} | MintRally`}
          description={props.nft.description}
          openGraph={{
            url: `https://mintrally.xyz/nfts/${props.tokenid}`,
            images: [
              {
                url: ipfs2http(props.nft.image),
                width: 600,
                height: 600,
                alt: props.nft.name,
              },
            ],
          }}
        ></NextSeo>
      )}
      <Box mt={10}>
        <Heading as="h1" size="xl" color="mint.primary" fontWeight={700}>
          NFT
        </Heading>
        <Text fontSize="lg">Token ID: {props.tokenid}</Text>
        <Text fontSize="lg">Token Owner: {props.address}</Text>
      </Box>
    </Container>
  );
};

export default Entity;
