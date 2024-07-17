import * as React from 'react';
import { ITerminalAddon, ITerminalInitOnlyOptions, ITerminalOptions, Terminal as XTerminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';

import './Terminal.css';

const terminalOptions: ITerminalOptions & ITerminalInitOnlyOptions = {
  fontFamily: 'monospace',
  fontSize: 16,
  cursorBlink: false,
  cols: 80,
  rows: 25,
};

type TerminalProps = {
  onData: (data: string) => void;
};

export type ImperativeTerminalType = {
  focus: () => void;
  onDataReceived: (data: string) => void;
  loadAttachAddon: (addOn: ITerminalAddon) => void;
};

const Terminal = React.forwardRef<ImperativeTerminalType, TerminalProps>(({ onData }, ref) => {
  const terminal = React.useRef<XTerminal>();
  const terminalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const term: XTerminal = new XTerminal(terminalOptions);
    const fitAddon = new FitAddon();
    terminalRef.current && term.open(terminalRef.current);
    term.loadAddon(fitAddon);
    term.focus();

    const resizeObserver: ResizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => fitAddon.fit());
    });

    terminalRef.current && resizeObserver.observe(terminalRef.current);

    if (terminal.current !== term) {
      terminal.current?.dispose();
      terminal.current = term;
    }

    return () => {
      term.dispose();
      resizeObserver.disconnect();
    };
  }, []);

  React.useEffect(() => {
    const term = terminal.current;
    const data = term?.onData(onData);
    return () => {
      data?.dispose();
    };
  }, [onData]);

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      terminal.current?.focus();
    },
    onDataReceived: (data) => {
      terminal.current?.write(data);
    },
    loadAttachAddon: (addOn) => {
      terminal.current?.loadAddon(addOn);
    },
  }));

  return <div style={{ width: '100%' }} ref={terminalRef} />;
});

Terminal.displayName = 'Terminal';

export default Terminal;
