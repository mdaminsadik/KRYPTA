import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight,
  ArrowUpRight, Bell, BrainCircuit, Building2, CheckCircle2,
  ChevronDown, CircleDollarSign, Clock3, Download, Eye,
  FileSearch, Filter, Fingerprint, GitBranch, LayoutDashboard,
  LoaderCircle, Network, RefreshCw, Search, Shield,
  ShieldAlert, ShieldCheck, SlidersHorizontal, Target,
  TrendingDown, Wallet, Zap
} from "lucide-react";

import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, PieChart, Pie, Cell,
  BarChart, Bar
} from "recharts";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Live Monitoring", icon: Activity },
  { label: "Fraud Intelligence", icon: BrainCircuit },
  { label: "AML Network", icon: Network },
  { label: "Investigations", icon: FileSearch },
  { label: "Digital Twin", icon: GitBranch },
  { label: "Reports", icon: Building2 }
];

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

const number = (value) =>
  new Intl.NumberFormat("en-IN").format(value || 0);

function RiskBadge({ level }) {
  return (
    <span className={`risk-badge ${(level || "low").toLowerCase()}`}>
      {level || "LOW"}
    </span>
  );
}

function SectionTitle({ kicker, title, description, right }) {
  return (
    <div className="section-title">
      <div>
        <div className="eyebrow">{kicker}</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {right}
    </div>
  );
}

