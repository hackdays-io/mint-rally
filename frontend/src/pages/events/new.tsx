import {
  Flex,
  FormErrorMessage,
  Heading,
  Link,
  Spinner,
} from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import { NextPage } from "next";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
} from "../../hooks/useEventManagerContract";

const EventCreate: NextPage = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "all",
  });
  // check contract address
  const address = useAddress();
  const [noGroups, setNogroups] = useState(false);
  // state for loading event groups
  const { groups, loading, getOwnEventGroups } = useOwnEventGroups();
  const {
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
  const selectGroup = (e: ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      setGroupIdSelected(true);
    }
  };
  return (
    <>
      <Heading>Create a new event</Heading>
      {address && groups.length > 0 ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl>
            <FormLabel htmlFor="eventGroupId">Event group: </FormLabel>
            <Select
              id="eventGroupId"
              placeholder="Please select event group"
              {...register("eventGroupId", {
                required: "This is required",
              })}
              onChange={selectGroup}
            >
              {groups.map((item: IEventGroup) => {
                return (
                  <option value={item.groupId} key={item.groupId}>
                    {item.name}
                  </option>
                );
              })}
            </Select>
          </FormControl>
          {groupIdSelcted ? (
            <>
              <FormControl>
                <FormLabel htmlFor="name">Event Name</FormLabel>
                <Input
                  id="name"
                  {...register("name", {
                    required: "This is required",
                    minLength: {
                      value: 4,
                      message: "Minimum length should be 4",
                    },
                  })}
                ></Input>
                {/* なぜかエラー
                <FormErrorMessage>{errors && errors.name && errors.name.message}</FormErrorMessage>
                */}
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="description">Description</FormLabel>
                <Input
                  id="description"
                  {...register("description", {
                    required: "This is required",
                    minLength: {
                      value: 4,
                      message: "Minimum length should be 4",
                    },
                  })}
                ></Input>
              </FormControl>
              <Button
                type="submit"
                //disabled={!errors?.name}
                isLoading={isSubmitting}
              >
                Create
              </Button>
              {createError && <Flex>{createError.message}</Flex>}
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
