import * as React from 'react';
import { ITerminalAddon, ITerminalInitOnlyOptions, ITerminalOptions, Terminal as XTerminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Spinner, Stack, StackItem } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';

import './Terminal.css';

// Cap bytes written per animation frame so high-volume output (e.g. VM reboot) cannot
// block the main thread and freeze the rest of the page.
const MAX_TERMINAL_WRITE_BYTES_PER_FRAME = 16_384;

const terminalOptions: ITerminalOptions & ITerminalInitOnlyOptions = {
  fontFamily: 'monospace',
  fontSize: 16,
  cursorBlink: false,
  cols: 80,
  rows: 25,
  convertEol: true,
};

type TerminalProps = {
  onData: (data: string, resize?: boolean) => void;
  /**
   * When set, the session is treated as open immediately and this message is written
   * to the terminal (for example VM serial for Windows, which may never emit guest output).
   */
  connectedMessage?: string;
};

export type ImperativeTerminalType = {
  focus: VoidFunction;
  onDataReceived: (data: string) => void;
  loadAttachAddon: (addOn: ITerminalAddon) => void;
  reset: VoidFunction;
};

const Terminal = React.forwardRef<ImperativeTerminalType, TerminalProps>(({ onData, connectedMessage }, ref) => {
  const { t } = useTranslation();
  const [receivedData, setReceivedData] = React.useState(!!connectedMessage);
  const terminal = React.useRef<XTerminal>();
  const terminalRef = React.useRef<HTMLDivElement>(null);
  const writeChunksRef = React.useRef<string[]>([]);
  const pendingWriteRef = React.useRef('');
  const flushScheduledRef = React.useRef(false);
  const connectedMessageRef = React.useRef(connectedMessage);
  connectedMessageRef.current = connectedMessage;

  const writeConnectedMessage = React.useCallback((term: XTerminal) => {
    const message = connectedMessageRef.current;
    if (!message) {
      return;
    }
    // Show connection message in green; reset so guest output is unaffected.
    term.write(`\x1b[32m${message}\x1b[0m\r\n\r\n`);
    setReceivedData(true);
  }, []);

  const flushWriteBuffer = React.useCallback(() => {
    flushScheduledRef.current = false;
    const term = terminal.current;

    let pending = pendingWriteRef.current;
    if (writeChunksRef.current.length > 0) {
      pending += writeChunksRef.current.join('');
      writeChunksRef.current = [];
    }

    if (!term || pending.length === 0) {
      pendingWriteRef.current = '';
      return;
    }

    const chunk =
      pending.length > MAX_TERMINAL_WRITE_BYTES_PER_FRAME
        ? pending.slice(0, MAX_TERMINAL_WRITE_BYTES_PER_FRAME)
        : pending;
    pendingWriteRef.current = pending.length > chunk.length ? pending.slice(chunk.length) : '';

    try {
      term.write(chunk);
    } catch {
      pendingWriteRef.current = '';
      return;
    }

    if (pendingWriteRef.current.length > 0 || writeChunksRef.current.length > 0) {
      flushScheduledRef.current = true;
      requestAnimationFrame(flushWriteBuffer);
    }
  }, []);

  const scheduleWriteFlush = React.useCallback(() => {
    if (!flushScheduledRef.current) {
      flushScheduledRef.current = true;
      requestAnimationFrame(flushWriteBuffer);
    }
  }, [flushWriteBuffer]);

  React.useEffect(() => {
    const term: XTerminal = new XTerminal(terminalOptions);
    const fitAddon = new FitAddon();
    if (terminalRef.current) {
      term.open(terminalRef.current);
    }
    term.loadAddon(fitAddon);
    term.focus();

    const resizeObserver: ResizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        fitAddon.fit();
        if (terminal.current) {
          const size = JSON.stringify({ Height: terminal.current?.rows, Width: terminal.current?.cols });
          onData(size, true);
        }
      });
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    if (terminal.current !== term) {
      terminal.current?.dispose();
      terminal.current = term;
    }

    writeConnectedMessage(term);

    return () => {
      writeChunksRef.current = [];
      pendingWriteRef.current = '';
      flushScheduledRef.current = false;
      term.dispose();
      resizeObserver.disconnect();
    };
  }, [onData, writeConnectedMessage]);

  React.useEffect(() => {
    const term = terminal.current;
    const data = term?.onData((data) => onData(data, false));
    return () => {
      data?.dispose();
    };
  }, [onData]);

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      terminal.current?.focus();
    },
    onDataReceived: (data) => {
      if (!terminal.current) {
        return;
      }
      setReceivedData((prev) => (prev ? prev : true));
      writeChunksRef.current.push(data);
      scheduleWriteFlush();
    },
    loadAttachAddon: (addOn) => {
      terminal.current?.loadAddon(addOn);
    },
    reset: () => {
      writeChunksRef.current = [];
      pendingWriteRef.current = '';
      flushScheduledRef.current = false;
      terminal.current?.reset();
      if (connectedMessageRef.current && terminal.current) {
        writeConnectedMessage(terminal.current);
      } else {
        setReceivedData(false);
      }
    },
  }));

  return (
    <Stack hasGutter className="fctl-terminal-container">
      {!receivedData && !connectedMessage && (
        <StackItem>
          <Spinner size="md" /> {t('Waiting for terminal session to open...')}
        </StackItem>
      )}
      <StackItem isFilled>
        <div className="fctl-terminal-wrapper" ref={terminalRef} />
      </StackItem>
    </Stack>
  );
});

Terminal.displayName = 'Terminal';

export default Terminal;
