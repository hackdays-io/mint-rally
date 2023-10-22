import { Box, Button, Heading, useDisclosure } from "@chakra-ui/react";
import { FC } from "react";
import ModalBase from "src/components/molecules/common/ModalBase";
import { useLocale } from "src/hooks/useLocale";
import GrantRole from "../molecules/GrantRole";

type EditCollaboratorsProps = {
  groupId: number;
};

const EditCollaborators: FC<EditCollaboratorsProps> = ({ groupId }) => {
  const { t } = useLocale();
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Button
        mb={6}
        size="sm"
        onClick={onOpen}
        background="mint.primary"
        color="white"
      >
        {t.RBAC_EDIT_COLLABORATORS}
      </Button>

      <ModalBase isOpen={isOpen} onClose={onClose}>
        <Box my={3}>
          <Heading as="h3" fontSize="lg" mb={2}>
            {t.RBAC_EDIT_COLLABORATORS}
          </Heading>
          <GrantRole groupId={groupId} />
        </Box>
      </ModalBase>
    </>
  );
};

export default EditCollaborators;
