import * as React from 'react';
import { ClipboardCopy, Content, Flex, FlexItem, Tooltip, TruncateProps } from '@patternfly/react-core';

import { DependencySyncConfigRefStatus } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { timeSinceText } from '../../../utils/dates';

type ConfigSourceSyncDetailsProps = {
  syncRef: DependencySyncConfigRefStatus;
};

// The delay improves the UX when moving from the "Copy" button to the timestamp or vice versa.
const TOOLTIP_DELAY = 400;
const FINGERPRINT_MAX_CHARS = 12;
const FINGERPRINT_MAX_CHARS_SHA256 = FINGERPRINT_MAX_CHARS + 'sha256:'.length;

const getFingerprintTruncation = (fingerprint: string): Partial<TruncateProps> => {
  return {
    position: 'end',
    maxCharsDisplayed: fingerprint.includes('sha256:') ? FINGERPRINT_MAX_CHARS_SHA256 : FINGERPRINT_MAX_CHARS,
    // We hide the tooltip that displays the full fingerprint.
    // Users can always copy the fingerprint to the clipboard, and there already are 2 more tooltips in this small component.
    tooltipProps: { trigger: 'manual', isVisible: false },
  };
};

const ConfigSourceSyncDetails = ({ syncRef }: ConfigSourceSyncDetailsProps) => {
  const { t } = useTranslation();

  const fingerprint = syncRef.fingerprint;
  return (
    <Flex>
      {fingerprint && (
        <FlexItem>
          <ClipboardCopy
            variant="inline-compact"
            copyAriaLabel={t('Copy fingerprint')}
            hoverTip={t('Copy fingerprint')}
            clickTip={t('Copied!')}
            entryDelay={TOOLTIP_DELAY}
            exitDelay={TOOLTIP_DELAY}
            truncation={getFingerprintTruncation(fingerprint)}
          >
            {fingerprint}
          </ClipboardCopy>
        </FlexItem>
      )}

      {syncRef.lastUpdatedAt && (
        <FlexItem>
          <Tooltip content={syncRef.lastUpdatedAt} entryDelay={TOOLTIP_DELAY} exitDelay={TOOLTIP_DELAY}>
            <Content component="small">
              {t('Last synced')} {timeSinceText(t, syncRef.lastUpdatedAt)}
            </Content>
          </Tooltip>
        </FlexItem>
      )}
    </Flex>
  );
};

export default ConfigSourceSyncDetails;
