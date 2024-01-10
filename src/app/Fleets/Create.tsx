import * as React from 'react';
import { useAuth } from 'react-oidc-context';
import { YamlView } from '@app/utils/yamlView';
import { FormView } from '@app/utils/fleetFormView';
import {
    PageSection,
    Spinner,
    Title,
    Divider,
    Radio,
  } from '@patternfly/react-core';


const CreateFleet: React.FunctionComponent = () => {
    const [typeEditor, setTypeEditor] = React.useState("form");
    const [fleetName, setFleetName] = React.useState('test');
    const [osImage, setOsImage] = React.useState('quay.io/flightctl/rhde:9.3');
    let yamlContent = 
    `apiVersion: v1alpha1
kind: fleet
metadata:
  name: ${fleetName}
spec:
  selector:
    matchLabels:
      fleet: ${fleetName}
  template:
    metadata:
      labels:
        fleet: ${fleetName}
    spec:
      os:
        image: ${osImage}`;
    const handleChange = (event) => {
        setTypeEditor(event.target.id);
    };
    return (
        <PageSection>
            <Title headingLevel="h1" size="lg" style={{ marginBottom: '15px' }}>Create Fleet</Title>
            <Divider />
            <table>
                <tbody>
                    <tr>
                        <td style={{ padding: 10 }}>
                        <b>Configure via: </b>
                        </td>
                        <td style={{ padding: 10 }}>
                        <Radio isChecked={typeEditor === "form"} onChange={handleChange} label="Form view" id="form" name='typeEditor' aria-label='form'/>
                        </td>
                        <td style={{ padding: 10 }}>
                        <Radio isChecked={typeEditor === "yaml"} onChange={handleChange} label="YAML view" id="yaml" name="typeEditor" aria-label="yaml" />
                        </td>
                    </tr>
                </tbody>
            </table>
            <Divider />
            {typeEditor === "form" ? <FormView setOsImage={setOsImage} osImage={osImage} setFleetName={setFleetName} name={fleetName}/> : <YamlView content={yamlContent} />}
        </PageSection>
    )
}

export { CreateFleet };