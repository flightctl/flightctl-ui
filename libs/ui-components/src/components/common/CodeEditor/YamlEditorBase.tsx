import * as React from 'react';
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import { ActionGroup, Button, Tooltip } from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { DownloadIcon } from '@patternfly/react-icons/dist/js/icons/download-icon';
import { saveAs } from 'file-saver';
import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

import ErrorBoundary from '../ErrorBoundary';
import FlightCtlForm from '../../form/FlightCtlForm';
import { useTranslation } from '../../../hooks/useTranslation';
import { useThemePreferences } from '../../../hooks/useThemePreferences';
// TODO add useShortcutPopover when adding saving capabilities to the YAML editor
import { defineConsoleThemes } from './CodeEditorTheme';

import './YamlEditorBase.css';

// Avoid using monaco from CDN
loader.config({ monaco });

type Monaco = typeof monacoEditor;
type YamlEditorBaseProps = {
  filename?: string;
  code?: string;
  onCancel?: VoidFunction;
  onReload?: VoidFunction;
  onSave?: (yamlContent: string | undefined) => Promise<void>;
  isSaving: boolean;
  disabledEditReason?: string;
  editorRef?: React.MutableRefObject<monacoEditor.editor.IStandaloneCodeEditor | null>;
  readOnly?: boolean;
  showActions?: boolean;
  onChange?: (val: string) => void;
};

const YamlEditorBase = ({
  filename,
  code,
  onCancel,
  onReload,
  onSave,
  isSaving,
  disabledEditReason,
  editorRef,
  readOnly = false,
  showActions = true,
  onChange,
}: YamlEditorBaseProps) => {
  const { t } = useTranslation();
  const monacoRef = React.useRef<typeof monacoEditor | null>(null);
  const saveButtonRef = React.useRef<HTMLButtonElement>(null);
  const { resolvedTheme } = useThemePreferences();

  const [editorMounted, setEditorMounted] = React.useState(false);

  const downloadYaml = () => {
    const resource = editorRef?.current?.getValue();
    if (resource) {
      const blob = new Blob([resource], { type: 'text/yaml;charset=utf-8' });
      saveAs(blob, `${filename}.yaml`);
    }
  };

  const handleSave = async () => {
    if (onSave) {
      const yamlContent = editorRef?.current?.getValue();
      await onSave(yamlContent);
    }
  };

  // recalculate bounds when viewport is changed
  React.useEffect(() => {
    const handleResize = () => {
      const editors = monacoRef.current?.editor?.getEditors();
      editors?.forEach((editor) => {
        editor.layout({ width: 0, height: 0 });
        editor.layout();
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (editorMounted) {
      // Prevent all brackets/curly braces by being highlighted by default
      monaco.languages.setLanguageConfiguration('yaml', {
        colorizedBracketPairs: [],
      });
    }
  }, [editorMounted]);

  return (
    <ErrorBoundary>
      <FlightCtlForm>
        <CodeEditor
          className="fctl-yaml-editor-base"
          copyButtonAriaLabel={t('Copy to clipboard')}
          copyButtonSuccessTooltipText={t('Content copied to clipboard')}
          copyButtonToolTipText={t('Copy to clipboard')}
          downloadButtonAriaLabel={t('Download yaml')}
          downloadButtonToolTipText={t('Download yaml')}
          shortcutsPopoverButtonText={t('View shortcuts')}
          emptyStateBody={t('Drag and drop a file or upload one.')}
          emptyStateButton={t('Browse')}
          emptyStateLink={t('Start from scratch')}
          emptyStateTitle={t('Start editing')}
          language={Language.yaml}
          code={code}
          onEditorDidMount={(editor: monacoEditor.editor.IStandaloneCodeEditor, instance: Monaco) => {
            setEditorMounted(true);
            defineConsoleThemes(instance);
            monacoRef.current = instance;
            if (editorRef) {
              editorRef.current = editor;
            }
          }}
          options={{
            theme: `console-${resolvedTheme}`,
            readOnly: readOnly || !!disabledEditReason,
          }}
          onChange={(val) => onChange?.(val)}
        />
        {showActions && (
          <ActionGroup className="fctl-yaml-editor-base__action-group">
            {onSave && (
              <>
                {disabledEditReason && <Tooltip content={disabledEditReason} triggerRef={saveButtonRef} />}
                <Button
                  ref={saveButtonRef}
                  variant="primary"
                  aria-label={t('Save')}
                  onClick={handleSave}
                  isLoading={isSaving}
                  isAriaDisabled={isSaving || !!disabledEditReason}
                >
                  {t('Save')}
                </Button>
              </>
            )}
            {onReload && (
              <Button variant="secondary" aria-label={t('Reload')} onClick={onReload}>
                {t('Reload')}
              </Button>
            )}
            {onCancel && (
              <Button variant="secondary" aria-label={t('Cancel')} onClick={onCancel}>
                {t('Cancel')}
              </Button>
            )}
            {filename && (
              <Button
                icon={<DownloadIcon />}
                type="submit"
                variant="secondary"
                className="pf-v6-u-ml-auto"
                aria-label={t('Download')}
                onClick={downloadYaml}
              >
                {t('Download')}
              </Button>
            )}
          </ActionGroup>
        )}
      </FlightCtlForm>
    </ErrorBoundary>
  );
};

export default YamlEditorBase;
