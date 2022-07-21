import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Container,
  Flex,
  FormErrorMessage,
  Heading,
  Link,
  SimpleGrid,
  Spinner,
  Textarea,
  theme,
} from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import { NextPage } from "next";
import { ChangeEvent, useEffect, useState } from "react";
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
  useCreateEventRecord,
  useOwnEventGroups,
} from "../../hooks/useEventManager";
import ErrorMessage from "../../components/atoms/form/ErrorMessage";

type FormData = {
  eventGroupId: string;
  eventName: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  secret: string;
};

const EventCreate: NextPage = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    mode: "all",
    defaultValues: {
      eventGroupId: "",
      eventName: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      secret: "",
    },
  });

  // check contract address
  const address = useAddress();
  const [noGroups, setNogroups] = useState(false);

  // state for loading event groups
  const { groups, loading } = useOwnEventGroups();
  const {
    status,
    errors: createError,
    loading: createLoading,
    createEventRecord,
  } = useCreateEventRecord();

  const onSubmit = (data: FormData) => {
    console.log("onSubmit:", data);
    const params: ICreateEventRecordParams = {
      groupId: data.eventGroupId,
      eventName: data.eventName,
      description: data.description,
      date: new Date(),
      startTime: data.startTime,
      endTime: data.endTime,
      secretPhrase: data.secret,
    };
    console.log("params:", params);
    try {
      createEventRecord(params);
    } catch (error: any) {
      alert(error);
    }
  };

  return (
    <>
      <Container maxW={800} paddingTop={6}>
        <Heading as="h1" mb={10}>
          Create a new event
        </Heading>
        {address && groups.length > 0 ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl mb={5}>
              <FormLabel htmlFor="eventGroupId">Event group</FormLabel>
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
                        <option value={item.groupId} key={item.groupId}>
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
                  <FormLabel htmlFor="name">Event Name</FormLabel>
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
                  <FormLabel htmlFor="description">Description</FormLabel>
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
                    <FormLabel htmlFor="date">Date</FormLabel>
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
                    <FormLabel htmlFor="startTime">Start time</FormLabel>
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
                    <FormLabel htmlFor="endTime">End time</FormLabel>
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
                  <FormLabel htmlFor="secret">
                    Secret phrase to mint
                    <br />
                    <Box as="span" fontSize="14px" color="red">
                      Please do not forget this phrase. you can&apos;t get this
                      phrase after submitting
                    </Box>
                  </FormLabel>

                  <Controller
                    control={control}
                    name="secret"
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
