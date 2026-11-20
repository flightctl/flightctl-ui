import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { AngleDownIcon } from '@patternfly/react-icons/dist/js/icons/angle-down-icon';
import { AngleRightIcon } from '@patternfly/react-icons/dist/js/icons/angle-right-icon';

import { type Fleet } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { type OneTimeWindowForm, type UpdatePolicyForm } from '../../../types/deviceSpec';
import { getCalendarDateDisplay } from '../../../utils/dates';
import LabelWithHelperText from '../../common/WithHelperText';
import { getOneTimeWindowTimeZone, getUpdatePolicyValues } from '../CreateFleet/fleetSpecUtils';
import * as timeUtils from '../../../utils/time';

import './FleetUpdatePolicyContent.css';

const weekdayShortLabels = (weekDays: boolean[] | undefined, t: (key: string) => string) => {
  const labels = [t('Sun'), t('Mon'), t('Tue'), t('Wed'), t('Thu'), t('Fri'), t('Sat')];
  return (weekDays || [])
    .map((selected, index) => (selected ? labels[index] : null))
    .filter(Boolean)
    .join(', ');
};

const timezoneDisplay = (timeZone: string | undefined, t: (key: string) => string) =>
  !timeZone || timeZone === timeUtils.localDeviceTimezone ? t("Device's local timezone") : timeZone;

type CollapsibleWindowPanelProps = {
  title: React.ReactNode;
  headerActions?: React.ReactNode;
  expandLabel: string;
  collapseLabel: string;
  className?: string;
};

const CollapsibleWindowPanel = ({
  title,
  headerActions,
  expandLabel,
  collapseLabel,
  className,
  children,
}: React.PropsWithChildren<CollapsibleWindowPanelProps>) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const panelClass = [
    'fctl-fleet-update-policy__panel',
    isExpanded ? 'fctl-fleet-update-policy__panel--expanded' : 'fctl-fleet-update-policy__panel--collapsed',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={panelClass}>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        gap={{ default: 'gapXs' }}
        flexWrap={{ default: 'nowrap' }}
        className="fctl-fleet-update-policy__panel-header"
      >
        <FlexItem>
          <Button
            variant="plain"
            size="sm"
            className="fctl-fleet-update-policy__toggle"
            onClick={() => setIsExpanded((value) => !value)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? collapseLabel : expandLabel}
          >
            {isExpanded ? <AngleDownIcon /> : <AngleRightIcon />}
          </Button>
        </FlexItem>
        <FlexItem grow={{ default: 'grow' }} className="fctl-fleet-update-policy__panel-title">
          {title}
        </FlexItem>
        {headerActions ? <FlexItem shrink={{ default: 'shrink' }}>{headerActions}</FlexItem> : null}
      </Flex>
      {isExpanded ? <div className="fctl-fleet-update-policy__panel-body">{children}</div> : null}
    </div>
  );
};

const PanelTitle = ({ children }: React.PropsWithChildren) => (
  <Title headingLevel="h4" size="md" className="fctl-fleet-update-policy__section-title">
    {children}
  </Title>
);

const hasGrace = (grace?: string) => Boolean(grace) && grace !== '0s';

const timeWithGrace = (startsAt: string, grace?: string) =>
  hasGrace(grace) ? `${startsAt} · startGraceDuration: ${grace}` : startsAt;

