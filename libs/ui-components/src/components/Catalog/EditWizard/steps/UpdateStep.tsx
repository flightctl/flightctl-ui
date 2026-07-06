import {
  Alert,
  Button,
  Content,
  FormGroup,
  Grid,
  GridItem,
  Icon,
  Modal,
  ModalBody,
  ModalHeader,
  Title,
} from '@patternfly/react-core';
import ArrowRightIcon from '@patternfly/react-icons/dist/js/icons/arrow-right-icon';
import * as React from 'react';
import { FormikErrors, useFormikContext } from 'formik';
import { CatalogItem, CatalogItemVersion } from '@flightctl/types/alpha';
import semver from 'semver';
import ReactMarkdown from 'react-markdown';

import FlightCtlForm from '../../../form/FlightCtlForm';
import { useTranslation } from '../../../../hooks/useTranslation';
import FormSelect from '../../../form/FormSelect';
import { InstallSpecFormik } from '../../InstallWizard/types';
import { StatusDisplayContent } from '../../../Status/StatusDisplay';
import { InstallSpec, VersionDropdown } from '../../InstallWizard/steps/SpecificationsStep';
import UpdateGraph from './UpdateGraph';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import { applyInitialConfig, getInitialAppConfig } from '../../InstallWizard/utils';
import { getUpdates } from '../../utils';

export const isUpdateStepValid = (errors: FormikErrors<InstallSpecFormik>) => {
  return !errors.version && !errors.channel;
};

type UpdateStepProps = {
  currentVersion: CatalogItemVersion;
  catalogItem: CatalogItem;
  isEdit: boolean;
};

const UpdateStep = ({ currentVersion, catalogItem, isEdit }: UpdateStepProps) => {
  const [showReadme, setShowReadme] = React.useState(false);
  const { t } = useTranslation();
  const { values, initialValues, setFieldValue } = useFormikContext<InstallSpecFormik>();

  const updates = getUpdates(catalogItem, values.channel, currentVersion.version);

  const updateVersion = catalogItem.spec.versions.find((v) => v.version === values.version);

  return isEdit ? (
    <>
      <FlightCtlForm>
        <Grid hasGutter>
          <GridItem>
            <Title headingLevel="h3">{t('Version update')}</Title>
          </GridItem>
          <GridItem>
            <Grid hasGutter>
              <GridItem>
                <Grid style={{ alignItems: 'center' }}>
                  <GridItem span={4}>
                    <FormGroup label={t('Current channel')} />
                  </GridItem>
                  <GridItem span={1} />
                  <GridItem span={4}>
                    <FormGroupWithHelperText
                      label={t('Target channel')}
                      content={t('The current version is available in the channels listed in the dropdown below')}
                    />
                  </GridItem>
                  <GridItem span={3} />
                  <GridItem span={4}>{initialValues.channel}</GridItem>
                  <GridItem span={1}>
                    <Icon>
                      <ArrowRightIcon />
                    </Icon>
                  </GridItem>
                  <GridItem span={4}>
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
                        const newVersion = latestVersion || currentVersion.version;
                        setFieldValue('version', newVersion);
                        const appConfig = getInitialAppConfig(catalogItem, newVersion);
                        applyInitialConfig(setFieldValue, appConfig);
                      }}
                    />
                  </GridItem>
                  <GridItem span={3} />
                </Grid>
              </GridItem>
              <GridItem>
                <Grid style={{ alignItems: 'center' }}>
                  <GridItem span={4}>
                    <FormGroup label={t('Current version')} />
                  </GridItem>
                  <GridItem span={1} />
                  <GridItem span={4}>
                    <FormGroup label={t('Target version')} />
                  </GridItem>
                  <GridItem span={3} />
                  <GridItem span={4}>{currentVersion.version}</GridItem>
                  <GridItem span={1}>
                    <Icon>
                      <ArrowRightIcon />
                    </Icon>
                  </GridItem>
                  <GridItem span={4}>
                    {updates.length ? (
                      <VersionDropdown catalogItem={catalogItem} versions={[...updates, currentVersion]} />
                    ) : (
                      <StatusDisplayContent level="success" label={t('Up to date')} />
                    )}
                  </GridItem>
                  <GridItem span={3} style={{ paddingLeft: 'var(--pf-t--global--spacer--md)' }}>
                    {updateVersion?.readme && (
                      <Button onClick={() => setShowReadme(true)} variant="link">
                        {t('Show readme')}
                      </Button>
                    )}
                  </GridItem>
                </Grid>
              </GridItem>
            </Grid>
          </GridItem>
          <GridItem>
            <Grid hasGutter>
              {!!updates.length && (
                <>
                  {values.version === currentVersion.version && (
                    <GridItem>
                      <Alert isInline variant="info" title={t('No version update will be performed')} />
                    </GridItem>
                  )}
                  <GridItem>
                    <UpdateGraph currentChannel={values.channel} currentVersion={currentVersion} updates={updates} />
                  </GridItem>
                </>
              )}
              {updateVersion?.deprecation && (
                <GridItem>
                  <Alert isInline variant="warning" title={t('This version is deprecated')}>
                    {updateVersion.deprecation.message}
                  </Alert>
                </GridItem>
              )}
            </Grid>
          </GridItem>
        </Grid>
      </FlightCtlForm>
      {showReadme && updateVersion?.readme && (
        <Modal isOpen onClose={() => setShowReadme(false)} variant="medium">
          <ModalHeader title={t('Readme')} />
          <ModalBody>
            <Content>
              <ReactMarkdown>{updateVersion.readme}</ReactMarkdown>
            </Content>
          </ModalBody>
        </Modal>
      )}
    </>
  ) : (
    <Grid hasGutter>
      <GridItem>
        <Title headingLevel="h3">{t('Deployment specifications')}</Title>
      </GridItem>
      <GridItem>
        <FlightCtlForm>
          <InstallSpec catalogItem={catalogItem} targetSet />
        </FlightCtlForm>
      </GridItem>
    </Grid>
  );
};

export default UpdateStep;
