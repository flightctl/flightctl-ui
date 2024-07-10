import * as React from 'react';
import '@xterm/xterm/css/xterm.css';
import {
    Alert,
    Breadcrumb,
    BreadcrumbItem,
    Bullseye,
    PageSection,
    Spinner,
    Split,
    SplitItem,
    Title,
} from '@patternfly/react-core';
import { getErrorMessage } from '../../utils/error';
import DeviceNotFound from './DeviceNotFound';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, Route } from '../../hooks/useNavigate';
import ErrorBoundary from '../common/ErrorBoundary';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { connected } from 'process';
import { WSFactory } from '../../utils/ws';
import { Base64 } from 'js-base64';
import { Socket } from 'dgram';
export type TerminalPageProps = {
    id: string;
    title?: string;
    error: unknown;
    resourceTypeLabel: string;
    resourceLink: Route;
    nav?: React.ReactNode;
};

const TerminalPage: React.FC<TerminalPageProps> = ({
    id,
    title,
    error,
    resourceTypeLabel,
    resourceLink,
    nav,

}) => {
    const [wsOpen, setWsOpen] = React.useState<boolean>(false);
    const [wsError, setWsError] = React.useState<string>();
    const [wsReopening, setWsReopening] = React.useState<boolean>(false);
    const ws = React.useRef<WSFactory>();
    const terminalRef = React.useRef(null);
    const terminal = React.useRef(new Terminal());
    const fitAddon = new FitAddon();
    let connected = false;
    terminal.current.loadAddon(fitAddon);

    React.useEffect(() => {
        const subprotocols = ['remote-controller'];
        if (terminalRef.current) {
            const deviceid = "1234";
            const sessionid = "5678";
            const wsOpts = {
                sessionid: sessionid,
                deviceid: deviceid,
                reconnect: true,
                jsonParse: true
            };
            const websocket = new WSFactory('http://localhost:8080', wsOpts);
            const fitAddon = new FitAddon();
            terminal.current.loadAddon(fitAddon);
            terminal.current.open(terminalRef.current);
            fitAddon.fit();
            terminal.current.writeln('Connecting to device: ' + id);
            let i = 0;
            const interval = setInterval(() => {
                i++;
                terminal.current.write('.');
                if (websocket.connected) {
                    console.log('conected with ws!');
                    connected = true;
                    if (connected) {
                        clearInterval(interval);
                        terminal.current.writeln('');
                        terminal.current.writeln('\x1b[32mConnected\x1b[0m to device ✈️');
                        terminal.current.write('$ ');
                        terminal.current.onData((data) => {
                            if (data === '\r') {
                                if (terminal.current.buffer.active) {
                                    const activeLine = terminal.current.buffer.active.getLine(terminal.current.buffer.active.cursorY)?.translateToString();
                                    if (activeLine) {
                                        websocket.send(activeLine);
                                    }
                                }
                                terminal.current.writeln('');
                                terminal.current.write('$ ');
                            } else if (data === '\x7F') {
                                terminal.current.write('\b \b');
                            }
                            else if (data.length > 1) {
                                data.split('').forEach((char) => {
                                    if (char === '\r') {
                                        terminal.current.writeln('');
                                    } else {
                                        terminal.current.write(char);
                                    }
                                });
                            } else {
                                terminal.current.write(data);
                            }
                        });
                    }
                }
                if (i === 80) {
                    terminal.current.writeln('');
                    i = 0;
                }
            }, 500);
        }
    }, []);
    return (
        <>
            <PageSection variant="light" type="breadcrumb">
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={resourceLink}>Devices</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>Terminal</BreadcrumbItem>
                    <BreadcrumbItem isActive>{title || id}</BreadcrumbItem>
                </Breadcrumb>
            </PageSection>
            <PageSection variant="light">
                <Split hasGutter>
                    <SplitItem isFilled>
                        <Title headingLevel="h1" size="3xl" role="heading">
                            Terminal device: {title || id}
                        </Title>
                    </SplitItem>

                </Split>
            </PageSection>
            {nav && (
                <PageSection variant="light" type="nav">
                    {nav}
                </PageSection>
            )}
            <PageSection>
                <div ref={terminalRef} style={{ height: '600px', width: '900px' }} />
            </PageSection>
        </>
    );
};

export default TerminalPage;
