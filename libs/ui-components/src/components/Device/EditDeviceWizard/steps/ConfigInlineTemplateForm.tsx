import * as React from 'react';
import { FormGroup } from '@patternfly/react-core';

import { useTranslation } from '../../../../hooks/useTranslation';
import { IgnitionFileHelperText } from '../../../common/HelperTextItems';
import TextAreaField from '../../../form/TextAreaField';

type ConfigInlineTemplateFormProps = {
  index: number;
};

const ConfigInlineTemplateForm = ({ index }: ConfigInlineTemplateFormProps) => {
  const { t } = useTranslation();
  return (
    <FormGroup label={t('Inline')} isRequired>
      <TextAreaField name={`configTemplates.${index}.inline`} helperText={<IgnitionFileHelperText />} />
    </FormGroup>
  );
};
export default ConfigInlineTemplateForm;
