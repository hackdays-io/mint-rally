import { useRouter } from "next/router";

const EventGroup = () => {
  const router = useRouter();
  const { eventgroupid } = router.query;

  return <p>Event Group: {eventgroupid}</p>;
};

export default EventGroup;
