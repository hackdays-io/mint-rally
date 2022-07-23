import {
  Box,
  Flex,
  Heading,
  Text,
  Spinner,
  Image,
  Container,
} from "@chakra-ui/react";

import { IOwnedNFT, useGetOwnedNFTs } from "../../hooks/useMintNFTManager";
import { FC, useEffect, useMemo, useState } from "react";
import { useEventGroups } from "../../hooks/useEventManager";

const getUrlThoughGateway = (rawFullUrl: string) => {
  const fileAddress = rawFullUrl.split("ipfs://")[1];
  return `https://gateway.ipfs.io/ipfs/${fileAddress}`;
};

const User = () => {
  const { ownedNFTs, loading, getOwnedNFTs } = useGetOwnedNFTs();
  const { groups } = useEventGroups();

  useEffect(() => {
    getOwnedNFTs();
  }, []);

  const nftCollectionsByGroup = useMemo(() => {
    const grouped = ownedNFTs.reduce<Record<number, IOwnedNFT[]>>(
      (nfts, current) => {
        const { groupId } = current;
        nfts[groupId.toNumber()] = nfts[groupId.toNumber()] ?? [];
        nfts[groupId.toNumber()].push(current);
        return nfts;
      },
      {}
    );
    return grouped;
  }, [groups, ownedNFTs]);

  const ImageBadge = ({ image, name }: { image: string; name: string }) => (
    <Flex justifyContent="center" alignItems="center" flexDirection="column">
      <Box>
        <Image
          src={image}
          alt={name}
          style={{ borderRadius: "60px" }}
        />
      </Box>
      <Box>
        <Flex justifyContent="center">
          <Text>{name}</Text>
        </Flex>
      </Box>
    </Flex>
  );

  const Collection: FC<{
    collectionData: { image: string; name: string; description: string }[];
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
            <Box key={i} width={{base:"50%", sm:"33%", md:"25%", lg:"20%"}} mb={8} textAlign="center">
              {ImageBadge({ image: data.image, name: data.name })}
            </Box>
          );
        })}
      </Flex>
    );
  };

  return (
    <Container maxW="1000">
      <Box mt={16}>
        <Heading as="h1" size="2xl" color="mint.primary" fontWeight={400}>
          NFT Collection
        </Heading>
      </Box>
      {loading && <Spinner></Spinner>}
      {groups.length > 0 &&
        Object.entries(nftCollectionsByGroup).map(([groupIdString, nfts]) => {
          const id = groupIdString;
          const data = nfts.map(({ name, image, description }) => ({
            name,
            description,
            image: getUrlThoughGateway(image),
          }));

          return (
            <div key={id}>
              <Box width="100%" mt={20}>
                <Heading
                  as="h2"
                  size="xl"
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
        })}
    </Container>
  );
};

export default User;
