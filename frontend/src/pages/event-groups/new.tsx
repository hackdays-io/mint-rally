import {
  Button,
  Input,
  Text,
  Heading,
  Box,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useState, useCallback } from "react";
import { Web3Storage } from "web3.storage";
import { useCreateEventGroup } from "../../hooks/useEventManager";
import ImageSelectorWithPreview from "../../components/ImageSelectorWithPreview";

if (!process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY) {
  throw new Error("WEB3_STORAGE_KEY is required");
}

const ipfsClient = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY,
  endpoint: new URL("https://api.web3.storage"),
});

const renameFile = (file: File, newFilename: string) => {
  const { type, lastModified } = file;
  return new File([file], newFilename, { type, lastModified });
};

interface PaticipateNftRecord {
  name: string;
  dataUrl: string;
  fileObject: File | null;
  requiredParticipateCount: number;
}

const NewEventGroupPage: NextPage = () => {
  const [groupName, setGroupName] = useState("");

  const [nftRecords, setNftRecords] = useState([
    { name: "", dataUrl: "", fileObject: null, requiredParticipateCount: 0 },
    { name: "", dataUrl: "", fileObject: null, requiredParticipateCount: 5 },
    { name: "", dataUrl: "", fileObject: null, requiredParticipateCount: 10 },
  ] as PaticipateNftRecord[]);

  const { errors, loading, createEventGroup } = useCreateEventGroup();

  const isAllInputed = useCallback(
    () =>
      nftRecords.every(
        ({ name, dataUrl, fileObject }) => name && dataUrl && fileObject
      ),
    [nftRecords]
  );

  const uploadImagesToIpfs = useCallback(async () => {
    if (!isAllInputed) {
      console.error("You must specify image and name");
      return;
    }
    console.log("Starting to upload images to IPFS...");
    const renamedFiles = nftRecords.map(
      ({ fileObject, requiredParticipateCount }) =>
        renameFile(fileObject!, `${requiredParticipateCount}.png`)
    );

    const rootCid = await ipfsClient.put(renamedFiles, {
      name: `test ${new Date().toISOString()}`,
      maxRetries: 3,
      wrapWithDirectory: true,
      onRootCidReady: (rootCid) => {
        console.log("rood cid:", rootCid);
      },
      onStoredChunk: (size) => {
        // console.log(`stored chunk of ${size} bytes`);
      },
    });
    return rootCid;
  }, [nftRecords, isAllInputed]);

  const callCreateEventGroup = () => {
    createEventGroup({ groupName: groupName });
  };

  return (
    <>
      {/* @TODO: padding need to be set in Layout component */}
      <Box px={6}>
        <Heading as="h1" textAlign="center" mb={4}>
          Create a new event group
        </Heading>
        <Text>Event Group Name</Text>
        <Input
          variant="outline"
          mb={4}
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <Heading as="h2" fontSize="3xl" mb={4}>
          NFTs
        </Heading>
        {nftRecords.map((r) => `${r.name} `)}
        <Box>
          {nftRecords.map((record, index) => (
            <Flex
              key={index}
              w="full"
              flexDirection={{ base: "column", md: "row" }}
            >
              <Box flexBasis="300px" flexShrink="0" minH="300px" m={2}>
                <ImageSelectorWithPreview
                  dataUrl={record.dataUrl}
                  onChangeData={(newDataUrl, newFile) => {
                    setNftRecords((_prev) => {
                      const prev = _prev.concat();
                      prev[index].dataUrl = newDataUrl;
                      prev[index].fileObject = newFile;
                      return prev;
                    });
                  }}
                />
              </Box>
              <Box flexBasis="1" flexGrow="1" m={2}>
                <Text>NFT name</Text>
                <Input
                  variant="outline"
                  mb={4}
                  value={record.name}
                  onChange={(e) => {
                    setNftRecords((_prev) => {
                      const prev = _prev.concat();
                      prev[index].name = e.target.value;
                      return prev;
                    });
                  }}
                />
              </Box>
              <Box flexBasis="1" flexGrow="1" m={2}>
                <Text>
                  How many events do users need participate in to get this NFT?
                </Text>
                <NumberInput
                  defaultValue={record.requiredParticipateCount}
                  min={0}
                  onChange={(__, num) => {
                    setNftRecords((_prev) => {
                      const prev = _prev.concat();
                      prev[index].requiredParticipateCount = num;
                      return prev;
                    });
                  }}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
            </Flex>
          ))}
        </Box>
        {/* [Debug]
        <p>Group name: {groupName}</p>
        <p>
          NFT1: {name1} / {countThreshold1}
        </p> */}
        <Box mt={8} mb={4}>
          <Button
            onClick={async () => {
              const cid = await uploadImagesToIpfs();
              if (cid) {
                console.log("Upload completed", cid);
              }
              callCreateEventGroup();
            }}
            disabled={!groupName || !isAllInputed()}
          >
            Create
          </Button>
          {loading && <Spinner></Spinner>}
          {errors && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Error occurred</AlertTitle>
              <AlertDescription>{errors.message}</AlertDescription>
            </Alert>
          )}
        </Box>
      </Box>
    </>
  );
};

export default NewEventGroupPage;
