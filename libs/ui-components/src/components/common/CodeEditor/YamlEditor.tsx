import * as React from 'react';
import { Alert, AlertActionCloseButton, Stack, StackItem } from '@patternfly/react-core';
import { CodeEditorProps as PfCodeEditorProps } from '@patternfly/react-code-editor';
import { dump, load } from 'js-yaml';
import { compare } from 'fast-json-patch';
import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

import { AuthProvider, Device, Fleet, PatchRequest, Repository, ResourceKind } from '@flightctl/types';
import { ImageBuild } from '@flightctl/types/imagebuilder';
import { fromAPILabel } from '../../../utils/labels';
import { getLabelPatches } from '../../../utils/patch';
import { getErrorMessage, isResourceVersionTestFailure } from '../../../utils/error';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppContext } from '../../../hooks/useAppContext';
import { useFetch } from '../../../hooks/useFetch';
import YamlEditorBase from './YamlEditorBase';

import './YamlEditor.css';

type FlightCtlYamlResource = Fleet | Device | Repository | AuthProvider | ImageBuild;

type YamlEditorProps<R extends FlightCtlYamlResource> = Partial<Omit<PfCodeEditorProps, 'ref' | 'code'>> & {
  /** FlightCtl resource to display in the editor. */
  apiObj: R;
  /** Function to reload the resource */
  refetch: VoidFunction;
  /** Reason why editing is disabled, if applicable */
  disabledEditReason?: string;
  /** Whether the user can edit the resource (controls Save button visibility) */
  canEdit?: boolean;
};

export const convertObjToYAMLString = (obj: unknown) => {
  let yaml = '';
  if (obj) {
    try {
      yaml = dump(obj, { lineWidth: -1 });
    } catch (e) {
      yaml = `# Error converting object to YAML\n# ${getErrorMessage(e)}`;
    }
  }
  return yaml;
};

const getResourceEndpoint = (obj: FlightCtlYamlResource) => {
  const kind = obj.kind as ResourceKind;
  const resourceName = obj.metadata.name || '';
  switch (kind) {
    case ResourceKind.FLEET:
      return `fleets/${resourceName}`;
    case ResourceKind.DEVICE:
      return `devices/${resourceName}`;
    case ResourceKind.REPOSITORY:
      return `repositories/${resourceName}`;
    case ResourceKind.AUTH_PROVIDER:
      return `authproviders/${resourceName}`;
    default:
      throw new Error(`Unsupported resource kind: ${kind}`);
  }
};

const mutablePaths = ['/spec', '/metadata/labels'];
const supportedOps = ['add', 'replace', 'remove', 'test'];

const getFallbackPatches = (original: FlightCtlYamlResource, updated: FlightCtlYamlResource) => {
  let fallbackPatch: PatchRequest = [];

  const originalLabels = original.metadata?.labels || {};
  const updatedLabels = fromAPILabel(updated.metadata?.labels || {});
  const labelPatches = getLabelPatches('/metadata/labels', originalLabels, updatedLabels);

  if (labelPatches.length > 0) {
    fallbackPatch = labelPatches;
  }

  if (JSON.stringify(original.spec) !== JSON.stringify(updated.spec)) {
    fallbackPatch.push({
      op: 'replace',
      path: '/spec',
      value: updated.spec,
    });
  }

  return fallbackPatch;
};

const getFilename = (obj: FlightCtlYamlResource) => {
  let filename: string | undefined;
  if (obj.kind === ResourceKind.DEVICE) {
    filename = obj.metadata.labels?.alias;
  }
  return filename || (obj.metadata.name as string);
};

const createPatchList = (original: FlightCtlYamlResource, updated: FlightCtlYamlResource): PatchRequest => {
  const rawComparePatches = compare(original, updated) as PatchRequest;
  const mutableFieldPatches = rawComparePatches.filter((op) =>
    mutablePaths.some((path: string) => op.path.startsWith(path)),
  );

  const hasOnlySupportedOperations = mutableFieldPatches.every((patch) => supportedOps.includes(patch.op));
  if (hasOnlySupportedOperations) {
    return mutableFieldPatches;
  }

  // Some changes associated with the unsupported operations could be lost.
  // To prevent that, we'll use a fallback that patches the top-level mutable fields that were modified.
  return getFallbackPatches(original, updated);
};

