import { Box, Heading, Text, Container, Spinner } from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import { FC } from "react";
import { GroupedCollection } from "src/components/organisms/nft/GroupedCollection";
import {
  useGetOwnedNFTByAddress,
  useGetOwnedNftIdsByAddress,
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

const User: FC = () => {
  const address = useAddress();

  return address ? <Entity address={address} /> : <></>;
};

export default User;
