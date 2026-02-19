import { Label } from '@patternfly/react-core';
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

import { useTranslation } from '../../../hooks/useTranslation';

import '@patternfly/react-topology/dist/esm/css/topology-components.css';
import '@patternfly/react-topology/dist/esm/css/topology-controlbar.css';
import '@patternfly/react-topology/dist/esm/css/topology-view.css';

type VersionNodeData = {
  version: string;
  channel: string;
  isCurrentVersion: boolean;
  entryName: string;
};

const NODE_DIAMETER = 90;

type VersionNodeProps = {
  element: Node;
} & WithSelectionProps;

const VersionNodeComponent: React.FC<VersionNodeProps> = observer(({ element, selected, onSelect }) => {
  const { t } = useTranslation();
  const data = element.getData() as VersionNodeData;

  return (
    <DefaultNode element={element} selected={selected} onSelect={onSelect} showLabel={false}>
      <g transform={`translate(${NODE_DIAMETER / 2}, ${NODE_DIAMETER / 2})`}>
        <text
          textAnchor="middle"
          dy={data.isCurrentVersion ? '-0.3em' : '0.35em'}
          style={{ fontSize: '14px', fontWeight: 'bold' }}
        >
          {data.version}
        </text>
        {data.isCurrentVersion && (
          <foreignObject x={-30} y={5} width={60} height={24}>
            <Label color="blue" isCompact>
              {t('Current')}
            </Label>
          </foreignObject>
        )}
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
        entryName: versionName,
      } as VersionNodeData,
    });
  });

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
          edgeStyle: EdgeStyle.default,
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
          edgeStyle: EdgeStyle.dashed,
        });
      }
    });

    // Edges from skipRange - find all versions in the graph that satisfy the range
    if (entry.skipRange) {
      allEntries.forEach((sourceEntry) => {
        if (sourceEntry.version === entry.version) return; // Skip self
        if (semver.satisfies(sourceEntry.version, entry.skipRange!, { includePrerelease: true })) {
          const sourceNodeId = versionToNodeId.get(sourceEntry.version);
          if (sourceNodeId) {
            edges.push({
              id: `edge-skiprange-${sourceNodeId}-${targetNodeId}`,
              type: 'edge',
              source: sourceNodeId,
              target: targetNodeId,
              edgeStyle: EdgeStyle.dashed,
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
  selectedNodeId: string;
  currentVersion: CatalogItemVersion;
  updates: CatalogItemVersion[];
  currentChannel: string;
  onSelectionChange: (nodeId: string, tag: string) => void;
}> = ({ selectedNodeId, currentVersion, currentChannel, updates, onSelectionChange }) => {
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
  }, []);

  return (
    <VisualizationProvider controller={controller}>
      <TopologyView
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
        <VisualizationSurface state={{ selectedIds: [selectedNodeId] }} />
      </TopologyView>
    </VisualizationProvider>
  );
};

export default UpdateGraph;
