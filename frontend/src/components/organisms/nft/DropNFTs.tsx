import { BigNumber } from "ethers";
import { FC } from "react";
import { Button, Textarea } from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { Event } from "types/Event";
import { useDropNFTs } from "src/hooks/useDropNFTs";
import { useAddress } from "@thirdweb-dev/react";

type Props = {
  event: Event.EventRecord;
  address: string;
};
type FormData = {
  addresses: string;
};

const DropNFTs: FC<Props> = ({ event, address }) => {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { addresses: "" },
  });
  const { dropNFTs, dropNFTsMTX, error, isLoading } = useDropNFTs(
    event,
    address
  );
  const submit = async (data: FormData) => {
    if (!data.addresses || isLoading) return;
    await dropNFTs(data.addresses.split("\n"));
  };
  return (
    <p>
      <label htmlFor="addressList">Drop NFTs</label>
      <Controller
        control={control}
        name="addresses"
        render={({ field }) => (
          <Textarea
            backgroundColor="white"
            maxW={300}
            value={field.value}
            onChange={field.onChange}
            placeholder="Please provide address list. One address per line."
          />
        )}
      />
      <Button
        ml={3}
        size="sm"
        backgroundColor="transparent"
        border="1px solid"
        borderColor="yellow.800"
        color="yellow.800"
        type="submit"
        isLoading={isLoading}
        disabled={isLoading}
      >
        Submit
      </Button>
    </p>
  );
};

export default DropNFTs;
