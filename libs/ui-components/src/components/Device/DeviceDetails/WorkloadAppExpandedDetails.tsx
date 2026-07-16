import * as React from 'react';
import {
  ClipboardCopy,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import type { ApplicationDesiredState, ApplicationPort } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import type { StatusAppWithSpec } from '../../../utils/vmApplications';
import { RUN_AS_ROOT_USER, isImageVariantApp } from '../../../types/deviceSpec';
import ApplicationExpandedSections, {
  type ApplicationDetailSection,
} from '../../Application/ApplicationExpandedSections';
import ApplicationPortsTable from '../../Application/ApplicationPortsTable';
import DesiredStateLabel from '../../Application/DesiredStateLabel';
import ApplicationVolumesDescriptionList from '../../Application/ApplicationVolumesDescriptionList';

const WorkloadAppExpandedDetails = ({
  application,
  desiredState,
}: {
  application: StatusAppWithSpec;
  desiredState?: ApplicationDesiredState;
}) => {
  const { status: appStatus, spec } = application;
  const { t } = useTranslation();

  let image: string | undefined;
  let appPorts: ApplicationPort[] = [];
  if (spec) {
    if ('image' in spec && isImageVariantApp(spec)) {
      image = spec.image;
    }
    if ('ports' in spec && spec.ports) {
      appPorts = spec.ports as ApplicationPort[];
    }
  }

  const volumes = appStatus.volumes || [];

  const detailsDescriptionList = (
    <DescriptionList
      isHorizontal
      isCompact
      horizontalTermWidthModifier={{ default: '25ch' }}
      className="fctl-applications-table__description-list"
    >
      {image && (
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Image')}</DescriptionListTerm>
          <DescriptionListDescription>
            <ClipboardCopy isReadOnly hoverTip={t('Copy')} clickTip={t('Copied')} variant="inline-compact">
              {image}
            </ClipboardCopy>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Run as user')}</DescriptionListTerm>
        <DescriptionListDescription>{appStatus.runAs || RUN_AS_ROOT_USER}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Embedded')}</DescriptionListTerm>
        <DescriptionListDescription>{appStatus.embedded ? t('Yes') : t('No')}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Desired state')}</DescriptionListTerm>
        <DescriptionListDescription>
          <DesiredStateLabel desiredState={desiredState} />
        </DescriptionListDescription>
      </DescriptionListGroup>
      {volumes.length > 0 && <ApplicationVolumesDescriptionList volumes={volumes} />}
    </DescriptionList>
  );

  const sections: ApplicationDetailSection[] = [
    {
      id: 'details',
      title: t('Details'),
      summary: (
        <>
          {appStatus.runAs || RUN_AS_ROOT_USER}
          {' · '}
          <DesiredStateLabel desiredState={desiredState} />
        </>
      ),
      content: detailsDescriptionList,
      contentAriaLabel: t('Application details'),
      toggleAriaLabel: t('Toggle details'),
    },
  ];

  if (appPorts.length > 0) {
    sections.push({
      id: 'network',
      title: t('Networking'),
      summary: t('{{count}} published ports', { count: appPorts.length }),
      content: <ApplicationPortsTable ports={appPorts} targetPortLabel={t('Container port')} />,
      contentAriaLabel: t('Networking details'),
      toggleAriaLabel: t('Toggle networking details'),
      contentHasNoPadding: true,
    });
  }

  return (
    <ApplicationExpandedSections
      name={appStatus.name}
      ariaLabel={t('Details for {{name}}', { name: appStatus.name })}
      sections={sections}
    />
  );
};

export default WorkloadAppExpandedDetails;
