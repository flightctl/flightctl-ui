import * as React from 'react';
import { Button, FormGroup, Grid, Label, LabelGroup, Split, SplitItem } from '@patternfly/react-core';
import { FieldArray, useField, useFormikContext } from 'formik';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons';

import { useTranslation } from '../../../hooks/useTranslation';
import EditableLabelControl from '../../common/EditableLabelControl';
import ExpandableFormSection from '../../form/ExpandableFormSection';
import ErrorHelperText from '../../form/FieldHelperText';
import TextField from '../../form/TextField';
import { type RepositoryFormValues } from './types';

const TagsField = ({
  index,
  onAdd,
  onRemove,
  onEdit,
}: {
  index: number;
  onAdd: (tag: string) => void;
  onRemove: (idx: number) => void;
  onEdit: (idx: number, tag: string) => void;
}) => {
  const { t } = useTranslation();
  const [{ value }, meta] = useField<string[] | undefined>(`ociConfig.baseImages.${index}.tags`);
  return (
    <>
      <LabelGroup
        numLabels={5}
        isEditable
        addLabelControl={<EditableLabelControl defaultLabel="tag" addButtonText={t('Add tag')} onAddLabel={onAdd} />}
      >
        {value?.map((tag, idx) => (
          <Label
            key={idx}
            title={tag}
            isEditable
            onClose={() => onRemove(idx)}
            onEditComplete={(_, newText) => {
              onEdit(idx, newText);
            }}
          >
            {tag}
          </Label>
        ))}
      </LabelGroup>
      <ErrorHelperText meta={meta} touchRequired={false} />
    </>
  );
};

const OciBaseImagesSection = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<RepositoryFormValues>();

  return (
    <FieldArray name="ociConfig.baseImages">
      {(arrayHelpers) => (
        <>
          <FormGroup label={t('Base images')}>
            {values.ociConfig?.baseImages?.map((baseImage, index) => (
              <Split hasGutter key={index}>
                <SplitItem isFilled>
                  <ExpandableFormSection
                    title={
                      baseImage.displayName || baseImage.imageName || t('Base image {{ idx }}', { idx: index + 1 })
                    }
                    fieldName={`ociConfig.baseImages.${index}`}
                  >
                    <Grid hasGutter>
                      <FormGroup label={t('Display name')}>
                        <TextField name={`ociConfig.baseImages.${index}.displayName`} aria-label={t('Display name')} />
                      </FormGroup>
                      <FormGroup label={t('Image name')} isRequired>
                        <TextField
                          name={`ociConfig.baseImages.${index}.imageName`}
                          aria-label={t('Image name')}
                          isRequired
                        />
                      </FormGroup>
                      <FormGroup label={t('Tags')} isRequired>
                        <FieldArray name={`ociConfig.baseImages.${index}.tags`}>
                          {(tagArrayHelpers) => (
                            <TagsField
                              index={index}
                              onAdd={(tag) => tagArrayHelpers.push(tag)}
                              onEdit={(idx, tag) => tagArrayHelpers.replace(idx, tag)}
                              onRemove={(idx) => tagArrayHelpers.remove(idx)}
                            />
                          )}
                        </FieldArray>
                      </FormGroup>
                    </Grid>
                  </ExpandableFormSection>
                </SplitItem>
                <SplitItem>
                  <Button
                    aria-label={t('Remove base image')}
                    variant="link"
                    icon={<MinusCircleIcon />}
                    iconPosition="start"
                    onClick={() => arrayHelpers.remove(index)}
                  />
                </SplitItem>
              </Split>
            ))}
          </FormGroup>
          <Button
            style={{ marginRight: 'auto' }}
            variant="link"
            icon={<PlusCircleIcon />}
            iconPosition="start"
            onClick={() =>
              arrayHelpers.push({
                displayName: '',
                imageName: '',
                tags: [],
              })
            }
          >
            {t('Add base image')}
          </Button>
        </>
      )}
    </FieldArray>
  );
};

export default OciBaseImagesSection;
