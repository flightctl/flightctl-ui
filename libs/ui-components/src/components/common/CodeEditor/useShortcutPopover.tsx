import React from 'react';
import { PopoverProps } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import Shortcut from './Shortcut';

export const useShortcutPopover = (onHideShortcuts?: VoidFunction): PopoverProps => {
  const { t } = useTranslation();

  return React.useMemo(
    () => ({
      'aria-label': t('View shortcuts'),
      bodyContent: (
        <table>
          <tbody>
            <Shortcut keyName="F1">{t('View all editor shortcuts')}</Shortcut>
            <Shortcut ctrl keyName="space">
              {t('Activate auto complete')}
            </Shortcut>
            <Shortcut ctrl shift keyName="m">
              {t('Toggle Tab action between insert Tab character and move focus out of editor')}
            </Shortcut>
            <Shortcut ctrlCmd shift keyName="o">
              {t('View document outline')}
            </Shortcut>
            <Shortcut hover>{t('View property descriptions')}</Shortcut>
            <Shortcut ctrlCmd keyName="s">
              {t('Save')}
            </Shortcut>
          </tbody>
        </table>
      ),
      maxWidth: '25rem',
      distance: 18,
      onHide: onHideShortcuts,
    }),
    [t, onHideShortcuts],
  );
};
