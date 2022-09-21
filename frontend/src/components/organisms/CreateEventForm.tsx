import { FC, useEffect, useRef } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Spinner,
  Switch,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  FormLabel,
  FormControl,
  Select,
  Input,
  Button,
} from "@chakra-ui/react";
import {
  ICreateEventRecordParams,
  IEventGroup,
  INFTAttribute,
  INFTImage,
  useCreateEventRecord,
  useOwnEventGroups,
} from "../../hooks/useEventManager";
import ErrorMessage from "../../components/atoms/form/ErrorMessage";
import { useLocale } from "../../hooks/useLocale";
import Link from "next/link";
import NFTAttributesForm from "./NFTAttributesForm";
import { useIpfsClient, useUploadImageToIpfs } from "src/hooks/useIpfs";

interface EventFormData {
  eventGroupId: string;
  eventName: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  secretPhrase: string;
  mintLimit: number;
  useMtx: boolean;
  nfts: INFTImage[];
}

const CreateEventForm: FC = () => {
  const { t } = useLocale();
  const ipfsClient = useIpfsClient();
  const uploadImagesToIpfs = useUploadImageToIpfs();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = useForm<EventFormData>({
    mode: "all",
    defaultValues: {
      eventGroupId: "",
      eventName: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      secretPhrase: "",
      mintLimit: 10,
      useMtx: false,
      nfts: [],
    },
  });

  const { remove, append } = useFieldArray({ control, name: "nfts" });

  useEffect(() => {
    const groupNFTAttributes = window.localStorage.getItem(
      `group${watch("eventGroupId")}`
    );
    if (!groupNFTAttributes) {
      console.log("dont has group");
      setValue("nfts", [
        { name: "", requiredParticipateCount: 0, description: "", image: "" },
      ]);
    } else {
      console.log("has group");
      const baseNFTAttributes: INFTImage[] = JSON.parse(groupNFTAttributes);
      setValue("nfts", baseNFTAttributes);
    }
  }, [watch("eventGroupId")]);

  // state for loading event groups
  const { groups } = useOwnEventGroups();
  const {
    status,
    errors: createError,
    loading: createLoading,
    createEventRecord,
  } = useCreateEventRecord();

  const saveNFTMetadataOnIPFS = async (
    groupId: string,
    eventName: string,
    nfts: INFTImage[]
  ) => {
    const imageUpdatedNfts = nfts.filter((nft) => nft.fileObject);
    let baseNftAttributes = nfts.filter((nft) => !nft.fileObject);

    const uploadResult = await uploadImagesToIpfs(imageUpdatedNfts);
    if (uploadResult) {
      const nftAttributes: INFTImage[] = uploadResult.renamedFiles.map(
        ({ name, fileObject, description, requiredParticipateCount }) => ({
          name: name,
          image: `ipfs://${uploadResult.rootCid}/${fileObject.name}`,
          description: description,
          requiredParticipateCount,
        })
      );
      baseNftAttributes = nftAttributes.concat(baseNftAttributes);
    }

    const metadataFiles: File[] = [];
    for (const nftAttribute of baseNftAttributes) {
      const attribute: INFTAttribute = {
        name: nftAttribute.name,
        image: nftAttribute.image,
        description: nftAttribute.description,
        external_link: "https://mintrally.xyz",
        traits: {
          EventGroupId: groupId,
          EventName: eventName,
          RequiredParticipateCount: nftAttribute.requiredParticipateCount,
        },
      };
      metadataFiles.push(
        new File(
          [JSON.stringify(attribute)],
          `${nftAttribute.requiredParticipateCount}.json`,
          { type: "text/json" }
        )
      );
    }
    const metaDataRootCid = await ipfsClient.put(metadataFiles, {
      name: `${groupId}_${eventName}`,
      maxRetries: 3,
      wrapWithDirectory: true,
    });
    return baseNftAttributes.map((attribute) => {
      return {
        requiredParticipateCount: attribute.requiredParticipateCount,
        metaDataURL: `ipfs://${metaDataRootCid}/${attribute.requiredParticipateCount}.json`,
      };
    });
  };

  const onSubmit = async (data: EventFormData) => {
    const nftAttributes = await saveNFTMetadataOnIPFS(
      data.eventGroupId,
      data.eventName,
      data.nfts
    );

    const params: ICreateEventRecordParams = {
      groupId: data.eventGroupId,
      eventName: data.eventName,
      description: data.description,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      secretPhrase: data.secretPhrase,
      mintLimit: Number(data.mintLimit),
      useMtx: data.useMtx,
      attributes: nftAttributes,
    };
    try {
      await createEventRecord(params);
    } catch (error: any) {
      alert(error);
    }
  };

  return (
    <>
      {groups.length > 0 ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl mb={5}>
            <FormLabel htmlFor="eventGroupId">{t.EVENT_GROUP}</FormLabel>
            <Controller
              control={control}
              name="eventGroupId"
              render={({ field: { onChange, value } }) => (
                <Select
                  id="eventGroupId"
                  placeholder="Please select event group"
                  value={value}
                  onChange={onChange}
                >
                  {groups.map((item: IEventGroup) => {
                    return (
                      <option
                        value={item.groupId.toNumber()}
                        key={item.groupId.toString()}
                      >
                        {item.name}
                      </option>
                    );
                  })}
                </Select>
              )}
            />
          </FormControl>

          {watch("eventGroupId") ? (
            <>
              <FormControl mb={5}>
                <FormLabel htmlFor="name">{t.EVENT_NAME}</FormLabel>
                <Controller
                  control={control}
                  name="eventName"
                  rules={{
                    required: "Event name is required",
                  }}
                  render={({
                    field: { onChange, value },
                    formState: { errors },
                  }) => (
                    <>
                      <Input id="name" onChange={onChange} value={value} />
                      <ErrorMessage>{errors.eventName?.message}</ErrorMessage>
                    </>
                  )}
                />
              </FormControl>
              <FormControl mb={5}>
                <FormLabel htmlFor="description">
                  {t.EVENT_DESCRIPTION}
                </FormLabel>
                <Controller
                  control={control}
                  name="description"
                  rules={{
                    required: "Description is required",
                    minLength: {
                      value: 4,
                      message: "Minimum length should be 4",
                    },
                  }}
                  render={({
                    field: { onChange, value },
                    formState: { errors },
                  }) => (
                    <>
                      <Textarea
                        id="description"
                        onChange={onChange}
                        value={value}
                      />
                      <ErrorMessage>{errors.description?.message}</ErrorMessage>
                    </>
                  )}
                />
              </FormControl>
              <Flex mb={5} justifyContent="space-between" flexWrap="wrap">
                <FormControl width={{ base: "100%", md: "30%" }}>
                  <FormLabel htmlFor="date">{t.EVENT_DATE}</FormLabel>
                  <Controller
                    control={control}
                    name="date"
                    rules={{
                      required: "Date is required",
                    }}
                    render={({
                      field: { onChange, value },
                      formState: { errors },
                    }) => (
                      <>
                        <Input
                          id="date"
                          onChange={onChange}
                          value={value}
                          type="date"
                        />
                        <ErrorMessage>{errors.date?.message}</ErrorMessage>
                      </>
                    )}
                  />
                </FormControl>
                <FormControl
                  width={{ base: "47%", md: "30%" }}
                  mt={{ base: 2, md: 0 }}
                >
                  <FormLabel htmlFor="startTime">
                    {t.EVENT_START_TIME}
                  </FormLabel>
                  <Controller
                    control={control}
                    name="startTime"
                    rules={{
                      required: "Start time is required",
                    }}
                    render={({
                      field: { onChange, value },
                      formState: { errors },
                    }) => (
                      <>
                        <Input
                          id="startTime"
                          onChange={onChange}
                          value={value}
                          type="time"
                        />
                        <ErrorMessage>{errors.date?.message}</ErrorMessage>
                      </>
                    )}
                  />
                </FormControl>
                <FormControl
                  width={{ base: "47%", md: "30%" }}
                  mt={{ base: 2, md: 0 }}
                >
                  <FormLabel htmlFor="endTime">{t.EVENT_END_TIME}</FormLabel>
                  <Controller
                    control={control}
                    name="endTime"
                    rules={{
                      required: "End time is required",
                    }}
                    render={({
                      field: { onChange, value },
                      formState: { errors },
                    }) => (
                      <>
                        <Input
                          id="endTime"
                          onChange={onChange}
                          value={value}
                          type="time"
                        />
                        <ErrorMessage>{errors.date?.message}</ErrorMessage>
                      </>
                    )}
                  />
                </FormControl>
              </Flex>

              <FormControl mb={5}>
                <FormLabel>{t.EVENT_NFT_LIMIT}</FormLabel>

                <Controller
                  control={control}
                  name="mintLimit"
                  rules={{
                    required: "Mint limit is required",
                    min: { value: 1, message: "Mint limit is at least 1" },
                    max: {
                      value: 1000000,
                      message: "Mint limit is at most 1000000",
                    },
                  }}
                  render={({
                    field: { onChange, value },
                    formState: { errors },
                  }) => (
                    <>
                      <Input type="number" onChange={onChange} value={value} />
                      <ErrorMessage>{errors.description?.message}</ErrorMessage>
                    </>
                  )}
                />
              </FormControl>

              <FormControl mb={5}>
                <FormLabel>{t.EVENT_USE_MTX}</FormLabel>

                <Controller
                  control={control}
                  name="useMtx"
                  render={({
                    field: { onChange, value },
                    formState: { errors },
                  }) => (
                    <>
                      <Switch isChecked={value} onChange={onChange} />
                      <ErrorMessage>{errors.description?.message}</ErrorMessage>
                    </>
                  )}
                />
              </FormControl>

              <FormControl mb={5}>
                <FormLabel htmlFor="secret">
                  {t.EVENT_SECRETPHRASE}
                  <br />
                  <Box as="span" fontSize="14px" color="red">
                    {t.EVENT_SECRETPHRASE_DESC}
                  </Box>
                </FormLabel>

                <Controller
                  control={control}
                  name="secretPhrase"
                  rules={{
                    required: "Secret phrase is required",
                    minLength: {
                      value: 4,
                      message: "Minimum length should be 4",
                    },
                  }}
                  render={({
                    field: { onChange, value },
                    formState: { errors },
                  }) => (
                    <>
                      <Input id="secret" onChange={onChange} value={value} />
                      <ErrorMessage>{errors.description?.message}</ErrorMessage>
                    </>
                  )}
                />
              </FormControl>

              <Box border="1px solid lightgrey" borderRadius={4} p={5} mt={10}>
                <Text fontSize="18px" fontWeight="bold" mb={5}>
                  イベントで配布するNFT
                </Text>
                <NFTAttributesForm
                  control={control}
                  nfts={watch("nfts")}
                  append={append}
                  remove={remove}
                />
              </Box>

              <Button
                mt={10}
                type="submit"
                isLoading={isSubmitting}
                backgroundColor="mint.bg"
                size="lg"
                width="full"
                disabled={isSubmitting || status}
              >
                {createLoading ? <Spinner /> : status ? "Success" : "Create"}
              </Button>
              {status && "Your Event Created!🎉"}
              {createError && (
                <Alert status="error" mt={2}>
                  <AlertIcon />
                  <AlertTitle>Error occurred</AlertTitle>
                  <AlertDescription>{createError.message}</AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <span>Please select event group first.</span>
          )}
        </form>
      ) : (
        <Link href="/event-groups/new">please create event group first</Link>
      )}
    </>
  );
};

export default CreateEventForm;
