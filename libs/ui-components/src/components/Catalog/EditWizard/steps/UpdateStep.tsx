import { FormGroup, Grid, GridItem, Icon, Title } from '@patternfly/react-core';
import ArrowRightIcon from '@patternfly/react-icons/dist/js/icons/arrow-right-icon';
import * as React from 'react';
import { FormikErrors, useFormikContext } from 'formik';
import { CatalogItem, CatalogItemVersion } from '@flightctl/types/alpha';
import semver from 'semver';

import FlightCtlForm from '../../../form/FlightCtlForm';
import UpdateGraph from './UpdateGraph';
import { useTranslation } from '../../../../hooks/useTranslation';
import FormSelect from '../../../form/FormSelect';
import { getUpdates } from '../../utils';
import { InstallSpecFormik } from '../../InstallWizard/types';
import { StatusDisplayContent } from '../../../Status/StatusDisplay';
import { InstallSpec } from '../../InstallWizard/steps/SpecificationsStep';

export const isUpdateStepValid = (errors: FormikErrors<InstallSpecFormik>) => {
  return !errors.version && !errors.channel;
};

type UpdateStepProps = {
  currentVersion: CatalogItemVersion;
  catalogItem: CatalogItem;
  onVersionChange?: (version: string) => void;
  isEdit: boolean;
};

const UpdateStep = ({ currentVersion, catalogItem, onVersionChange, isEdit }: UpdateStepProps) => {
  const { t } = useTranslation();
  const { values, initialValues, setFieldValue } = useFormikContext<InstallSpecFormik>();

  const updates = getUpdates(catalogItem, values.channel, currentVersion.version);

  return isEdit ? (
    <FlightCtlForm>
      <Grid hasGutter>
        <GridItem>
          <Title headingLevel="h3">{t('Version update')}</Title>
        </GridItem>
        <GridItem span={6}>
          <Grid hasGutter>
            <GridItem>
              <Grid style={{ alignItems: 'center' }}>
                <GridItem span={5}>
                  <FormGroup label={t('Current channel')} />
                </GridItem>
                <GridItem span={2} />
                <GridItem span={5}>
                  <FormGroup label={t('Target channel')} />
                </GridItem>
                <GridItem span={5}>{initialValues.channel}</GridItem>
                <GridItem span={2}>
                  <Icon>
                    <ArrowRightIcon />
                  </Icon>
                </GridItem>
                <GridItem span={5}>
                  <FormSelect
                    name="channel"
                    items={currentVersion.channels.reduce((acc, curr) => {
                      acc[curr] = curr;
                      return acc;
                    }, {})}
                    onChange={(val) => {
                      const latestVersion = getUpdates(catalogItem, val, currentVersion.version).sort((a, b) =>
                        semver.rcompare(a.version, b.version),
                      )[0]?.version;
                      setFieldValue('version', latestVersion || currentVersion.version);
                    }}
                  />
                </GridItem>
              </Grid>
            </GridItem>
            <GridItem>
              <Grid style={{ alignItems: 'center' }}>
                <GridItem span={5}>
                  <FormGroup label={t('Current version')} />
                </GridItem>
                <GridItem span={2} />
                <GridItem span={5}>
                  <FormGroup label={t('Target version')} />
                </GridItem>
                <GridItem span={5}>{currentVersion.version}</GridItem>
                <GridItem span={2}>
                  <Icon>
                    <ArrowRightIcon />
                  </Icon>
                </GridItem>
                <GridItem span={5}>
                  {updates.length ? (
                    <FormSelect
                      name="version"
                      items={updates.reduce((acc, curr) => {
                        acc[curr.version] = curr.version;
                        return acc;
                      }, {})}
                    />
                  ) : (
                    <StatusDisplayContent level="success" label={t('Up to date')} />
                  )}
                </GridItem>
              </Grid>
            </GridItem>
          </Grid>
        </GridItem>
        {!!updates.length && (
          <GridItem>
            <FormGroup label={t('{{ channel }} channel', { channel: values.channel })}>
              <UpdateGraph
                selectedVersion={values.version}
                currentVersion={currentVersion}
                currentChannel={values.channel}
                onSelectionChange={(version) => {
                  onVersionChange?.(version);
                  setFieldValue('version', version);
                }}
                updates={updates}
              />
            </FormGroup>
          </GridItem>
        )}
      </Grid>
    </FlightCtlForm>
  ) : (
    <FlightCtlForm>
      <Grid hasGutter>
        <GridItem>
          <Title headingLevel="h3">{t('Deployment specifications')}</Title>
        </GridItem>
        <GridItem span={6}>
          <InstallSpec catalogItem={catalogItem} />
        </GridItem>
      </Grid>
    </FlightCtlForm>
  );
};

export default UpdateStep;
