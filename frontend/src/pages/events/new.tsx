import { Heading, List, ListItem, Switch } from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import { NextPage } from "next";
import { ChangeEvent, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Select,
  Input,
  Button,
} from "@chakra-ui/react";
import {
  getEventManagerContract,
  IEventGroup,
} from "../../helpers/eventManager";

const EventCreate: NextPage = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "all",
  });
  const [groupIdSelcted, setGroupIdSelected] = useState(false);
  const address = useAddress();
  const [groups, setGroups] = useState([]);
  const getOwnEventGroups = async () => {
    console.log("get my event groups");
    const eventManager = getEventManagerContract();
    console.log(eventManager);
    if (!eventManager) throw "error";
    const data = await eventManager.getOwnGroups();
    console.log(data);
    setGroups(data);
  };
  useEffect(() => {
    if (address) {
      getOwnEventGroups();
    }
  }, [address]);
  const onSubmit = (data: any) => console.log("onSubmit:", data);
  const selectGroup = (e: ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      setGroupIdSelected(true);
    }
  };
  return (
    <>
      <Heading>Create a new event</Heading>
      {address ? (
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
              </FormControl>
              <Button
                type="submit"
                //disabled={!errors?.name}
                isLoading={isSubmitting}
              >
                Create
              </Button>{" "}
            </>
          ) : (
            <span>please select event group</span>
          )}
        </form>
      ) : (
        <span>please login first</span>
      )}
    </>
  );
};

export default EventCreate;
