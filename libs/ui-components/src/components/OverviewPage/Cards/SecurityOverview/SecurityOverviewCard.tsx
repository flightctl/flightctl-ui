import * as React from 'react';
import {
  Bullseye,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Spinner,
} from '@patternfly/react-core';

import { useTranslation } from '../../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../../hooks/useNavigate';
import { useVulnerabilitySummary } from '../../../../hooks/useVulnerabilitySummary';
import SecurityOverviewSummary from '../../../SecurityOverview/SecurityOverviewSummary';
import LabelWithHelperText from '../../../common/WithHelperText';

const SecurityOverviewCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { counts, isLoading } = useVulnerabilitySummary();
  const isEmpty = counts.total === 0;

  return (
    <Card>
      <CardHeader>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsFlexStart' }}
          flexWrap={{ default: 'wrap' }}
        >
          <FlexItem>
            <CardTitle>
              <LabelWithHelperText
                label={t('Security overview')}
                content={t(
                  'Security risks across your devices. Resolve critical vulnerabilities immediately to prevent migration failure and protect your infrastructure.',
                )}
              />
            </CardTitle>
          </FlexItem>
          <FlexItem>
            {!isLoading && !isEmpty && (
              <Button
                variant="link"
                isInline
                onClick={() => navigate(ROUTE.SECURITY_OVERVIEW)}
                aria-label={t('View all CVEs')}
                hasNoPadding
              >
                {t('View all CVEs')}
              </Button>
            )}
          </FlexItem>
        </Flex>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <Bullseye className="pf-v6-u-py-xl">
            <Spinner />
          </Bullseye>
        ) : (
          <SecurityOverviewSummary />
        )}
      </CardBody>
    </Card>
  );
};

export default SecurityOverviewCard;
