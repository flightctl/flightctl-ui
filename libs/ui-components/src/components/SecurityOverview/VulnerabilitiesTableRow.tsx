import * as React from 'react';
import { Button } from '@patternfly/react-core';
import { ActionsColumn, ExpandableRowContent, Tbody, Td, type TdProps, Tr, TrProps } from '@patternfly/react-table';

import { Vulnerability, VulnerabilityGroup } from '@flightctl/types/alpha';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, ROUTE } from '../../hooks/useNavigate';
import { getDateNoTimeDisplay } from '../../utils/dates';
import { isVulnerabilityGroup } from '../../utils/vulnerabilities';
import VulnerabilitySeverityStatus from '../Status/VulnerabilitySeverityStatus';
import VulnerabilityAffectedImages, { getAffectedImages } from './VulnerabilityAffectedImages';

type VulnerabilitiesTableCompactRowProps = {
  vulnerability: Vulnerability | VulnerabilityGroup;
  setSelectedRow: VoidFunction;
};

type VulnerabilitiesTableFullRowProps = {
  vulnerability: VulnerabilityGroup;
  setSelectedRow: VoidFunction;
  imagesExpanded: boolean;
  compoundExpand: TdProps['compoundExpand'];
};

const VulnerabilitiesBaseTr = ({
  vulnerability,
  setSelectedRow,
  isControlRow,
  isContentExpanded,
  children,
}: React.PropsWithChildren<VulnerabilitiesTableCompactRowProps & TrProps>) => {
  const { t } = useTranslation();
  const isGroupItem = isVulnerabilityGroup(vulnerability);

  return (
    <Tr isControlRow={isControlRow} isContentExpanded={isContentExpanded}>
      <Td dataLabel={t('Name')}>
        <Button variant="link" isInline onClick={setSelectedRow}>
          {vulnerability.cveId}
        </Button>
      </Td>
      <Td dataLabel={t('Severity')}>
        <VulnerabilitySeverityStatus severity={vulnerability.severity} />
      </Td>
      {children}
      <Td dataLabel={t('Published')}>
        {getDateNoTimeDisplay(isGroupItem ? vulnerability.maxPublishedAt : vulnerability.publishedAt)}
      </Td>
      <Td isActionCell dataLabel={t('Actions')}>
        <ActionsColumn
          items={[
            {
              title: t('View details'),
              onClick: setSelectedRow,
            },
          ]}
        />
      </Td>
    </Tr>
  );
};

const VulnerabilitiesFullTr = ({
  vulnerability,
  setSelectedRow,
  imagesExpanded,
  compoundExpand,
}: VulnerabilitiesTableFullRowProps) => {
  const { t } = useTranslation();

  const affectedImagesCount = getAffectedImages(vulnerability.findings).length;
  return (
    <VulnerabilitiesBaseTr
      vulnerability={vulnerability}
      setSelectedRow={setSelectedRow}
      isControlRow={compoundExpand !== undefined}
      isContentExpanded={imagesExpanded}
    >
      <Td dataLabel={t('Affected devices')}>
        <Link
          to={ROUTE.DEVICES}
          query={new URLSearchParams({
            cveId: vulnerability.cveId,
          }).toString()}
        >
          {vulnerability.affectedDevices}
        </Link>
      </Td>
      <Td dataLabel={t('Affected images')} compoundExpand={compoundExpand}>
        {affectedImagesCount}
      </Td>
    </VulnerabilitiesBaseTr>
  );
};

export const VulnerabilitiesTableCompactRow = ({
  vulnerability,
  setSelectedRow,
}: VulnerabilitiesTableCompactRowProps) => {
  return (
    <Tbody key={vulnerability.cveId}>
      <VulnerabilitiesBaseTr vulnerability={vulnerability} setSelectedRow={setSelectedRow} />
    </Tbody>
  );
};

export const VulnerabilitiesTableFullRow = ({
  vulnerability,
  setSelectedRow,
  imagesExpanded,
  compoundExpand,
}: VulnerabilitiesTableFullRowProps) => {
  const { t } = useTranslation();
  return (
    <Tbody key={vulnerability.cveId} isExpanded={imagesExpanded}>
      <VulnerabilitiesFullTr
        vulnerability={vulnerability}
        setSelectedRow={setSelectedRow}
        imagesExpanded={imagesExpanded}
        compoundExpand={compoundExpand}
      />
      <Tr isExpanded={imagesExpanded}>
        <Td dataLabel={t('Affected images')} colSpan={6}>
          <ExpandableRowContent>
            <VulnerabilityAffectedImages findings={vulnerability.findings} />
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};
