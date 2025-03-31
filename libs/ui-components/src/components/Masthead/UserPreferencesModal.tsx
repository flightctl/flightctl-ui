import * as React from 'react';
import { TFunction } from 'i18next';
import {
  Button,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Modal,
  Select,
  SelectOption,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { Theme } from '../../hooks/useThemePreferences';
import { useTranslation } from '../../hooks/useTranslation';
import FlightCtlActionGroup from '../form/FlightCtlActionGroup';
import FlightCtlForm from '../form/FlightCtlForm';
import { UserPreferencesContext } from './UserPreferencesProvider';

const getThemeLabels = (t: TFunction): { [key in Theme]: string } => ({
  system: t('System default'),
  light: t('Light'),
  dark: t('Dark'),
});

type UserPreferencesModalProps = {
  onClose: VoidFunction;
};

const UserPreferencesModal: React.FC<UserPreferencesModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { theme, setTheme } = React.useContext(UserPreferencesContext);

  const themeLabels = getThemeLabels(t);

  const [themeExpanded, setThemeExpanded] = React.useState(false);
  return (
    <Modal title={t('User preferences')} isOpen variant="small" onClose={onClose}>
      <Stack hasGutter>
        <StackItem>
          <FlightCtlForm>
            <FormGroup label={t('Theme')}>
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
          </FlightCtlForm>
        </StackItem>
        <StackItem>
          <FlightCtlActionGroup>
            <Button variant="secondary" onClick={onClose}>
              {t('Close')}
            </Button>
          </FlightCtlActionGroup>
        </StackItem>
      </Stack>
    </Modal>
  );
};

export default UserPreferencesModal;
