import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  GitBranch,
  Info,
  Maximize2,
  Network,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import EmptyState from '../components/ui/EmptyState';
import { FullPageSpinner } from '../components/ui/Spinner';
import { getApiErrorMessage } from '../services/api/apiClient';
import evidenceService from '../services/evidence/evidenceService';
import { investigationService } from '../services/investigation/investigationService';
import { titleCase } from '../utils/format';
import InvestigationNode from '../components/graph/InvestigationNode';

const nodeTypes = { investigation: InvestigationNode };

const edgeLabels = {
  CONTAINS_URL: 'contains URL',
  REFERENCES_DOMAIN: 'references domain',
  MENTIONS_EMAIL: 'mentions email',
  SHARES_INDICATOR: 'shares indicator',
  REDIRECTS_TO: 'redirects to',
  MATCHES_THREAT_INDICATOR: 'matches threat',
  ASSOCIATED_WITH: 'associated with',
};

const edgeColors = {
  MATCHES_THREAT_INDICATOR: 'rgb(var(--pt-critical))',
  SHARES_INDICATOR: 'var(--text-primary)',
  REFERENCES_DOMAIN: 'var(--accent)',
  CONTAINS_URL: 'var(--accent)',
  MENTIONS_EMAIL: 'var(--accent)',
};

const layoutNodes = (nodes) => {
  let invIdx = 0;
  let evIdx = 0;
  let indIdx = 0;

  return nodes.map((node) => {
    let x;
    let y;

    if (node.type === 'INVESTIGATION') {
      x = 0;
      y = 40 + invIdx++ * 138;
    } else if (['MESSAGE', 'EMAIL', 'FILE'].includes(node.type)) {
      x = 315;
      y = 40 + evIdx++ * 138;
    } else {
      x = 630 + (indIdx % 2) * 303;
      y = 40 + Math.floor(indIdx / 2) * 138;
      indIdx++;
    }

    return {
      id: node.id,
      type: 'investigation',
      position: { x, y },
      ariaLabel: `${titleCase(node.type)}: ${node.label}`,
      className: 'group',
      data: node,
    };
  });
};

const layoutEdges = (edges, nodes) => {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  return edges.map((edge) => {
    const color = edgeColors[edge.type] || 'var(--text-secondary)';
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    const label = edgeLabels[edge.type] || titleCase(edge.type);
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      label,
      ariaLabel: label,
      data: {
        ...edge,
        sourceEvidenceId: source?.evidenceId,
        targetEvidenceId: target?.evidenceId,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color },
      style: { stroke: color, strokeWidth: 2, strokeDasharray: edge.verificationStatus === 'AI_SUGGESTED' ? '5 4' : undefined },
      labelStyle: { fill: 'var(--text-primary)', fontSize: 12, fontWeight: 600 },
      labelBgStyle: { fill: 'var(--bg-surface)', stroke: 'var(--border-default)' },
      labelBgPadding: [7, 4],
      labelBgBorderRadius: 4,
    };
  });
};

const verificationTone = {
  DIRECT: 'VERIFIED',
  DIRECTLY_EXTRACTED: 'VERIFIED',
  DETERMINISTICALLY_MATCHED: 'VERIFIED',
  EXTERNALLY_VERIFIED: 'VERIFIED',
  AI_SUGGESTED: 'AI_INFERENCE',
  VERIFIED_MALICIOUS: 'CRITICAL',
  VERIFIED_SUSPICIOUS: 'HIGH',
  SYNTHETIC_TEST_INDICATOR: 'SYNTHETIC_TEST_INDICATOR',
};

const DetailValue = ({ label, children, mono = false }) => (
  <div className="min-w-0">
    <dt className="section-label text-text-secondary">{label}</dt>
    <dd className={mono ? 'mt-1 break-all font-mono text-xs leading-relaxed text-text-primary' : 'mt-1 text-sm leading-relaxed text-text-primary'}>
      {children}
    </dd>
  </div>
);

