import {
  Button,
  Input,
  Heading,
  Box,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Container,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { Web3Storage } from "web3.storage";
import { useCreateEventGroup, INFTImage } from "../../hooks/useEventManager";
import LoginRequired from "../../components/atoms/web3/LoginRequired";
import { useLocale } from "../../hooks/useLocale";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import ErrorMessage from "../../components/atoms/form/ErrorMessage";
import NFTAttributesForm from "../../components/organisms/NFTAttributesForm";

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

export interface EventGroupFormData {
  groupName: string;
  nfts: {
    description: string;
    fileObject: File | null;
    requiredParticipateCount: number;
  }[];
}

const NewEventGroupPage: NextPage = () => {
  const { status, errors, createEventGroup, loading } = useCreateEventGroup();
  const { t } = useLocale();

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<EventGroupFormData>({
    defaultValues: {
      groupName: "",
      nfts: [
        {
          description: "",
          fileObject: null,
          requiredParticipateCount: 0,
        },
        {
          description: "",
          fileObject: null,
          requiredParticipateCount: 3,
        },
        {
          description: "",
          fileObject: null,
          requiredParticipateCount: 5,
        },
      ],
    },
  });

  const { remove, append } = useFieldArray({ control, name: "nfts" });

  const uploadImagesToIpfs = async (nfts: EventGroupFormData["nfts"]) => {
    console.log("Starting to upload images to IPFS...");
    const renamedFiles = nfts.map(
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
  };

  const submit = async (data: EventGroupFormData) => {
    const uploadResult = await uploadImagesToIpfs(data.nfts);
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

    await createEventGroup({ groupName: data.groupName, nftAttributes });
  };

  return (
    <Container maxW={800}>
      <Heading as="h1" mt={4} mb={6}>
        {t.CREATE_NEW_EVENT_GROUP}
      </Heading>
      <LoginRequired
        requiredChainID={+process.env.NEXT_PUBLIC_CHAIN_ID!}
        forbiddenText={t.PLEASE_SIGN_IN}
      >
        <>
          {!status ? (
            <form onSubmit={handleSubmit(submit)}>
              <Heading as="h2" fontSize="xl" mb={4}>
                {t.NEW_EVENT_GROUP_NAME}
              </Heading>
              <Controller
                control={control}
                name="groupName"
                rules={{ required: "Group name is required" }}
                render={({
                  field: { onChange, value },
                  formState: { errors },
                }) => (
                  <>
                    <Input
                      variant="outline"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                    />
                    <ErrorMessage>{errors.groupName?.message}</ErrorMessage>
                  </>
                )}
              />

              <Heading as="h2" fontSize="xl" my={4}>
                NFTs
              </Heading>
              {control && (
                <NFTAttributesForm
                  control={control}
                  nfts={watch("nfts")}
                  append={append}
                  remove={remove}
                />
              )}
              <Box mt={8} mb={10}>
                <Button
                  disabled={isSubmitting || loading}
                  width="full"
                  background="mint.bg"
                  size="lg"
                  type="submit"
                >
                  {isSubmitting || loading ? (
                    <Spinner />
                  ) : (
                    t.CREATE_NEW_EVENT_GROUP
                  )}
                </Button>
                {errors && (
                  <Alert status="error" mt={2}>
                    <AlertIcon />
                    <AlertTitle>Error occurred</AlertTitle>
                    <AlertDescription>{errors.message}</AlertDescription>
                  </Alert>
                )}
              </Box>
            </form>
          ) : (
            <>
              <Box>{t.EVENT_GROUP_CREATED}🎉</Box>
            </>
          )}
        </>
      </LoginRequired>
    </Container>
  );
};

export default NewEventGroupPage;
