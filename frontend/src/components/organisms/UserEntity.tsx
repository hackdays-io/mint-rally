import { Box, Heading, Text, Container, Spinner } from "@chakra-ui/react";
import { FC } from "react";
import ENSName from "src/components/atoms/web3/ENSName";
import { GroupedCollection } from "src/components/organisms/nft/GroupedCollection";
import {
  useGetOwnedNFTByAddress,
  useSortNFTsByGroup,
} from "src/hooks/useMintNFT";

export const UserEntity: FC<{ address: string }> = ({ address }) => {
  const { nfts, isLoading } = useGetOwnedNFTByAddress(address);
  const groupedNFTs = useSortNFTsByGroup(nfts);
  // if groupedNFT has tokenid, get the nft

  return (
    <Container maxW="1000">
      <Box mt={10}>
        <Heading as="h1" size="xl" color="mint.primary" fontWeight={700}>
          NFT Collection
        </Heading>
        <Text fontSize="lg">
          User: <ENSName address={address} enableLink />
        </Text>

        {isLoading ? (
          <Spinner />
        ) : (
          <GroupedCollection groupedNFTs={groupedNFTs} />
        )}
      </Box>
    </Container>
  );
};
