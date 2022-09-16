import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Container,
  Flex,
  Heading,
  Link,
  Spinner,
  Switch,
  Textarea,
} from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import { NextPage } from "next";
import { Controller, useForm } from "react-hook-form";
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
import { Web3Storage } from "web3.storage";
import { useLocale } from "../../hooks/useLocale";

type FormData = {
  eventGroupId: string;
  eventName: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  secretPhrase: string;
  mintLimit: number;
  useMtx: boolean;
};

const EventCreate: NextPage = () => {
  const { t } = useLocale();

  const ipfsClient = new Web3Storage({
    token: String(process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY),
    endpoint: new URL("https://api.web3.storage"),
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = useForm<FormData>({
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
    },
  });

  // check contract address
  const address = useAddress();

  // state for loading event groups
  const { groups } = useOwnEventGroups();
  const {
    status,
    errors: createError,
    loading: createLoading,
    createEventRecord,
  } = useCreateEventRecord();

  const saveNFTMetadataOnIPFS = async (groupId: string, eventName: string) => {
    const baseNFTAttributes: INFTImage[] = JSON.parse(
      String(window.localStorage.getItem(`group${groupId}`))
    );
    const metadataFiles: File[] = [];
    for (const baseAttribute of baseNFTAttributes) {
      const attribute: INFTAttribute = {
        name: eventName,
        image: baseAttribute.image,
        description: baseAttribute.description,
        external_link: "https://mintrally.xyz",
        traits: {
          eventGroupId: groupId,
        },
      };
      metadataFiles.push(
        new File(
          [JSON.stringify(attribute)],
          `${baseAttribute.requiredParticipateCount}.json`,
          { type: "text/json" }
        )
      );
    }
    const rootCid = await ipfsClient.put(metadataFiles, {
      name: `${groupId}_${eventName}`,
      maxRetries: 3,
      wrapWithDirectory: true,
    });
    return baseNFTAttributes.map((attribute) => {
      return {
        requiredParticipateCount: attribute.requiredParticipateCount,
        metaDataURL: `ipfs://${rootCid}/${attribute.requiredParticipateCount}.json`,
      };
    });
  };

  const onSubmit = async (data: FormData) => {
    const nftAttributes = await saveNFTMetadataOnIPFS(
      data.eventGroupId,
      data.eventName
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
      <Container maxW={800} py={6}>
        <Heading as="h1" mb={10}>
          {t.CREATE_NEW_EVENT}
        </Heading>
        {address && groups.length > 0 ? (
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
                        <ErrorMessage>
                          {errors.description?.message}
                        </ErrorMessage>
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
                        <Input
                          type="number"
                          onChange={onChange}
                          value={value}
                        />
                        <ErrorMessage>
                          {errors.description?.message}
                        </ErrorMessage>
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
                        <ErrorMessage>
                          {errors.description?.message}
                        </ErrorMessage>
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
                        <ErrorMessage>
                          {errors.description?.message}
                        </ErrorMessage>
                      </>
                    )}
                  />
                </FormControl>
                <Button
                  mt={4}
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
          <>
            {address ? (
              <Link href="/event-groups/new">
                please create event group first
              </Link>
            ) : (
              <span>please sign in first</span>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default EventCreate;
