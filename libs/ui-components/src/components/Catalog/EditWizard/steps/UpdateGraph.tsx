import { Alert, Card, CardBody, Stack, StackItem } from '@patternfly/react-core';
import semver from 'semver';
import * as React from 'react';
import {
  ComponentFactory,
  DagreLayout,
  DefaultEdge,
  DefaultNode,
  EdgeModel,
  EdgeStyle,
  GRAPH_LAYOUT_END_EVENT,
  Graph,
  GraphComponent,
  LEFT_TO_RIGHT,
  Layout,
  LayoutFactory,
  Model,
  ModelKind,
  Node,
  NodeModel,
  NodeShape,
  SELECTION_EVENT,
  TopologyControlBar,
  TopologyView,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
  WithSelectionProps,
  action,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
  observer,
  withPanZoom,
  withSelection,
} from '@patternfly/react-topology';
import { CatalogItemVersion } from '@flightctl/types/alpha';
import warningColor from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_warning_default';
import successColor from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_success_default';
import blueColor from '@patternfly/react-tokens/dist/js/chart_color_blue_400';
import { ArrowCircleUpIcon, CheckCircleIcon, WarningTriangleIcon } from '@patternfly/react-icons/dist/js/icons';

import { useTranslation } from '../../../../hooks/useTranslation';

import '@patternfly/react-topology/dist/esm/css/topology-components.css';
import '@patternfly/react-topology/dist/esm/css/topology-controlbar.css';
import '@patternfly/react-topology/dist/esm/css/topology-view.css';

import './UpdateGraph.css';

const ICON_SIZE = 12;

type VersionNodeData = {
  version: string;
  channel: string;
  isCurrentVersion: boolean;
  isDeprecated: boolean;
  entryName: string;
};

const NODE_DIAMETER = 20;

type VersionNodeProps = {
  element: Node;
} & WithSelectionProps;

const VersionNodeComponent: React.FC<VersionNodeProps> = observer(({ element, selected, onSelect }) => {
  const data = element.getData() as VersionNodeData;

  let nodeIcon: React.ReactNode = undefined;
  if (data.isCurrentVersion) {
    nodeIcon = <CheckCircleIcon width={ICON_SIZE} height={ICON_SIZE} style={{ fill: successColor.value }} />;
  } else if (data.isDeprecated) {
    nodeIcon = <WarningTriangleIcon width={ICON_SIZE} height={ICON_SIZE} style={{ fill: warningColor.value }} />;
  } else if (selected) {
    nodeIcon = <ArrowCircleUpIcon width={ICON_SIZE} height={ICON_SIZE} style={{ fill: blueColor.value }} />;
  }

  return (
    <DefaultNode element={element} selected={selected} onSelect={onSelect} showLabel={false}>
      <g transform={`translate(${NODE_DIAMETER / 2}, ${NODE_DIAMETER / 2})`}>
        <text textAnchor="middle" y={-20} style={{ fontSize: '12px' }}>
          {data.version}
        </text>
        {nodeIcon && <g transform={`translate(${-ICON_SIZE / 2}, ${-ICON_SIZE / 2})`}>{nodeIcon}</g>}
      </g>
    </DefaultNode>
  );
});

const VersionNode = withSelection()(VersionNodeComponent);

const customComponentFactory: ComponentFactory = (kind: ModelKind) => {
  switch (kind) {
    case ModelKind.graph:
      return withPanZoom()(GraphComponent);
    case ModelKind.node:
      return VersionNode as never;
    case ModelKind.edge:
      return DefaultEdge;
    default:
      return undefined;
  }
};

const customLayoutFactory: LayoutFactory = (type: string, graph: Graph): Layout | undefined =>
  new DagreLayout(graph, {
    rankdir: LEFT_TO_RIGHT,
    nodesep: 50,
    ranksep: 80,
    edgesep: 20,
  });

