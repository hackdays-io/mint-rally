import { Heading, Spinner, Text, Container, Box } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FC, Fragment, useMemo } from "react";
import { useLocale } from "../../hooks/useLocale";
import { MintForm } from "src/components/organisms/nft/MintForm";
import { useAddress, useWallet, magicLink } from "@thirdweb-dev/react";
import {
  useGetOwnedNFTByAddress,
  useIsHoldingEventNftByAddress,
} from "src/hooks/useMintNFT";
import { NFTItem } from "src/components/atoms/nft/NFTItem";
import { Event } from "types/Event";
import { useEventById, useParseEventDate } from "src/hooks/useEvent";
import OrganizerInfo from "src/components/atoms/events/OrganizerInfo";
import { CalendarIcon } from "@chakra-ui/icons";
import { MintGuide } from "src/components/atoms/form/MintGuide";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import MintNFTLoginRequired from "src/components/atoms/events/MintNFTLoginRequired";
import EventEditSection from "src/components/organisms/EventEditSection";
import { HoldersOfEvent } from "src/components/molecules/HoldersOfEvent";
import dayjs from "dayjs";

const MintNFTSection: FC<{ event: Event.EventRecord }> = ({ event }) => {
  const address = useAddress();
  const walletInstance = useWallet();
  const { t } = useLocale();
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
        <Box mx="auto" cursor="pointer" mb={10} maxW={350}>
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
        <Box
          rounded="lg"
          overflow="hidden"
          verticalAlign="center"
          backgroundColor="blue.50"
          py={{ md: 8, base: 5 }}
          px={{ md: 10, base: 5 }}
        >
          {walletInstance?.walletId == "magicLink" && !event.useMtx ? (
            <Text>{t.MAGICLINK_IS_NOT_SUPPORTED_USE_OTHERS}</Text>
          ) : (
            <MintForm event={event} address={address} />
          )}
        </Box>
      )}
    </>
  );
};

const Event: FC = () => {
  const router = useRouter();
  const { eventid } = router.query;
  const { event, isLoading } = useEventById(Number(eventid));

  const { t } = useLocale();

  const { parsedEventDate } = useParseEventDate(event?.date);

  return (
    <>
      <Container maxW={800} py={6} pb="120px">
        {isLoading && <Spinner />}
        {event && (
          <>
            <Heading fontSize="3xl" mb={2} color="text.black">
              {event.name}
            </Heading>
            <Text
              fontSize="md"
              mb={6}
              display="flex"
              alignItems="center"
              gap={2}
              color="yellow.900"
            >
              <CalendarIcon /> {parsedEventDate}
            </Text>

            <Text fontSize="md" color="text.black">
              {event.description
                .split(/(\n)/)
                .map((item: any, index: number) => (
                  <Fragment key={index}>
                    {item.match(/\n/) ? <br /> : item}
                  </Fragment>
                ))}
            </Text>

            <OrganizerInfo eventgroupid={event[1]} />

            <MintNFTLoginRequired
              requiredChainID={+process.env.NEXT_PUBLIC_CHAIN_ID!}
              forbiddenText={t.SIGN_IN_TO_GET_NFT}
              allowMagicLink={event.useMtx == true}
            >
              <MintNFTSection event={event} />
              <EventEditSection event={event} />
            </MintNFTLoginRequired>

            <Box
              rounded="lg"
              verticalAlign="top"
              alignContent="top"
              backgroundColor="blue.50"
              py={{ md: 8, base: 5 }}
              px={{ md: 10, base: 5 }}
              mt={4}
              display={{ base: "block", md: "flex" }}
            >
              <Box color="blue.500" fontSize="lg">
                <FontAwesomeIcon icon={faCircleInfo} />
              </Box>
              <Box>
                <MintGuide />
              </Box>
            </Box>

            <HoldersOfEvent eventId={Number(eventid)} />
          </>
        )}
      </Container>
    </>
  );
};

export default Event;
