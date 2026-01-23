import * as React from 'react';
import {
  Alert,
  Button,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
  ProgressMeasureLocation,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { ImageBuild } from '@flightctl/types/imagebuilder';
import { getErrorMessage } from '../../../../utils/error';
import { useFetch } from '../../../../hooks/useFetch';
import { useTranslation } from '../../../../hooks/useTranslation';
import { isPromiseRejected } from '../../../../types/typeUtils';
import { getImageBuildDestinationImage, getImageBuildSourceImage } from '../../../../utils/imageBuilds';

type MassDeleteImageBuildModalProps = {
  onClose: VoidFunction;
  imageBuilds: Array<ImageBuild>;
  onDeleteSuccess: VoidFunction;
};

const MassDeleteImageBuildTable = ({ imageBuilds }: { imageBuilds: Array<ImageBuild> }) => {
  const { t } = useTranslation();
  return (
    <Table>
      <Thead>
        <Tr>
          <Th modifier="fitContent">{t('Name')}</Th>
          <Th modifier="fitContent">{t('Base image')}</Th>
          <Th modifier="fitContent">{t('Image output')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {imageBuilds.map((imageBuild) => {
          const name = imageBuild.metadata.name || '';
          const baseImage = getImageBuildSourceImage(imageBuild);
          const outputImage = getImageBuildDestinationImage(imageBuild);
          return (
            <Tr key={name}>
              <Td dataLabel={t('Name')}>{name}</Td>
              <Td dataLabel={t('Base image')}>{baseImage}</Td>
              <Td dataLabel={t('Image output')}>{outputImage}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

const MassDeleteImageBuildModal = ({ onClose, imageBuilds, onDeleteSuccess }: MassDeleteImageBuildModalProps) => {
  const { t } = useTranslation();
  const [progress, setProgress] = React.useState(0);
  const [progressTotal, setProgressTotal] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>();
  const { remove } = useFetch();

  const imageBuildsCount = imageBuilds.length;

  const deleteImageBuilds = async () => {
    setErrors(undefined);
    setProgress(0);
    setProgressTotal(imageBuilds.length);
    setIsDeleting(true);

    const promises = imageBuilds.map(async (imageBuild) => {
      await remove(`imagebuilds/${imageBuild.metadata.name}`);
      setProgress((p) => p + 1);
    });

    const results = await Promise.allSettled(promises);
    setIsDeleting(false);

    const rejectedResults = results.filter(isPromiseRejected);

    if (rejectedResults.length) {
      setErrors(rejectedResults.map((r) => getErrorMessage(r.reason)));
    } else {
      onDeleteSuccess();
    }
  };

  return (
    <Modal isOpen onClose={isDeleting ? undefined : onClose} variant="medium">
      <ModalHeader title={t('Delete image builds?')} titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Content>
              {t('This will remove the record of this build and its history.', { count: imageBuildsCount })}
            </Content>
          </StackItem>
          <StackItem>
            <Content className="pf-v6-u-text-color-subtle">
              {t('The actual image files in your storage will not be deleted.')}
            </Content>
          </StackItem>
          <StackItem>
            <MassDeleteImageBuildTable imageBuilds={imageBuilds} />
          </StackItem>

          {isDeleting && (
            <StackItem>
              <Progress
                value={progress}
                min={0}
                max={progressTotal}
                title={t('Deleting...')}
                measureLocation={ProgressMeasureLocation.top}
                label={t('{{progress}} of {{progressTotal}}', { progress, progressTotal })}
                valueText={t('{{progress}} of {{progressTotal}}', { progress, progressTotal })}
              />
            </StackItem>
          )}
          {errors?.length && (
            <StackItem>
              <Alert isInline variant="danger" title={t('An error occurred')}>
                <Stack hasGutter>
                  {errors.map((e, index) => (
                    <StackItem key={index}>{e}</StackItem>
                  ))}
                </Stack>
              </Alert>
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          key="delete"
          variant="danger"
          onClick={deleteImageBuilds}
          isLoading={isDeleting}
          isDisabled={isDeleting}
        >
          {t('Delete image builds')}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MassDeleteImageBuildModal;
