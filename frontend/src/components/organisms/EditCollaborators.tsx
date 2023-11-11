import {
  Button,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from "@chakra-ui/react";
import { FC, useState } from "react";
import ModalBase from "src/components/molecules/common/ModalBase";
import GrantRole from "src/components/molecules/GrantRole";
import Collaborators from "src/components/molecules/Collaborators";
import { useLocale } from "src/hooks/useLocale";

type EditCollaboratorsProps = {
  groupId: number;
};

const EditCollaborators: FC<EditCollaboratorsProps> = ({ groupId }) => {
  const { t } = useLocale();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [tabIndex, setTabIndex] = useState(0);

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
        <Tabs index={tabIndex} onChange={(index) => setTabIndex(index)}>
          <TabList>
            <Tab>{t.RBAC_GRANT}</Tab>
            <Tab>{t.RBAC_LIST}</Tab>
          </TabList>

          <TabPanels>
            <TabPanel key={`tab-panel-0-${tabIndex}`}>
              <GrantRole groupId={groupId} />
            </TabPanel>
            <TabPanel key={`tab-panel-1-${tabIndex}`}>
              <Collaborators groupId={groupId} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </ModalBase>
    </>
  );
};

export default EditCollaborators;
