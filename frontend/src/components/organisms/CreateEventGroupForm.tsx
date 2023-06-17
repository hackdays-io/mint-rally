import { FC } from "react";
import { useForm } from "react-hook-form";
import { useCreateEventGroup } from "src/hooks/useEvent";

type Props = {
  address: string;
};

interface EventGroupFormData {
  groupName: string;
}

export const createEventGroupForm: FC<Props> = ({ address }) => {
  const {
    createEventGroup,
    createStatus,
    isCreating,
    createError,
    createdGroupId,
  } = useCreateEventGroup(address);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<EventGroupFormData>({ defaultValues: { groupName: "" } });

  return <form></form>;
};
