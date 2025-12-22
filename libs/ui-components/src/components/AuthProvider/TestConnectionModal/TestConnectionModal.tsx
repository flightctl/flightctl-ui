import * as React from 'react';
import {
  Alert,
  Button,
  Content,
  ContentVariants,
  Icon,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import { FieldValidationResult } from '../CreateAuthProvider/types';

type TestConnectionModalProps = {
  onClose: VoidFunction;
  results: FieldValidationResult[];
};

const getStatusIcon = (valid: boolean) => {
  if (valid) {
    return (
      <Icon status="success">
        <CheckCircleIcon />
      </Icon>
    );
  }
  return (
    <Icon status="warning">
      <ExclamationTriangleIcon />
    </Icon>
  );
};

const getFieldDisplayName = (fieldName: string, t: (key: string) => string): string => {
  const fieldMap: Record<string, string> = {
    issuer: t('Issuer URL'),
    authorizationUrl: t('Authorization URL'),
    tokenUrl: t('Token URL'),
    userinfoUrl: t('Userinfo URL'),
  };
  return fieldMap[fieldName] || fieldName;
};

const NotesCell = ({ notes }: { notes?: string[] }) => {
  if (!notes || notes.length === 0) {
    return <>-</>;
  }

  return (
    <List isPlain>
      {notes.map((note, idx) => (
        <ListItem key={idx}>{note}</ListItem>
      ))}
    </List>
  );
};

const TestConnectionModal = ({ onClose, results }: TestConnectionModalProps) => {
  const { t } = useTranslation();

  const allValid = results.every((validation) => validation.valid);
  const hasValid = results.some((validation) => validation.valid);

  return (
    <Modal isOpen onClose={onClose} variant="medium">
      <ModalHeader title={t('Test connection results')} />
      <ModalBody>
        <Stack hasGutter>
          {allValid ? (
            <>
              <StackItem>
                <Alert variant="success" title={t('Connection test successful')} />
              </StackItem>
              <StackItem>
                <Content>
                  <Content component={ContentVariants.small}>
                    {t("Great! We successfully connected to your provider. Here's what we found:")}
                  </Content>
                </Content>
              </StackItem>
            </>
          ) : (
            <StackItem>
              <Alert
                isInline
                variant={hasValid ? 'warning' : 'danger'}
                title={hasValid ? t('Connection partially successful') : t('Connection test unsuccessful')}
              >
                {t("We found some issues with your configuration. Here's what needs your attention:")}
              </Alert>
            </StackItem>
          )}
          <StackItem>
            <Table variant="compact">
              <Thead>
                <Tr>
                  <Th>{t('Field')}</Th>
                  <Th>{t('Value')}</Th>
                  <Th>{t('Status')}</Th>
                  <Th>{t('Details')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {results.map((result) => (
                  <Tr key={result.field}>
                    <Td>{getFieldDisplayName(result.field, t)}</Td>
                    <Td style={{ wordBreak: 'break-all' }}>{result.value || '-'}</Td>
                    <Td>{getStatusIcon(result.valid)}</Td>
                    <Td>
                      <NotesCell notes={result.notes} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={onClose}>
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TestConnectionModal;
