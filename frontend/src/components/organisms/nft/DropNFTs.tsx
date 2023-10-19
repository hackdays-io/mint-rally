import { FC } from "react";
import { Button, FormLabel, Textarea, Text } from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { Event } from "types/Event";
import { useDropNFTs } from "src/hooks/useDropNFTs";
import { useLocale } from "src/hooks/useLocale";

type Props = {
  event: Event.EventRecord;
  address: string;
};
type FormData = {
  addresses: string;
};

const DropNFTs: FC<Props> = ({ event, address }) => {
  const { t } = useLocale();
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { addresses: "" },
  });
  const { dropNFTs, dropNFTsMTX, error, isLoading } = useDropNFTs(
    event,
    address
  );
  const submit = async (data: FormData) => {
    console.log(data);
    if (!data.addresses || isLoading) return;
    if (data.addresses.split("\n").length > 100) {
      alert(t.YOU_CAN_DROP_UP_TO_100_NFTS_AT_ONCE);
      return;
    }
    await dropNFTs(data.addresses.split("\n"));
  };
  return (
    <p>
      <form onSubmit={handleSubmit(submit)}>
        <FormLabel fontWeight="bold" htmlFor="addressList">
          {t.DROP_NFTS}
        </FormLabel>
        <Text>{t.PLEASE_ENTER_WALLET_ADDRESSES}</Text>
        <Controller
          control={control}
          name="addresses"
          render={({ field }) => (
            <Textarea
              backgroundColor="white"
              maxW={500}
              value={field.value}
              onChange={field.onChange}
              placeholder="0xD238C2bCeB99BBac56647b852A..."
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
      </form>
    </p>
  );
};

export default DropNFTs;
