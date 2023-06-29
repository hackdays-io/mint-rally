import { Box, Grid, Heading, Spinner } from "@chakra-ui/react";
import { FC } from "react";
import { NFTItem } from "src/components/atoms/nft/NFTItem";
import { useEventGroups } from "src/hooks/useEvent";
import { NFT } from "types/NFT";

type Props = {
  groupedNFTs: { [key: number]: NFT.Metadata[] };
};
export const GroupedCollection: FC<Props> = ({ groupedNFTs }) => {
  const { groups, isLoading } = useEventGroups();

  return isLoading ? (
    <Spinner />
  ) : (
    <Box mt={5}>
      {Object.keys(groupedNFTs).map((groupId: string) => (
        <Box mb={10} key={`group${groupId}`}>
          <Heading
            as="h2"
            pb={2}
            borderBottom="solid 3px"
            borderBottomColor="mint.bg"
            fontSize="3xl"
          >
            {
              groups.find(
                (group: any) => group.groupId.toNumber() === Number(groupId)
              )?.name
            }
          </Heading>

          <Grid
            mt={5}
            columnGap={5}
            rowGap={10}
            gridTemplateColumns={{ md: "1fr 1fr 1fr 1fr 1fr", sm: "1fr 1fr" }}
          >
            {groupedNFTs[Number(groupId)].map((nft) => (
              <NFTItem
                nft={nft}
                tokenId={nft.tokenId || 0}
                key={`group${groupId}nft${nft.tokenId}`}
              />
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};
