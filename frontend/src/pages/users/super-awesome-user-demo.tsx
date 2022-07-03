import { Box, Divider, Flex, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useGetOwnedNFTs } from "../../hooks/useMintNFTManager";

const User = () => {
  // TODO: address毎のNFTを表示する
  const router = useRouter();
  const { userid } = router.query;

  const { ownedNFTs, loading, getOwnedNFTs } = useGetOwnedNFTs();

  const hackDaysCollectionData = [
    {
      image: "/images/collection_example/00-00.png",
      name: "Event day 1",
      date: "2020-01-01",
    },
    {
      image: "/images/collection_example/00-00.png",
      name: "Event day 2",
      date: "2020-02-01",
    },
    {
      image: "/images/collection_example/00-00.png",
      name: "Event day 3",
      date: "2020-03-01",
    },
    {
      image: "/images/collection_example/00-00.png",
      name: "Event day 4",
      date: "2020-04-01",
    },
    {
      image: "/images/collection_example/00-01.png",
      name: "Event day 5",
      date: "2020-05-01",
    },
    {
      image: "/images/collection_example/00-00.png",
      name: "Event day 6",
      date: "2020-06-01",
    },
    {
      image: "/images/collection_example/00-00.png",
      name: "Event day 7",
      date: "2020-07-01",
    },
    {
      image: "/images/collection_example/00-00.png",
      name: "Event day 8",
      date: "2020-08-01",
    },
    {
      image: "/images/collection_example/00-00.png",
      name: "Event day 9",
      date: "2020-09-01",
    },
    {
      image: "/images/collection_example/02-03.png",
      name: "Event day 10",
      date: "2020-10-01",
    },
  ];

  const summitCollectionData = [
    {
      image: "/images/collection_example/Summit-04.png",
      name: "Event day 1",
      date: "2020-01-01",
    },
    {
      image: "/images/collection_example/Summit-04.png",
      name: "Event day 2",
      date: "2020-02-01",
    },
    {
      image: "/images/collection_example/Summit-04.png",
      name: "Event day 3",
      date: "2020-03-01",
    },
    {
      image: "/images/collection_example/Summit-04.png",
      name: "Event day 4",
      date: "2020-04-01",
    },
    {
      image: "/images/collection_example/Summit-02.png",
      name: "Event day 5",
      date: "2020-05-01",
    },
  ];

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
            User Collection
          </Heading>
        </Box>
        <Box width="100%" mt={20}>
          <Heading as="h2" size="xl" color="#552306" fontWeight={400}>
            Social Hack Day
          </Heading>
          <Box mt={4}>
            <div style={{ border: "2px #56F0DE solid" }} />
          </Box>
          <Flex justifyContent="space-between">
            {collection(hackDaysCollectionData)}
          </Flex>
        </Box>

        <Box width="100%" mt={20}>
          <Heading as="h2" size="xl" color="#552306" fontWeight={400}>
            Code for Japan Summit
          </Heading>
          <Box mt={4}>
            <div style={{ border: "2px #56F0DE solid" }} />
          </Box>
          <Flex justifyContent="space-between">
            {collection(summitCollectionData)}
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};

export default User;
