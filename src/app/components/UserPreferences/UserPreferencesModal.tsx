import {
  Button,
  Form,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Modal,
  Select,
  SelectOption,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import * as React from 'react';
import { UserPreferencesContext } from './UserPreferencesProvider';
import { Theme } from '@app/hooks/useThemePreferences';
import FlightCtlActionGroup from '@app/components/form/FlightCtlActionGroup';

const themeLabels: { [key in Theme]: string } = {
  system: 'System default',
  light: 'Light',
  dark: 'Dark',
};

type UserPreferencesModalProps = {
  onClose: VoidFunction;
};

const UserPreferencesModal: React.FC<UserPreferencesModalProps> = ({ onClose }) => {
  const { theme, setTheme } = React.useContext(UserPreferencesContext);

  const [themeExpanded, setThemeExpanded] = React.useState(false);
  return (
    <Modal title="User preferences" isOpen variant="small" onClose={onClose}>
      <Stack hasGutter>
        <StackItem>
          <Form>
            <FormGroup label="Theme">
              <Select
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    style={{ width: '100%' }}
                    onClick={() => setThemeExpanded(true)}
                    isExpanded={themeExpanded}
                  >
                    {themeLabels[theme]}
                  </MenuToggle>
                )}
                selected={theme}
                onSelect={(_, value) => {
                  setTheme(value as Theme);
                  setThemeExpanded(false);
                }}
                aria-label="theme"
                isOpen={themeExpanded}
                onOpenChange={setThemeExpanded}
              >
                {Object.keys(themeLabels).map((theme) => (
                  <SelectOption key={theme} value={theme}>
                    {themeLabels[theme]}
                  </SelectOption>
                ))}
              </Select>
            </FormGroup>
          </Form>
        </StackItem>
        <StackItem>
          <FlightCtlActionGroup>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </FlightCtlActionGroup>
        </StackItem>
      </Stack>
    </Modal>
  );
};

export default UserPreferencesModal;
