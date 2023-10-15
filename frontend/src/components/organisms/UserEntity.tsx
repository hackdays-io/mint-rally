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
    <Box>
      <Flex gap={4} alignItems="center">
        <Heading
          as="h1"
          size={{ base: "lg", md: "xl" }}
          color="yellow.900"
          fontWeight={700}
        >
          NFT Collection
        </Heading>
        <ShareButtons address={address} twitter facebook />
      </Flex>
      <Box fontSize="lg" wordBreak="break-all">
        <ENSName address={address} enableEtherScanLink />
      </Box>

      <Box mt={10}>
        {isLoading ? (
          <Spinner />
        ) : (
          <GroupedCollection groupedNFTs={groupedNFTs} />
        )}
      </Box>
    </Box>
  );
};
