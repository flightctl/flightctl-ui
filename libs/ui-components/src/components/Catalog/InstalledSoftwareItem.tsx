import * as React from 'react';
import { ActionsColumn, type IAction } from '@patternfly/react-table';
import { Flex, FlexItem, Label, Popover, StackItem } from '@patternfly/react-core';

import type { SpecCatalogItemId } from '../../utils/catalog';
import { getUpdates } from '../../utils/catalog';
import { useTranslation } from '../../hooks/useTranslation';
import { buildAllDropdownActions } from '../common/ActionsDropdownList';
import type { ResolvedCatalogItemData } from './specCatalogItems';
import { type CatalogEditWizardMode } from '../../utils/catalog';
import CatalogItemTitle, { BrokenCatalogItemTitle } from './CatalogItemTitle';
import { CatalogItemUpdateBadge } from './CatalogItemBadges';

const SoftwareItemTitle = ({
  catalogItemId,
  data,
}: {
  catalogItemId: SpecCatalogItemId;
  data?: ResolvedCatalogItemData;
}) => {
  const appName = catalogItemId.type === 'app' && catalogItemId.appName ? catalogItemId.appName : '';
  if (!data) {
    return <BrokenCatalogItemTitle catalogRef={catalogItemId.ref} headerTitle={appName} />;
  }

  const itemName = (data.item.spec.displayName || data.item.metadata.name) as string;
  return (
    <CatalogItemTitle
      headerTitle={appName || itemName}
      description={appName ? itemName : undefined}
      item={data.item}
      channel={data.channel}
      version={data.version?.version}
    />
  );
};

const SoftwareItemUpdateBadge = ({
  data,
  onEdit,
  canEdit,
}: {
  data: ResolvedCatalogItemData;
  onEdit: VoidFunction;
  canEdit: boolean;
}) => {
  const { item, version, channel } = data;
  if (!version) {
    return null;
  }

  const updates = getUpdates(item, channel, version.version);
  return <CatalogItemUpdateBadge hasUpdates={updates.length > 0} onUpdate={canEdit ? onEdit : undefined} />;
};

const SoftwareItemDeprecation = ({ data }: { data: ResolvedCatalogItemData }) => {
  const { t } = useTranslation();
  const deprecationMessage = data.item.spec.deprecation?.message || data.version?.deprecation?.message;
  if (!deprecationMessage) {
    return null;
  }

  return (
    <Popover bodyContent={deprecationMessage} withFocusTrap triggerAction="click">
      <Label variant="outline" color="orange">
        {t('Deprecated')}
      </Label>
    </Popover>
  );
};

type InstalledSoftwareItemProps = {
  catalogItemId: SpecCatalogItemId;
  data?: ResolvedCatalogItemData;
  onEdit: (id: SpecCatalogItemId, mode: CatalogEditWizardMode) => void;
  onDelete: VoidFunction;
  canEdit: boolean;
};

const InstalledSoftwareItem = ({ catalogItemId, data, onEdit, onDelete, canEdit }: InstalledSoftwareItemProps) => {
  const { t } = useTranslation();

  const isValidCatalogItem = !!data;

  const regularActions: IAction[] = [];
  const dangerActions: IAction[] = [];
  if (canEdit) {
    const invalidItemProps = isValidCatalogItem
      ? undefined
      : {
          isAriaDisabled: true,
          tooltipProps: {
            content: t('The referenced catalog item is invalid. This catalog item cannot be edited.'),
          },
        };
    regularActions.push({
      title: t('Edit'),
      onClick: () => onEdit(catalogItemId, 'edit'),
      ...invalidItemProps,
    });
  }
  // We allow deleting catalog items also when their references are broken
  if (canEdit) {
    dangerActions.push({
      title: t('Delete'),
      onClick: onDelete,
    });
  }

  const actions = buildAllDropdownActions(regularActions, dangerActions);
  return (
    <StackItem>
      <Flex alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem grow={{ default: 'grow' }}>
          <SoftwareItemTitle catalogItemId={catalogItemId} data={data} />
        </FlexItem>

        {isValidCatalogItem && (
          <>
            <FlexItem>
              <SoftwareItemUpdateBadge data={data} onEdit={() => onEdit(catalogItemId, 'update')} canEdit={canEdit} />
            </FlexItem>
            <FlexItem>
              <SoftwareItemDeprecation data={data} />
            </FlexItem>
          </>
        )}

        {actions.length > 0 && (
          <FlexItem>
            <ActionsColumn items={actions} />
          </FlexItem>
        )}
      </Flex>
    </StackItem>
  );
};

export default InstalledSoftwareItem;
