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
import { useCreateEventGroup, INFTImage } from "../../hooks/useEventManager";
import LoginRequired from "../../components/atoms/web3/LoginRequired";
import { useLocale } from "../../hooks/useLocale";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import ErrorMessage from "../../components/atoms/form/ErrorMessage";
import NFTAttributesForm from "../../components/organisms/NFTAttributesForm";
import { ipfsUploader } from "src/libs/libIpfs";

export interface EventGroupFormData {
  groupName: string;
  nfts: INFTImage[];
}

const NewEventGroupPage: NextPage = () => {
  const { status, errors, createEventGroup, loading } = useCreateEventGroup();
  const { t } = useLocale();
  const uploader = new ipfsUploader();

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
          name: "",
          description: "",
          fileObject: null,
          requiredParticipateCount: 0,
        },
        {
          name: "",
          description: "",
          fileObject: null,
          requiredParticipateCount: 3,
        },
        {
          name: "",
          description: "",
          fileObject: null,
          requiredParticipateCount: 5,
        },
      ],
    },
  });

  const { remove, append } = useFieldArray({ control, name: "nfts" });

  const submit = async (data: EventGroupFormData) => {
    console.log(data.nfts);
    const uploadResult = await uploader.uploadNFTsToIpfs(data.nfts);

    if (uploadResult) {
      const { rootCid, renamedFiles } = uploadResult;
      const nftAttributes: INFTImage[] = renamedFiles.map(
        ({ name, fileObject, description, requiredParticipateCount }) => ({
          name: name,
          image: `ipfs://${rootCid}/${fileObject.name}`,
          description: description,
          requiredParticipateCount,
        })
      );
      console.log(nftAttributes);
      await createEventGroup({ groupName: data.groupName, nftAttributes });
    }
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
                {t.EVENT_GROUP_NFT_TITLE}
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
