import { useRouter } from "next/router";

const Event = () => {
  const router = useRouter();
  const { eventid } = router.query;

  return <p>Event: {eventid}</p>;
};

export default Event;
