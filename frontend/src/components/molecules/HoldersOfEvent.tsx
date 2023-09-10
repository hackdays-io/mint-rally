import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { FC, useCallback, useRef, useState } from "react";
import { useHoldersOfEvent } from "src/hooks/useMintNFT";
import { unparse } from "papaparse";

type Props = {
  eventId: number | BigNumber;
};

export const HoldersOfEvent: FC<Props> = ({ eventId }) => {
  const { holders, isLoading } = useHoldersOfEvent(eventId);
  const [downloadData, setDownloadData] = useState<any>();

  const downloadTarget = useRef<HTMLAnchorElement>(null);

  const downloadCsv = useCallback(() => {
    const data = unparse(
      holders.map((holder) => ({
        holderAddress: holder.holderAddress,
        tokenId: holder.tokenId.toString(),
      })),
      {
        columns: ["holderAddress", "tokenId"],
        header: true,
      }
    );
    setDownloadData(
      URL.createObjectURL(new Blob([data], { type: "text/csv" }))
    );
    setTimeout(() => {
      downloadTarget.current?.click();
    }, 100);
  }, [holders]);

  return (
    <Box
      rounded="lg"
      verticalAlign="top"
      alignContent="top"
      backgroundColor="blue.50"
      py={{ md: 8, base: 5 }}
      px={{ md: 10, base: 5 }}
      mt={4}
    >
      <Heading
        as={"h2"}
        fontSize={"lg"}
        mb={3}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box as="span">Holders ({holders?.length})</Box>
        <Button
          ml={3}
          size="sm"
          backgroundColor="transparent"
          border="1px solid"
          borderColor="yellow.800"
          color="yellow.800"
          onClick={downloadCsv}
        >
          Download
        </Button>
        <a
          download={`holders_address.csv`}
          href={downloadData}
          style={{ display: "none" }}
          ref={downloadTarget}
        />
      </Heading>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <Divider my={4} />
          <Flex>
            {holders?.map((holder) => (
              <Tooltip
                label={holder.holderAddress}
                backgroundColor="white"
                color="yellow.900"
                fontSize="xs"
                key={`${holder.holderAddress}-${holder.tokenId}`}
              >
                <Box
                  as="span"
                  px={3}
                  py={1}
                  fontSize="xs"
                  backgroundColor="white"
                  borderRadius="full"
                  border="2px solid lightgray"
                >
                  {holder.holderAddress.slice(0, 5)}...
                  {holder.holderAddress.slice(-3)}
                </Box>
              </Tooltip>
            ))}
          </Flex>
        </>
      )}
    </Box>
  );
};
