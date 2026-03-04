import * as React from 'react';
import { useField, useFormikContext } from 'formik';
import { CatalogItemVersion } from '@flightctl/types/alpha';
import semver from 'semver';
import { Button, Popover, Stack } from '@patternfly/react-core';
import { ArrowCircleUpIcon } from '@patternfly/react-icons/dist/js/icons';

import { useTranslation } from '../../../../hooks/useTranslation';
import { InstallSpecFormik } from '../../InstallWizard/types';

import './UpdateGraph.css';

const MoreVersions = ({ updates }: { updates: CatalogItemVersion[] }) => {
  const { t } = useTranslation();
  const [, , { setValue }] = useField<string>('version');
  return (
    <ChannelLine>
      <Popover
        headerContent={t('Other available paths')}
        bodyContent={(hide) => {
          return (
            <Stack hasGutter>
              {updates.map((u) => (
                <Button
                  key={u.version}
                  variant="link"
                  onClick={() => {
                    setValue(u.version);
                    hide();
                  }}
                >
                  {u.version}
                </Button>
              ))}
            </Stack>
          );
        }}
      >
        <Button variant="secondary" className="fctl-channel-more-versions" onClick={() => {}}>
          {t('+ More')}
        </Button>
      </Popover>
    </ChannelLine>
  );
};

const Channel = ({ children }: React.PropsWithChildren) => {
  return <div className="fctl-channel">{children}</div>;
};

const ChannelLine = ({ children }: React.PropsWithChildren) => {
  return <li className="fctl-channel-line">{children}</li>;
};

export const ChannelName = ({ children }: React.PropsWithChildren) => {
  return <span className="fctl-channel-name">{children}</span>;
};

const ChannelPath = ({ children }: React.PropsWithChildren) => {
  return <ul className="fctl-channel-path">{children}</ul>;
};

const ChannelVersion = ({ children }: React.PropsWithChildren) => {
  return <span className="fctl-channel-version">{children}</span>;
};

const ChannelVersionDot = ({ version, current }: { version: string; current?: boolean }) => {
  const { t } = useTranslation();
  const [{ value }, , { setValue }] = useField<string>('version');

  const isSelected = version === value;

  let className = 'fctl-channel-version-dot';
  let icon: React.ReactNode = undefined;
  if (current) {
    className = `${className} fctl-channel-version-dot--current`;
  } else if (isSelected) {
    className = `${className} fctl-channel-version-dot--selected`;
    icon = <ArrowCircleUpIcon />;
  }

  return (
    <Button
      variant="secondary"
      className={className}
      icon={icon}
      aria-label={t('Version {{version}}', { version })}
      onClick={() => setValue(version)}
    />
  );
};

type UpdateGraphProps = {
  currentChannel: string;
  updates: CatalogItemVersion[];
  currentVersion: CatalogItemVersion;
};

const UpdateGraph = ({ currentChannel, updates, currentVersion }: UpdateGraphProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<InstallSpecFormik>();

  const sortedUpdates = updates.sort((a, b) => semver.compare(a.version, b.version));

  let content: React.ReactNode;

  if (sortedUpdates.length === 2) {
    content = (
      <ChannelLine>
        <ChannelVersion>{sortedUpdates[0].version}</ChannelVersion>
        <ChannelVersionDot version={sortedUpdates[0].version} />
      </ChannelLine>
    );
  } else if (sortedUpdates.length > 2) {
    const updateIdx = sortedUpdates.findIndex((v) => v.version === values.version);
    if (updateIdx === -1 || updateIdx === sortedUpdates.length - 1) {
      //current or latest is selected
      content = <MoreVersions updates={sortedUpdates.slice(0, -1)} />;
    } else {
      const beforeSelectedUpd = sortedUpdates.slice(0, updateIdx);
      const afterSelectedUpd = sortedUpdates.slice(updateIdx + 1, -1);

      const getContent = (upd: CatalogItemVersion[]) => {
        if (!upd.length) {
          return undefined;
        }
        if (upd.length === 1) {
          return (
            <ChannelLine>
              <ChannelVersion>{upd[0].version}</ChannelVersion>
              <ChannelVersionDot version={upd[0].version} />
            </ChannelLine>
          );
        }
        return <MoreVersions updates={upd} />;
      };

      content = (
        <>
          {getContent(beforeSelectedUpd)}
          <ChannelLine>
            <ChannelVersion>{sortedUpdates[updateIdx].version}</ChannelVersion>
            <ChannelVersionDot version={sortedUpdates[updateIdx].version} />
          </ChannelLine>
          {getContent(afterSelectedUpd)}
        </>
      );
    }
  }

  return (
    <Channel>
      <ChannelPath>
        <ChannelLine>
          <ChannelVersion>{`${currentVersion.version} (current)`}</ChannelVersion>
          <ChannelVersionDot version={currentVersion.version} current />
        </ChannelLine>
        {content}
        <ChannelLine>
          <ChannelVersion>{sortedUpdates[sortedUpdates.length - 1].version}</ChannelVersion>
          <ChannelVersionDot version={sortedUpdates[sortedUpdates.length - 1].version} />
        </ChannelLine>
      </ChannelPath>
      <ChannelName>{t('{{currentChannel}} channel', { currentChannel })}</ChannelName>
    </Channel>
  );
};

export default UpdateGraph;
