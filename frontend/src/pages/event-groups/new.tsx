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

const NewEventGroupPage: NextPage = () => {
  const [groupName, setGroupName] = useState("");
  const [image1DataUrl, setImage1DataUrl] = useState("");
  const [image1File, setImage1File] = useState(null as File | null);
  const [name1, setName1] = useState("");
  const [countThreshold1, setCountThreshold1] = useState(1);
  const { errors, loading, createEventGroup } = useCreateEventGroup();

  const uploadImagesToIpfs = useCallback(async () => {
    if (!image1File || !name1) {
      console.error("You must specify image and name");
      return;
    }
    console.log("Starting to upload images to IPFS...");
    const renamedFile = renameFile(image1File, "1.png");
    const rootCid = await ipfsClient.put([renamedFile], {
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
  }, [image1File, name1]);

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
        <Flex w="full" flexDirection={{ base: "column", md: "row" }}>
          <Box flexBasis="300px" flexShrink="0" minH="300px" m={2}>
            <ImageSelectorWithPreview
              dataUrl={image1DataUrl}
              onChangeDataUrl={setImage1DataUrl}
              onChangeFile={setImage1File}
            />
          </Box>
          <Box flexBasis="1" flexGrow="1" m={2}>
            <Text>NFT name</Text>
            <Input
              variant="outline"
              mb={4}
              value={name1}
              onChange={(e) => {
                setName1(e.target.value);
              }}
            />
          </Box>
          <Box flexBasis="1" flexGrow="1" m={2}>
            <Text>
              How many events do users need participate in to get this NFT?
            </Text>
            <NumberInput
              defaultValue={0}
              min={0}
              onChange={(__, num) => setCountThreshold1(num)}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
        </Flex>
        [Debug]
        <p>Group name: {groupName}</p>
        <p>
          NFT1: {name1} / {countThreshold1}
        </p>
        <Box mt={8} mb={4}>
          <Button
            onClick={async () => {
              const cid = await uploadImagesToIpfs();
              if (cid) {
                console.log("Upload completed", cid);
              }
              callCreateEventGroup();
            }}
            disabled={!groupName || !image1File || !name1}
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
