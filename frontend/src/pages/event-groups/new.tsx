import {
  Button,
  Input,
  Text,
  Heading,
  Box,
  createIcon,
  Image,
  Flex,
  HTMLChakraProps,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useState, useCallback } from "react";
import styled from "@emotion/styled";
import { Web3Storage } from "web3.storage";

const ImageIcon = createIcon({
  displayName: "ImageIcon",
  viewBox: "0 0 24 24",
  path: (
    <path
      fill="currentColor"
      d="M22,16V4A2,2 0 0,0 20,2H8A2,2 0 0,0 6,4V16A2,2 0 0,0 8,18H20A2,2 0 0,0 22,16M11,12L13.03,14.71L16,11L20,16H8M2,6V20A2,2 0 0,0 4,22H18V20H4V6"
    />
  ),
});

const LabelForStyledInput = styled.label`
  display: block;
  width: 100%;
  height: 100%;
  &:hover {
    cursor: pointer;
  }
`;

const noop = () => {};

const FileInput = ({
  previewElements,
  onFileChange = noop,
  ...rest
}: {
  previewElements: JSX.Element;
  onFileChange: (file: File | undefined | null) => void;
} & HTMLChakraProps<"div">) => (
  <Box {...rest}>
    <LabelForStyledInput>
      {previewElements}
      <input
        style={{ display: "none" }}
        type="file"
        accept="image/*"
        onChange={(e) => {
          onFileChange(e.target.files?.item(0));
        }}
      />
    </LabelForStyledInput>
  </Box>
);

const ImageSelectorWithPreview = ({
  dataUrl,
  onChangeDataUrl,
  onChangeFile,
}: {
  dataUrl: string;
  onChangeDataUrl: (dataUrl: string) => void;
  onChangeFile: (file: File) => void;
}) => (
  <FileInput
    w="100%"
    h="100%"
    bgColor="gray.300"
    previewElements={
      <Flex w="100%" h="100%" align="center" justify="center">
        {dataUrl ? (
          <Image
            src={dataUrl}
            alt="image"
            fit="contain"
            maxW="100%"
            maxH="100%"
          />
        ) : (
          <ImageIcon boxSize={16} color="gray.600" mx="auto" />
        )}
      </Flex>
    }
    onFileChange={async (file) => {
      if (!file) return;
      const dataUrl = await getImageData(file);
      if (!dataUrl) return;

      onChangeFile(file);
      onChangeDataUrl(dataUrl);
    }}
  />
);

const getImageData = (file: File): Promise<string | undefined> => {
  const fileReader = new FileReader();
  return new Promise((resolve, _reject) => {
    fileReader.readAsDataURL(file);
    fileReader.addEventListener("load", (ev) => {
      resolve(fileReader.result?.toString());
    });
  });
};

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
        console.log(`stored chunk of ${size} bytes`);
      },
    });
    return rootCid;
  }, [image1File, name1]);

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
              console.log("Upload completed", cid);
            }}
          >
            Create
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default NewEventGroupPage;