const buildTopologyModel = (
  currentVersionEntry: CatalogItemVersion,
  directUpgradeEntries: CatalogItemVersion[],
  currentChannel: string,
): Model => {
  const nodes: NodeModel[] = [];
  const edges: EdgeModel[] = [];

  // Deduplicate entries
  const entriesMap = new Map<string, CatalogItemVersion>();
  directUpgradeEntries.forEach((entry) => entriesMap.set(entry.version, entry));
  if (currentVersionEntry) {
    entriesMap.set(currentVersionEntry.version, currentVersionEntry);
  }
  const allEntries = Array.from(entriesMap.values());

  // Map to track version nodes for edge creation
  const versionToNodeId = new Map<string, string>();

  // Create version nodes
  allEntries.forEach((versionEntry) => {
    const versionName = versionEntry.version;
    const nodeId = versionName;

    versionToNodeId.set(versionName, nodeId);

    nodes.push({
      id: nodeId,
      type: 'node',
      label: versionName,
      width: NODE_DIAMETER,
      height: NODE_DIAMETER,
      shape: NodeShape.ellipse,
      data: {
        version: versionName,
        channel: currentChannel,
        isCurrentVersion: versionName === currentVersionEntry.version,
        isDeprecated: !!versionEntry.deprecation?.message,
        entryName: versionName,
      } as VersionNodeData,
    });
  });

  const latestVersion = allEntries
    .filter((e) => e.version !== currentVersionEntry.version)
    .sort((a, b) => semver.rcompare(a.version, b.version))[0]?.version;

  const getEdgeStyle = (source: string, target: string) =>
    source === currentVersionEntry.version && target === latestVersion ? EdgeStyle.default : EdgeStyle.dashed;

  // Create edges based on replaces, skips, and skipRange
  allEntries.forEach((entry) => {
    const targetNodeId = versionToNodeId.get(entry.version);
    if (!targetNodeId) return;

    // Edge from replaces (single version string)
    if (entry.replaces) {
      const sourceNodeId = versionToNodeId.get(entry.replaces);
      if (sourceNodeId) {
        edges.push({
          id: `edge-${sourceNodeId}-${targetNodeId}`,
          type: 'edge',
          source: sourceNodeId,
          target: targetNodeId,
          edgeStyle: getEdgeStyle(sourceNodeId, targetNodeId),
        });
      }
    }

    // Edges from skips (array of version strings)
    entry.skips?.forEach((skippedVersion) => {
      const sourceNodeId = versionToNodeId.get(skippedVersion);
      if (sourceNodeId) {
        edges.push({
          id: `edge-skip-${sourceNodeId}-${targetNodeId}`,
          type: 'edge',
          source: sourceNodeId,
          target: targetNodeId,
          edgeStyle: getEdgeStyle(sourceNodeId, targetNodeId),
        });
      }
    });

    // Edges from skipRange - find all versions in the graph that satisfy the range
    if (entry.skipRange) {
      allEntries.forEach((sourceEntry) => {
        if (sourceEntry.version === entry.version) return;
        if (semver.satisfies(sourceEntry.version, entry.skipRange!, { includePrerelease: true })) {
          const sourceNodeId = versionToNodeId.get(sourceEntry.version);
          if (sourceNodeId) {
            edges.push({
              id: `edge-skiprange-${sourceNodeId}-${targetNodeId}`,
              type: 'edge',
              source: sourceNodeId,
              target: targetNodeId,
              edgeStyle: getEdgeStyle(sourceNodeId, targetNodeId),
            });
          }
        }
      });
    }
  });

  return {
    nodes,
    edges,
    graph: {
      id: 'update-graph',
      type: 'graph',
      layout: 'Dagre',
    },
  };
};

const UpdateGraph: React.FC<{
  selectedVersion: string;
  currentVersion: CatalogItemVersion;
  updates: CatalogItemVersion[];
  currentChannel: string;
  onSelectionChange: (nodeId: string, tag: string) => void;
}> = ({ selectedVersion, currentVersion, currentChannel, updates, onSelectionChange }) => {
  const { t } = useTranslation();
  const controller = React.useMemo(() => {
    const newController = new Visualization();
    newController.registerComponentFactory(customComponentFactory);
    newController.registerLayoutFactory(customLayoutFactory);
    newController.addEventListener(GRAPH_LAYOUT_END_EVENT, () => {
      newController.getGraph().fit(80);
    });
    newController.addEventListener(SELECTION_EVENT, (ids: string[]) => {
      const selectedId = ids[0];
      if (selectedId) {
        const node = newController.getNodeById(selectedId);
        if (node) {
          const data = node.getData() as VersionNodeData | undefined;
          if (data?.entryName) {
            onSelectionChange(selectedId, data.entryName);
          }
        }
      }
    });

    const model = buildTopologyModel(currentVersion, updates, currentChannel);
    newController.fromModel(model, false);

    return newController;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChannel]);

  const update = updates.find((v) => v.version === selectedVersion);

  return (
    <Stack hasGutter>
      <StackItem>
        <Card>
          <CardBody className="fctl-update-graph">
            <VisualizationProvider controller={controller}>
              <TopologyView
                style={{
                  backgroundColor: 'unset',
                }}
                controlBar={
                  <TopologyControlBar
                    controlButtons={createTopologyControlButtons({
                      ...defaultControlButtonsOptions,
                      fitToScreenCallback: action(() => {
                        controller.getGraph().fit(80);
                      }),
                      zoomIn: false,
                      zoomOut: false,
                      resetView: false,
                      legend: false,
                    })}
                  />
                }
              >
                <VisualizationSurface state={{ selectedIds: [selectedVersion] }} />
              </TopologyView>
            </VisualizationProvider>
          </CardBody>
        </Card>
      </StackItem>
      {!update && currentVersion.deprecation && (
        <StackItem>
          <Alert isInline variant="warning" title={t('The current version is deprecated')}>
            {currentVersion.deprecation.message}
          </Alert>
        </StackItem>
      )}
      {update?.deprecation && (
        <StackItem>
          <Alert isInline variant="warning" title={t('The selected version is deprecated')}>
            {update.deprecation.message}
          </Alert>
        </StackItem>
      )}
    </Stack>
  );
};

export default UpdateGraph;
