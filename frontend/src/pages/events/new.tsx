import { Heading, Link } from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import { NextPage } from "next";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
  // check contract address
  const address = useAddress();
  const [noGroups, setNogroups] = useState(false);
  // state for loading event groups
  const [groups, setGroups] = useState([]);
  // state for checking any group id is selected.
  const [groupIdSelcted, setGroupIdSelected] = useState(false);
  // function for get login user's groups
  const getOwnEventGroups = async () => {
    console.log("get my event groups");
    const eventManager = getEventManagerContract();
    if (!eventManager) throw "error: contract can't found";
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
              </FormControl>
              <Button
                type="submit"
                //disabled={!errors?.name}
                isLoading={isSubmitting}
              >
                Create
              </Button>
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
