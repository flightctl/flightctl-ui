import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Divider,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import SyncAltIcon from '@patternfly/react-icons/dist/js/icons/sync-alt-icon';

import { Event, ResourceKind } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { timeSinceEpochText } from '../../utils/dates';
import useEvents, { DisplayEvent, SelectableEventType } from './useEvents';
import EventItem from './EventItem';

import './EventsCard.css';

type EventListProps = {
  kind: ResourceKind;
  objId: string;
  type?: Event.type;
};

const EventEmptyState = ({ hasFilters }: { hasFilters: boolean }) => {
  const { t } = useTranslation();
  return (
    <EmptyState titleText={t('No matching events')}>
      <EmptyStateBody>
        {hasFilters ? t('No events were found based on the current filters') : t('No events were found')}
      </EmptyStateBody>
    </EmptyState>
  );
};

const EventList = ({ events }: { events: DisplayEvent[] }) => {
  // Reference used to give the events panel the correct height
  const topRef = React.useRef<HTMLDivElement>(null);
  const [topY, setTopY] = React.useState<number>(0);

  React.useEffect(() => {
    if (topRef.current) {
      const boundingRect = topRef.current.getBoundingClientRect();
      if (boundingRect.top > 0) {
        setTopY(Math.ceil(boundingRect.top));
      }
    }
  }, []);

  return (
    <div ref={topRef} style={{ height: `calc(97vh - ${topY}px)` }}>
      <Stack hasGutter>
        {events.map((event) => {
          return (
            <StackItem key={event.name}>
              <EventItem event={event} />
            </StackItem>
          );
        })}
      </Stack>
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
  const title =
    lastUpdateTime === 0
      ? t('Events')
      : t('Events (updated {{ lastUpdate}})', { lastUpdate: timeSinceEpochText(t, lastUpdateTime) });

  let content: React.ReactNode;
  if (isLoading && !events) {
    content = <Spinner size="sm" />;
  } else if (!isLoading && events?.length === 0) {
    content = <EventEmptyState hasFilters={selectedType !== 'all'} />;
  } else {
    content = <EventList events={events || []} />;
  }

  return (
    <Card>
      <CardTitle>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>{title}</FlexItem>
          <FlexItem>
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
