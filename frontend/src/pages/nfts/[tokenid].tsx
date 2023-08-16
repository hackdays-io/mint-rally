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
  Grid,
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
      const data = await getNFTDataFromTokenID(BigNumber.from(props.tokenid));
      if (data) {
        props.nft = data;
      }
      const owner = await getOwnerOfTokenId(BigNumber.from(props.tokenid));
      if (owner) {
        props.address = owner;
      }
      const groups = await getEventGroups();
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
            <Grid gridTemplateColumns={{ base: "auto", md: "400px 1fr" }}>
              <Box>
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
              </Box>

              <Table maxWidth="100%" variant="simple" wordBreak="break-all">
                <Tbody>
                  <Tr>
                    <Th pl={0} width="130px" color="primary.400">
                      {t.OWNER}
                    </Th>
                    <Td pl={0} overflowWrap="anywhere" whiteSpace="unset">
                      <ENSName address={props.address!} enableUserLink={true} />
                    </Td>
                  </Tr>
                  <Tr>
                    <Th pl={0} width="130px" color="primary.400">
                      {t.NFT_NAME}
                    </Th>
                    <Td pl={0} overflowWrap="anywhere">
                      {props.nft.name}
                    </Td>
                  </Tr>
                  <Tr>
                    <Th pl={0} width="130px" color="primary.400">
                      {t.NFT_DESC}
                    </Th>
                    <Td pl={0} overflowWrap="anywhere">
                      {props.nft.description}
                    </Td>
                  </Tr>
                  <OrganizerRows eventgroupid={props.nft.traits.EventGroupId} />
                </Tbody>
              </Table>
            </Grid>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Entity;