function StatCard({ title, value, detail, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className={`stat-icon ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-bottom">{detail}</div>
    </div>
  );
}

function TransactionTable({ transactions, onSelect }) {
  if (!transactions?.length) {
    return <div className="empty-state">No matching transactions found.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>TRANSACTION</th>
            <th>SENDER</th>
            <th>RECEIVER</th>
            <th>AMOUNT</th>
            <th>RISK SCORE</th>
            <th>CLASSIFICATION</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.transaction_id}>
              <td>
                <strong>{tx.transaction_id}</strong>
                <small>{tx.channel}</small>
              </td>
              <td className="account-code">{tx.sender}</td>
              <td className="account-code">{tx.receiver}</td>
              <td className="amount">{money(tx.amount)}</td>
              <td>
                <div className="score-cell">
                  <strong>{tx.risk_score}</strong>
                  <div className="score-track">
                    <i style={{ width: `${tx.risk_score}%` }} />
                  </div>
                </div>
              </td>
              <td><RiskBadge level={tx.risk_level} /></td>
              <td>
                <button
                  className="icon-button"
                  onClick={() => onSelect?.(tx)}
                  title="Inspect transaction"
                >
                  <Eye size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NetworkGraph({ network, selectedAccount, onSelect }) {
  const nodes = network?.nodes || [];
  const edges = (network?.edges || []).filter(
    (edge) => Number(edge.amount) >= 50000
  );

  const width = 760;
  const height = 440;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 165;

  const positions = useMemo(() => {
    const result = {};

    nodes.forEach((node, index) => {
      const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2;
      result[node.id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    });

    return result;
  }, [nodes]);

  const suspiciousAccounts = new Set([
    "ACC9001", "ACC9002", "ACC9003", "ACC9004", "ACC9005"
  ]);

  return (
    <div className="network-canvas">
      <svg viewBox={`0 0 ${width} ${height}`} role="img"
        aria-label="High-value financial transaction network">
        <defs>
          <marker
            id="money-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L7,3 z" fill="#B96D57" />
          </marker>
        </defs>

        {edges.map((edge, index) => {
          const source = positions[edge.source];
          const target = positions[edge.target];

          if (!source || !target) return null;

          return (
            <line
              key={`${edge.source}-${edge.target}-${index}`}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="#C77B68"
              strokeWidth={Math.min(3, 1 + edge.amount / 100000)}
              strokeOpacity=".55"
              markerEnd="url(#money-arrow)"
            />
          );
        })}

        {nodes.map((node) => {
          const position = positions[node.id];
          const suspicious = suspiciousAccounts.has(node.id);
          const selected = selectedAccount === node.id;

          return (
            <g
              key={node.id}
              onClick={() => onSelect(node.id)}
              className="graph-node"
              style={{ cursor: "pointer" }}
            >
              {selected && (
                <circle
                  cx={position.x}
                  cy={position.y}
                  r="18"
                  fill="none"
                  stroke="#167C68"
                  strokeWidth="2"
                />
              )}
              <circle
                cx={position.x}
                cy={position.y}
                r={suspicious ? 9 : 6}
                fill={suspicious ? "#C74747" : "#4C9A7B"}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={position.x}
                y={position.y - 14}
                textAnchor="middle"
                className="graph-label"
              >
                {node.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("Overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [account, setAccount] = useState("ACC9001");
  const [intervention, setIntervention] = useState("hold_transfers");
  const [simulation, setSimulation] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API}/api/intelligence/analyse`);
      setData(response.data);
    } catch (err) {
      setError(
        "Unable to connect to the KRYPTA intelligence API. Check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const transactions = data?.transactions || [];
  const alerts = data?.alerts || [];
  const summary = data?.summary || {};
  const network = data?.network || { nodes: [], edges: [] };

  const filteredTransactions = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return transactions;

    return transactions.filter((tx) =>
      [
        tx.transaction_id,
        tx.sender,
        tx.receiver,
        tx.channel,
        tx.risk_level
      ].some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
  }, [transactions, search]);

  const riskDistribution = [
    {
      name: "Critical",
      value: transactions.filter((tx) => tx.risk_level === "CRITICAL").length,
      color: "#C74747"
    },
    {
      name: "High",
      value: transactions.filter((tx) => tx.risk_level === "HIGH").length,
      color: "#D58D43"
    },
    {
      name: "Medium",
      value: transactions.filter((tx) => tx.risk_level === "MEDIUM").length,
      color: "#D5B45E"
    },
    {
      name: "Low",
      value: transactions.filter((tx) => tx.risk_level === "LOW").length,
      color: "#4A9A79"
    }
  ];

  const amountChart = [...alerts]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 7)
    .map((tx) => ({
      name: tx.transaction_id,
      amount: tx.amount,
      score: tx.risk_score
    }));

  const runSimulation = async () => {
    try {
      setSimulating(true);
      setSimulation(null);

      const response = await axios.get(
        `${API}/api/digital-twin/simulate`,
        {
          params: {
            account_id: account,
            intervention
          }
        }
      );

      setSimulation(response.data);
    } catch {
      setError("Digital Twin simulation failed. Please check the backend.");
    } finally {
      setSimulating(false);
    }
  };

  const exportReport = () => {
    const report = {
      platform: "KRYPTA",
      generated_at: new Date().toISOString(),
      disclaimer: "Synthetic demonstration data. Not a real-world crime determination.",
      summary,
      alerts
    };

    const blob = new Blob(
      [JSON.stringify(report, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "krypta-investigation-report.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const firstAlert = alerts[0];

  const renderOverview = () => (
    <>
      <SectionTitle
        kicker="FINANCIAL CRIME INTELLIGENCE / OVERVIEW"
        title="Intelligence Overview"
        description="A consolidated view of transaction activity, emerging risk signals and investigation priorities."
        right={
          <div className="heading-actions">
            <div className="date-pill">
              <Clock3 size={14} />
              Synthetic demonstration
            </div>
            <button className="primary-button" onClick={loadData}>
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              Refresh intelligence
            </button>
          </div>
        }
      />

      <div className="section-caption">
        <span>MONITORING SNAPSHOT</span>
        <span className="updated">LIVE API DATA</span>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Transactions analysed"
          value={number(summary.total_transactions)}
          detail="Transactions processed by the engine"
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Suspicious transactions"
          value={number(summary.suspicious_transactions)}
          detail="Flagged for further investigation"
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title="Critical alerts"
          value={number(summary.critical_alerts)}
          detail="Highest-priority risk classification"
          icon={AlertTriangle}
          color="orange"
        />
        <StatCard
          title="Monitored accounts"
          value={number(summary.accounts_monitored)}
          detail="Unique accounts in transaction network"
          icon={Wallet}
          color="green"
        />
      </div>

      <div className="analytics-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Priority transaction exposure</h3>
              <p>Highest-value flagged transactions</p>
            </div>
            <span className="subtle-label">TOP ALERTS</span>
          </div>

          <div className="chart-legend">
            <span><i className="legend-blue" /> Transaction amount</span>
          </div>

          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amountChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF0EC" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip formatter={(value) => money(value)} />
                <Bar dataKey="amount" fill="#167C68" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Risk classification</h3>
              <p>Distribution across analysed transactions</p>
            </div>
            <span className="subtle-label">RISK PROFILE</span>
          </div>

          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={53}
                  outerRadius={75}
                  paddingAngle={3}
                  stroke="none"
                >
                  {riskDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <strong>{number(summary.total_transactions)}</strong>
              <span>ANALYSED</span>
            </div>
          </div>

          <div className="risk-legend">
            {riskDistribution.map((item) => (
              <div key={item.name}>
                <span><i style={{ background: item.color }} />{item.name}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lower-grid">
        <div className="panel alerts-panel">
          <div className="panel-header">
            <div>
              <h3>Priority investigation queue</h3>
              <p>Transactions requiring analyst attention</p>
            </div>
            <button className="text-button" onClick={() => setActive("Investigations")}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <TransactionTable
            transactions={alerts.slice(0, 5)}
            onSelect={setSelectedTransaction}
          />
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Network intelligence</h3>
              <p>Structural indicators</p>
            </div>
            <Network size={17} className="network-icon" />
          </div>

          <div className="network-stat">
            <div className="network-stat-icon"><GitBranch size={18} /></div>
            <div>
              <strong>{number(summary.network_cycles)}</strong>
              <span>Detected network cycles</span>
            </div>
          </div>

          <div className="network-stat">
            <div className="network-stat-icon purple"><Wallet size={18} /></div>
            <div>
              <strong>{number(network.nodes?.length)}</strong>
              <span>Connected accounts</span>
            </div>
          </div>

          <div className="network-callout">
            <div><ShieldAlert size={15} /> Circular flow indicator</div>
            <p>
              A high-value transaction cycle has been identified in the
              synthetic monitoring network.
            </p>
            <button onClick={() => setActive("AML Network")}>
              Explore MoneyTrail <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className="intel-brief">
        <div className="intel-brief-head">
          <div>
            <span className="intel-brief-kicker">KRYPTA / INTELLIGENCE BRIEF</span>
            <h3>Investigation priorities</h3>
            <p>Automated signals from the current synthetic transaction dataset.</p>
          </div>
          <span className="brief-status"><i /> ENGINE OPERATIONAL</span>
        </div>

        <div className="intel-brief-grid">
          <div className="intel-brief-item priority">
            <span>PRIORITY ALERTS</span>
            <strong>{number(summary.critical_alerts)}</strong>
            <small>Critical classifications</small>
          </div>
          <div className="intel-brief-item">
            <span>NETWORK CYCLES</span>
            <strong>{number(summary.network_cycles)}</strong>
            <small>High-value cyclic structures</small>
          </div>
          <div className="intel-brief-item">
            <span>FLAGGED EXPOSURE</span>
            <strong>{money(alerts.reduce((sum, tx) => sum + tx.amount, 0))}</strong>
            <small>Value of flagged records</small>
          </div>
          <div className="intel-brief-item">
            <span>PRIORITY ACCOUNT</span>
            <strong className="brief-account">{firstAlert?.sender || "â€”"}</strong>
            <small>First item in alert queue</small>
          </div>
        </div>

        <div className="intel-brief-foot">
          <p>
            Risk scores combine transaction value, account activity,
            network structure and machine-learning anomaly signals.
          </p>
          <button onClick={() => setActive("Digital Twin")}>
            OPEN DIGITAL TWIN <ArrowRight size={13} />
          </button>
        </div>

        <div className="intel-disclaimer">
          SYNTHETIC DEMONSTRATION DATA Â· ALERTS ARE INVESTIGATIVE LEADS, NOT PROOF OF CRIME
        </div>
      </div>
    </>
  );

  const renderMonitoring = () => (
    <>
      <SectionTitle
        kicker="TRANSACTION SURVEILLANCE"
        title="Live Monitoring"
        description="Review the transaction stream and examine risk signals generated by the intelligence engine."
      />
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Transaction stream</h3>
            <p>{transactions.length} records returned by the analysis API</p>
          </div>
          <button className="primary-button" onClick={loadData}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        <div className="search-toolbar">
          <Search size={15} />
          <input
            placeholder="Search transaction, account, channel or risk level..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span>{filteredTransactions.length} records</span>
        </div>
        <TransactionTable
          transactions={filteredTransactions}
          onSelect={setSelectedTransaction}
        />
      </div>
    </>
  );

  const renderIntelligence = () => (
    <>
      <SectionTitle
        kicker="BEHAVIOURAL ANALYSIS"
        title="Fraud Intelligence"
        description="Explainable risk scoring combining anomaly detection, transaction behaviour and network signals."
      />
      <div className="stats-grid">
        <StatCard title="Flagged records" value={number(alerts.length)} detail="Risk score â‰¥ 40" icon={Target} color="red" />
        <StatCard title="Critical records" value={number(summary.critical_alerts)} detail="Risk score â‰¥ 70" icon={AlertTriangle} color="orange" />
        <StatCard title="Network cycles" value={number(summary.network_cycles)} detail="High-value network structures" icon={GitBranch} color="blue" />
        <StatCard title="Accounts monitored" value={number(summary.accounts_monitored)} detail="Unique transaction participants" icon={Fingerprint} color="green" />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Explainable alert register</h3>
            <p>Each alert includes its contributing risk indicators.</p>
          </div>
          <span className="subtle-label">EXPLAINABLE AI</span>
        </div>
        <div className="intelligence-list">
          {alerts.map((tx) => (
            <button
              className="intelligence-row"
              key={tx.transaction_id}
              onClick={() => setSelectedTransaction(tx)}
            >
              <div className="intelligence-row-main">
                <ShieldAlert size={18} />
                <div>
                  <strong>{tx.transaction_id}</strong>
                  <small>{tx.sender} â†’ {tx.receiver}</small>
                </div>
              </div>
              <div className="intelligence-reasons">
                {(tx.reasons || []).map((reason) => (
                  <span key={reason}>{reason}</span>
                ))}
              </div>
              <div className="intelligence-score">
                <strong>{tx.risk_score}/100</strong>
                <RiskBadge level={tx.risk_level} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const renderNetwork = () => (
    <>
      <SectionTitle
        kicker="MONEYTRAIL / NETWORK ANALYSIS"
        title="AML Network Intelligence"
        description="Explore high-value transaction connections and investigate structurally linked accounts."
      />

      <div className="stats-grid">
        <StatCard title="Network accounts" value={number(network.nodes?.length)} detail="Unique graph nodes" icon={Network} color="blue" />
        <StatCard title="Network connections" value={number(network.edges?.length)} detail="Directed transaction links" icon={GitBranch} color="green" />
        <StatCard title="Detected cycles" value={number(summary.network_cycles)} detail="High-value cyclic components" icon={AlertTriangle} color="red" />
        <StatCard title="Flagged transactions" value={number(alerts.length)} detail="Records requiring review" icon={ShieldAlert} color="orange" />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>MoneyTrail transaction graph</h3>
            <p>Showing high-value links of â‚¹50,000 and above. Select an account to investigate it.</p>
          </div>
          <span className="subtle-label">DIRECTED NETWORK</span>
        </div>

        <div className="graph-legend">
          <span><i className="legend-critical" /> Accounts in suspicious flow</span>
          <span><i className="legend-normal" /> Other accounts</span>
          <span><i className="legend-edge" /> High-value transfer</span>
        </div>

        <NetworkGraph
          network={network}
          selectedAccount={account}
          onSelect={setAccount}
        />

        <div className="graph-selection">
          <span>Selected investigation account</span>
          <strong>{account}</strong>
          <button className="primary-button" onClick={() => setActive("Digital Twin")}>
            Simulate intervention <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </>
  );

  const renderInvestigations = () => (
    <>
      <SectionTitle
        kicker="CASE MANAGEMENT"
        title="Investigation Workbench"
        description="Review flagged transfers, inspect their contributing risk signals and export an investigation register."
        right={
          <button className="primary-button" onClick={exportReport}>
            <Download size={14} /> Export report
          </button>
        }
      />

      <div className="stats-grid">
        <StatCard title="Investigation queue" value={number(alerts.length)} detail="Flagged transaction records" icon={FileSearch} color="blue" />
        <StatCard title="Critical priority" value={number(summary.critical_alerts)} detail="Highest risk classification" icon={AlertTriangle} color="red" />
        <StatCard title="Flagged exposure" value={money(alerts.reduce((sum, tx) => sum + tx.amount, 0))} detail="Value of flagged records" icon={CircleDollarSign} color="orange" />
        <StatCard title="Network cycles" value={number(summary.network_cycles)} detail="Potential circular movement" icon={GitBranch} color="green" />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Investigation register</h3>
            <p>Select any transaction to view its evidence and risk explanation.</p>
          </div>
          <button className="text-button" onClick={exportReport}>
            Download JSON <Download size={13} />
          </button>
        </div>
        <TransactionTable
          transactions={alerts}
          onSelect={setSelectedTransaction}
        />
      </div>
    </>
  );

  const renderDigitalTwin = () => {
    const result = simulation?.simulation;

    return (
      <>
        <SectionTitle
          kicker="COUNTERFACTUAL FINANCIAL CRIME SIMULATION"
          title="Financial Crime Digital Twin"
          description="Test hypothetical interventions against the synthetic transaction network before choosing an investigation response."
          right={<span className="subtle-label">SIMULATION ENVIRONMENT</span>}
        />

        <div className="twin-intro">
          <div className="twin-intro-icon"><BrainCircuit size={25} /></div>
          <div>
            <h3>From detection to intervention intelligence</h3>
            <p>
              KRYPTA compares the current flagged exposure with an illustrative
              counterfactual scenario after a selected intervention.
            </p>
          </div>
        </div>

        <div className="panel twin-controls">
          <div className="panel-header">
            <div>
              <h3>Configure intervention scenario</h3>
              <p>Choose an account and a hypothetical response strategy.</p>
            </div>
            <span className="subtle-label">SCENARIO BUILDER</span>
          </div>

          <div className="twin-form">
            <label>
              INVESTIGATION ACCOUNT
              <select value={account} onChange={(e) => setAccount(e.target.value)}>
                {(network.nodes || []).map((node) => (
                  <option key={node.id} value={node.id}>{node.id}</option>
                ))}
              </select>
            </label>

            <label>
              INTERVENTION STRATEGY
              <select value={intervention} onChange={(e) => setIntervention(e.target.value)}>
                <option value="hold_transfers">Hold outgoing flagged transfers</option>
                <option value="enhanced_verification">Enhanced verification</option>
                <option value="manual_review">Manual analyst review</option>
              </select>
            </label>

            <button
              className="primary-button simulate-button"
              onClick={runSimulation}
              disabled={simulating}
            >
              {simulating
                ? <LoaderCircle size={15} className="spin" />
                : <Zap size={15} />}
              {simulating ? "Running scenario..." : "Run counterfactual simulation"}
            </button>
          </div>
        </div>

        {result && (
          <>
            <div className="simulation-result-head">
              <div>
                <span className="intel-brief-kicker">SIMULATION COMPLETE</span>
                <h3>Counterfactual scenario results</h3>
                <p>{result.action_description}</p>
              </div>
              <span className="subtle-label">{result.intervention.replaceAll("_", " ").toUpperCase()}</span>
            </div>

            <div className="comparison-grid">
              <div className="comparison-card">
                <span>BASELINE FLAGGED EXPOSURE</span>
                <strong>{money(result.before.suspicious_exposure)}</strong>
                <small>{result.before.flagged_transactions} flagged transaction records</small>
              </div>

              <div className="comparison-arrow"><ArrowRight size={22} /></div>

              <div className="comparison-card projected">
                <span>PROJECTED EXPOSURE</span>
                <strong>{money(result.after.projected_exposure)}</strong>
                <small>{result.after.projected_flagged_transactions} flagged transaction records in the current model output</small>
              </div>

              <div className="comparison-card reduction">
                <span>ILLUSTRATIVE EXPOSURE DIFFERENCE</span>
                <strong>{money(result.projected_reduction)}</strong>
                <small>{result.projected_reduction_percentage}% of baseline exposure</small>
              </div>
            </div>

            <div className="panel simulation-explanation">
              <div className="panel-header">
                <div>
                  <h3>Scenario interpretation</h3>
                  <p>What this intervention represents in the current model.</p>
                </div>
                <CheckCircle2 size={19} color="#167C68" />
              </div>
              <p>{result.action_description}</p>
              <p><strong>Account:</strong> {result.account_id}</p>
              <p><strong>Affected transactions:</strong> {result.affected_transactions}</p>
              <div className="simulation-disclaimer">
                {simulation.disclaimer}
              </div>
            </div>
          </>
        )}

        {!result && (
          <div className="twin-empty">
            <GitBranch size={30} />
            <h3>Awaiting simulation scenario</h3>
            <p>Configure an intervention above and run the counterfactual model to see its projected impact.</p>
          </div>
        )}
      </>
    );
  };

  const renderReports = () => (
    <>
      <SectionTitle
        kicker="INTELLIGENCE OUTPUTS"
        title="Reports & Evidence"
        description="Generate a structured snapshot of the current synthetic monitoring and investigation results."
      />

      <div className="report-card">
        <div className="report-icon"><FileSearch size={24} /></div>
        <div>
          <span className="intel-brief-kicker">KRYPTA / INVESTIGATION EXPORT</span>
          <h3>Financial Crime Intelligence Report</h3>
          <p>
            Includes the monitoring summary, risk-classified alerts,
            transaction identifiers and timestamps.
          </p>
          <button className="primary-button" onClick={exportReport}>
            <Download size={14} /> Export investigation report
          </button>
        </div>
      </div>

      <div className="panel report-note">
        <ShieldCheck size={20} />
        <div>
          <h3>Evidence and model transparency</h3>
          <p>
            This hackathon prototype uses synthetic transaction data.
            Its risk classifications are investigative signals, not proof
            of fraud or money laundering. Exported data should be treated
            as a demonstration report.
          </p>
        </div>
      </div>
    </>
  );

  const views = {
    Overview: renderOverview,
    "Live Monitoring": renderMonitoring,
    "Fraud Intelligence": renderIntelligence,
    "AML Network": renderNetwork,
    Investigations: renderInvestigations,
    "Digital Twin": renderDigitalTwin,
    Reports: renderReports
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Shield size={21} /></div>
          <div>
            <h1>KRYPTA<span>.</span></h1>
            <p>FINANCIAL INTELLIGENCE</p>
          </div>
        </div>

        <div className="workspace-label">INTELLIGENCE WORKSPACE</div>

        <nav>
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${active === label ? "active" : ""}`}
              onClick={() => setActive(label)}
            >
              <Icon size={16} />
              <span>{label}</span>
              {label === "Investigations" && alerts.length > 0 && (
                <span className="nav-count">{alerts.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="security-card">
            <div className="security-icon"><ShieldCheck size={19} /></div>
            <h4>Intelligence engine</h4>
            <p>Multi-signal risk analysis and counterfactual simulation.</p>
            <div className="system-status">
              <span /> {data ? "ENGINE OPERATIONAL" : "CONNECTING"}
            </div>
          </div>

          <div className="profile">
            <div className="avatar">KA</div>
            <div className="profile-info">
              <strong>Analyst Workspace</strong>
              <span>Investigation operator</span>
            </div>
              <ChevronDown size={14} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            KRYPTA <ArrowRight size={12} /> <strong>{active}</strong>
          </div>
          <div className="topbar-right">
            <div className="live-indicator">
              <span /> SYSTEM {data ? "OPERATIONAL" : "CONNECTING"}
            </div>
            <button className="icon-button notification" title="Notifications">
              <Bell size={17} />
              {alerts.length > 0 && <i />}
            </button>
            <div className="top-avatar">KA</div>
          </div>
        </header>

        <div className="page-content">
          {error && (
            <div className="error-banner">
              <AlertTriangle size={16} />
              {error}
              <button onClick={loadData}>Retry</button>
            </div>
          )}

          {loading && !data ? (
            <div className="loading-state">
              <LoaderCircle size={25} className="spin" />
              <span>Loading financial intelligence...</span>
            </div>
          ) : (
            (views[active] || renderOverview)()
          )}

          <footer className="footer">
            <span>KRYPTA FINANCIAL CRIME INTELLIGENCE PLATFORM</span>
            <span><i className="footer-dot" /> Synthetic demo environment</span>
            <span>Â© 2026 KRYPTA</span>
          </footer>
        </div>
      </main>

      {selectedTransaction && (
        <div className="modal-backdrop" onClick={() => setSelectedTransaction(null)}>
          <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="intel-brief-kicker">TRANSACTION INVESTIGATION</span>
                <h3>{selectedTransaction.transaction_id}</h3>
              </div>
              <button className="icon-button" onClick={() => setSelectedTransaction(null)}>âœ•</button>
            </div>

            <div className="modal-amount">{money(selectedTransaction.amount)}</div>

            <div className="modal-details">
              <div><span>Sender</span><strong>{selectedTransaction.sender}</strong></div>
              <div><span>Receiver</span><strong>{selectedTransaction.receiver}</strong></div>
              <div><span>Channel</span><strong>{selectedTransaction.channel}</strong></div>
              <div><span>Risk score</span><strong>{selectedTransaction.risk_score}/100</strong></div>
              <div><span>Classification</span><RiskBadge level={selectedTransaction.risk_level} /></div>
              <div><span>Timestamp</span><strong>{new Date(selectedTransaction.timestamp).toLocaleString()}</strong></div>
            </div>

            <div className="modal-reasons">
              <h4>Contributing risk indicators</h4>
              {selectedTransaction.reasons?.length ? (
                selectedTransaction.reasons.map((reason) => (
                  <div key={reason}><AlertTriangle size={14} /> {reason}</div>
                ))
              ) : (
                <p>No additional risk indicators recorded.</p>
              )}
            </div>

            <div className="simulation-disclaimer">
              A risk classification is an investigative lead, not a determination of criminal activity.
            </div>

            <button className="primary-button modal-close" onClick={() => setSelectedTransaction(null)}>
              Close investigation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
