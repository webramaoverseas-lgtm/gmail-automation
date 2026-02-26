import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;

function App() {
  const [page, setPage] = useState("dashboard");
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({});
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(null); // null, true, false

  const refresh = async () => {
    try {
      const resp = await axios.get(`${API}/analytics`);
      setStats(resp.data);
      const cResp = await axios.get(`${API}/contacts`);
      setContacts(cResp.data);
      setConnected(true);
    } catch (e) {
      setConnected(false);
      console.error("Backend offline:", e);
    }
  };

  useEffect(() => {
    refresh();
    fetchTemplates(); // Templates are not part of the health check, fetch once
    const interval = setInterval(refresh, 10000); // Refresh stats and contacts every 10s
    return () => clearInterval(interval);
  }, []);

  // Original fetchContacts and fetchStats are now integrated into refresh for periodic updates
  // Keeping them separate for potential individual calls if needed, but refresh handles the main data flow.
  const fetchContacts = async () => {
    const res = await axios.get(`${API}/contacts`);
    setContacts(res.data);
  };

  const fetchStats = async () => {
    const res = await axios.get(`${API}/analytics`);
    setStats(res.data);
  };

  const fetchTemplates = async () => {
    const res = await axios.get(`${API}/templates`);
    setTemplates(res.data);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <h1 style={{ marginBottom: "40px", color: "var(--accent-primary)" }}>DigitalVibe</h1>
          <div style={{ fontSize: "10px", marginTop: "4px", color: connected ? "#10b981" : "#f43f5e" }}>
            {connected ? "● Connected" : "● Offline / Disconnected"}
          </div>
          <div style={{ fontSize: "9px", opacity: 0.4, marginTop: "2px" }}>{API}</div>
        </div>
        <button className={`nav-link ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}>Dashboard</button>
        <button className={`nav-link ${page === "contacts" ? "active" : ""}`} onClick={() => setPage("contacts")}>Contacts</button>
        <button className={`nav-link ${page === "templates" ? "active" : ""}`} onClick={() => setPage("templates")}>Templates</button>
        <button className={`nav-link ${page === "tracking" ? "active" : ""}`} onClick={() => setPage("tracking")}>Tracking</button>
        <button className={`nav-link ${page === "campaign" ? "active" : ""}`} onClick={() => setPage("campaign")}>Campaign</button>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        {page === "dashboard" && <Dashboard stats={stats} />}
        {page === "contacts" && <ContactsTable contacts={contacts} refresh={refresh} />}
        {page === "templates" && <Templates templates={templates} fetchTemplates={fetchTemplates} />}
        {page === "tracking" && <Tracking />}
        {page === "campaign" && <Campaign refresh={refresh} loading={loading} setLoading={setLoading} />}
      </div>
    </div>
  );
}

/* =========================
   DASHBOARD PAGE
 ========================= */
function Dashboard({ stats }) {
  const replyRate = stats.total > 0 ? ((stats.replied / stats.total) * 100).toFixed(1) : 0;
  const convRate = stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : 0;

  return (
    <div>
      <h1 style={{ marginBottom: "32px" }}>Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <StatItem title="Total Reach" value={stats.total} />
        <StatItem title="Reply Rate" value={`${replyRate}%`} color="#38bdf8" />
        <StatItem title="Conversion Rate" value={`${convRate}%`} color="#22c55e" />
        <StatItem title="Replied" value={stats.replied} color="#fbbf24" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginTop: "40px" }}>
        <div className="glass-card">
          <h3>Automation Pipeline</h3>
          <p style={{ color: "var(--text-dim)", marginTop: "8px" }}>Sequence flow based on real-time activity.</p>
          <div style={{ marginTop: "24px", display: "flex", gap: "10px", alignItems: "center" }}>
             <PipelineNode label="Welcome" count={stats.contacted} active />
             <Connector />
             <PipelineNode label="Follow-ups" count={(stats.reengaged || 0) + (stats.interested || 0)} active />
             <Connector />
             <PipelineNode label="LTO / Success" count={(stats.lto || 0) + (stats.converted || 0)} />
          </div>
        </div>

        <div className="glass-card">
            <h3>Recent Metrics</h3>
            <div style={{ marginTop: "20px" }}>
                <MetricItem label="New Leads" value={stats.new} />
                <MetricItem label="Re-Engaged" value={stats.reengaged} />
                <MetricItem label="Interested" value={stats.interested} />
                <MetricItem label="Converted" value={stats.converted} />
            </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ label, value }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px" }}>
            <span style={{ color: "var(--text-dim)" }}>{label}</span>
            <span style={{ fontWeight: "700" }}>{value || 0}</span>
        </div>
    )
}

function StatItem({ title, value, color }) {
  return (
    <div className="glass-card">
      <h4 style={{ color: "var(--text-dim)", fontWeight: "500" }}>{title}</h4>
      <p style={{ fontSize: "32px", fontWeight: "700", marginTop: "10px", color: color }}>{value || 0}</p>
    </div>
  );
}

function PipelineNode({ label, count, active }) {
    return (
        <div style={{ 
            padding: "16px", 
            borderRadius: "12px", 
            background: active ? "rgba(56, 189, 248, 0.1)" : "rgba(255,255,255,0.05)",
            border: active ? "1px solid var(--accent-primary)" : "1px solid transparent",
            minWidth: "120px",
            textAlign: "center"
        }}>
            <div style={{ fontWeight: "600", fontSize: "12px" }}>{label}</div>
            <div style={{ fontSize: "18px", fontWeight: "700", marginTop: "4px" }}>{count || 0}</div>
        </div>
    );
}

function Connector() {
    return <div style={{ height: "2px", width: "20px", background: "var(--border-glass)" }} />
}

/* =========================
   TRACKING PAGE
 ========================= */
function Tracking() {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await axios.get(`${API}/tracking`);
        setReplies(res.data);
      } catch (err) {
        console.error("Tracking Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
    const interval = setInterval(fetchTracking, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: "32px" }}>Reply Tracker</h1>
      {replies.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", color: "var(--text-dim)", padding: "60px" }}>
            {loading ? "Loading replies..." : "No automated replies detected yet. Check back soon!"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {replies.map(r => (
            <div key={r._id} className="glass-card tracking-item">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <span style={{ fontWeight: "700", fontSize: "16px", color: "var(--accent-primary)" }}>{r.name}</span>
                  <span style={{ marginLeft: "12px", color: "var(--text-dim)", fontSize: "13px" }}>{r.email}</span>
                </div>
                <span className={`badge badge-${r.stage}`}>{r.stage}</span>
              </div>
              <div className="reply-snippet">
                <i style={{ color: "var(--text-dim)", fontSize: "14px" }}>"{r.lastReplySnippet || "No snippet available"}"</i>
              </div>
              <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-dim)", textAlign: "right" }}>
                Received {new Date(r.repliedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   CONTACTS PAGE
========================= */
function ContactsTable({ contacts, refresh }) {
  const markReplied = async (email) => {
    await axios.post(`${API}/mark-replied/${email}`);
    refresh();
  };

  const optOut = async (email) => {
    await axios.post(`${API}/opt-out/${email}`);
    refresh();
  };

  return (
    <div>
      <h1 style={{ marginBottom: "32px" }}>Contacts</h1>
      <div className="glass-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Stage</th>
              <th>Sequence</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c._id}>
                <td style={{ fontWeight: "600" }}>{c.name}</td>
                <td style={{ color: "var(--text-dim)" }}>{c.email}</td>
                <td><span className={`badge badge-${c.stage}`}>{c.stage}</span></td>
                <td>Step {c.sequenceStep + 1}</td>
                <td>
                    {c.optedOut ? <span style={{color: "var(--badge-lto)"}}>Opted Out</span> : (c.replied ? "Replied ✅" : "Sent 📩")}
                </td>
                <td>
                  {!c.replied && !c.optedOut && c.stage !== "converted" && (
                    <button onClick={() => markReplied(c.email)} style={{ background: "none", border: "1px solid #fbbf24", color: "#fbbf24", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", marginRight: "8px", cursor: "pointer" }}>Mark Reply</button>
                  )}
                  {!c.optedOut && (
                    <button onClick={() => optOut(c.email)} style={{ background: "none", border: "1px solid #f43f5e", color: "#f43f5e", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>Opt Out</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================
   TEMPLATES PAGE
========================= */
function Templates({ templates, fetchTemplates }) {
  const [editing, setEditing] = useState(null);

  const createNew = async () => {
    const name = prompt("Enter Template Name:");
    if (!name) return;
    await axios.post(`${API}/templates`, { 
      name, 
      subject: "New Subject", 
      htmlBody: "<h1>Hi {{name}}</h1>", 
      order: templates.length,
      delayDays: 3 
    });
    fetchTemplates();
  };

  const save = async (runAutomation = false) => {
    try {
      await axios.put(`${API}/templates/${editing._id}`, editing);
      if (runAutomation) {
        await axios.post(`${API}/run-automation`);
        alert("Template Saved & Automation Triggered Successfully");
      } else {
        alert("Template Saved");
      }
      setEditing(null);
      fetchTemplates();
    } catch (err) {
      alert("Error saving template: " + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1>Email Templates</h1>
        <button className="btn-primary" onClick={createNew}>+ Create New</button>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {templates.length === 0 && <p style={{ color: "var(--text-dim)" }}>No templates found. Click 'Create New' or restart server to seed defaults.</p>}
          {templates.map(t => (
            <div key={t._id} className="glass-card" style={{ cursor: "pointer", border: editing?._id === t._id ? "1px solid var(--accent-primary)" : "1px solid var(--border-glass)" }} onClick={() => setEditing(t)}>
              <h4 style={{ color: "var(--accent-primary)" }}>{t.name}</h4>
              <p style={{ fontSize: "13px", color: "var(--text-dim)" }}>{t.subject}</p>
            </div>
          ))}
        </div>

        {editing ? (
          <div className="glass-card">
            <h3>Edit: {editing.name}</h3>
            <div style={{ marginTop: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Subject</label>
              <input style={{ width: "100%", marginBottom: "20px" }} value={editing.subject} onChange={e => setEditing({ ...editing, subject: e.target.value })} />

              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "var(--text-dim)" }}>HTML Body (use {"{{name}}"} for placeholder)</label>
              <textarea 
                className="code-editor"
                style={{ width: "100%", height: "180px", marginBottom: "20px" }} 
                value={editing.htmlBody} 
                onChange={e => setEditing({ ...editing, htmlBody: e.target.value })} 
              />

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>Live Preview (Example: John Doe)</label>
                <div 
                  className="preview-box"
                  dangerouslySetInnerHTML={{ __html: editing.htmlBody.replace(/\{\{name\}\}/g, "John Doe") }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button className="btn-secondary" onClick={() => save(false)}>Save Only</button>
                <button className="btn-primary" onClick={() => save(true)}>Save & Run Automation</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)" }}>
            Select a template to edit
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   CAMPAIGN PAGE
========================= */
function Campaign({ refresh, loading, setLoading }) {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      await axios.post(`${API}/upload`, formData);
      refresh();
      alert("Contacts Uploaded Successfully");
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const launch = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/launch`);
      alert(`Outreach Campaign Started! Processing ${res.data.count} contacts in the background. Check refresh in 1 minute.`);
    } catch (err) {
      console.error("Launch Error:", err);
      alert("Campaign launch failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
      refresh();
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: "32px" }}>Campaign Control</h1>
      <div className="glass-card" style={{ maxWidth: "600px" }}>
        <h3 style={{ marginBottom: "16px" }}>1. Import Audience</h3>
        <p style={{ color: "var(--text-dim)", marginBottom: "20px" }}>Upload a CSV or Excel file with 'name' and 'email' columns.</p>
        <label className="btn-primary" style={{ display: "inline-block", cursor: "pointer" }}>
          Choose File
          <input type="file" style={{ display: "none" }} onChange={handleUpload} />
        </label>

        <hr style={{ border: "none", borderBottom: "1px solid var(--border-glass)", margin: "40px 0" }} />

        <h3 style={{ marginBottom: "16px" }}>2. Launch Outreach</h3>
        <p style={{ color: "var(--text-dim)", marginBottom: "20px" }}>This will send the 'Welcome' template to all new contacts and start the 3-day automation clock.</p>
        <button className="btn-primary" onClick={launch} disabled={loading} style={{ opacity: loading ? 0.5 : 1 }}>
          {loading ? "Launching..." : "Launch Welcome Sequence"}
        </button>
      </div>
    </div>
  );
}

export default App;