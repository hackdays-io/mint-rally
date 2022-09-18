import {
  Box,
  Flex,
  Heading,
  Text,
  Spinner,
  Image,
  Container,
  useDisclosure,
} from "@chakra-ui/react";
import { GetServerSideProps } from "next";

import {
  IOwnedNFT,
  useGetOwnedNFTsByAddress,
} from "../../hooks/useMintNFTManager";
import { FC, useEffect, useMemo, useState } from "react";
import { useEventGroups } from "../../hooks/useEventManager";
import { ipfs2http } from "../../../utils/ipfs2http";
import { BigNumber } from "ethers";
import TokenModal from "../../components/molecules/user/TokenModal";
import { useRouter } from "next/router";
type Props = {
  address?: string;
  tokenid?: string;
  nft?: IOwnedNFT | null;
};
export const getServerSideProps: GetServerSideProps = async (context) => {
  const address = context.query.address;
  const props: Props = {
    address: String(address),
  };
  if (context.query.tokenid) {
    props.tokenid = String(context.query.tokenid);
  }
  let _nft = null;

  console.log(props);
  return {
    props: props,
  };
};
const User = (props: Props) => {
  const { ownedNFTs, loading } = useGetOwnedNFTsByAddress(props.address);
  const [selectedTokenId, selectTokenId] = useState<BigNumber>();
  const { groups } = useEventGroups();

  const { isOpen, onClose, onOpen } = useDisclosure();

  const nftCollectionsByGroup = useMemo(() => {
    const grouped = ownedNFTs.reduce<Record<number, IOwnedNFT[]>>(
      (nfts, current) => {
        const {
          metaData: { traits },
        } = current;
        nfts[traits.EventGroupId] = nfts[Number(traits.EventGroupId)] ?? [];
        nfts[traits.EventGroupId].push(current);
        return nfts;
      },
      {}
    );
    return grouped;
  }, [groups, ownedNFTs]);

  useEffect(() => {
    console.log(props.tokenid);
    if (props.tokenid && props.tokenid != null) {
      selectTokenId(BigNumber.from(props.tokenid));
      onOpen();
    }
  }, [props.tokenid]);

  const ImageBadge = ({ image, name }: { image: string; name: string }) => (
    <Flex justifyContent="center" alignItems="center" flexDirection="column">
      <Box>
        <Image src={image} alt={name} />
      </Box>
      <Box>
        <Text fontSize="md" fontWeight="bold" mt={2}>
          {name}
        </Text>
      </Box>
    </Flex>
  );

  const Collection: FC<{
    collectionData: {
      image: string;
      name: string;
      description: string;
      tokenId: BigNumber;
    }[];
  }> = ({ collectionData }) => {
    return (
      <Flex
        flexWrap="wrap"
        justifyContent="flex-start"
        position="relative"
        mt={4}
        w="100%"
      >
        {collectionData.map((data, i) => {
          return (
            <Box
              key={i}
              width={{ base: "50%", sm: "33%", md: "25%", lg: "20%" }}
              p={1}
              mb={8}
              textAlign="center"
              onClick={() => openModal(data.tokenId)}
            >
              {ImageBadge({ image: data.image, name: data.name })}
            </Box>
          );
        })}
      </Flex>
    );
  };

  const openModal = (tokenId: BigNumber) => {
    selectTokenId(tokenId);
    onOpen();
  };

  return (
    <Container maxW="1000">
      <Box mt={10}>
        <Heading as="h1" size="xl" color="mint.primary" fontWeight={700}>
          NFT Collection
        </Heading>
      </Box>
      {loading ? (
        <Spinner />
      ) : (
        groups.length > 0 &&
        Object.entries(nftCollectionsByGroup).map(([groupIdString, nfts]) => {
          const id = groupIdString;
          const data = nfts.map(
            ({ tokenId, metaData: { name, image, description } }) => ({
              name,
              description,
              image: ipfs2http(image),
              tokenId,
            })
          );

          return (
            <div key={id}>
              <Box width="100%" mt={10}>
                <Heading
                  as="h2"
                  size="lg"
                  color="mint.primary"
                  fontWeight={400}
                >
                  {
                    groups.find((g) => g.groupId.toNumber() === Number(id))
                      ?.name
                  }
                </Heading>
                <Box mt={4}>
                  <div style={{ border: "2px #56F0DE solid" }} />
                </Box>
                <Flex justifyContent="space-between">
                  {<Collection collectionData={data} />}
                </Flex>
              </Box>
            </div>
          );
        })
      )}
      <TokenModal isOpen={isOpen} onClose={onClose} tokenId={selectedTokenId} />
    </Container>
  );
};

export default User;
