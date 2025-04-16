import * as React from 'react';
import { MouseIcon } from '@patternfly/react-icons/dist/js/icons/mouse-icon';
import upperFirst from 'lodash/upperFirst';

import { useTranslation } from '../../../hooks/useTranslation';

import './Shortcut.css';

interface ShortcutProps {
  children: React.ReactNode;
  alt?: boolean;
  click?: boolean;
  ctrl?: boolean;
  ctrlCmd?: boolean;
  drag?: boolean;
  hover?: boolean;
  keyName?: string;
  rightClick?: boolean;
  shift?: boolean;
  dragNdrop?: boolean;
}

export const ShortcutCommand = ({ children }: React.PropsWithChildren) => (
  <span className="fctl-shortcut__command">
    <kbd className="fctl-shortcut__command-key">{children}</kbd>
  </span>
);

export const isMac = window.navigator.platform.includes('Mac');

const Shortcut = ({
  children,
  alt,
  click,
  ctrl,
  ctrlCmd,
  drag,
  hover,
  keyName,
  rightClick,
  shift,
  dragNdrop,
}: ShortcutProps) => {
  const { t } = useTranslation();
  return (
    <tr role="row">
      <td className="fctl-shortcut__cell" role="cell">
        {(ctrl || (!isMac && ctrlCmd)) && <ShortcutCommand>Ctrl</ShortcutCommand>}
        {alt && <ShortcutCommand>{isMac ? '⌥ Opt' : 'Alt'}</ShortcutCommand>}
        {shift && <ShortcutCommand>Shift</ShortcutCommand>}
        {isMac && ctrlCmd && <ShortcutCommand>⌘ Cmd</ShortcutCommand>}
        {hover && (
          <ShortcutCommand>
            <MouseIcon /> {t('Hover')}
          </ShortcutCommand>
        )}
        {keyName && (
          <ShortcutCommand>
            {keyName.length === 1 ? keyName.toUpperCase() : upperFirst(keyName.toLowerCase())}
          </ShortcutCommand>
        )}
        {drag && (
          <ShortcutCommand>
            <MouseIcon /> {t('Drag')}
          </ShortcutCommand>
        )}
        {click && (
          <ShortcutCommand>
            <MouseIcon /> {t('Click')}
          </ShortcutCommand>
        )}
        {rightClick && (
          <ShortcutCommand>
            <MouseIcon /> {t('Right click')}
          </ShortcutCommand>
        )}
        {dragNdrop && (
          <ShortcutCommand>
            <MouseIcon /> {t('Drag + Drop')}
          </ShortcutCommand>
        )}
      </td>
      <td className="fctl-shortcut__cell" role="cell">
        {children}
      </td>
    </tr>
  );
};

export default Shortcut;
