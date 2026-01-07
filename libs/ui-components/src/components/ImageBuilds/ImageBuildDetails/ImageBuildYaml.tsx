import * as React from 'react';

import { ImageBuild } from '@flightctl/types/imagebuilder';
import { useTranslation } from '../../../hooks/useTranslation';
import YamlEditor from '../../common/CodeEditor/YamlEditor';
import { ImageBuildWithExports } from '../../../types/extraTypes';

// In the YAML editor, we must have the raw ImageBuild object
// For that reason, we must remove the fields we add to "ImageBuildWithExports"
const ImageBuildYaml = ({ imageBuild, refetch }: { imageBuild: ImageBuildWithExports; refetch: VoidFunction }) => {
  const { t } = useTranslation();
  const rawImageBuild = { ...imageBuild, imageExports: undefined, exportsCount: undefined } as ImageBuild;
  return (
    <YamlEditor
      apiObj={rawImageBuild}
      refetch={refetch}
      disabledEditReason={t('Image builds cannot be edited. Use Retry to create a new image build based on this one.')}
    />
  );
};

export default ImageBuildYaml;