const ScheduleFields = ({
  days,
  startsAt,
  grace,
  timeZone,
}: {
  days?: string;
  startsAt: string;
  grace?: string;
  timeZone: string;
}) => {
  const { t } = useTranslation();

  return (
    <DescriptionList isHorizontal isCompact termWidth="8ch" className="fctl-fleet-update-policy__fields">
      {days ? (
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Days')}</DescriptionListTerm>
          <DescriptionListDescription>{days}</DescriptionListDescription>
        </DescriptionListGroup>
      ) : null}
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Time')}</DescriptionListTerm>
        <DescriptionListDescription>{timeWithGrace(startsAt, grace)}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Timezone')}</DescriptionListTerm>
        <DescriptionListDescription>{timeZone}</DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};

const FrequencyLabel = ({ isWeekly }: { isWeekly: boolean }) => {
  const { t } = useTranslation();
  return (
    <Label isCompact color="blue">
      {isWeekly ? t('Weekly') : t('Daily')}
    </Label>
  );
};

const CronFields = ({ cron, grace, timeZone }: { cron: string; grace?: string; timeZone: string }) => {
  const { t } = useTranslation();
  return (
    <DescriptionList isHorizontal isCompact termWidth="8ch" className="fctl-fleet-update-policy__fields">
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Cron')}</DescriptionListTerm>
        <DescriptionListDescription>
          <code>{cron}</code>
          {hasGrace(grace) ? <> · startGraceDuration: {grace}</> : null}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Timezone')}</DescriptionListTerm>
        <DescriptionListDescription>{timeZone}</DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};

type RecurringSide = {
  key: 'download' | 'install';
  cron: string;
  startGraceDuration?: string;
  timeZone: string;
  scheduleMode: UpdatePolicyForm['downloadScheduleMode'];
  weekDays: boolean[];
};

const getRecurringSides = (updatePolicy: UpdatePolicyForm): RecurringSide[] => {
  const sides: RecurringSide[] = [];
  if (updatePolicy.downloadCron) {
    sides.push({
      key: 'download',
      cron: updatePolicy.downloadCron,
      startGraceDuration: updatePolicy.downloadStartGraceDuration,
      timeZone: updatePolicy.downloadTimeZone,
      scheduleMode: updatePolicy.downloadScheduleMode,
      weekDays: updatePolicy.downloadWeekDays,
    });
  }
  if (updatePolicy.installCron) {
    sides.push({
      key: 'install',
      cron: updatePolicy.installCron,
      startGraceDuration: updatePolicy.installStartGraceDuration,
      timeZone: updatePolicy.installTimeZone,
      scheduleMode: updatePolicy.installScheduleMode,
      weekDays: updatePolicy.installWeekDays,
    });
  }
  return sides;
};

const SideChip = ({ side }: { side: RecurringSide }) => {
  const { t } = useTranslation();
  return timeUtils.isUiSupportedCron(side.cron) ? (
    <FrequencyLabel isWeekly={side.scheduleMode === timeUtils.UpdateScheduleMode.Weekly} />
  ) : (
    <Label isCompact color="purple">
      {t('Custom')}
    </Label>
  );
};

const SideFields = ({ side, updatePolicy }: { side: RecurringSide; updatePolicy: UpdatePolicyForm }) => {
  const { t } = useTranslation();
  if (!timeUtils.isUiSupportedCron(side.cron)) {
    return <CronFields cron={side.cron} grace={side.startGraceDuration} timeZone={timezoneDisplay(side.timeZone, t)} />;
  }
  return (
    <ScheduleFields
      days={
        side.scheduleMode === timeUtils.UpdateScheduleMode.Weekly
          ? weekdayShortLabels(side.weekDays, t) || '—'
          : undefined
      }
      startsAt={
        updatePolicy[side.key === 'install' ? 'installStartsAt' : 'downloadStartsAt'] || timeUtils.defaultStartTime
      }
      grace={side.startGraceDuration}
      timeZone={timezoneDisplay(side.timeZone, t)}
    />
  );
};

const recurringSidesMatch = (a: RecurringSide, b: RecurringSide) =>
  a.cron === b.cron &&
  a.startGraceDuration === b.startGraceDuration &&
  a.timeZone === b.timeZone &&
  a.scheduleMode === b.scheduleMode &&
  a.weekDays.join() === b.weekDays.join();

const RecurringSection = ({ updatePolicy }: { updatePolicy: UpdatePolicyForm }) => {
  const { t } = useTranslation();
  const sides = getRecurringSides(updatePolicy);
  const isSplit = sides.length > 1 && !recurringSidesMatch(sides[0], sides[1]);

  return (
    <CollapsibleWindowPanel
      title={<PanelTitle>{t('Recurring')}</PanelTitle>}
      headerActions={isSplit ? undefined : <SideChip side={sides[0]} />}
      expandLabel={t('Expand recurring window')}
      collapseLabel={t('Collapse recurring window')}
    >
      <Stack hasGutter>
        {isSplit ? (
          sides.map((side, index) => (
            <React.Fragment key={side.key}>
              {index > 0 && (
                <StackItem>
                  <Divider />
                </StackItem>
              )}
              <StackItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                  <FlexItem>
                    <PanelTitle>{side.key === 'install' ? t('Update') : t('Download')}</PanelTitle>
                  </FlexItem>
                  <FlexItem>
                    <SideChip side={side} />
                  </FlexItem>
                </Flex>
              </StackItem>
              <StackItem>
                <SideFields side={side} updatePolicy={updatePolicy} />
              </StackItem>
            </React.Fragment>
          ))
        ) : (
          <StackItem>
            <SideFields side={sides[0]} updatePolicy={updatePolicy} />
          </StackItem>
        )}
      </Stack>
    </CollapsibleWindowPanel>
  );
};

type WindowEntry = { schedule: 'download' | 'install'; window: OneTimeWindowForm };

const OneTimeSideFields = ({ window, timeZone }: { window: OneTimeWindowForm; timeZone: string }) => {
  const { t } = useTranslation();
  return (
    <DescriptionList isHorizontal isCompact termWidth="8ch" className="fctl-fleet-update-policy__fields">
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Time')}</DescriptionListTerm>
        <DescriptionListDescription>
          {timeWithGrace(window.startsAt, window.startGraceDuration)}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Timezone')}</DescriptionListTerm>
        <DescriptionListDescription>{timeZone}</DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};

const OneTimeWindowFields = ({ entries, updatePolicy }: { entries: WindowEntry[]; updatePolicy: UpdatePolicyForm }) => {
  const { t } = useTranslation();
  const download = entries.find((entry) => entry.schedule === 'download');
  const install = entries.find((entry) => entry.schedule === 'install');
  const primary = download || install;
  if (!primary) {
    return null;
  }
  const timeZoneFor = (entry: WindowEntry) =>
    getOneTimeWindowTimeZone(updatePolicy, entry.schedule, entry.window);
  const differs = Boolean(
    download &&
      install &&
      (download.window.startsAt !== install.window.startsAt ||
        download.window.startGraceDuration !== install.window.startGraceDuration ||
        timeZoneFor(download) !== timeZoneFor(install)),
  );

  const displayTimeZoneFor = (entry: WindowEntry) => timezoneDisplay(timeZoneFor(entry), t);

  const chip = download && install ? t('One-time') : install ? t('Update') : t('Download');

  return (
    <CollapsibleWindowPanel
      title={<PanelTitle>{getCalendarDateDisplay(primary.window.date)}</PanelTitle>}
      headerActions={
        <Label isCompact color="blue">
          {chip}
        </Label>
      }
      expandLabel={t('Expand one-time window')}
      collapseLabel={t('Collapse one-time window')}
    >
      <Stack hasGutter>
        <StackItem>
          <DescriptionList isHorizontal isCompact termWidth="8ch" className="fctl-fleet-update-policy__fields">
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Date')}</DescriptionListTerm>
              <DescriptionListDescription>{getCalendarDateDisplay(primary.window.date)}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </StackItem>
        {download && install && differs ? (
          <>
            <StackItem>
              <PanelTitle>{t('Download')}</PanelTitle>
            </StackItem>
            <StackItem>
              <OneTimeSideFields window={download.window} timeZone={displayTimeZoneFor(download)} />
            </StackItem>
            <StackItem>
              <Divider />
            </StackItem>
            <StackItem>
              <PanelTitle>{t('Update')}</PanelTitle>
            </StackItem>
            <StackItem>
              <OneTimeSideFields window={install.window} timeZone={displayTimeZoneFor(install)} />
            </StackItem>
          </>
        ) : (
          <StackItem>
            <OneTimeSideFields window={primary.window} timeZone={displayTimeZoneFor(primary)} />
          </StackItem>
        )}
      </Stack>
    </CollapsibleWindowPanel>
  );
};

/**
 * Fleet-detail card for the update policy: recurring schedule and one-time windows,
 * straight from `downloadSchedule` / `updateSchedule`.
 */
const FleetUpdatePolicyContent = ({ fleet }: { fleet: Fleet }) => {
  const { t } = useTranslation();

  const updatePolicy = getUpdatePolicyValues(fleet.spec.template?.spec?.updatePolicy);

  const entries: WindowEntry[] = [
    ...updatePolicy.downloadOneTimeWindows.map((window) => ({ schedule: 'download' as const, window })),
    ...updatePolicy.installOneTimeWindows.map((window) => ({ schedule: 'install' as const, window })),
  ];
  const activeEntries = entries.filter(
    (entry) =>
      !timeUtils.isOneTimeWindowExpired(
        entry.window.date,
        entry.window.startsAt,
        entry.window.startGraceDuration,
        getOneTimeWindowTimeZone(updatePolicy, entry.schedule, entry.window),
      ),
  );
  const expiredEntries = entries.filter((entry) =>
    timeUtils.isOneTimeWindowExpired(
      entry.window.date,
      entry.window.startsAt,
      entry.window.startGraceDuration,
      getOneTimeWindowTimeZone(updatePolicy, entry.schedule, entry.window),
    ),
  );

  const windowGroups = timeUtils
    .groupOneTimeWindowEntries(activeEntries)
    .flatMap((group): WindowEntry[][] =>
      group.length > 1 && group.every((entry) => entry.schedule === group[0].schedule)
        ? group.map((entry) => [entry])
        : [group],
    );
  const hasRecurring = timeUtils.hasRecurringSchedule(updatePolicy);

  const expiredTitle =
    expiredEntries.length === 1
      ? getCalendarDateDisplay(expiredEntries[0].window.date)
      : t('{{count}} past windows', { count: expiredEntries.length });

  return (
    <Card className="fctl-fleet-update-policy">
      <CardTitle>
        <LabelWithHelperText
          label={t('Maintenance windows')}
          content={t(
            'Windows control when devices may start downloading and installing updates. Work already in progress can finish after a window ends.',
          )}
        />
      </CardTitle>
      <CardBody>
        <Stack hasGutter>
          {!hasRecurring && !entries.length ? (
            <StackItem>
              <Content component="p">{t('None configured')}</Content>
            </StackItem>
          ) : (
            <>
              <StackItem>
                <DescriptionList isHorizontal isCompact termWidth="14ch">
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Global download timezone')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {timezoneDisplay(updatePolicy.downloadTimeZone, t)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Global update timezone')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {timezoneDisplay(updatePolicy.installTimeZone, t)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </StackItem>
              {hasRecurring && (
                <StackItem>
                  <RecurringSection updatePolicy={updatePolicy} />
                </StackItem>
              )}

              {windowGroups.map((group) => (
                <StackItem key={group[0].window.id}>
                  <OneTimeWindowFields entries={group} updatePolicy={updatePolicy} />
                </StackItem>
              ))}

              {expiredEntries.length > 0 && (
                <StackItem>
                  <CollapsibleWindowPanel
                    className="fctl-fleet-update-policy__panel--expired"
                    title={<PanelTitle>{expiredTitle}</PanelTitle>}
                    headerActions={<Label isCompact>{t('Expired')}</Label>}
                    expandLabel={t('Expand expired windows')}
                    collapseLabel={t('Collapse expired windows')}
                  >
                    <ul className="fctl-fleet-update-policy__expired-list">
                      {expiredEntries.map((entry) => (
                        <li key={entry.window.id}>
                          {getCalendarDateDisplay(entry.window.date)} · {entry.window.startsAt} · startGraceDuration:{' '}
                          {entry.window.startGraceDuration} ·{' '}
                          {timezoneDisplay(getOneTimeWindowTimeZone(updatePolicy, entry.schedule, entry.window), t)}
                        </li>
                      ))}
                    </ul>
                  </CollapsibleWindowPanel>
                </StackItem>
              )}
            </>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};

export default FleetUpdatePolicyContent;
