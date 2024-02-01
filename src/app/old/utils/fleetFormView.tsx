import React from 'react';
import {
  Button,
  TextArea,
  TextInput,
  Dropdown,
  DropdownItem,
  DropdownList,
  Icon,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalVariant,
  SearchInput,
  LabelGroup,
  Label,
  ExpandableSection
} from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
interface FormViewProps {
  name: string;
  setFleetName: (value: string) => void;
  osImage: string;
  setOsImage: (value: string) => void;
}
interface Section {
  id: number;
  type?: sectionType;
  parameters?: { [key: string]: any };
}
// declare the interface sectionType with type [git, secret, inline] and each one have different parameters
interface sectionType {
  git: {
    name: string;
    repositoryUrl: string;
    branch: string;
    path: string;
  },
  secret: {
    name: string;
    secretName: string;
    secretNamespace: string;
  },
  inline: {
    files: {
      fileName: string;
      content: string;
    }[]
  }

}
const FormView: React.FunctionComponent<FormViewProps> = ({ name, setFleetName, osImage, setOsImage }) => {
  const handleNameChange = (event: React.FormEvent<HTMLInputElement>,  value: string) => {
    setFleetName(value);
  };
  const handleOsImageChange = (event: React.FormEvent<HTMLInputElement>,  value: string) => {
    setOsImage(value);
  };
  const [idIndex, setIdIndex] = React.useState<number>(3);
  const [labels, setLabels] = React.useState<any>([
    { name: 'foo=bar',
      props: {
        isEditable: true,
      }, 
      id: 0 
    },
    { name: 'env=development',
      props: {
        isEditable: true,
      },
      id: 1
    },
    {
      name: 'Label 3',
      props: {
        isEditable: true,
      },
      id: 2
    }
  ]);

  const onClose = (labelId: string) => {
    setLabels(labels.filter((l: any) => l.id !== labelId));
  };
  const onEdit = (nextText: string, index: number) => {
    const copy = [...labels];
    const updatedProps = {
      ...labels[index].props,
      editableProps: { 'aria-label': `Editable label with text ${nextText}` }
    };

    copy[index] = { name: nextText, props: updatedProps, id: labels[index].id };
    setLabels(copy);
  };
  const onAdd = () => {
    setLabels([
      {
        name: 'New Label',
        props: {
          isEditable: true,
          editableProps: {
                        'aria-label': `Editable label with text New Label`
                      }
                    },
                    id: idIndex
                  },
                  ...labels
                ]);
                setIdIndex(idIndex + 1);
              };
              const [isOpen, setIsOpen] = React.useState<{ [key: number]: boolean }>({ 1: true });
              const toggleSection = (id: number) => {
                setIsOpen(prevIsOpen => ({ ...prevIsOpen, [id]: !prevIsOpen[id] }));
              };
              const [isOpenSource, setIsOpenSource] = React.useState<{ [key: number]: boolean }>({ 1: false});
              const [isOpenSource1, setIsOpenSource1] = React.useState(false);
              const onToggleClickSource = (id: number) => {
                setIsOpenSource(prevIsOpenSource => ({ ...prevIsOpenSource, [id]: !prevIsOpenSource?.[id] }));
              };
              const onToggleClickSource1 = () => {
                setIsOpenSource1(!isOpenSource1);
              };
              const onSelectSource1 = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
                // eslint-disable-next-line no-console
                console.log('selected', value);
                setIsOpenSource1(false);
              };
              const onSelectSource = (id: number) => (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
                // eslint-disable-next-line no-console
                console.log('selected', value);
                setIsOpenSource(prevIsOpenSource => ({ ...prevIsOpenSource, [id]: false }));
              };
              const [isModalOpen, setIsModalOpen] = React.useState(false);

              const handleModalToggle = (_event: KeyboardEvent | React.MouseEvent) => {
                setIsModalOpen(!isModalOpen);
              };

              const [isExpandedS1, setIsExpandedS1] = React.useState(true);

              const onToggleS1 = (_event: React.MouseEvent, isExpandedS1: boolean) => {
                setIsExpandedS1(isExpandedS1);
              };
              const [sections, setSections] = React.useState<Section[]>([

              ]);
              const addSection = () => {
                setSections(prevSections => [...prevSections, { id: prevSections.length + 1 }]);
                isOpen[sections.length + 1] = true;
                isOpenSource[sections.length + 1] = false;
              };


              return (
                <div style={{ width: '1200px', padding: '20px'}}>
                  <div style={{ fontWeight: 'bold' }}>
                  Fleet name <span style={{ color: 'red' }}>*</span> 
                  <TextInput value={name} onChange={handleNameChange} aria-label="name" />
                  </div>
                  <br />
                  <div style={{ fontWeight: 'bold' }}>
                    Labels 
                    <LabelGroup
                  categoryName=" "
                  numLabels={5}
                  isEditable
                  addLabelControl={
                    <Label color="blue" variant="outline" isOverflowLabel onClick={onAdd}>
                      Add label
                    </Label>
                  }
                >
                  {labels.map((label, index) => (
                    <Label
                      key={label.id}
                      id={label.id}
                      onClose={() => onClose(label.id)}
                      onEditCancel={(_event, prevText) => onEdit(prevText, index)}
                      onEditComplete={(_event, newText) => onEdit(newText, index)}
                      {...label.props}
                    >
                      {label.name}
                    </Label>
                  ))}
                </LabelGroup>
                  </div>
                  <br />
                  <div style={{ fontWeight: 'bold' }}>
                  OS Image <span style={{ color: 'red' }}>*</span> 
                  <TextInput value={osImage} onChange={handleOsImageChange} aria-label="osImage" />
                  <span style={{ fontWeight: 'normal'}}>Must either be an OCI image ref (e.g. "quay.io/redhat/rhde:9.3") or ostree ref (e.g. "https://ostree.fedoraproject.org/iot?ref=fedora/stable/x86_64/iot").</span>
                  </div>
                  <br />
                  <div style={{ fontWeight: 'bold' }}>
                    Configuration templates <span style={{ color: 'red' }}>*</span> 
                    <div style={{marginLeft: '50px'}}>
                      <ExpandableSection toggleText="Source 1" onToggle={onToggleS1} isExpanded={isExpandedS1}>
                      <Dropdown
                                isOpen={isOpenSource1}
                                onSelect={onSelectSource1}
                                onOpenChange={(isOpenSource1: boolean) => setIsOpenSource1(isOpenSource1)}
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                  <MenuToggle ref={toggleRef} isFullWidth onClick={onToggleClickSource1} isExpanded={isOpenSource1} style={{ backgroundColor: 'white' }}>
                                    <div id="togglesource0">Select source type</div>
                                  </MenuToggle>
                                )}
                                ouiaId="fleetdropdown"
                                shouldFocusToggleOnSelect

                              >
                                <DropdownList id="source1Type">
                                  <DropdownItem
                                      value="Git repository"
                                      key="gitRef"
                                      onClick={() => {
                                        const toggle = document.getElementById('togglesource0');
                                        if (toggle) {
                                          toggle.innerHTML = "Git repository";
                                        }
                                      }}
                                    >
                                      Git repository
                                    </DropdownItem>
                                    <DropdownItem
                                      value="Secret"
                                      key="secret"
                                      onClick={() => {
                                        const toggle = document.getElementById('togglesource0');
                                        if (toggle) {
                                          toggle.innerHTML = "Secret";
                                        }
                                      }}
                                    >
                                      Secret
                                    </DropdownItem>
                                    <DropdownItem
                                      value="Inline files"
                                      key="inline"
                                      onClick={() => {
                                        const toggle = document.getElementById('togglesource0');
                                        if (toggle) {
                                          toggle.innerHTML = "Inline files";
                                        }
                                      }}
                                    >
                                      Inline files
                                    </DropdownItem>
                  </DropdownList>
                  </Dropdown>

                  <div>      
                  <br />
                      <div style={{ fontWeight: 'bold' }}>
                        Source name <span style={{ color: 'red' }}>*</span> 
                        <TextInput aria-label="repourl" />
                      </div>
                      <br />
                      <div style={{ fontWeight: 'bold' }}>
                        Repository URL <span style={{ color: 'red' }}>*</span> 
                        <TextInput aria-label="repourl" />
                      </div>
                      <br />
                      <div style={{ fontWeight: 'bold' }}>
                        Repository target reference <span style={{ color: 'red' }}>*</span> 
                        <TextInput aria-label="repobranch" />
                      </div>
                      <br />
                      <div style={{ fontWeight: 'bold' }}>
                        Repository path <span style={{ color: 'red' }}>*</span> 
                        <TextInput aria-label="repopath" />
                      </div>
                    </div>
                  <Modal
                    variant={ModalVariant.small}
                    title='Add new Git-Source'
                    isOpen={isModalOpen}
                    onClose={handleModalToggle}
                    actions={[
                      <Button key="create" variant="primary" onClick={handleModalToggle}>
                        Create
                      </Button>,
                      <Button key="cancel" variant="link" onClick={handleModalToggle}>
                        Cancel
                      </Button>
                    ]}
                    ouiaId="new-git-source-modal"
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
                        Source name <span style={{ color: 'red' }}>*</span> 
                        <TextInput aria-label="name" />
                      </div>
                      <br />
                      <div style={{ fontWeight: 'bold' }}>
                        Repository URL <span style={{ color: 'red' }}>*</span> 
                        <TextInput aria-label="url" />
                      </div>
                      <br />
                      <div style={{ fontWeight: 'bold' }}>
                        Username
                        <TextInput aria-label="branch" />
                      </div>
                      <br />
                      <div style={{ fontWeight: 'bold' }}>
                        Password
                        <TextInput aria-label="username" />
                      </div>
                    </div>
                    </Modal>
                       </ExpandableSection>
                       <br />
                       {sections.map((section) => (
                      <ExpandableSection key={section.id} toggleText={`Source ${section.id}`} onToggle={() => toggleSection(section.id)} isExpanded={isOpen[section.id]}>
                        <Dropdown
                          isOpen={isOpenSource[section.id]}
                          onSelect={onSelectSource[section.id]}
                          onOpenChange={(isOpenSource: boolean) => setIsOpenSource(prevIsOpenSource => ({ ...prevIsOpenSource, [section.id]: isOpenSource }))}
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                  <MenuToggle ref={toggleRef} isFullWidth onClick={() => onToggleClickSource(section.id)} isExpanded={isOpenSource[section.id]} style={{ backgroundColor: 'white' }}>
                                    <div id={`togglesource${section.id}`}>Select source type</div>
                                  </MenuToggle>
                                )}
                                ouiaId="fleetdropdown"
                                shouldFocusToggleOnSelect

                              >
                                <DropdownList id="source1Type">
                                  <DropdownItem
                                      value="Git repository"
                                      key="gitRef"
                                      onClick={() => {
                                        const toggle = document.getElementById(`togglesource${section.id}`);
                                        if (toggle) {
                                          toggle.innerHTML = "Git repository";
                                        }
                                      }}
                                    >
                                      Git repository
                                    </DropdownItem>
                                    <DropdownItem
                                      value="Secret"
                                      key="secret"
                                      onClick={() => {
                                        const toggle = document.getElementById(`togglesource${section.id}`);
                                        if (toggle) {
                                          toggle.innerHTML = "Secret";
                                        }
                                      }}
                                    >
                                      Secret
                                    </DropdownItem>
                                    <DropdownItem
                                      value="Inline files"
                                      key="inline"
                                      onClick={() => {
                                        const toggle = document.getElementById(`togglesource${section.id}`);
                                        if (toggle) {
                                          toggle.innerHTML = "Inline files";
                                        }
                                      }}
                                    >
                                      Inline files
                                    </DropdownItem>
                  </DropdownList>
                  </Dropdown>

                        params...
                      </ExpandableSection>
                    ))}

                    </div>

                    <div style={{ fontWeight: 'normal' }}>
                    <Button variant="link" onClick={() => addSection()} icon={<PlusCircleIcon />}>
                      Add source
                    </Button>
                      </div>
                      <br />

                  </div>
                  <div>
                  <ExpandableSection toggleText="Update policy">
                  <div style={{ fontWeight: 'bold', marginLeft: '50px' }}>
                        Fail threshold
                        <TextInput aria-label="failThreshold" />
                        <span style={{ fontWeight: 'normal'}}>Use either an absolute number or a percentage.</span>
                  </div>
                  <div style={{ fontWeight: 'bold', marginLeft: '50px' }}>
                        Batch size
                        <TextInput aria-label="failThreshold" />
                        <span style={{ fontWeight: 'normal'}}>Use either an absolute number or a percentage.</span>
                  </div>
                    </ExpandableSection>
                  </div>
                  <div>
                  <ExpandableSection toggleText="Extensibility">
                    </ExpandableSection>
                  </div>
                  <div>
                      <Button >Create fleet</Button> 
                    <Button variant="link">
                      Cancel
                    </Button></div>
                </div>
                
            )
            };

            export { FormView };
