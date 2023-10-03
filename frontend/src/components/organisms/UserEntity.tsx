import { Box, Heading, Text, Container, Spinner, Flex } from "@chakra-ui/react";
import { FC } from "react";
import ENSName from "src/components/atoms/web3/ENSName";
import { ShareButtons } from "src/components/atoms/users/ShareButtons";
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
        <Flex>
          <Heading as="h1" size="xl" color="mint.primary" fontWeight={700} mr={4}>
            NFT Collection
          </Heading>
          <ShareButtons
            address={address}
            twitter
            facebook
          />
        </Flex>
        <Text fontSize="lg" wordBreak="break-all">
          <ENSName address={address} enableEtherScanLink />
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
