import { Heading, Spinner, Text, Container, Box } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FC, Fragment, useMemo } from "react";
import LoginRequired from "../../components/atoms/web3/LoginRequired";
import { useLocale } from "../../hooks/useLocale";
import { MintForm } from "src/components/organisms/nft/MintForm";
import { useAddress } from "@thirdweb-dev/react";
import {
  useGetOwnedNFTByAddress,
  useIsHoldingEventNftByAddress,
} from "src/hooks/useMintNFT";
import { NFTItem } from "src/components/atoms/nft/NFTItem";
import { Event } from "types/Event";
import { useEventById } from "src/hooks/useEvent";
import { CalendarIcon } from '@chakra-ui/icons'

const MintNFTSection: FC<{ event: Event.EventRecord }> = ({ event }) => {
  const address = useAddress();
  const { isHoldingEventNft, isLoading } = useIsHoldingEventNftByAddress(
    address,
    event.eventRecordId
  );
  const { nfts, isLoading: checkHoldingNFTs } =
    useGetOwnedNFTByAddress(address);
  const holdingNFT = useMemo(() => {
    return nfts.find(
      (nft) =>
        nft.traits.EventName === event?.name &&
        nft.traits.EventGroupId === event?.groupId.toString()
    );
  }, [nfts, address]);

  return (
    <>
      {isLoading || checkHoldingNFTs || !address ? (
        <Spinner />
      ) : isHoldingEventNft && holdingNFT ? (
        <Box maxW={200} mx="auto" cursor="pointer">
          <NFTItem
            shareURL={false}
            nft={holdingNFT}
            tokenId={holdingNFT.tokenId || 0}
            address={address}
            showShareButtons={true}
            showOpenSeaLink={true}
          />
        </Box>
      ) : (
        <MintForm event={event} address={address} />
      )}
    </>
  );
};

const Event: FC = () => {
  const router = useRouter();
  const { eventid } = router.query;
  const { event, isLoading } = useEventById(Number(eventid));

  const { t } = useLocale();

  return (
    <>
      <Container maxW={800} py={6} pb="120px">
        {isLoading && <Spinner />}
        {event && (
          <>
            <Heading>{event.name}</Heading>
            <Text fontSize="24px"><CalendarIcon /> {event.date}</Text>

            <Text fontSize="16px" my={10}>
              {event.description
                .split(/(\n)/)
                .map((item: any, index: number) => (
                  <Fragment key={index}>
                    {item.match(/\n/) ? <br /> : item}
                  </Fragment>
                ))}
            </Text>

            <LoginRequired
              requiredChainID={+process.env.NEXT_PUBLIC_CHAIN_ID!}
              forbiddenText={t.SIGN_IN_TO_GET_NFT}
            >
              <Box
                borderWidth="3px"
                rounded="lg"
                overflow="hidden"
                _hover={{ cursor: "pointer" }}
                verticalAlign="center"
                backgroundColor="blue.50"
                padding="8"
              >
                <MintNFTSection event={event} />
              </Box>
            </LoginRequired>
            <br/>
              <Box
                borderWidth="3px"
                rounded="lg"
                overflow="hidden"
                _hover={{ cursor: "pointer" }}
                verticalAlign="center"
                backgroundColor="blue.50"
                padding="8"
              >
                注意事項羅列
              </Box>
          </>
        )}
      </Container>
    </>
  );
};

export default Event;
