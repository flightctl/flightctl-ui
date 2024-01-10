import * as React from 'react';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import '@patternfly/react-core/dist/styles/base.css';

// create a react element to display in yaml the form data, can be imported into any component
interface YamlViewProps {
    content: string;
  }
const YamlView: React.FunctionComponent<YamlViewProps> = ({ content }) => {
    return (
        <div>
            <div>
                <CodeEditor
                    isDarkTheme={true}
                    isLineNumbersVisible={true}
                    code={content}
                    language={Language.yaml}
                    height="sizeToFit"
                />
            </div>
        </div>
    )
}

export { YamlView };
