import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Divider,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  Flex,
  FlexItem,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';
import SyncAltIcon from '@patternfly/react-icons/dist/js/icons/sync-alt-icon';
import { AutoSizer, CellMeasurer, CellMeasurerCache, List as VirtualList } from 'react-virtualized';
import { MeasuredCellParent } from 'react-virtualized/dist/es/CellMeasurer';

import { Event, ResourceKind } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { timeSinceEpochText } from '../../utils/dates';
import useEvents, { DisplayEvent, SelectableEventType } from './useEvents';
import EventItem from './EventItem';

import './EventsCard.css';

const mdWidthBreakpoint = 768;

type EventListProps = {
  kind: ResourceKind;
  objId: string;
  type?: Event.type;
};

const EventEmptyState = ({ hasFilters }: { hasFilters: boolean }) => {
  const { t } = useTranslation();
  return (
    <EmptyState>
      <EmptyStateHeader>{t('No matching events')}</EmptyStateHeader>
      <EmptyStateBody>
        {hasFilters ? t('No events were found based on the current filters') : t('No events were found')}
      </EmptyStateBody>
    </EmptyState>
  );
};

const EventList = ({ events }: { events: DisplayEvent[] }) => {
  const [containerHeight, setContainerHeight] = React.useState<string | number>();
  const topRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<VirtualList | null>(null);

  const rowCache = React.useMemo(
    () =>
      new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 50,
      }),
    [],
  );

  React.useEffect(() => {
    if (topRef.current) {
      const boundingRect = topRef.current.getBoundingClientRect();
      if (window.innerWidth < mdWidthBreakpoint) {
        setContainerHeight(600);
      } else if (boundingRect.top > 0) {
        setContainerHeight(`calc(97vh - ${Math.ceil(boundingRect.top)}px)`);
      }
    }
  }, []);

  const clearRowCache = React.useCallback(() => {
    rowCache.clearAll();
  }, [rowCache]);

  React.useEffect(() => {
    clearRowCache();
    if (listRef.current) {
      listRef.current?.recomputeRowHeights();
    }
  }, [events, clearRowCache]);

  const renderRow = ({
    index,
    parent,
    style,
  }: {
    index: number;
    parent: MeasuredCellParent;
    style: React.CSSProperties;
  }) => {
    const event = events[index];
    return (
      <CellMeasurer key={event.name} cache={rowCache} parent={parent} columnIndex={0} rowIndex={index}>
        <div className="fctl-event__wrapper" style={style}>
          <EventItem event={event} />
        </div>
      </CellMeasurer>
    );
  };

  return (
    <div ref={topRef} style={{ height: containerHeight }}>
      <AutoSizer onResize={clearRowCache}>
        {({ width, height }) => {
          return (
            <VirtualList
              ref={(ref) => {
                listRef.current = ref;
              }}
              rowCount={events.length}
              width={width}
              height={height}
              deferredMeasurementCache={rowCache}
              rowHeight={rowCache.rowHeight}
              rowRenderer={renderRow}
              overscanRowCount={3}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

const EventsCard = ({ kind, objId, type = Event.type.WARNING }: EventListProps) => {
  const { t } = useTranslation();

  const [selectedType, setSelectedType] = React.useState<SelectableEventType>(type);
  const searchCriteria = React.useMemo(
    () => ({
      kind,
      name: objId,
      type: selectedType,
    }),
    [kind, objId, selectedType],
  );
  const [events, isLoading, refetch, isUpdating, lastUpdateTime] = useEvents(searchCriteria, t);
  const [isTypeOpen, setIsTypeOpen] = React.useState<boolean>(false);
  const titleDetails =
    lastUpdateTime === 0 ? '' : t('(updated {{ lastUpdate}})', { lastUpdate: timeSinceEpochText(t, lastUpdateTime) });

  let content: React.ReactNode;
  if (isLoading && !events) {
    content = <Spinner size="sm" />;
  } else if (!isLoading && events?.length === 0) {
    content = <EventEmptyState hasFilters={selectedType !== 'all'} />;
  } else {
    content = <EventList events={events || []} />;
  }

  return (
    <Card className="fctl-events-card">
      <CardTitle>
        <Flex wrap="nowrap">
          <FlexItem className="fctl-events-card__text">{t('Events')}</FlexItem>
          <FlexItem className="fctl-events-card__text fctl-events-card__text-details">{titleDetails}</FlexItem>
          <FlexItem className="fctl-events-card__button">
            <Button
              aria-label={t('Reload events')}
              isDisabled={isLoading || isUpdating}
              variant="plain"
              icon={<SyncAltIcon />}
              onClick={refetch}
            />
          </FlexItem>
        </Flex>
      </CardTitle>
      <CardBody isFilled={false}>
        <Select
          isOpen={isTypeOpen}
          selected={selectedType}
          onSelect={(_, value) => {
            setSelectedType(value as SelectableEventType);
            setIsTypeOpen(false);
          }}
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              isExpanded
              onClick={() => {
                setIsTypeOpen((open) => !open);
              }}
            >
              {selectedType === 'all' ? t('All types') : selectedType}
            </MenuToggle>
          )}
        >
          <SelectList>
            <SelectOption value="all">{t('All types')}</SelectOption>
            <SelectOption value={Event.type.NORMAL}>{t('Normal')}</SelectOption>
            <SelectOption value={Event.type.WARNING}>{t('Warning')}</SelectOption>
          </SelectList>
        </Select>
      </CardBody>
      <Divider />
      <CardBody isFilled className="fctl-events-container">
        {content}
      </CardBody>
    </Card>
  );
};

export default EventsCard;
