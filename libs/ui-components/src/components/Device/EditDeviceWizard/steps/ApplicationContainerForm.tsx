import * as React from 'react';
import { FieldArray, useField } from 'formik';
import { Button, FormGroup, Grid, Split, SplitItem } from '@patternfly/react-core';
import MinusCircleIcon from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import { InlineAppForm } from '../../../../types/deviceSpec';

interface Props {
  app: InlineAppForm;
  index: number;
  isReadOnly?: boolean;
}

const ApplicationContainerForm = ({ index, isReadOnly }: Props) => {
  const { t } = useTranslation();
  const appFieldName = `applications[${index}]`;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [{ value: app }, , { setValue }] = useField<InlineAppForm>(appFieldName);

  React.useEffect(() => {
    if (!app.container) {
      setValue(
        {
          ...app,
          container: {
            image: '',
            ports: [],
            mounts: [],
          },
        },
        false,
      );
    }
    // ensure appType stays 'quadlet' for container format
    if (app.inlineFormat === 'container' && app.appType !== ('quadlet' as unknown as InlineAppForm['appType'])) {
      setValue(
        {
          ...app,
          appType: 'quadlet' as unknown as InlineAppForm['appType'],
        },
        false,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.inlineFormat]);

  const containerField = `${appFieldName}.container`;

  return (
    <ExpandableFormSection
      title={t('Container Settings')}
      fieldName={`${appFieldName}.container`}
      description={t('Configure single-container application')}
    >
      <Grid hasGutter>
        <FormGroup label={t('Image')} isRequired>
          <TextField aria-label={t('Image')} name={`${containerField}.image`} isDisabled={isReadOnly} />
        </FormGroup>

        <FieldArray name={`${containerField}.ports`}>
          {({ push, remove }) => (
            <>
              <Split hasGutter>
                <SplitItem isFilled>
                  <strong>{t('Ports')}</strong>
                </SplitItem>
                {!isReadOnly && (
                  <SplitItem>
                    <Button
                      variant="link"
                      icon={<PlusCircleIcon />}
                      iconPosition="start"
                      onClick={() => push({ hostPort: undefined, containerPort: undefined, protocol: 'tcp' })}
                    >
                      {t('Add port')}
                    </Button>
                  </SplitItem>
                )}
              </Split>
              {/* Use FieldArray's context to render list; values accessed by formik in TextField */}
              {/* Renders simple triplet: hostPort, containerPort, protocol */}
              {/* Index-based rendering handled by Formik/values */}
              {/* Consumers validate in shared schema */}
              {app.container?.ports?.map((_p, pIndex) => {
                const pName = `${containerField}.ports[${pIndex}]`;
                return (
                  <Split hasGutter key={pIndex}>
                    <SplitItem>
                      <FormGroup label={t('Host port')} isRequired>
                        <TextField name={`${pName}.hostPort`} type="number" isDisabled={isReadOnly} />
                      </FormGroup>
                    </SplitItem>
                    <SplitItem>
                      <FormGroup label={t('Container port')} isRequired>
                        <TextField name={`${pName}.containerPort`} type="number" isDisabled={isReadOnly} />
                      </FormGroup>
                    </SplitItem>
                    <SplitItem>
                      <FormGroup label={t('Protocol')}>
                        <TextField name={`${pName}.protocol`} placeholder="tcp|udp" isDisabled={isReadOnly} />
                      </FormGroup>
                    </SplitItem>
                    {!isReadOnly && (
                      <SplitItem>
                        <Button
                          aria-label={t('Delete port')}
                          variant="link"
                          icon={<MinusCircleIcon />}
                          iconPosition="start"
                          onClick={() => remove(pIndex)}
                        />
                      </SplitItem>
                    )}
                  </Split>
                );
              })}
            </>
          )}
        </FieldArray>

        <FieldArray name={`${containerField}.mounts`}>
          {({ push, remove }) => (
            <>
              <Split hasGutter>
                <SplitItem isFilled>
                  <strong>{t('Volumes')}</strong>
                </SplitItem>
                {!isReadOnly && (
                  <SplitItem>
                    <Button
                      variant="link"
                      icon={<PlusCircleIcon />}
                      iconPosition="start"
                      onClick={() => push({ name: '', mountPath: '' })}
                    >
                      {t('Add volume')}
                    </Button>
                  </SplitItem>
                )}
              </Split>
              {app.container?.mounts?.map((_m, mIndex) => {
                const mName = `${containerField}.mounts[${mIndex}]`;
                return (
                  <Split hasGutter key={mIndex}>
                    <SplitItem>
                      <FormGroup label={t('Volume name')} isRequired>
                        <TextField name={`${mName}.name`} isDisabled={isReadOnly} />
                      </FormGroup>
                    </SplitItem>
                    <SplitItem isFilled>
                      <FormGroup label={t('Mount path')} isRequired>
                        <TextField name={`${mName}.mountPath`} isDisabled={isReadOnly} />
                      </FormGroup>
                    </SplitItem>
                    {!isReadOnly && (
                      <SplitItem>
                        <Button
                          aria-label={t('Delete volume')}
                          variant="link"
                          icon={<MinusCircleIcon />}
                          iconPosition="start"
                          onClick={() => remove(mIndex)}
                        />
                      </SplitItem>
                    )}
                  </Split>
                );
              })}
            </>
          )}
        </FieldArray>

        <FormGroup label={t('Memory limit')}>
          <TextField name={`${containerField}.memory`} placeholder="e.g. 512M, 1G" isDisabled={isReadOnly} />
        </FormGroup>
        <FormGroup label={t('CPU quota')}>
          <TextField name={`${containerField}.cpuQuota`} placeholder="e.g. 50% or 100000" isDisabled={isReadOnly} />
        </FormGroup>
        <FormGroup label={t('CPU weight')}>
          <TextField name={`${containerField}.cpuWeight`} type="number" placeholder="1-10000" isDisabled={isReadOnly} />
        </FormGroup>
      </Grid>
    </ExpandableFormSection>
  );
};

export default ApplicationContainerForm;



