import {
  Box,
  Container,
  Flex,
  Heading,
  Link,
  Table,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import Image from "next/image";
import { FC } from "react";
import { OrganizerRows } from "src/components/atoms/events/OrganizerInfo";
import { ShareButtons } from "src/components/atoms/nft/ShareButtons";
import ENSName from "src/components/atoms/web3/ENSName";
import { useLocale } from "src/hooks/useLocale";
import {
  getEventGroups,
  getNFTDataFromTokenID,
  getOwnerOfTokenId,
} from "src/libs/contractMethods";
import { NFT } from "types/NFT";
import { ipfs2http } from "utils/ipfs2http";

type Props = {
  address?: string;
  tokenid?: string;
  nft?: NFT.Metadata | null;
  groupName?: string;
};
export const getServerSideProps: GetServerSideProps = async (context) => {
  const address = context.query.address;
  const props: Props = {
    address: String(address),
  };
  if (context.query.tokenid) {
    try {
      props.tokenid = String(context.query.tokenid);
      const [data, owner, groups] = await Promise.all([
        getNFTDataFromTokenID(BigNumber.from(props.tokenid)),
        getOwnerOfTokenId(BigNumber.from(props.tokenid)),
        getEventGroups(),
      ]);
      if (data) {
        props.nft = data;
      }
      if (owner) {
        props.address = owner;
      }
      if (groups) {
        const gid = BigNumber.from(props.nft?.traits.EventGroupId);
        props.groupName = groups.find((group) => gid.eq(group.groupId))?.name;
      }
    } catch (e) {
      console.log(e);
      return {
        notFound: true,
      };
    }
  }
  return {
    props: props,
  };
};

const Entity: FC<Props> = (props: Props) => {
  const { t } = useLocale();
  return (
    <Container maxW="1000">
      {props.nft && (
        <NextSeo
          title={`${props.nft.name} | MintRally`}
          description={props.nft.description}
          openGraph={{
            url: `https://mintrally.xyz/nfts/${props.tokenid}`,
            images: [
              {
                url: ipfs2http(props.nft.image),
                width: 600,
                height: 600,
                alt: props.nft.name,
              },
            ],
          }}
        ></NextSeo>
      )}
      <Box mt={{ base: 5, md: 10 }}>
        <Heading as="h1" size="xl" color="mint.primary" fontWeight={700} mb={5}>
          NFT
        </Heading>
        {props.nft && (
          <>
            <Flex justifyContent={{ md: "center" }} flexDirection="column">
              <Box
                width={{ md: 350 }}
                textAlign={{ base: "center", md: "left" }}
              >
                <Image
                  width={500}
                  height={500}
                  src={ipfs2http(props.nft.image)}
                  alt={props.nft.name}
                />
              </Box>

              <Flex justifyContent="center" pb={4} width={{ md: 350 }}>
                <ShareButtons
                  tokenId={Number(props.tokenid)}
                  address={props.address!}
                  twitter={true}
                />
              </Flex>

              <Table maxWidth="100%" variant="simple">
                <Tbody>
                  <Tr>
                    <Th width={155}>{t.OWNER}: </Th>
                    <Td overflowWrap="anywhere" whiteSpace="unset">
                      <ENSName address={props.address!} enableUserLink={true} />
                    </Td>
                  </Tr>
                  <Tr>
                    <Th>{t.NFT_NAME}:</Th>
                    <Td overflowWrap="anywhere"> {props.nft.name}</Td>
                  </Tr>
                  <Tr>
                    <Th>{t.NFT_DESC}:</Th>
                    <Td overflowWrap="anywhere">{props.nft.description}</Td>
                  </Tr>
                  <OrganizerRows eventgroupid={props.nft.traits.EventGroupId} />
                </Tbody>
              </Table>
            </Flex>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Entity;
