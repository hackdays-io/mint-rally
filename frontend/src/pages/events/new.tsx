import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Container,
  Flex,
  FormErrorMessage,
  Heading,
  Link,
  SimpleGrid,
  Spinner,
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
  const { groups, loading, getOwnEventGroups } = useOwnEventGroups();
  const {
    status,
    errors: createError,
    loading: createLoading,
    createEventRecord,
  } = useCreateEventRecord();
  // state for checking any group id is selected.
  const [groupIdSelcted, setGroupIdSelected] = useState(false);

  useEffect(() => {
    if (address) {
      getOwnEventGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  useEffect(() => {
    if (watch("eventGroupId")) {
      console.log("selected");
      setGroupIdSelected(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("eventGroupId")]);

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
        <Heading>Create a new event</Heading>
        {address && groups.length > 0 ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl>
              <FormLabel htmlFor="eventGroupId">Event group: </FormLabel>
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

            {groupIdSelcted ? (
              <>
                <FormControl>
                  <FormLabel htmlFor="name">Event Name</FormLabel>
                  <Controller
                    control={control}
                    name="eventName"
                    rules={{
                      required: "This is required",
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
                        <Input id="name" onChange={onChange} value={value} />
                        <FormErrorMessage>
                          {errors.eventName?.message}
                        </FormErrorMessage>
                      </>
                    )}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <Controller
                    control={control}
                    name="description"
                    rules={{
                      required: "This is required",
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
                        <Input
                          id="description"
                          onChange={onChange}
                          value={value}
                        />
                        <FormErrorMessage>
                          {errors.description?.message}
                        </FormErrorMessage>
                      </>
                    )}
                  />
                </FormControl>
                <Flex>
                  <FormControl>
                    <FormLabel htmlFor="date">Date: </FormLabel>
                    <Controller
                      control={control}
                      name="date"
                      rules={{
                        required: "This is required",
                      }}
                      render={({
                        field: { onChange, value },
                        formState: { errors },
                      }) => (
                        <>
                          <Input id="date" onChange={onChange} value={value} />
                          <FormErrorMessage>
                            {errors.date?.message}
                          </FormErrorMessage>
                        </>
                      )}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="startTime">
                      Start time(HH:MM):{" "}
                    </FormLabel>
                    <Controller
                      control={control}
                      name="startTime"
                      rules={{
                        required: "This is required",
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
                          />
                          <FormErrorMessage>
                            {errors.date?.message}
                          </FormErrorMessage>
                        </>
                      )}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="endTime">End time(HH:MM): </FormLabel>
                    <Controller
                      control={control}
                      name="endTime"
                      rules={{
                        required: "This is required",
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
                          />
                          <FormErrorMessage>
                            {errors.date?.message}
                          </FormErrorMessage>
                        </>
                      )}
                    />
                  </FormControl>
                </Flex>
                <FormControl>
                  <FormLabel htmlFor="secret">Secret phrase to mint</FormLabel>
                  <span>
                    Please do not forget this phrase. you can't get this phrase
                    after submitting
                  </span>
                  <Controller
                    control={control}
                    name="secret"
                    rules={{
                      required: "This is required",
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
                        <FormErrorMessage>
                          {errors.description?.message}
                        </FormErrorMessage>
                      </>
                    )}
                  />
                </FormControl>
                <Button
                  mt={4}
                  type="submit"
                  //disabled={!errors?.name}
                  isLoading={isSubmitting}
                >
                  Create
                </Button>
                {createError && (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertTitle>Error occurred</AlertTitle>
                    <AlertDescription>{createError.message}</AlertDescription>
                  </Alert>
                )}
                {status && <Flex>Success</Flex>}
                {createLoading && <Spinner></Spinner>}
              </>
            ) : (
              <span>no event group is selected</span>
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
