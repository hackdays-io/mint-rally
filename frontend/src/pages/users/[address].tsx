import { Box, Heading, Text, Container, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FC } from "react";
import { GroupedCollection } from "src/components/organisms/nft/GroupedCollection";
import {
  useGetOwnedNFTByAddress,
  useSortNFTsByGroup,
} from "src/hooks/useMintNFT";

const Entity: FC<{ address: string }> = ({ address }) => {
  const { nfts, isLoading } = useGetOwnedNFTByAddress(address);
  const groupedNFTs = useSortNFTsByGroup(nfts);

  return (
    <Container maxW="1000">
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
