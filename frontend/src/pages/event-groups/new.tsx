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
  Container,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useState, useCallback, useEffect } from "react";
import { Web3Storage } from "web3.storage";
import { useAddress } from "@thirdweb-dev/react";
import { useCreateEventGroup, INFTImage } from "../../hooks/useEventManager";
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
  description: string;
  dataUrl: string;
  fileObject: File | null;
  requiredParticipateCount: number;
}

const NewEventGroupPage: NextPage = () => {
  const address = useAddress();
  const [groupName, setGroupName] = useState("");
  const { status, errors, loading, createEventGroup, createdGroupId } =
    useCreateEventGroup();

  const [nftRecords, setNftRecords] = useState([
    {
      description: "",
      dataUrl: "",
      fileObject: null,
      requiredParticipateCount: 0,
    },
    {
      description: "",
      dataUrl: "",
      fileObject: null,
      requiredParticipateCount: 5,
    },
    {
      description: "",
      dataUrl: "",
      fileObject: null,
      requiredParticipateCount: 10,
    },
  ] as PaticipateNftRecord[]);

  const isAllInputed = useCallback(
    () =>
      nftRecords.every(
        ({ description, dataUrl, fileObject }) =>
          description && dataUrl && fileObject
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
      ({ fileObject, description, requiredParticipateCount }) => ({
        fileObject: renameFile(fileObject!, `${requiredParticipateCount}.png`),
        description,
        requiredParticipateCount,
      })
    );

    const rootCid = await ipfsClient.put(
      renamedFiles.map((f) => f.fileObject),
      {
        name: `${new Date().toISOString()}`,
        maxRetries: 3,
        wrapWithDirectory: true,
        onRootCidReady: (rootCid) => {
          console.log("rood cid:", rootCid);
        },
        onStoredChunk: (size) => {
          // console.log(`stored chunk of ${size} bytes`);
        },
      }
    );
    return { rootCid, renamedFiles };
  }, [nftRecords, isAllInputed]);

  const submit = async () => {
    const uploadResult = await uploadImagesToIpfs();
    if (!uploadResult) {
      console.error("uploading error");
      // @TODO: display error alert
      return;
    }
    const { rootCid, renamedFiles } = uploadResult;
    const nftAttributes: INFTImage[] = renamedFiles.map(
      ({ fileObject, description, requiredParticipateCount }) => ({
        image: `ipfs://${rootCid}/${fileObject.name}`,
        description: description,
        requiredParticipateCount,
      })
    );

    await createEventGroup({ groupName, nftAttributes });
  };

  return (
    <Container maxW={800}>
      <Heading as="h1" my={4}>
        Create a new event group
      </Heading>
      {!address ? (
        <Text fontSize="xl">Sign in first!</Text>
      ) : (
        <>
          {!status ? (
            <>
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
              <Box>
                {nftRecords.map((record, index) => (
                  <Flex
                    key={index}
                    w="full"
                    flexDirection={{ base: "column", md: "row" }}
                  >
                    <Box flexBasis="300px" flexShrink="0" minH="300px" mb={3}>
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
                    <Box>
                      <Box m={2}>
                        <Text>NFT Description</Text>
                        <Input
                          variant="outline"
                          mb={4}
                          value={record.description}
                          onChange={(e) => {
                            setNftRecords((_prev) => {
                              const prev = _prev.concat();
                              prev[index].description = e.target.value;
                              return prev;
                            });
                          }}
                        />
                      </Box>
                      <Box m={2}>
                        <Text>
                          How many events do users need participate in to get
                          this NFT?
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
                    </Box>
                  </Flex>
                ))}
              </Box>
              <Box mt={8} mb={10}>
                <Button
                  onClick={() => submit()}
                  disabled={!groupName || !isAllInputed() || loading}
                  width="full"
                  background="mint.bg"
                >
                  {loading ? <Spinner /> : "Create"}
                </Button>
                {errors && (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertTitle>Error occurred</AlertTitle>
                    <AlertDescription>{errors.message}</AlertDescription>
                  </Alert>
                )}
              </Box>
            </>
          ) : (
            <>
              <Box>Event Group Created!🎉</Box>
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default NewEventGroupPage;