const DetailPanel = ({ selected, onClose, findings }) => {
  const isEdge = selected?.kind === 'edge';
  const item = selected?.data;

  return (
    <aside className="min-w-0 border-t border-cyber-border bg-cyber-surface xl:max-h-[min(65vh,700px)] xl:overflow-y-auto xl:border-l xl:border-t-0" aria-label="Graph provenance">
      <div className="flex items-center justify-between gap-3 border-b border-cyber-border px-4 py-3">
        <h2 className="text-sm font-semibold text-text-primary">{isEdge ? 'Relationship Provenance' : 'Provenance'}</h2>
        {selected && (
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-text-secondary hover:bg-cyber-elevated hover:text-text-primary"
            aria-label="Close graph details"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {item ? (
        <div className="p-4">
          <p className="section-label text-cyan-primary">{isEdge ? edgeLabels[item.type] || titleCase(item.type) : titleCase(item.type)}</p>
          <dl className="mt-4 space-y-4">
            {isEdge ? (
              <>
                <DetailValue label="Why this exists">{item.explanation || 'No explanation was provided.'}</DetailValue>
                <DetailValue label="Source reference" mono>{item.sourceReference || 'Not provided'}</DetailValue>
                <DetailValue label="Supporting evidence" mono>
                  <span className="block">Source: {item.sourceEvidenceId || 'Not provided'}</span>
                  <span className="block">Target: {item.targetEvidenceId || 'Indicator relationship'}</span>
                </DetailValue>
              </>
            ) : (
              <>
                <DetailValue label="Entity value" mono>{item.label}</DetailValue>
                <DetailValue label="Source evidence" mono>{item.evidenceId || 'Investigation-level entity'}</DetailValue>
              </>
            )}
            <DetailValue label="Verification">
              <Badge status={verificationTone[item.verificationStatus] || item.verificationStatus}>
                {titleCase(item.verificationStatus || 'UNKNOWN')}
              </Badge>
            </DetailValue>
            {isEdge && (
              <DetailValue label="Confidence" mono>
                {item.confidence == null ? 'Unknown' : `${Math.round(item.confidence * 100)}%`}
              </DetailValue>
            )}
          </dl>
          {!isEdge && findings.length > 0 && (
            <div className="mt-4 border-t border-cyber-border pt-4">
              <h3 className="section-label text-text-secondary">Related findings</h3>
              <ul className="mt-2 space-y-2 text-sm text-text-primary">
                {findings.map((finding, index) => (
                  <li key={`${finding.title}-${index}`} className="break-words border-l-2 border-epistemic-inference pl-2.5">
                    {finding.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="flex items-start gap-2 px-4 py-5 text-sm leading-relaxed text-text-secondary">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-primary" aria-hidden="true" />
          Select a node or relationship to inspect provenance
        </p>
      )}
    </aside>
  );
};

const EvidenceGraphContent = () => {
  const { id } = useParams();
  const { fitView } = useReactFlow();
  const [graph, setGraph] = useState(null);
  const [investigation, setInvestigation] = useState(null);
  const [selected, setSelected] = useState(null);
  const [findingsByEvidence, setFindingsByEvidence] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const loadGraph = useCallback(async () => {
    const [result, context] = await Promise.all([
      investigationService.getGraph(id),
      investigationService.getById(id),
    ]);
    const evidence = await evidenceService.list(id);
    const analyses = await Promise.all(
      evidence.map(async (item) => ({
        evidenceId: item.id,
        executions: await evidenceService.listAnalysis(item.id).catch(() => []),
      }))
    );
    const relatedFindings = Object.fromEntries(
      analyses.map(({ evidenceId, executions }) => [
        evidenceId,
        executions.flatMap((execution) => {
          try {
            return JSON.parse(execution.outputJson || '{}').findings || [];
          } catch {
            return [];
          }
        }),
      ])
    );
    setGraph(result);
    setInvestigation(context);
    setNodes(layoutNodes(result.nodes || []));
    setEdges(layoutEdges(result.edges || [], result.nodes || []));
    setFindingsByEvidence(relatedFindings);
  }, [id, setEdges, setNodes]);

  useEffect(() => {
    loadGraph()
      .catch((err) =>
        setError(getApiErrorMessage(err, 'Could not load the investigation graph.'))
      )
      .finally(() => setLoading(false));
  }, [loadGraph]);

  const selectedFindings = useMemo(() => {
    if (!selected || selected.kind !== 'node') return [];
    return findingsByEvidence[selected.data.evidenceId] || [];
  }, [findingsByEvidence, selected]);

  const inspectSelection = useCallback(({ nodes: [node], edges: [edge] }) => {
    if (node) setSelected({ kind: 'node', data: node.data });
    else if (edge) setSelected({ kind: 'edge', data: edge.data });
    else setSelected(null);
  }, []);

  if (loading) return <FullPageSpinner label="Loading relationship graph…" />;
  if (error) {
    return (
      <div role="alert" className="flex items-start gap-3 rounded-lg border border-risk-critical/35 bg-risk-critical/10 p-4 text-sm text-text-primary">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-risk-critical" aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }

  const hasGraphData = nodes.length > 0;
  return (
    <div className="min-w-0 space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link to={`/investigations/${id}`} className="text-link mb-2 inline-flex items-center gap-1.5 text-sm">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to investigation
          </Link>
          <h1 className="page-heading">Evidence relationship graph</h1>
          <p className="page-lede mt-1 break-words text-text-secondary">{investigation?.title || 'Investigation'}</p>
        </div>
        <Link
          to={`/investigations/${id}/campaign`}
          className="inline-flex min-h-9 w-fit shrink-0 items-center gap-2 rounded-md border border-cyber-border bg-cyber-surface px-3 text-sm font-medium text-text-primary hover:bg-cyber-elevated"
        >
          <Network className="h-4 w-4 text-cyan-primary" aria-hidden="true" />
          Campaign Signals
        </Link>
      </header>

      {!hasGraphData ? (
        <Card>
          <EmptyState
            icon={GitBranch}
            title="No relationships yet"
            message="Submit evidence and run deterministic extraction before opening the graph."
          />
        </Card>
      ) : (
        <section className="workstation-panel overflow-hidden" aria-label="Evidence graph">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyber-border px-4 py-2.5">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-text-secondary">
              <span><strong className="font-mono text-text-primary">{graph?.nodes?.length || 0}</strong> nodes</span>
              <span><strong className="font-mono text-text-primary">{graph?.edges?.length || 0}</strong> relationships</span>
            </div>
            <button
              type="button"
              onClick={() => fitView({ padding: 0.15, duration: 0 })}
              title="Fit to view"
              className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-cyber-border px-2.5 text-xs font-medium text-text-primary hover:bg-cyber-elevated"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              Fit view
            </button>
          </div>
          <div className="grid min-w-0 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="relative h-[min(54vh,500px)] min-h-[330px] min-w-0 xl:h-[min(65vh,700px)] xl:min-h-[470px]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onSelectionChange={inspectSelection}
                onNodeClick={(_, node) => setSelected({ kind: 'node', data: node.data })}
                onEdgeClick={(_, edge) => setSelected({ kind: 'edge', data: edge.data })}
                onPaneClick={() => setSelected(null)}
                nodesConnectable={false}
                deleteKeyCode={null}
                fitView
                fitViewOptions={{ padding: 0.15, maxZoom: 1.1 }}
                minZoom={0.2}
                maxZoom={1.85}
                proOptions={{ hideAttribution: true }}
                className="bg-cyber-canvas [&_g.selected>path:first-of-type]:!stroke-[var(--accent)] [&_g.selected>path:first-of-type]:!stroke-[3px]"
              >
                <Background color="var(--border-default)" gap={22} size={1} />
                <Controls
                  position="bottom-left"
                  showFitView={false}
                  showInteractive={false}
                  className="overflow-hidden rounded-md border border-cyber-border !shadow-none [&_button]:!size-9 [&_button]:!border-cyber-border [&_button]:!bg-cyber-surface [&_button]:!fill-text-primary [&_button:hover]:!bg-cyber-elevated"
                />
                <MiniMap
                  nodeColor={(node) => node.data?.type === 'INVESTIGATION' ? 'var(--accent)' : 'var(--text-muted)'}
                  bgColor="var(--bg-surface)"
                  maskColor="rgba(16, 19, 21, 0.66)"
                  maskStrokeColor="var(--text-muted)"
                  maskStrokeWidth={1}
                  ariaLabel="Graph minimap"
                  className="!hidden !h-[72px] !w-[110px] overflow-hidden rounded-md border border-cyber-border !shadow-none sm:!block"
                />
              </ReactFlow>
            </div>
            <DetailPanel selected={selected} onClose={() => setSelected(null)} findings={selectedFindings} />
          </div>
        </section>
      )}

      {hasGraphData && graph.edges?.length === 0 && (
        <p className="flex items-start gap-2 text-sm text-text-secondary">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-cyan-primary" aria-hidden="true" /> Nodes exist, but no supported relationships were found.
        </p>
      )}
    </div>
  );
};

export const EvidenceGraphPage = (props) => {
  return (
    <ReactFlowProvider>
      <EvidenceGraphContent {...props} />
    </ReactFlowProvider>
  );
};

export default EvidenceGraphPage;
