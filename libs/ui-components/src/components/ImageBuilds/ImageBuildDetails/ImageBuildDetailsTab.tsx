import * as React from 'react';
import {
  CardBody,
  CardTitle,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Icon,
  Label,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Trans } from 'react-i18next';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';

import { BindingType, ImageExport } from '@flightctl/types/imagebuilder';
import { getDateDisplay } from '../../../utils/dates';
import { getExportFormatLabel, getImageReference } from '../../../utils/imageBuilds';
import { useTranslation } from '../../../hooks/useTranslation';
import FlightCtlDescriptionList from '../../common/FlightCtlDescriptionList';
import DetailsPageCard from '../../DetailsPage/DetailsPageCard';
import { CERTIFICATE_VALIDITY_IN_YEARS } from '../../../constants';
import { ImageBuildWithExports } from '../../../types/extraTypes';
import { useOciRegistriesContext } from '../OciRegistriesContext';
import { ImageBuildStatusDisplay } from '../ImageBuildAndExportStatus';
import ImageUrl from '../ImageUrl';

const ImageBuildDetailsTab = ({ imageBuild }: { imageBuild: ImageBuildWithExports }) => {
  const { t } = useTranslation();
  const srcRepositoryName = imageBuild.spec.source.repository;
  const dstRepositoryName = imageBuild.spec.destination.repository;

  const { ociRegistries } = useOciRegistriesContext();
  const isEarlyBinding = imageBuild.spec.binding.type === BindingType.BindingTypeEarly;

  const hasExports = imageBuild.exportsCount > 0;
  const existingImageExports = imageBuild.imageExports.filter(
    (imageExport) => imageExport !== undefined,
  ) as ImageExport[];

  const srcImageReference = React.useMemo(() => {
    return getImageReference(ociRegistries, imageBuild.spec.source) || '';
  }, [ociRegistries, imageBuild.spec.source]);

  const dstImageReference = React.useMemo(() => {
    return getImageReference(ociRegistries, imageBuild.spec.destination) || '';
  }, [ociRegistries, imageBuild.spec.destination]);

  const remoteAccessUsername = imageBuild.spec.userConfiguration?.username || '';

  return (
    <Stack hasGutter>
      <StackItem>
        <Grid hasGutter>
          <GridItem span={6}>
            <DetailsPageCard>
              <CardTitle>{t('Build information')}</CardTitle>
              <CardBody>
                <FlightCtlDescriptionList isCompact isHorizontal>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Build status')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <ImageBuildStatusDisplay buildStatus={imageBuild.status} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {getDateDisplay(imageBuild.metadata.creationTimestamp)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </FlightCtlDescriptionList>
              </CardBody>
            </DetailsPageCard>
          </GridItem>
          <GridItem span={6}>
            <DetailsPageCard>
              <CardTitle>{t('Registration')}</CardTitle>
              <CardBody>
                <FlightCtlDescriptionList isHorizontal isCompact>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Binding type')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {isEarlyBinding ? t('Early binding') : t('Late binding')}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  {isEarlyBinding ? (
                    <>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Enrollment')}</DescriptionListTerm>
                        <DescriptionListDescription>{t('Auto-create certificate')}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Registration')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {t('{{ validityPeriod }} years (Standard)', {
                            validityPeriod: CERTIFICATE_VALIDITY_IN_YEARS,
                            count: CERTIFICATE_VALIDITY_IN_YEARS,
                          })}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </>
                  ) : (
                    <>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Registration')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          <Flex>
                            <FlexItem>
                              <Icon status="info" size="sm">
                                <InfoCircleIcon />
                              </Icon>
                            </FlexItem>
                            <FlexItem>{t('Cloud-init and ignition are enabled automatically')}</FlexItem>
                          </Flex>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </>
                  )}
                  {remoteAccessUsername && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>{t('Remote access')}</DescriptionListTerm>
                      <DescriptionListDescription>
                        <Trans t={t}>
                          Enabled for <strong>{remoteAccessUsername}</strong>
                        </Trans>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
                </FlightCtlDescriptionList>
              </CardBody>
            </DetailsPageCard>
          </GridItem>
          <GridItem span={6}>
            <DetailsPageCard>
              <CardTitle>{t('Source image')}</CardTitle>
              <CardBody>
                <FlightCtlDescriptionList isCompact isHorizontal>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Source repository')}</DescriptionListTerm>
                    <DescriptionListDescription>{srcRepositoryName}</DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Image name')}</DescriptionListTerm>
                    <DescriptionListDescription>{imageBuild.spec.source.imageName}</DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Image tag')}</DescriptionListTerm>
                    <DescriptionListDescription>{imageBuild.spec.source.imageTag}</DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Image reference URL')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <ImageUrl imageReference={srcImageReference} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </FlightCtlDescriptionList>
              </CardBody>
            </DetailsPageCard>
          </GridItem>
          <GridItem span={6}>
            <DetailsPageCard>
              <CardTitle>{t('Image output')}</CardTitle>
              <CardBody>
                <FlightCtlDescriptionList isCompact isHorizontal>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Target repository')}</DescriptionListTerm>
                    <DescriptionListDescription>{dstRepositoryName}</DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Image output name')}</DescriptionListTerm>
                    <DescriptionListDescription>{imageBuild.spec.destination.imageName}</DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Image output tag')}</DescriptionListTerm>
                    <DescriptionListDescription>{imageBuild.spec.destination.imageTag}</DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Image reference URL')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <ImageUrl imageReference={dstImageReference} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Export formats')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {hasExports
                        ? existingImageExports.map((imageExport) => (
                            <Label key={imageExport.spec.format} color="blue" className="pf-v6-u-mr-sm">
                              {getExportFormatLabel(t, imageExport.spec.format)}
                            </Label>
                          ))
                        : t('None')}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </FlightCtlDescriptionList>
              </CardBody>
            </DetailsPageCard>
          </GridItem>
        </Grid>
      </StackItem>
    </Stack>
  );
};

export default ImageBuildDetailsTab;
