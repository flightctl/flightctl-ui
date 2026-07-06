import * as React from 'react';
import {
  Alert,
  CardBody,
  CardTitle,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Icon,
  Label,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { TFunction, Trans } from 'react-i18next';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';

import { BindingType, ImagePromotion } from '@flightctl/types/imagebuilder';
import ImagePromotionModal from '../../ImagePromotion/ImagePromotionModal';
import ImagePromotionStatus from '../../ImagePromotion/ImagePromotionStatus';
import { getDateDisplay } from '../../../utils/dates';
import { getExportFormatLabel, getImageReference } from '../../../utils/imageBuilds';
import { useTranslation } from '../../../hooks/useTranslation';
import DetailsPageCard from '../../DetailsPage/DetailsPageCard';
import { CERTIFICATE_VALIDITY_IN_YEARS } from '../../../constants';
import { ImageBuildWithExports } from '../../../types/extraTypes';
import { useOciRegistriesContext } from '../OciRegistriesContext';
import { ImageBuildStatusDisplay } from '../ImageBuildAndExportStatus';
import ImageUrl from '../ImageUrl';
import { getErrorMessage } from '../../../utils/error';
import Table from '../../Table/Table';
import { ActionsColumn, IAction, Tbody, Td, Tr } from '@patternfly/react-table';
import TablePagination from '../../Table/TablePagination';
import { getResourceId } from '../../../utils/resource';
import DeleteImagePromotionModal from '../../ImagePromotion/DeleteImagePromotionModal';
import { usePermissionsContext } from '../../common/PermissionsContext';
import { RESOURCE, VERB } from '../../../types/rbac';
import { useImagePromotionsContext } from '../ImagePromotionsContext';

const detailsPermissions = [
  { kind: RESOURCE.IMAGE_PROMOTION, verb: VERB.LIST },
  { kind: RESOURCE.IMAGE_PROMOTION, verb: VERB.UPDATE },
  { kind: RESOURCE.IMAGE_PROMOTION, verb: VERB.DELETE },
];

const ImagePromotionRow = ({
  imagePromotion,
  onDeleteClick,
  onEditClick,
  canEditPromotions,
  canDeletePromotions,
}: {
  imagePromotion: ImagePromotion;
  onDeleteClick: VoidFunction;
  onEditClick: VoidFunction;
  canEditPromotions: boolean;
  canDeletePromotions: boolean;
}) => {
  const { t } = useTranslation();

  const actions: IAction[] = [
    ...(canEditPromotions
      ? [
          {
            title: t('Edit image promotion'),
            onClick: onEditClick,
          },
        ]
      : []),
    ...(canDeletePromotions
      ? [
          {
            title: t('Delete image promotion'),
            onClick: onDeleteClick,
          },
        ]
      : []),
  ];

  return (
    <Tr>
      <Td dataLabel={t('Name')}>{imagePromotion.metadata.name || ''}</Td>
      <Td dataLabel={t('Target catalog')}>{imagePromotion.spec.target.catalogName}</Td>
      <Td dataLabel={t('Target catalog item')}>{imagePromotion.spec.target.catalogItemName}</Td>

      <Td dataLabel={t('Status')}>
        <ImagePromotionStatus promotion={imagePromotion} />
      </Td>
      {!!actions.length && (
        <Td isActionCell>
          <ActionsColumn items={actions} />
        </Td>
      )}
    </Tr>
  );
};

const getImagePromotionsTableColumns = (t: TFunction) => [
  {
    name: t('Name'),
  },
  {
    name: t('Target catalog'),
  },
  {
    name: t('Target catalog item'),
  },
  {
    name: t('Status'),
  },
];

const ImagePromotionsCard = ({
  imageBuild,
  canEditPromotions,
  canDeletePromotions,
}: {
  imageBuild: ImageBuildWithExports;
  canEditPromotions: boolean;
  canDeletePromotions: boolean;
}) => {
  const { t } = useTranslation();

  const { error, isLoading, isUpdating, pagination, imagePromotions, refetchPromotions } = useImagePromotionsContext();

  const [promotionToDeleteId, setPromotionToDeleteId] = React.useState<string>();
  const [promotionToEditId, setPromotionToEditId] = React.useState<string>();

  let content: React.ReactNode;
  if (error) {
    content = (
      <Alert title={t('Failed to fetch image promotions')} variant="danger" isInline>
        {getErrorMessage(error)}
      </Alert>
    );
  } else if (isLoading) {
    content = <Spinner />;
  } else if (!imagePromotions.length) {
    content = <Content component={ContentVariants.small}>{t('No image promotions yet')}</Content>;
  } else {
    content = (
      <>
        <Table aria-label={t('ImagePromotions table')} loading={isUpdating} columns={getImagePromotionsTableColumns(t)}>
          <Tbody>
            {imagePromotions.map((promotion) => (
              <ImagePromotionRow
                key={getResourceId(promotion)}
                imagePromotion={promotion}
                onEditClick={() => setPromotionToEditId(promotion.metadata.name)}
                onDeleteClick={() => setPromotionToDeleteId(promotion.metadata.name)}
                canEditPromotions={canEditPromotions}
                canDeletePromotions={canDeletePromotions}
              />
            ))}
          </Tbody>
        </Table>
        <TablePagination pagination={pagination} isUpdating={isUpdating} />
      </>
    );
  }

  const promotionToDelete = imagePromotions.find((p) => p.metadata.name === promotionToDeleteId);
  const promotionToEdit = imagePromotions.find((p) => p.metadata.name === promotionToEditId);

  return (
    <DetailsPageCard>
      <CardTitle>{t('Image promotions')}</CardTitle>
      <CardBody>{content}</CardBody>
      {promotionToDelete && (
        <DeleteImagePromotionModal
          promotion={promotionToDelete}
          onClose={(hasDeleted?: boolean) => {
            if (hasDeleted) {
              refetchPromotions();
            }
            setPromotionToDeleteId(undefined);
          }}
        />
      )}
      {promotionToEdit && (
        <ImagePromotionModal
          imageBuild={imageBuild}
          imagePromotion={promotionToEdit}
          onClose={(updated) => {
            setPromotionToEditId(undefined);
            if (updated) {
              refetchPromotions();
            }
          }}
        />
      )}
    </DetailsPageCard>
  );
};

const ImageBuildDetailsTab = ({ imageBuild }: { imageBuild: ImageBuildWithExports }) => {
  const { t } = useTranslation();
  const { checkPermissions } = usePermissionsContext();
  const [canListPromotions, canEditPromotions, canDeletePromotions] = checkPermissions(detailsPermissions);
  const srcRepositoryName = imageBuild.spec.source.repository;
  const dstRepositoryName = imageBuild.spec.destination.repository;

  const { ociRegistries } = useOciRegistriesContext();
  const isEarlyBinding = imageBuild.spec.binding.type === BindingType.BindingTypeEarly;

  const existingImageExports = imageBuild.imageExports.filter((imageExport) => imageExport !== undefined);
  const hasExports = existingImageExports.length > 0;

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
                <DescriptionList isCompact isHorizontal>
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
                </DescriptionList>
              </CardBody>
            </DetailsPageCard>
          </GridItem>
          <GridItem span={6}>
            <DetailsPageCard>
              <CardTitle>{t('Registration')}</CardTitle>
              <CardBody>
                <DescriptionList isHorizontal isCompact>
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
                </DescriptionList>
              </CardBody>
            </DetailsPageCard>
          </GridItem>
          <GridItem span={6}>
            <DetailsPageCard>
              <CardTitle>{t('Source image')}</CardTitle>
              <CardBody>
                <DescriptionList isCompact isHorizontal>
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
                </DescriptionList>
              </CardBody>
            </DetailsPageCard>
          </GridItem>
          <GridItem span={6}>
            <DetailsPageCard>
              <CardTitle>{t('Image output')}</CardTitle>
              <CardBody>
                <DescriptionList isCompact isHorizontal>
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
                </DescriptionList>
              </CardBody>
            </DetailsPageCard>
          </GridItem>
          {canListPromotions && (
            <GridItem>
              <ImagePromotionsCard
                imageBuild={imageBuild}
                canEditPromotions={canEditPromotions}
                canDeletePromotions={canDeletePromotions}
              />
            </GridItem>
          )}
        </Grid>
      </StackItem>
    </Stack>
  );
};

export default ImageBuildDetailsTab;
