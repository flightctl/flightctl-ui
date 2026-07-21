import * as React from 'react';
import {
  Alert,
  Button,
  Content,
  ContentVariants,
  FormGroup,
  FormHelperText,
  FormSection,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { FormikErrors, useField, useFormikContext } from 'formik';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { EyeIcon } from '@patternfly/react-icons/dist/js/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/js/icons/eye-slash-icon';
import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

import { PUBLIC_KEY_MAX_LENGTH, validateSshPublicKey } from '../../../form/validations';
import { useTranslation } from '../../../../hooks/useTranslation';
import { DeviceSpecConfigFormValues, PortMapping, VmAppForm } from '../../../../types/deviceSpec';
import TextField from '../../../form/TextField';
import { DefaultHelperText } from '../../../form/FieldHelperText';
import TextAreaField from '../../../form/TextAreaField';
import SwitchField from '../../../form/SwitchField';
import NumberField from '../../../form/NumberField';
import UploadField from '../../../form/UploadField';
import ApplicationPortMappingField from '../../../form/ApplicationPortMappingField';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import YamlEditorBase from '../../../common/CodeEditor/YamlEditorBase';
import FlightCtlModal from '../../../common/FlightCtlModal';
import '../../../common/CodeEditor/YamlEditor.css';
import {
  buildCloudInitUserData,
  parseVmCloudInitUserData,
  stripCredentialLinesFromCloudInit,
} from '../../../../utils/vmApplications';

type ViewMode = 'form' | 'yaml';

const ApplicationVmForm = ({ index, isReadOnly }: { index: number; isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const appFieldName = `applications[${index}]`;
  const [{ value: app }, { error: appErrors }, { setValue }] = useField<VmAppForm>(appFieldName);
  const { setFieldValue, setFieldTouched, validateForm } = useFormikContext<DeviceSpecConfigFormValues>();
  const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const suppressSyncRef = React.useRef(false);
  const didInitialCredentialValidationRef = React.useRef(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSwitchToFormModalOpen, setIsSwitchToFormModalOpen] = React.useState(false);

  const cloudInitFieldName = `${appFieldName}.cloudInit`;
  const sshPublicKeyFieldName = `${appFieldName}.sshPublicKey`;
  const vmYamlMetaError =
    typeof appErrors === 'object' && appErrors !== null && 'vmYaml' in appErrors
      ? (appErrors as FormikErrors<VmAppForm>).vmYaml
      : undefined;

  const touchInvalidCloudInitCredentials = React.useCallback(() => {
    const parsed = parseVmCloudInitUserData(app.cloudInit);
    if (parsed.enableSshKey && parsed.sshPublicKey && validateSshPublicKey(parsed.sshPublicKey, t)) {
      setFieldTouched(cloudInitFieldName, true, false);
      setFieldTouched(sshPublicKeyFieldName, true, false);
    }
  }, [app.cloudInit, cloudInitFieldName, setFieldTouched, sshPublicKeyFieldName, t]);

  React.useEffect(() => {
    if (didInitialCredentialValidationRef.current) {
      return;
    }
    didInitialCredentialValidationRef.current = true;
    touchInvalidCloudInitCredentials();
    void validateForm();
  }, [touchInvalidCloudInitCredentials, validateForm]);

  const updateField = <K extends keyof VmAppForm>(field: K, value: VmAppForm[K]) => {
    setValue({ ...app, [field]: value }, false);
  };

  React.useEffect(() => {
    if (!app || suppressSyncRef.current) {
      suppressSyncRef.current = false;
      return;
    }
    const userBase = stripCredentialLinesFromCloudInit(app.cloudInit || '');
    const merged = buildCloudInitUserData(userBase, {
      enableSshKey: app.enableSshKey,
      sshPublicKey: app.sshPublicKey || '',
      enablePassword: app.enablePassword,
      password: app.password || '',
    });
    if (merged !== (app.cloudInit || '')) {
      updateField('cloudInit', merged);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.enableSshKey, app?.sshPublicKey, app?.enablePassword, app?.password]);

  const handleCloudInitCustom = (val: string) => {
    const parsed = parseVmCloudInitUserData(val);
    suppressSyncRef.current = true;

    const credentialUpdates = parsed.documentParsed
      ? {
          enableSshKey: parsed.enableSshKey,
          sshPublicKey: parsed.sshPublicKey,
          enablePassword: parsed.enablePassword,
          password: parsed.password,
        }
      : {};

    void setFieldValue(
      appFieldName,
      {
        ...app,
        cloudInit: val,
        ...credentialUpdates,
      },
      false,
    ).then(() => {
      if (parsed.documentParsed && parsed.enableSshKey) {
        setFieldTouched(sshPublicKeyFieldName, true, false);
      }
      if (parsed.documentParsed && parsed.enablePassword) {
        setFieldTouched(`${appFieldName}.password`, true, false);
      }
      return validateForm();
    });
  };

  const handleModeChange = (mode: ViewMode) => {
    if (mode === app.configMode) {
      return;
    }
    if (mode === 'form' && app.configMode === 'yaml' && app.hasAdvancedVmSettings) {
      setIsSwitchToFormModalOpen(true);
      return;
    }
    updateField('configMode', mode);
  };

  const confirmSwitchToForm = () => {
    updateField('configMode', 'form');
    setIsSwitchToFormModalOpen(false);
  };

  const ports = app.publishPorts ?? [];

  return (
    <>
      <FormGroupWithHelperText
        label={t('Application name')}
        content={t('The unique identifier for this application. Must be lowercase alphanumeric with hyphens.')}
        isRequired
      >
        <TextField
          aria-label={t('VM name')}
          name={`${appFieldName}.name`}
          isDisabled={isReadOnly}
          placeholder={t('e.g. edge-analytics')}
        />
      </FormGroupWithHelperText>

      <FormGroup fieldId={`${appFieldName}-config-mode`}>
        <ToggleGroup aria-label={t('Configuration mode')}>
          <ToggleGroupItem
            text={t('Form')}
            buttonId={`${appFieldName}-form-mode`}
            isSelected={app.configMode === 'form'}
            isDisabled={isReadOnly}
            onChange={() => handleModeChange('form')}
          />
          <ToggleGroupItem
            text={t('YAML')}
            buttonId={`${appFieldName}-yaml-mode`}
            isSelected={app.configMode === 'yaml'}
            isDisabled={isReadOnly}
            onChange={() => handleModeChange('yaml')}
          />
        </ToggleGroup>
        <HelperText className="pf-v6-u-mt-sm">
          <HelperTextItem>
            {t(
              'Use Form for standard Linux VMs. Use YAML for advanced configurations such as Windows VMs or custom KubeVirt setups that require additional spec fields.',
            )}
          </HelperTextItem>
        </HelperText>
      </FormGroup>

      {app.configMode === 'yaml' && app.hasAdvancedVmSettings && (
        <Alert isInline variant="warning" title={t('Advanced YAML configuration detected')}>
          {t(
            'This VM uses settings that are not supported in form view. YAML mode is selected to preserve the full configuration. Editing in form view may overwrite these custom settings.',
          )}
        </Alert>
      )}

      {app.configMode === 'form' ? (
        <>
          <FormGroup
            label={t('Disk image (OCI)')}
            content={t('OCI container image containing the VM disk.')}
            isRequired
          >
            <TextField
              aria-label={t('Disk image (OCI)')}
              name={`${appFieldName}.diskImage`}
              isDisabled={isReadOnly}
              placeholder={t('e.g. quay.io/containerdisks/fedora:latest', { nsSeparator: '|' })}
              helperText={t('OCI container image containing the VM disk.')}
            />
          </FormGroup>

          <FormGroupWithHelperText
            label={t('CPU cores')}
            content={t(
              'Number of virtual CPU cores (vCPU) assigned to this VM. Each core maps to one thread on the host device. Should not exceed the physical cores available on the target device.',
            )}
            isRequired
          >
            <NumberField
              aria-label={t('CPU cores')}
              name={`${appFieldName}.cpuCores`}
              min={1}
              isDisabled={isReadOnly}
            />
          </FormGroupWithHelperText>

          <FormGroupWithHelperText
            label={t('Memory')}
            content={t('Memory allocated to the VM using KubeVirt units. Examples: "2Gi", "512Mi", "4294967296".')}
            isRequired
          >
            <TextField
              aria-label={t('Memory')}
              name={`${appFieldName}.memory`}
              value={app.memory || ''}
              placeholder={t('Enter numeric value with optional unit')}
              isDisabled={isReadOnly}
              helperText={t('Provide a valid KubeVirt memory value (e.g., "2Gi", "512Mi", "4294967296").')}
            />
          </FormGroupWithHelperText>

          <FormGroup label={t('Cloud-init user data')} fieldId={`${appFieldName}-cloud-init`}>
            <TextAreaField
              name={cloudInitFieldName}
              aria-label={t('Cloud-init user data')}
              placeholder={`#cloud-config\npackage_update: true\npackages:\n  - nginx`}
              rows={6}
              resizeOrientation="vertical"
              minHeight="auto"
              isDisabled={isReadOnly}
              helperText={t(
                'Cloud-init user data in YAML format. Applied on first boot only. SSH key and password entries in this field are managed by the Credentials section below and may be overwritten when toggling those options.',
              )}
              onChangeCustom={handleCloudInitCustom}
            />

            <FormSection title={t('Credentials')}>
              <Content component={ContentVariants.small}>
                {t(
                  'Credentials are applied through cloud-init on first boot only. Changes here will take effect on newly created VMs but will not update VMs already running on existing devices. To update credentials on a running VM, access it directly through the console.',
                )}
              </Content>

              <SwitchField
                name={`${appFieldName}.enableSshKey`}
                label={
                  <>
                    <span>{t('SSH public key')}</span>
                    <DefaultHelperText
                      helperText={t(
                        "Add a public SSH key to enable direct SSH access to the application's VM. Requires publishing the SSH port to the host device.",
                      )}
                    />
                  </>
                }
                isDisabled={isReadOnly}
              />
              {app.enableSshKey && (
                <FormGroup
                  label={t('SSH public key')}
                  fieldId={`${appFieldName}-ssh-key`}
                  className="pf-v6-u-ml-md"
                  isRequired
                >
                  <UploadField
                    name={sshPublicKeyFieldName}
                    ariaLabel={t('SSH public key')}
                    maxFileBytes={PUBLIC_KEY_MAX_LENGTH}
                    isRequired
                    isDisabled={isReadOnly}
                  />
                </FormGroup>
              )}

              <SwitchField
                name={`${appFieldName}.enablePassword`}
                label={
                  <>
                    <span>{t('Password')}</span>
                    <DefaultHelperText
                      helperText={t(
                        'Sets a login password via cloud-init, required for serial console access. If not configured, the default credentials from the OS image apply (if any).',
                      )}
                    />
                  </>
                }
                isDisabled={isReadOnly}
              />
              {app.enablePassword && (
                <FormGroup
                  label={t('Password')}
                  fieldId={`${appFieldName}-password`}
                  isRequired
                  className="pf-v6-u-ml-md"
                >
                  <InputGroup>
                    <InputGroupItem isFill>
                      <TextField
                        name={`${appFieldName}.password`}
                        aria-label={t('Password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('Enter password')}
                        isDisabled={isReadOnly}
                        style={{ width: '100%' }}
                      />
                    </InputGroupItem>
                    <InputGroupItem>
                      <Button
                        variant="control"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? t('Show password') : t('Hide password')}
                        icon={showPassword ? <EyeIcon aria-hidden /> : <EyeSlashIcon aria-hidden />}
                        isDisabled={isReadOnly}
                      />
                    </InputGroupItem>
                  </InputGroup>
                </FormGroup>
              )}
            </FormSection>
          </FormGroup>
        </>
      ) : (
        <FormGroup label={t('VirtualMachine YAML')} fieldId={`${appFieldName}-yaml`}>
          <div className="fctl-yaml-editor">
            <YamlEditorBase
              showActions={false}
              isSaving={false}
              code={app.vmYaml}
              editorRef={editorRef}
              readOnly={isReadOnly}
              onChange={(val) => updateField('vmYaml', val)}
              height="400px"
            />
          </div>
          <HelperText>
            <HelperTextItem>
              {t(
                'Edit the VirtualMachine manifest directly. This YAML is applied as-is. Application name and port mappings are configured separately above and below.',
              )}
            </HelperTextItem>
          </HelperText>
          {vmYamlMetaError && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem icon={<ExclamationCircleIcon />} variant="error">
                  {vmYamlMetaError}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
      )}

      <ApplicationPortMappingField
        ports={ports}
        onChange={(newPorts) => updateField('publishPorts', newPorts as Required<PortMapping>[])}
        isReadOnly={isReadOnly}
        description={t('Map ports from inside the VM to the host device.')}
        targetPortAriaLabel={t('VM port')}
        targetPortPlaceholder={t('Enter VM port')}
        withProtocol
      />

      {isSwitchToFormModalOpen && (
        <FlightCtlModal isOpen onClose={() => setIsSwitchToFormModalOpen(false)} variant="small">
          <ModalHeader title={t('Switch to form mode?')} titleIconVariant="warning" />
          <ModalBody>
            <Content component="p">
              {t(
                'This VM uses advanced settings that are not supported in form view. Switching to form mode will discard those custom settings. The configuration will be rebuilt from the form fields when you save.',
              )}
            </Content>
          </ModalBody>
          <ModalFooter>
            <Button key="confirm" variant="primary" onClick={confirmSwitchToForm}>
              {t('Switch to form mode')}
            </Button>
            <Button key="cancel" variant="link" onClick={() => setIsSwitchToFormModalOpen(false)}>
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </FlightCtlModal>
      )}
    </>
  );
};

export default ApplicationVmForm;
