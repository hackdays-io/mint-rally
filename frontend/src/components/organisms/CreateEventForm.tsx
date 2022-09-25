import { FC, useEffect, useRef, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Radio,
  RadioGroup,
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
import { useIpfs } from "src/hooks/useIpfs";

interface EventFormData {
  eventGroupId: string;
  eventName: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  secretPhrase: string;
  mintLimit: number;
  useMtx: "true" | "false";
  nfts: INFTImage[];
}

const CreateEventForm: FC = () => {
  const { t } = useLocale();
  const { loading, errors, nftAttributes, saveNFTMetadataOnIPFS } = useIpfs();
  const [formData, setFormData] = useState<EventFormData | null>(null);
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
      useMtx: undefined,
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
      console.log("has group", groupNFTAttributes);
      const baseNFTAttributes: INFTImage[] = JSON.parse(groupNFTAttributes);
      console.log(baseNFTAttributes);
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

  const onSubmit = async (data: EventFormData) => {
    setFormData(data);
    console.log(formData);
    saveNFTMetadataOnIPFS(data.eventGroupId, data.eventName, data.nfts);
  };

  useEffect(() => {
    console.log("nftAttributes", nftAttributes);
    if (nftAttributes.length > 0 && formData) {
      console.log("ok", formData);
      const params: ICreateEventRecordParams = {
        groupId: formData.eventGroupId,
        eventName: formData.eventName,
        description: formData.description,
        date: new Date(formData.date),
        startTime: formData.startTime,
        endTime: formData.endTime,
        secretPhrase: formData.secretPhrase,
        mintLimit: Number(formData.mintLimit),
        useMtx: formData.useMtx === "true",
        attributes: nftAttributes,
      };
      try {
        console.log(params);
        createEventRecord(params);
      } catch (error: any) {
        alert(error);
      }
    }
  }, [nftAttributes]);

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
                        <ErrorMessage>{errors.startTime?.message}</ErrorMessage>
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
