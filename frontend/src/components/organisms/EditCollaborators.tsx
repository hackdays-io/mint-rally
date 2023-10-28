import {
  Button,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from "@chakra-ui/react";
import { FC } from "react";
import ModalBase from "src/components/molecules/common/ModalBase";
import GrantRole from "src/components/molecules/GrantRole";
import { useLocale } from "src/hooks/useLocale";

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
        <Tabs>
          <TabList>
            <Tab>{t.RBAC_GRANT}</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <GrantRole groupId={groupId} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </ModalBase>
    </>
  );
};

export default EditCollaborators;
