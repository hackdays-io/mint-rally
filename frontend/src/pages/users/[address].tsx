import { Box, Heading, Text, Container, Spinner } from "@chakra-ui/react";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { FC } from "react";
import { GroupedCollection } from "src/components/organisms/nft/GroupedCollection";
import {
  useGetOwnedNFTByAddress,
  useSortNFTsByGroup,
} from "src/hooks/useMintNFT";
import { ipfs2http } from "utils/ipfs2http";

const Entity: FC<{ address: string }> = ({ address }) => {
  const { nfts, isLoading } = useGetOwnedNFTByAddress(address);
  const groupedNFTs = useSortNFTsByGroup(nfts);
  const { tokenid } = useRouter().query;
  // if groupedNFT has tokenid, get the nft
  const tokenId = Number(tokenid);
  const nft = nfts.find((nft) => nft.tokenId === tokenId);

  return (
    <Container maxW="1000">
      {nft && (
        <NextSeo
          title={`${nft.name} | MintRally`}
          description={nft.description}
          openGraph={{
            url: `https://mintrally.xyz/users/${address}?tokenid=${tokenId}`,
            images: [
              {
                url: ipfs2http(nft.image),
                width: 600,
                height: 600,
                alt: nft.name,
              },
            ],
          }}
        ></NextSeo>
      )}
      <Box mt={10}>
        <Heading as="h1" size="xl" color="mint.primary" fontWeight={700}>
          NFT Collection
        </Heading>
        <Text fontSize="lg">Wallet: {address}</Text>

        {isLoading ? (
          <Spinner />
        ) : (
          <GroupedCollection groupedNFTs={groupedNFTs} />
        )}
      </Box>
    </Container>
  );
};

const UserByAddress: FC = () => {
  const {
    query: { address },
  } = useRouter();

  return address ? <Entity address={String(address)} /> : <></>;
};

export default UserByAddress;
