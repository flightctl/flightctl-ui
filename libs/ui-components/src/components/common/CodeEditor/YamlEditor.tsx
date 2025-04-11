import * as React from 'react';
import { Alert } from '@patternfly/react-core';
import { CodeEditorProps as PfCodeEditorProps } from '@patternfly/react-code-editor';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { dump } from 'js-yaml';

import { Device, Fleet, Repository } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppContext } from '../../../hooks/useAppContext';
import YamlEditorBase from './YamlEditorBase';

import './YamlEditor.css';

type FlightCtlYamlResource = Fleet | Device | Repository;

type YamlEditorProps<R extends FlightCtlYamlResource> = Partial<Omit<PfCodeEditorProps, 'ref' | 'code'>> & {
  /** FlightCtl resource to display in the editor. */
  apiObj: R;
  /** Filename to use when YAML is downloaded */
  filename: string;
  /** Function to reload the resource */
  refetch?: VoidFunction;
};

const convertObjToYAMLString = (obj: FlightCtlYamlResource) => {
  let yaml = '';
  if (obj) {
    try {
      yaml = dump(obj, { lineWidth: -1 });
    } catch (e) {
      yaml = `# Error converting object to YAML\n# ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  return yaml;
};

const YamlEditor = <R extends FlightCtlYamlResource>({ filename, apiObj, refetch }: YamlEditorProps<R>) => {
  const [yaml, setYaml] = React.useState<string>(convertObjToYAMLString(apiObj));
  const [resourceVersion, setResourceVersion] = React.useState<string>(apiObj.metadata.resourceVersion || '0');
  const [doUpdate, setDoUpdate] = React.useState<boolean>(false);
  const [monacoRef, setMonacoRef] = React.useState<typeof monacoEditor | null>(null);

  const {
    router: { useNavigate },
  } = useAppContext();
  const navigate = useNavigate();

  let hasChanged = false;
  let onReload: VoidFunction | undefined;
  if (refetch) {
    hasChanged = resourceVersion !== apiObj.metadata.resourceVersion;
    onReload = () => {
      void refetch();
      setDoUpdate(true);
    };
  }

  React.useEffect(() => {
    if (doUpdate) {
      setYaml(convertObjToYAMLString(apiObj));
      setResourceVersion(apiObj.metadata.resourceVersion || '0');
      setDoUpdate(false);
    }
  }, [doUpdate, apiObj]);

  const { t } = useTranslation();

  // recalculate bounds when viewport is changed
  const handleResize = React.useCallback(() => {
    const editors = monacoRef?.editor?.getEditors();
    editors?.forEach((editor) => {
      editor.layout({ width: 0, height: 0 });
      editor.layout();
    });
  }, [monacoRef]);

  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return (
    <div className="fctl-yaml-editor">
      <YamlEditorBase
        filename={filename}
        code={yaml}
        onCancel={() => {
          navigate('../.');
        }}
        onReload={onReload}
        onEditorDidMount={setMonacoRef}
      />

      {hasChanged && (
        <Alert isInline variant="info" title={t('This object has been updated.')}>
          {t('Click reload to see the new version.')}
        </Alert>
      )}
    </div>
  );
};

export default YamlEditor;
