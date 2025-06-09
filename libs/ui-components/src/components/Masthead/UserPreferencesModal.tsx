import * as React from 'react';
import { TFunction } from 'i18next';
import { Button, FormGroup, MenuToggle, MenuToggleElement, Select, SelectOption } from '@patternfly/react-core';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core/next';

import { Theme } from '../../hooks/useThemePreferences';
import { useTranslation } from '../../hooks/useTranslation';
import { UserPreferencesContext } from './UserPreferencesProvider';
import FlightCtlForm from '../form/FlightCtlForm';

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
  const { userTheme, setUserTheme } = React.useContext(UserPreferencesContext);

  const themeLabels = getThemeLabels(t);

  const [themeExpanded, setThemeExpanded] = React.useState(false);
  return (
    <Modal isOpen variant="small" onClose={onClose}>
      <ModalHeader title={t('User preferences')} />
      <ModalBody>
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
                  {themeLabels[userTheme]}
                </MenuToggle>
              )}
              selected={userTheme}
              onSelect={(_, value) => {
                setUserTheme(value as Theme);
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
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UserPreferencesModal;
