import {
  Alert,
  Button,
  ClipboardCopy,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Modal,
  OrderType,
  Radio,
  Stack,
  StackItem,
  TextContent,
  TextList,
  TextListItem,
} from '@patternfly/react-core';
import * as React from 'react';

const AddDeviceModal = ({ onClose }: { onClose: VoidFunction }) => {
  const [imgType, setImgType] = React.useState<'bootc' | 'qcow2'>('bootc');

  const actions = [
    <Button key="close" variant="secondary" onClick={onClose}>
      Close
    </Button>,
  ];

  if (imgType === 'qcow2') {
    actions.unshift(
      <Button key="download" onClick={() => window.open(window.QCOW2_IMG_URL, '_blank')}>
        Download disk
      </Button>,
    );
  }
  return (
    <Modal variant="medium" title="Add device" onClose={onClose} isOpen actions={actions}>
      <Grid hasGutter>
        <GridItem>
          <Radio
            isChecked={imgType === 'bootc'}
            name="bootc"
            onChange={(_, checked) => checked && setImgType('bootc')}
            label={`Use a container image (bootc) ${window.BOOTC_IMG_URL ? '' : '(Not available)'}`}
            id="bootc"
            isDisabled={!window.BOOTC_IMG_URL}
          />
          <Radio
            isChecked={imgType === 'qcow2'}
            name="qcow2"
            onChange={(_, checked) => checked && setImgType('qcow2')}
            label={`Use a disk image (qcow2) ${window.QCOW2_IMG_URL ? '' : '(Not available)'}`}
            id="qcow2"
            isDisabled={!window.QCOW2_IMG_URL}
          />
        </GridItem>
        <GridItem>
          {imgType === 'bootc' && (
            <Alert isInline variant="info" title="Adding devices instructions">
              <TextContent>
                <TextList component="ol" type={OrderType.number} style={{ marginLeft: 0 }}>
                  <TextListItem>Boot you device.</TextListItem>
                  <TextListItem>Ensure that your device has a disk available for installation.</TextListItem>
                  <TextListItem>
                    Execute the following podman command
                    <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied">
                      {`podman run --rm --privileged --pid=host -v /var/lib/containers:/var/lib/containers --security-opt label=type:unconfined_t ${window.BOOTC_IMG_URL} bootc install to-disk /path/to/disk`}
                    </ClipboardCopy>
                  </TextListItem>
                  <TextListItem>Ensure that your device will boot from `/path/to/disk`.</TextListItem>
                  <TextListItem>Reboot the device.</TextListItem>
                  <TextListItem>
                    Booted device should appear in the devices table. This might take a few minutes.
                  </TextListItem>
                </TextList>
              </TextContent>
            </Alert>
          )}
          {imgType === 'qcow2' && (
            <Stack hasGutter>
              <StackItem>
                <Alert isInline variant="info" title="Adding devices instructions">
                  <TextContent>
                    <TextList component="ol" type={OrderType.number} style={{ marginLeft: 0 }}>
                      <TextListItem>Download the qcow2 disk and use it to boot your device.</TextListItem>
                      <TextListItem>
                        Booted device should appear in the devices table. This might take a few minutes.
                      </TextListItem>
                    </TextList>
                  </TextContent>
                </Alert>
              </StackItem>
              <StackItem>
                <Form>
                  <FormGroup label="Disk URL">
                    <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied">
                      {window.QCOW2_IMG_URL}
                    </ClipboardCopy>
                  </FormGroup>
                  <FormGroup label="Command to download the disk">
                    <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied">
                      {`wget -O disk.qcow2 ${window.QCOW2_IMG_URL}`}
                    </ClipboardCopy>
                  </FormGroup>
                </Form>
              </StackItem>
            </Stack>
          )}
        </GridItem>
      </Grid>
    </Modal>
  );
};

export default AddDeviceModal;
