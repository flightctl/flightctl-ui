import * as React from 'react';
import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  List,
  ListItem,
  Spinner,
  Split,
  SplitItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { EnrollmentRequestList } from '@flightctl/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useFetchPeriodically } from '../../../../hooks/useFetchPeriodically';
import { EnrollmentRequestStatus, getApprovalStatus } from '../../../../utils/status/enrollmentRequest';
import { Link, ROUTE } from '../../../../hooks/useNavigate';
import ErrorAlert from '../../../ErrorAlert/ErrorAlert';

const ToDoCard = () => {
  const { t } = useTranslation();
  const [erList, loading, error] = useFetchPeriodically<EnrollmentRequestList>({
    endpoint: 'enrollmentrequests',
  });

  let content: React.ReactNode;
  if (loading) {
    content = (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  } else if (error) {
    content = <ErrorAlert error={error} />;
  } else {
    const pendingErs = erList?.items.filter((er) => getApprovalStatus(er) === EnrollmentRequestStatus.Pending);
    if (pendingErs?.length) {
      content = (
        <List>
          <ListItem>
            <Split hasGutter>
              <SplitItem isFilled>{t('{{ count }} devices pending approval', { count: pendingErs.length })}</SplitItem>
              <SplitItem>
                <Link to={ROUTE.DEVICES}>{t('Review pending devices', { count: pendingErs.length })}</Link>
              </SplitItem>
            </Split>
          </ListItem>
        </List>
      );
    } else {
      content = (
        <Bullseye>
          <TextContent>
            <Text component={TextVariants.small}>{t('All good!')}</Text>
          </TextContent>
        </Bullseye>
      );
    }
  }

  return (
    <Card>
      <CardTitle>{t('To do')}</CardTitle>
      <CardBody>{content}</CardBody>
    </Card>
  );
};

export default ToDoCard;