const YamlEditor = <R extends FlightCtlYamlResource>({
  apiObj,
  refetch,
  disabledEditReason,
  canEdit = true,
}: YamlEditorProps<R>) => {
  const [yaml, setYaml] = React.useState<string>(convertObjToYAMLString(apiObj));
  const [yamlResourceVersion, setYamlResourceVersion] = React.useState<string>(apiObj.metadata.resourceVersion || '0');
  const [doUpdate, setDoUpdate] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [saveError, setSaveError] = React.useState<{ hasConflict: boolean; message: string } | undefined>(undefined);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = React.useState<boolean>(false);
  const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);

  const {
    router: { useNavigate },
  } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { patch } = useFetch();

  const resourceName = getFilename(apiObj);
  const needsReload = yamlResourceVersion !== apiObj.metadata.resourceVersion;

  React.useEffect(() => {
    if (doUpdate) {
      const newYaml = convertObjToYAMLString(apiObj);
      setYaml(newYaml);
      // When users click reload, we force Monaco Editor to update its content
      if (editorRef.current) {
        editorRef.current.setValue(newYaml);
      }
      setYamlResourceVersion(apiObj.metadata.resourceVersion || '0');
      setDoUpdate(false);
    }
  }, [doUpdate, apiObj]);

  const handleSave = async (updatedYaml: string | undefined) => {
    if (!updatedYaml) {
      return;
    }

    let updatedObj: R;
    try {
      updatedObj = load(updatedYaml) as R;
    } catch (error) {
      setSaveError({ hasConflict: false, message: getErrorMessage(error) });
      return;
    }

    setSaveError(undefined);
    setIsSavedSuccessfully(false);
    setIsSaving(true);

    try {
      const patchList = createPatchList(apiObj, updatedObj);
      if (patchList.length === 0) {
        // TODO - Check with UX team if the user should be aware that there are no valid changes
        return;
      }
      // This operation ensures that the patch only succeeds if we are updating the latest resourceVersion
      patchList.unshift({
        op: 'test',
        path: '/metadata/resourceVersion',
        value: yamlResourceVersion,
      });

      const endpoint = getResourceEndpoint(apiObj);
      const resultObject = await patch<R>(endpoint, patchList);
      const newResourceVersion = resultObject.metadata?.resourceVersion || 'unknown';

      setYaml(convertObjToYAMLString(resultObject));
      setYamlResourceVersion(newResourceVersion);
      setIsSavedSuccessfully(true);

      refetch();
    } catch (error) {
      const hasResourceConflict = isResourceVersionTestFailure(error);
      if (hasResourceConflict) {
        setSaveError({ hasConflict: true, message: '' });
      } else {
        setSaveError({ hasConflict: false, message: getErrorMessage(error) });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fctl-yaml-editor">
      <YamlEditorBase
        filename={resourceName}
        code={yaml}
        onCancel={() => {
          navigate('../.');
        }}
        onReload={() => {
          refetch();
          setIsSavedSuccessfully(false);
          setSaveError(undefined);
          setDoUpdate(true);
        }}
        onSave={canEdit ? handleSave : undefined}
        isSaving={isSaving}
        disabledEditReason={canEdit ? disabledEditReason : undefined}
        editorRef={editorRef}
      />

      {isSavedSuccessfully && (
        <Alert
          isInline
          variant="success"
          title={t('{{ resourceName }} has been updated to version {{ version }}', {
            resourceName,
            version: yamlResourceVersion,
          })}
          actionClose={<AlertActionCloseButton onClose={() => setIsSavedSuccessfully(false)} />}
        />
      )}

      {saveError && (
        <Alert isInline variant="danger" title={t('Yaml could not be saved')}>
          {saveError.hasConflict ? (
            <Stack>
              <StackItem>{t('A newer version of the resource has been detected.')}</StackItem>
              <StackItem>
                {t(
                  'First, copy your changes to a safe location, then click ʼReloadʼ to get the latest version, and reapply your changes.',
                )}
              </StackItem>
            </Stack>
          ) : (
            <Stack hasGutter>
              <StackItem>
                {t('The current YAML is invalid. Fix the errors, or click ʼReloadʼ to discard your changes.')}
              </StackItem>
              <StackItem>{saveError.message}</StackItem>
            </Stack>
          )}
        </Alert>
      )}

      {needsReload && (
        <Alert isInline variant="info" title={t('This object has been updated.')}>
          {t('Click reload to see the new version.')}
        </Alert>
      )}
    </div>
  );
};

export default YamlEditor;
