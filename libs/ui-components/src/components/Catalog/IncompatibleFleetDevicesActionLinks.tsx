import * as React from 'react';
import { Icon, List, ListItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import type { DeviceList } from '@flightctl/types';
import type { DeviceFeatures } from '@flightctl/types/alpha';

import { useFetch } from '../../hooks/useFetch';
import { Link, ROUTE } from '../../hooks/useNavigate';
import { useTranslation } from '../../hooks/useTranslation';
import { getApiListCount } from '../../utils/api';
import { getFeatureRequirementText } from '../../utils/status/devices';
import {
  type IncompatibleFleetDevicesLink,
  buildIncompatibleFleetDevicesQueries,
  commonQueries,
} from '../../utils/query';

type IncompatibleFleetDevicesActionLinksProps = {
  fleetName: string;
  featureRequirements?: DeviceFeatures;
};

/** List of failing feature requirements with links to matching incompatible devices. */
const IncompatibleFleetDevicesActionLinks = ({
  fleetName,
  featureRequirements,
}: IncompatibleFleetDevicesActionLinksProps) => {
  const { t } = useTranslation();
  const { get } = useFetch();

  // Data used to identify which features have at least one device that doesn't meet the requirement.
  const candidateLinks = React.useMemo(
    () => buildIncompatibleFleetDevicesQueries(fleetName, featureRequirements),
    [fleetName, featureRequirements],
  );

  const [incompatibleFeatureLinks, setIncompatibleFeatureLinks] = React.useState<
    IncompatibleFleetDevicesLink[] | undefined
  >();

  React.useEffect(() => {
    if (!fleetName || !candidateLinks.length) {
      setIncompatibleFeatureLinks([]);
      return;
    }

    let cancelled = false;
    const loadFailingFeatures = async () => {
      try {
        // Probe with the incompatible selector (label!=requiredValue)
        const incompatibleDeviceCounts = await Promise.all(
          candidateLinks.map((link) =>
            get<DeviceList>(commonQueries.getFullyCompatibleDeviceCount(fleetName, [link.incompatibleFilters])),
          ),
        );
        if (cancelled) {
          return;
        }
        // Only show a row for features that have at least one device that doesn't meet the requirement.
        setIncompatibleFeatureLinks(
          candidateLinks.filter((_, index) => (getApiListCount(incompatibleDeviceCounts[index]) || 0) > 0),
        );
      } catch {
        if (!cancelled) {
          setIncompatibleFeatureLinks([]);
        }
      }
    };

    void loadFailingFeatures();
    return () => {
      cancelled = true;
    };
  }, [fleetName, candidateLinks, get]);

  if (!incompatibleFeatureLinks?.length) {
    return null;
  }

  return (
    <List isPlain className="pf-v6-u-mt-sm">
      {incompatibleFeatureLinks.map(({ fieldId, mustBePresent, incompatibleQuery }) => {
        const text = getFeatureRequirementText(t, fieldId, mustBePresent);
        return (
          <ListItem key={fieldId}>
            {text}
            <Link
              to={ROUTE.DEVICES}
              query={incompatibleQuery}
              target="_blank"
              rel="noopener noreferrer"
              className="pf-v6-u-ml-xs"
            >
              {t('Review devices')}
              <Icon className="pf-v6-u-ml-xs">
                <ExternalLinkAltIcon />
              </Icon>
            </Link>
          </ListItem>
        );
      })}
    </List>
  );
};

export default IncompatibleFleetDevicesActionLinks;
