import * as React from 'react';

import { useTranslation } from '../../../../hooks/useTranslation';
import { useAppLinks } from '../../../../hooks/useAppLinks';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import LearnMoreLink from '../../../common/LearnMoreLink';

import ImageOrCatalogRefField from '../../../form/ImageOrCatalogRefField';

const CreateImageContent = () => {
  const { t } = useTranslation();
  const createAppLink = useAppLinks('createApp');
  return (
    <span>
      {t('The application image. Learn how to create one')} <LearnMoreLink text={t('here')} link={createAppLink} />
    </span>
  );
};

const ApplicationImageForm = ({
  applicationName,
  isRequired,
  groupContent,
  isReadOnly,
}: {
  applicationName: string;
  isRequired?: boolean;
  groupContent?: React.ReactNode;
  isReadOnly?: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <FormGroupWithHelperText
      label={t('Image')}
      content={groupContent || <CreateImageContent />}
      isRequired={isRequired}
    >
      <ImageOrCatalogRefField
        name={`${applicationName}.imageSpec`}
        aria-label={t('Image')}
        helperText={t('Provide a valid image reference')}
        isDisabled={isReadOnly}
      />
    </FormGroupWithHelperText>
  );
};

export default ApplicationImageForm;
