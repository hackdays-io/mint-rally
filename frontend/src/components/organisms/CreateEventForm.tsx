import { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Grid,
  Radio,
  RadioGroup,
  Spinner,
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
import ErrorMessage from "../../components/atoms/form/ErrorMessage";
import AlertMessage from "../../components/atoms/form/AlertMessage";
import { useLocale } from "../../hooks/useLocale";
import Link from "next/link";
import NFTAttributesForm from "./NFTAttributesForm";
import { useIpfs } from "src/hooks/useIpfs";
import {
  useCalcMtxGasFee,
  useCreateEvent,
  useCollaboratorAccessEventGroups,
  useEventsByGroupId,
  useParseEventDate,
} from "src/hooks/useEvent";
import { Event } from "types/Event";
import { NFT } from "types/NFT";
import { formatEther } from "ethers/lib/utils";
import { useRouter } from "next/router";
import { useCopyPastAttribute } from "src/hooks/useMintNFT";
import AboutNFTMetadata from "../molecules/nft/AboutNFTMetadata";

type Props = {
  address: string;
};

export interface EventFormData {
  eventGroupId: string;
  eventName: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  secretPhrase: string;
  mintLimit: number;
  useMtx: "true" | "false";
  nfts: NFT.NFTImage[];
}

const CreateEventForm: FC<Props> = ({ address }) => {
  const { t } = useLocale();
  const { parse } = useParseEventDate();
  const {
    loading: isUploadingMetadata,
    errors,
    nftAttributes,
    saveNFTMetadataOnIPFS,
  } = useIpfs();
  const [formData, setFormData] = useState<EventFormData | null>(null);
  const [copiedPastEventId, setCopiedPastEventId] = useState<number | null>(
    null
  );
  const [processingCopy, setProcessingCopy] = useState(false);
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    register,
    setValue,
  } = useForm<EventFormData>({
    mode: "all",
    defaultValues: {
      eventGroupId: "",
      eventName: "",
      description: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      secretPhrase: "",
      mintLimit: 10,
      useMtx: undefined,
      nfts: [
        {
          name: "",
          requiredParticipateCount: 0,
          description: "",
          image: "",
          animation_url: "",
        },
      ],
    },
  });

  const { remove, append } = useFieldArray({ control, name: "nfts" });

  const { gasFee } = useCalcMtxGasFee(watch("mintLimit"));

  // state for loading event groups
  const { groups, isLoading: isLoadingEventGroups } =
    useCollaboratorAccessEventGroups();
  const {
    events,
    isLoading: eventLoading,
    getEventsByGroupId,
  } = useEventsByGroupId();
  const { createEvent, isCreating, createError, createStatus, createdEventId } =
    useCreateEvent(address);

  const { copyPastAttribute } = useCopyPastAttribute();

  const onSubmit = async (data: EventFormData) => {
    setFormData(data);
    saveNFTMetadataOnIPFS(data.eventGroupId, data.eventName, data.nfts);
  };

  useEffect(() => {
    const create = async () => {
      if (nftAttributes.length > 0 && formData) {
        const params = {
          groupId: formData.eventGroupId,
          eventName: formData.eventName,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          secretPhrase: formData.secretPhrase,
          mintLimit: Number(formData.mintLimit),
          useMtx: formData.useMtx === "true",
          attributes: nftAttributes,
        };
        await createEvent(params);
      }
    };
    create();
  }, [nftAttributes]);

  useEffect(() => {
    if (router.isReady && groups) {
      const groupId = router.query.group_id;
      if (typeof groupId === "string") {
        const eventGroupId = groupId;
        if (eventGroupId) {
          // select eventGroupId
          setValue("eventGroupId", eventGroupId);
        }
      }
    }
  }, [router.query.group_id, groups]);

  useEffect(() => {
    getEventsByGroupId(Number(watch("eventGroupId")));
    setCopiedPastEventId(null);
  }, [watch("eventGroupId")]);

  const errorMessage = useMemo(() => {
    if (createError || errors) {
      return (createError || errors) as any;
    }
  }, [createError, errors]);

  const isLoading = useMemo(() => {
    if (isCreating || isUploadingMetadata) return true;
  }, [isCreating, isUploadingMetadata]);

  const onGroupChange = useCallback(
    (e: any) => {
      const groupId = e.target.value;
      setValue("eventGroupId", groupId);
    },
    [setValue]
  );

  const handleCopyPastEvent = async () => {
    try {
      setProcessingCopy(true);
      const foundEvent = events?.find(
        (event: Event.EventRecord) =>
          event.eventRecordId.toNumber() === copiedPastEventId
      );
      if (foundEvent && copiedPastEventId) {
        const pastAttributeRecords = await copyPastAttribute(copiedPastEventId);
        console.log(pastAttributeRecords);

        setValue("eventName", foundEvent.name);
        setValue("description", foundEvent.description);
        const [startDateTime, endDateTime] = foundEvent.date.split("/");

        const formatDateTime = (dateTime: string) => {
          const localDateTime = new Date(dateTime);
          const [date, time] = localDateTime.toLocaleString().split(" ");
          const formattedDate = date.split("/").join("-");
          const finalFormattedDate = `${formattedDate.split("-")[0]}-${parseInt(
            formattedDate.split("-")[1]
          )
            .toString()
            .padStart(2, "0")}-${parseInt(formattedDate.split("-")[2])
            .toString()
            .padStart(2, "0")}`;
          return { finalFormattedDate, time };
        };

        const { finalFormattedDate: startDate, time: startTime } =
          formatDateTime(startDateTime);
        const { finalFormattedDate: endDate, time: endTime } =
          formatDateTime(endDateTime);

        setValue("startDate", startDate);
        setValue("startTime", startTime);
        setValue("endDate", endDate);
        setValue("endTime", endTime);
        setValue("nfts", pastAttributeRecords);
      }
    } catch (error) {
      console.log(error);
    }
    setProcessingCopy(false);
  };

  const onStartDateChange = useCallback(
    (e: any) => {
      const startDate = e.target.value;
      setValue("startDate", startDate);
      setValue("endDate", startDate);
    },
    [setValue]
  );

  const validateEventDate = () => {
    const startDate = watch("startDate");
    const startTime = watch("startTime");
    const endDate = watch("endDate");
    const endTime = watch("endTime");

    if (startDate && startTime && endDate && endTime) {
      const startDateTime = new Date(`${startDate} ${startTime}`);
      const endDateTime = new Date(`${endDate} ${endTime}`);
      if (startDateTime > endDateTime) {
        return "End date should be after start date";
      }
    }
    return true;
  };

  return (
    <>
      {isLoadingEventGroups || typeof groups == "undefined" ? (
        <Spinner />
      ) : groups?.length === 0 ? (
        <Link href="/event-groups/new">please create event group first</Link>
      ) : createdEventId ? (
        <Box>
          <Text>{t.YOUR_EVENT_WAS_CREATED}</Text>

          <Link href={`/events/${createdEventId}`}>
            <Button mt={10} backgroundColor="mint.bg" size="md">
              {t.GOTO_EVENT_PAGE}
            </Button>
          </Link>
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl mb={5}>
            <FormLabel htmlFor="eventGroupId">{t.EVENT_GROUP}</FormLabel>
            <Controller
              control={control}
              {...register("eventGroupId")}
              name="eventGroupId"
              render={({ field: { value } }) => (
                <Select
                  id="eventGroupId"
                  placeholder="Please select event group"
                  value={value}
                  onChange={onGroupChange}
                >
                  {groups.map((item: Event.EventGroup) => {
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
              {events?.length !== 0 && (
                <Box
                  backgroundColor="blue.50"
                  p={{ base: 5, md: 10 }}
                  borderRadius={5}
                  mb={10}
                >
                  <FormControl>
                    <FormLabel htmlFor="pastEventIds">
                      {t.SELECT_PAST_EVENT_TO_COPY}
                    </FormLabel>

                    <Grid
                      gridTemplateColumns={{ base: "1fr", md: "1fr auto" }}
                      gap={{ base: 2, md: 5 }}
                    >
                      <Select
                        placeholder="Select Event"
                        onChange={(e) =>
                          setCopiedPastEventId(Number(e.target.value))
                        }
                        backgroundColor="white"
                      >
                        {events?.map((event: Event.EventRecord) => (
                          <option
                            value={Number(event.eventRecordId)}
                            key={`eventSelector_${event.eventRecordId}_${event.name}`}
                          >
                            {event.name}（{parse(event.date || "")}）
                          </option>
                        ))}
                      </Select>
                      <Button
                        onClick={handleCopyPastEvent}
                        colorScheme="mintGreen"
                        isLoading={processingCopy}
                        disabled={processingCopy}
                      >
                        {t.COPY}
                      </Button>
                    </Grid>

                    <Text fontSize="xs" mt={2} color="red">
                      *{t.SELECT_PAST_EVENT_TO_COPY_NOTICES}
                    </Text>
                  </FormControl>
                </Box>
              )}
              <Box>
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
                <Flex mb={5} gap={5} flexWrap="wrap">
                  <FormControl width={{ base: "100%", md: "30%" }}>
                    <FormLabel htmlFor="startDate">
                      {t.EVENT_START_DATE}
                    </FormLabel>
                    <Controller
                      control={control}
                      name="startDate"
                      rules={{
                        required: "Date is required",
                      }}
                      render={({ field: { value }, formState: { errors } }) => (
                        <>
                          <Input
                            id="startDate"
                            onChange={onStartDateChange}
                            value={value}
                            type="date"
                          />
                          <ErrorMessage>
                            {errors.startDate?.message}
                          </ErrorMessage>
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
                          <ErrorMessage>
                            {errors.startTime?.message}
                          </ErrorMessage>
                        </>
                      )}
                    />
                  </FormControl>
                </Flex>
                <Flex mb={5} gap={5} flexWrap="wrap">
                  <FormControl width={{ base: "100%", md: "30%" }}>
                    <FormLabel htmlFor="endDate">{t.EVENT_END_DATE}</FormLabel>
                    <Controller
                      control={control}
                      name="endDate"
                      rules={{
                        required: "Date is required",
                        validate: validateEventDate,
                      }}
                      render={({
                        field: { onChange, value },
                        formState: { errors },
                      }) => (
                        <>
                          <Input
                            id="endDate"
                            onChange={onChange}
                            value={value}
                            type="date"
                          />
                          <ErrorMessage>{errors.endDate?.message}</ErrorMessage>
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
                          <ErrorMessage>{errors.endTime?.message}</ErrorMessage>
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
                        <ErrorMessage>{errors.mintLimit?.message}</ErrorMessage>
                      </>
                    )}
                  />
                </FormControl>

                <FormControl mb={5}>
                  <FormLabel>{t.EVENT_USE_MTX}</FormLabel>

                  <Controller
                    control={control}
                    name="useMtx"
                    rules={{
                      required: "required",
                    }}
                    render={({
                      field: { onChange, value },
                      formState: { errors },
                    }) => (
                      <>
                        <RadioGroup onChange={onChange}>
                          <Radio value="false" mr={6}>
                            {t.EVENT_USE_MTX_FALSE}
                          </Radio>
                          <Radio value="true">{t.EVENT_USE_MTX_TRUE}</Radio>
                        </RadioGroup>
                        <ErrorMessage>{errors.useMtx?.message}</ErrorMessage>
                      </>
                    )}
                  />
                  {watch("useMtx") === "true" && (
                    <Text mt={2} fontSize="sm">
                      {t.EVENT_ESTIMATED_GAS_MTX}
                      <br />
                      <Box as="span" fontWeight="bold" fontSize="md" pr={1}>
                        {formatEther(gasFee || 0)}
                      </Box>
                      MATIC
                    </Text>
                  )}
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
                          {errors.secretPhrase?.message}
                        </ErrorMessage>
                      </>
                    )}
                  />
                </FormControl>

                <Box
                  border="1px solid lightgrey"
                  borderRadius={4}
                  p={5}
                  mt={10}
                >
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={5}
                  >
                    <Text fontSize="18px" fontWeight="bold">
                      {t.EVENT_DISTRIBUTED_NFT}
                    </Text>

                    <AboutNFTMetadata />
                  </Flex>
                  <NFTAttributesForm
                    control={control}
                    nfts={watch("nfts")}
                    append={append}
                    remove={remove}
                    setValue={setValue}
                  />
                </Box>

                <Button
                  mt={10}
                  type="submit"
                  isLoading={isLoading || isSubmitting}
                  backgroundColor="mint.bg"
                  size="lg"
                  width="full"
                  disabled={isLoading || isSubmitting}
                >
                  {t.CREATE_NEW_EVENT}
                </Button>
              </Box>

              {errorMessage && (
                <AlertMessage title={t.ERROR_CREATING_EVENT}>
                  {errorMessage?.reason || errorMessage?.message}
                </AlertMessage>
              )}
            </>
          ) : (
            <span>Please select event group first.</span>
          )}
        </form>
      )}
    </>
  );
};

export default CreateEventForm;
