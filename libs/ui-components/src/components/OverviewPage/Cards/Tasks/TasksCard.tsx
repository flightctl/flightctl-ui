import * as React from 'react';
import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  Content,
  ContentVariants,
  List,
  ListItem,
  Spinner,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { useTranslation } from '../../../../hooks/useTranslation';
import { usePendingEnrollmentRequestsCount } from '../../../../hooks/usePendingEnrollmentRequestsCount';
import { Link, ROUTE } from '../../../../hooks/useNavigate';
import ErrorAlert from '../../../ErrorAlert/ErrorAlert';

const TasksCard = () => {
  const { t } = useTranslation();

  const [pendingErCount, loading, error] = usePendingEnrollmentRequestsCount();

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
    if (pendingErCount) {
      content = (
        <List>
          <ListItem>
            <Split hasGutter>
              <SplitItem isFilled>{t('{{ count }} devices pending approval', { count: pendingErCount })}</SplitItem>
              <SplitItem>
                <Link to={ROUTE.DEVICES}>{t('Review pending devices', { count: pendingErCount })}</Link>
              </SplitItem>
            </Split>
          </ListItem>
        </List>
      );
    } else {
      content = (
        <Bullseye>
          <Content component={ContentVariants.small}>{t('All good!')}</Content>
        </Bullseye>
      );
    }
  }

  return (
    <Card>
      <CardTitle>{t('Tasks')}</CardTitle>
      <CardBody>{content}</CardBody>
    </Card>
  );
};

export default TasksCard;
