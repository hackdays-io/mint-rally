import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Flex,
  FormErrorMessage,
  Heading,
  Link,
  Spinner,
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
};

const EventCreate: NextPage = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "all",
    defaultValues: {
      eventGroupdId: "",
      eventName: "",
      description: "",
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

  const onSubmit = (data: any) => {
    console.log("onSubmit:", data);
    const params: ICreateEventRecordParams = {
      groupId: data.eventGroupId,
      eventName: data.name,
      description: data.description,
      date: new Date(),
      startTime: "19:00",
      endTime: "21:00",
      secretPhrase: "test secret",
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
      <Heading>Create a new event</Heading>
      {address && groups.length > 0 ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl>
            <FormLabel htmlFor="eventGroupId">Event group: </FormLabel>
            <Controller
              control={control}
              name="eventGroupdId"
              render={({ field: { onChange } }) => (
                <Select
                  id="eventGroupId"
                  placeholder="Please select event group"
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
                  render={({ field: { onChange }, formState: { errors } }) => (
                    <>
                      <Input id="name" onChange={onChange} />
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
                  render={({ field: { onChange }, formState: { errors } }) => (
                    <>
                      <Input id="description" onChange={onChange} />
                      <FormErrorMessage>
                        {errors.description?.message}
                      </FormErrorMessage>
                    </>
                  )}
                />
              </FormControl>
              <Button
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
            <span>please login first</span>
          )}
        </>
      )}
    </>
  );
};

export default EventCreate;
