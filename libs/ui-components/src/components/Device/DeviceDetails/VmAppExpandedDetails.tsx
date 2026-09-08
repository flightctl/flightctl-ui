import * as React from 'react';
import {
  ClipboardCopy,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import { type ApplicationDesiredState, type VmApplication } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { getVmYamlContent, parseVmYaml } from '../../../utils/vmApplications';
import ApplicationExpandedSections, {
  type ApplicationDetailSection,
} from '../../Application/ApplicationExpandedSections';
import DesiredStateLabel from '../../Application/DesiredStateLabel';
import ApplicationPortsTable from '../../Application/ApplicationPortsTable';

const VmAppExpandedDetails = ({
  vmSpec,
  vmName,
  desiredState,
}: {
  vmSpec: VmApplication;
  vmName: string;
  desiredState?: ApplicationDesiredState;
}) => {
  const { t } = useTranslation();

  const vmYaml = getVmYamlContent(vmSpec);
  const config = parseVmYaml(vmYaml);

  const configDescriptionList = (
    <DescriptionList
      isHorizontal
      horizontalTermWidthModifier={{ default: '25ch' }}
      className="fctl-applications-table__description-list"
    >
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Disk image')}</DescriptionListTerm>
        <DescriptionListDescription>
          {config?.diskImage ? (
            <ClipboardCopy isReadOnly hoverTip={t('Copy')} clickTip={t('Copied')} variant="inline-compact">
              {config.diskImage}
            </ClipboardCopy>
          ) : (
            '-'
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('CPU')}</DescriptionListTerm>
        <DescriptionListDescription>
          {config?.cpuCores ? t('{{count}} cores', { count: Number(config.cpuCores) }) : '-'}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Memory')}</DescriptionListTerm>
        <DescriptionListDescription>{config?.memory || '-'}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Desired state')}</DescriptionListTerm>
        <DescriptionListDescription>
          <DesiredStateLabel desiredState={desiredState} />
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );

  const sections: ApplicationDetailSection[] = [
    {
      id: 'config',
      title: t('Configuration'),
      summary: (
        <>
          {t('{{ cores }} cores, {{ memory }}', {
            cores: config?.cpuCores || '-',
            count: Number(config?.cpuCores || 0),
            memory: config?.memory || '-',
          })}
          {' · '}
          <DesiredStateLabel desiredState={desiredState} />
        </>
      ),
      content: configDescriptionList,
      contentAriaLabel: t('Configuration details'),
      toggleAriaLabel: t('Toggle configuration details'),
    },
  ];

  const ports = vmSpec.publishPorts || [];
  if (ports.length > 0) {
    sections.push({
      id: 'network',
      title: t('Networking'),
      summary: t('{{count}} published ports', { count: ports.length }),
      content: <ApplicationPortsTable ports={ports} targetPortLabel={t('VM port')} withProtocol />,
      contentAriaLabel: t('Networking details'),
      toggleAriaLabel: t('Toggle networking details'),
      contentHasNoPadding: true,
    });
  }

  return (
    <ApplicationExpandedSections
      name={vmName}
      ariaLabel={t('VM details for {{name}}', { name: vmName })}
      sections={sections}
    />
  );
};

export default VmAppExpandedDetails;
