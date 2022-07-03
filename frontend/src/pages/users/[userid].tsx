import {
  Box,
  Divider,
  Flex,
  Heading,
  Text,
  Spinner,
  Image,
} from "@chakra-ui/react";
import { useRouter } from "next/router";

import { IOwnedNFT, useGetOwnedNFTs } from "../../hooks/useMintNFTManager";
import { useEffect, useState } from "react";
import { useEventGroups } from "../../hooks/useEventManager";

const getUrlThoughGateway = (rawFullUrl: string) => {
  const fileAddress = rawFullUrl.split("ipfs://")[1];
  return `https://gateway.ipfs.io/ipfs/${fileAddress}`;
};

const User = () => {
  const router = useRouter();

  const { ownedNFTs, loading, getOwnedNFTs } = useGetOwnedNFTs();
  const { groups, getEventGroups } = useEventGroups();

  const [myAddress, setMyAddress] = useState("");

  useEffect(() => {
    const { userid } = router.query;
    if (userid) {
      const address = Array.isArray(userid) ? userid[0] : userid;
      setMyAddress(address);
    }
  }, [router.query]);

  useEffect(() => {
    if (!myAddress) {
      return;
    }
    getOwnedNFTs();
    getEventGroups();
  }, [myAddress]);

  const nftCollectionsByGroup = () => {
    const grouped = ownedNFTs.reduce<Record<number, IOwnedNFT[]>>(
      (nfts, current) => {
        const { groupId } = current;
        nfts[groupId] = nfts[groupId] ?? [];
        nfts[groupId].push(current);
        return nfts;
      },
      {}
    );
    return grouped;
  };

  const ImageBadge = ({ image, name }: { image: string; name: string }) => (
    <Flex justifyContent="center" alignItems="center" flexDirection="column">
      <Box>
        <Image
          src={image}
          width={179}
          height={179}
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

  const collection = (collectionData: { image: string; name: string }[]) => {
    return (
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="flex-start"
        position="relative"
        mt={4}
        w="100%"
      >
        {collectionData.map((data, i) => {
          return (
            <Box key={i} minWidth="20%" mb={8}>
              {ImageBadge({ image: data.image, name: data.name })}
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Flex justifyContent="center" px={20}>
      <Flex justifyContent="flex-start" flexDirection="column" width="100%">
        <Box mt={16}>
          <Heading as="h1" size="2xl" color="#552306" fontWeight={400}>
            User NFT Collection
          </Heading>
        </Box>
        {loading && <Spinner></Spinner>}
        {groups.length > 0 &&
          Object.entries(nftCollectionsByGroup()).map(
            ([groupIdString, nfts]) => {
              const id = parseInt(groupIdString, 10);
              const data = nfts.map(({ name, image }) => ({
                name,
                image: getUrlThoughGateway(image),
              }));

              return (
                <div key={id}>
                  <Box width="100%" mt={20}>
                    <Heading as="h2" size="xl" color="#552306" fontWeight={400}>
                      {
                        groups.find((g) => (g.groupId as any).toNumber() === id)
                          ?.name
                      }
                    </Heading>
                    <Box mt={4}>
                      <div style={{ border: "2px #56F0DE solid" }} />
                    </Box>
                    <Flex justifyContent="space-between">
                      {collection(data)}
                    </Flex>
                  </Box>
                </div>
              );
            }
          )}
      </Flex>
    </Flex>
  );
};

export default User;
