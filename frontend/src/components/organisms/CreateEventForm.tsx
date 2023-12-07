import { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
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
  useOwnEventGroups,
} from "src/hooks/useEvent";
import { Event } from "types/Event";
import { NFT } from "types/NFT";
import { formatEther } from "ethers/lib/utils";
import { useRouter } from "next/router";

type Props = {
  address: string;
};

interface EventFormData {
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
  isNtt: "true" | "false";
  nfts: NFT.NFTImage[];
}

const CreateEventForm: FC<Props> = ({ address }) => {
  const { t } = useLocale();
  const {
    loading: isUploadingMetadata,
    errors,
    nftAttributes,
    saveNFTMetadataOnIPFS,
  } = useIpfs();
  const [formData, setFormData] = useState<EventFormData | null>(null);
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
      isNtt: undefined,
      nfts: [
        { name: "", requiredParticipateCount: 0, description: "", image: "" },
      ],
    },
  });

  const { remove, append } = useFieldArray({ control, name: "nfts" });

  const { gasFee } = useCalcMtxGasFee(watch("mintLimit"));

  // state for loading event groups
  const { groups, isLoading: isLoadingEventGroups } = useOwnEventGroups();
  const { createEvent, isCreating, createError, createStatus, createdEventId } =
    useCreateEvent(address);

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
          isNtt: formData.isNtt === "false",
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

  const errorMessage = useMemo(() => {
    if (createError || errors) {
      return (createError || errors) as any;
    }
  }, [createError, errors]);

  const isLoading = useMemo(() => {
    if (isCreating || isUploadingMetadata) return true;
  }, [isCreating, isUploadingMetadata]);

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
          <Text>Your Event Created🎉</Text>

          <Link href={`/events/${createdEventId}`}>
            <Button mt={10} backgroundColor="mint.bg" size="md">
              Go to Event Page
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
              render={({ field: { onChange, value } }) => (
                <Select
                  id="eventGroupId"
                  placeholder="Please select event group"
                  value={value}
                  onChange={onChange}
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
                        <ErrorMessage>{errors.startDate?.message}</ErrorMessage>
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
                        <ErrorMessage>{errors.startTime?.message}</ErrorMessage>
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
                      <Input type="number" onChange={onChange} value={value} />
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
                <FormLabel>{t.EVENT_USE_NTT}</FormLabel>

                <Controller
                  control={control}
                  name="isNtt"
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
                          {t.EVENT_USE_NTT_FALSE}
                        </Radio>
                        <Radio value="true">{t.EVENT_USE_NTT_TRUE}</Radio>
                      </RadioGroup>
                      <ErrorMessage>{errors.isNtt?.message}</ErrorMessage>
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
                        {errors.secretPhrase?.message}
                      </ErrorMessage>
                    </>
                  )}
                />
              </FormControl>

              <Box border="1px solid lightgrey" borderRadius={4} p={5} mt={10}>
                <Text fontSize="18px" fontWeight="bold" mb={5}>
                  {t.EVENT_DISTRIBUTED_NFT}
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
                isLoading={isLoading || isSubmitting}
                backgroundColor="mint.bg"
                size="lg"
                width="full"
                disabled={isLoading || isSubmitting}
              >
                {t.CREATE_NEW_EVENT}
              </Button>

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
