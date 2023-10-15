import { FC, useState } from "react";
import { Button, FormLabel, Textarea } from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { Event } from "types/Event";
import { useDropNFTs } from "src/hooks/useDropNFTs";
import { useLocale } from "src/hooks/useLocale";
import AlertMessage from "src/components/atoms/form/AlertMessage";

type Props = {
  event: Event.EventRecord;
  address: string;
};
type FormData = {
  addresses: string;
};

const DropNFTs: FC<Props> = ({ event, address }) => {
  const { t } = useLocale();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
    setIsSuccess(false);
    setErrorMessage("");
    try {
      await dropNFTs(data.addresses.split("\n"));
      setIsSuccess(true);
    } catch (e: any) {
      setErrorMessage(e.message);
    }
  };
  return (
    <p>
      <form onSubmit={handleSubmit(submit)}>
        <FormLabel htmlFor="addressList">{t.DROP_NFTs}</FormLabel>
        <Controller
          control={control}
          name="addresses"
          render={({ field }) => (
            <Textarea
              backgroundColor="white"
              maxW={500}
              value={field.value}
              onChange={field.onChange}
              placeholder={t.PLEASE_PROVIDE_ADDRESS_LIST_TO_DROP_NFT}
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
          {t.SUBMIT_DROP_NFTs}
        </Button>
      </form>
      {isSuccess && (
        <AlertMessage status="success" title={t.DROP_NFTs_SUCCESS} />
      )}
      {errorMessage && <AlertMessage title={errorMessage} />}
    </p>
  );
};

export default DropNFTs;
