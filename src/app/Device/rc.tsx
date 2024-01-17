import React, { useState } from 'react';
import { fetchDataObj } from '@app/utils/commonFunctions';
import { device } from '@app/utils/commonDataTypes';
import { useAuth } from 'react-oidc-context';
import { LogViewer } from '@patternfly/react-log-viewer';
import YAML from 'yaml';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import {
    Accordion,
    AccordionItem,
    AccordionContent,
    AccordionToggle,
    Breadcrumb, 
    BreadcrumbItem,
    CodeBlock,
    CodeBlockCode,
    Button,
    Divider,
    Dropdown,
    DropdownList,
    DropdownItem,
    MenuToggle,
    MenuToggleElement,
    PageSection,
    Panel,
    PanelMain,
    PanelMainBody,
    PanelHeader,
    SearchInput,
    Tabs,
    Tab,
    TabTitleText,
    TextInput,
    Title
} from '@patternfly/react-core';
import { set } from 'yaml/dist/schema/yaml-1.1/set';

const dateFormatter = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    let dateObj;
    const epoch = Number(date);
    if (epoch) {
        dateObj = new Date(epoch * 1000);
    } else {
        dateObj = new Date(date);
    }

    return `${dateObj.toLocaleDateString('en-US', options)} ${dateObj.toLocaleTimeString('en-US')}`;
};

// if windowPath contains "rc/", then set deviceID to the value after "rc/"
// else set deviceID to ""
var windowPath;
if (window.location.pathname.includes("rc/")) {
    windowPath = window.location.pathname.split("rc/");
} else {
    windowPath = window.location.pathname.split("device/");
}
const deviceID = windowPath[1];
var connected = false;
let socket;
const WS_URL =  window.env?.WS_URL ? window.env.WS_URL : 'http://localhost:8082';  
const RemoteControl: React.FunctionComponent = () => {
    const terminal = React.useRef<Terminal | null>(null);
    const xtermContainer = React.useRef<HTMLElement | null>(null);
    const auth = useAuth();

  
    const [logData, setLogData] = useState("Connecting to device...");
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            if (socket !== undefined) {
                socket.emit('cmd-input', inputValue)
            }
            setLogData(prevLogData => `${prevLogData}\n${inputValue}`);
            setInputValue(">");
        }
    }
        const [inputValue, setInputValue] = React.useState(">");

    const handleInputChange = (event: React.FormEvent<HTMLInputElement>, newValue: string) => {
        // Ensure that "$: " is always at the start of the input
        if (!newValue.startsWith(">")) {
          setInputValue(`>${newValue}`);
        } else {
          setInputValue(newValue);
        }
      };
      React.useEffect(() => {
        const fitAddon = new FitAddon();
        if (!terminal.current) {
            terminal.current = new Terminal({convertEol: true});
            terminal.current.loadAddon(fitAddon);
        }
        xtermContainer.current = document.getElementById('xterm-container');
        if (xtermContainer.current && xtermContainer.current.children.length === 0) {
            terminal.current?.open(xtermContainer.current);
            fitAddon.fit();
            terminal.current?.write('Connecting to device... ' + deviceID);
            terminal.current?.writeln('');

        }
        
      }, []);
      React.useEffect(() => {
        console.log(connected);
        if (!connected) {
            const timer = setTimeout(() => {
                const totalDots = 40;
                let dots = 0;
                const connecting = setInterval(() => {
                    terminal.current?.write('.');
                    dots++;
                    if (dots === totalDots) {
                        terminal.current?.writeln('');
                        terminal.current?.write('Connecting to device... ' + deviceID);
                        dots = 0;
                    }
                }, 1000);
                console.log("deviceID: " + deviceID);
                if (deviceID !== "")   {
                    socket = io(WS_URL, {
                        query: {
                            deviceID: deviceID
                        }
                    });
                    socket.on('connect', () => {
                        clearInterval(connecting);
                        terminal.current?.writeln('Connected with \x1B[1;3;31mflightctl\x1B[0m remote-control service!');
                        terminal.current?.write("$ ")
                        var command = "";
                        terminal.current?.onKey(({ key, domEvent }) => {
                            
                            const printable = !domEvent.getModifierState('AltGraph') && !domEvent.getModifierState('Control') && !domEvent.getModifierState('Meta');
                            if (domEvent.key === "Enter") {
                                const inputValue = command;
                                command = "";
                                terminal.current?.writeln('');
                                socket.emit('cmd-input', inputValue)
                                
                            }   else if (domEvent.ctrlKey && domEvent.key === "c") {
                                console.log("ctrl-c");
                                socket.emit('cmd-input', '\x03');
                                terminal.current?.writeln('');
                                terminal.current?.write("$ ");

                            }   else if (domEvent.key === "Backspace") {
                                command = command.slice(0, -1);
                                if (terminal.current?.buffer.active?.cursorX && terminal.current.buffer.active.cursorX > 2) {
                                    terminal.current?.write('\b \b');
                                }
                            } else if (printable) {
                                command += key;
                                terminal.current?.write(key);
                            }
                        });
                        connected = true; 
                        socket.on('cmd', (data) => {
                            if (typeof data === 'object' && data !== null) {
                                data = new TextDecoder().decode(data);
                            }
                            terminal.current?.writeln(data);
                            terminal.current?.write("$ ");
                        }
                        );
                    });
                }
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            return;
        }
      }, [auth]);
    return (
        <PageSection >
            <div id="xterm-container" style={{ width: '90%', height: '90%'}}></div>

        </PageSection>
    );
};

export { RemoteControl };
