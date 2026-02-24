import { useState, useEffect, useCallback } from 'react';

interface AgentInfo {
  id: string;
  name: string;
  description: string;
  status: string;
  metrics: {
    tasksCompleted: number;
    tasksFailed: number;
    averageResponseTimeMs: number;
    totalTokensUsed: number;
  };
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: number;
}

interface RuleCounts {
  global: number;
  etsy: number;
  scraper: number;
  pricing: number;
  social: number;
  va: number;
  total: number;
}

interface MCPServer {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  toolCount: number;
}

export default function AgentDashboard() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [ruleCounts, setRuleCounts] = useState<RuleCounts | null>(null);
  const [mcpServers, setMCPServers] = useState<MCPServer[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [taskType, setTaskType] = useState('');
  const [taskInput, setTaskInput] = useState('{}');
  const [taskResult, setTaskResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'agents' | 'workflows' | 'rules' | 'mcp'>('agents');

  const fetchData = useCallback(async () => {
    try {
      const [agentRes, workflowRes, rulesRes, mcpRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/agents/workflows'),
        fetch('/api/agents/rules'),
        fetch('/api/mcp'),
      ]);

      if (agentRes.ok) {
        const data = await agentRes.json();
        setAgents(data.agents || []);
        setSystemMetrics(data.system);
      }
      if (workflowRes.ok) {
        const data = await workflowRes.json();
        setWorkflows(data.templates || []);
      }
      if (rulesRes.ok) {
        const data = await rulesRes.json();
        setRuleCounts(data.counts);
      }
      if (mcpRes.ok) {
        const data = await mcpRes.json();
        setMCPServers(data.servers || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const executeTask = async () => {
    if (!selectedAgent || !taskType) return;
    setLoading(true);
    setTaskResult(null);

    try {
      let input = {};
      try { input = JSON.parse(taskInput); } catch { input = {}; }

      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          taskType,
          input,
        }),
      });

      const data = await res.json();
      setTaskResult(data);
    } catch (error: any) {
      setTaskResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (templateName: string) => {
    setLoading(true);
    setTaskResult(null);

    try {
      const res = await fetch('/api/agents/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName, params: { niche: 'funny t-shirts' } }),
      });

      const data = await res.json();
      setTaskResult(data);
    } catch (error: any) {
      setTaskResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'idle': return '#22c55e';
      case 'running': return '#3b82f6';
      case 'error': return '#ef4444';
      case 'paused': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const agentTaskTypes: Record<string, string[]> = {
    'scraper-etsy-products': ['scrape_competitor_products', 'find_low_competition', 'scrape_search_results', 'monitor_competitors', 'deep_competitor_analysis'],
    'scraper-etsy-trends': ['detect_trends', 'analyze_niche', 'seasonal_forecast', 'daily_trend_check', 'find_emerging'],
    'scraper-competitors': ['profile_competitor', 'map_market', 'reverse_engineer_seo', 'price_benchmark', 'find_weaknesses'],
    'agent-product-listing': ['generate_listing', 'generate_batch', 'generate_warmup_listings', 'update_value_proposition', 'generate_variations'],
    'agent-seo': ['optimize_listing', 'keyword_research', 'audit_listing', 'basic_seo', 'refresh_tags', 'differentiation_seo', 'bulk_optimize'],
    'agent-pricing': ['analyze_and_set_price', 'set_competitive_price', 'daily_price_adjustment', 'competitive_price_response', 'cost_analysis', 'market_price_map', 'bundle_pricing'],
    'agent-social': ['create_launch_campaign', 'daily_post', 'create_content_calendar', 'generate_pinterest_pins', 'generate_instagram_content', 'generate_tiktok_scripts'],
    'agent-zero': ['execute_workflow', 'decompose_goal', 'agent_health_check'],
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid #334155', padding: '20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Agent Command Center
            </h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '14px' }}>
              AI-Powered Etsy/Shopify Dropshipping Automation
            </p>
          </div>
          {systemMetrics && (
            <div style={{ display: 'flex', gap: '24px' }}>
              <MetricCard label="Total Agents" value={systemMetrics.totalAgents} />
              <MetricCard label="Active" value={systemMetrics.activeAgents} color="#22c55e" />
              <MetricCard label="Tasks Done" value={systemMetrics.totalTasksCompleted} color="#3b82f6" />
              <MetricCard label="Tokens Used" value={systemMetrics.totalTokensUsed?.toLocaleString()} color="#a78bfa" />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          {(['agents', 'workflows', 'rules', 'mcp'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                backgroundColor: activeTab === tab ? '#3b82f6' : '#1e293b',
                color: activeTab === tab ? '#fff' : '#94a3b8',
                transition: 'all 0.2s',
              }}
            >
              {tab === 'agents' ? 'Agents' : tab === 'workflows' ? 'Workflows' : tab === 'rules' ? 'Rules' : 'MCP Servers'}
            </button>
          ))}
        </div>
      </header>

      <main style={{ padding: '24px 40px' }}>
        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Agent List */}
            <div>
              <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>AI Agents ({agents.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {agents.map(agent => (
                  <div
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent.id);
                      setTaskType('');
                      setTaskResult(null);
                    }}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: selectedAgent === agent.id ? '#1e3a5f' : '#1e293b',
                      border: `1px solid ${selectedAgent === agent.id ? '#3b82f6' : '#334155'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>{agent.name}</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>{agent.id}</p>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: statusColor(agent.status) + '20',
                        color: statusColor(agent.status),
                      }}>
                        {agent.status}
                      </span>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#cbd5e1' }}>{agent.description}</p>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                      <span>Done: {agent.metrics.tasksCompleted}</span>
                      <span>Failed: {agent.metrics.tasksFailed}</span>
                      <span>Tokens: {agent.metrics.totalTokensUsed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Execution Panel */}
            <div>
              <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Execute Task</h2>
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
                {selectedAgent ? (
                  <>
                    <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 12px 0' }}>
                      Agent: <strong style={{ color: '#60a5fa' }}>{selectedAgent}</strong>
                    </p>

                    <label style={{ fontSize: '14px', color: '#94a3b8' }}>Task Type</label>
                    <select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value)}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '8px', marginTop: '4px', marginBottom: '12px',
                        backgroundColor: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', fontSize: '14px',
                      }}
                    >
                      <option value="">Select task type...</option>
                      {(agentTaskTypes[selectedAgent] || []).map(tt => (
                        <option key={tt} value={tt}>{tt}</option>
                      ))}
                    </select>

                    <label style={{ fontSize: '14px', color: '#94a3b8' }}>Input (JSON)</label>
                    <textarea
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      rows={4}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '8px', marginTop: '4px', marginBottom: '12px',
                        backgroundColor: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', fontSize: '13px',
                        fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box',
                      }}
                    />

                    <button
                      onClick={executeTask}
                      disabled={loading || !taskType}
                      style={{
                        width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                        backgroundColor: loading ? '#334155' : '#3b82f6',
                        color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {loading ? 'Executing...' : 'Execute Task'}
                    </button>
                  </>
                ) : (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>
                    Select an agent from the list to execute tasks
                  </p>
                )}

                {taskResult && (
                  <div style={{ marginTop: '16px' }}>
                    <h3 style={{ fontSize: '14px', color: '#94a3b8' }}>Result:</h3>
                    <pre style={{
                      padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a',
                      border: '1px solid #334155', fontSize: '12px', overflow: 'auto',
                      maxHeight: '400px', whiteSpace: 'pre-wrap', color: '#a7f3d0',
                    }}>
                      {JSON.stringify(taskResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Automation Workflows</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {workflows.map(wf => (
                <div key={wf.id} style={{
                  padding: '20px', borderRadius: '12px', backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#60a5fa' }}>{wf.name}</h3>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#94a3b8' }}>{wf.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{wf.steps} steps</span>
                    <button
                      onClick={() => executeWorkflow(wf.id)}
                      disabled={loading}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: 'none',
                        backgroundColor: '#22c55e', color: '#fff', fontSize: '13px',
                        fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Run Workflow
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {taskResult && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px' }}>Workflow Result:</h3>
                <pre style={{
                  padding: '16px', borderRadius: '12px', backgroundColor: '#1e293b',
                  border: '1px solid #334155', fontSize: '12px', overflow: 'auto',
                  maxHeight: '500px', whiteSpace: 'pre-wrap', color: '#a7f3d0',
                }}>
                  {JSON.stringify(taskResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && ruleCounts && (
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>
              Agent Rules & Policies ({ruleCounts.total} total)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {Object.entries(ruleCounts).filter(([k]) => k !== 'total').map(([category, count]) => (
                <div key={category} style={{
                  padding: '20px', borderRadius: '12px', backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', textTransform: 'capitalize', color: '#60a5fa' }}>
                    {category} Rules
                  </h3>
                  <p style={{ margin: 0, fontSize: '32px', fontWeight: 700 }}>{count as number}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                    {category === 'global' && 'Applied to all agents'}
                    {category === 'etsy' && 'Etsy platform compliance'}
                    {category === 'scraper' && 'Web scraping safety'}
                    {category === 'pricing' && 'Pricing intelligence'}
                    {category === 'social' && 'Social media automation'}
                    {category === 'va' && 'Virtual assistant management'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MCP Tab */}
        {activeTab === 'mcp' && (
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>
              MCP Servers ({mcpServers.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {mcpServers.map(server => (
                <div key={server.id} style={{
                  padding: '20px', borderRadius: '12px', backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#60a5fa' }}>{server.name}</h3>
                    <span style={{
                      padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                      backgroundColor: server.enabled ? '#22c55e20' : '#ef444420',
                      color: server.enabled ? '#22c55e' : '#ef4444',
                    }}>
                      {server.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '13px', color: '#94a3b8' }}>{server.description}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    {server.toolCount} tools available
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: any; color?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '24px', fontWeight: 700, color: color || '#e2e8f0' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: '#64748b' }}>{label}</div>
    </div>
  );
}
