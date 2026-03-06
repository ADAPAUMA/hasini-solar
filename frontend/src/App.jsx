import { useState, useEffect, useCallback } from "react";

const API = "https://hasini-solar.onrender.com/api";

const STATUS_CONFIG = {
  bank_payment_1:    { label: "బ్యాంక్ నుండి మొదటి పేమెంట్",  en: "1st Bank Payment",  color: "#f59e0b", bg: "#fef3c7", step: 1 },
  site_installation: { label: "సైట్ Installation Completed",   en: "Site Installation",  color: "#3b82f6", bg: "#dbeafe", step: 2 },
  bank_payment_2:    { label: "బ్యాంక్ నుండి రెండోవ పేమెంట్", en: "2nd Bank Payment",   color: "#8b5cf6", bg: "#ede9fe", step: 3 },
  site_completed:    { label: "కస్టమర్ సైట్ Completed ✓",       en: "Site Completed",     color: "#10b981", bg: "#d1fae5", step: 4 },
};

function apiFetch(path, opts = {}, token) {
  return fetch(API + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  }).then(r => r.json());
}

// ── Solar Background ──────────────────────────────────────────────────────────
function SolarBG() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 40%,#0f4c2a 100%)" }} />
      <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px" }}>
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: "200px", height: "2px",
            background: "linear-gradient(90deg,rgba(251,191,36,0.5),transparent)",
            transformOrigin: "left center", transform: `rotate(${i * 30}deg)`, animation: "spin 20s linear infinite" }} />
        ))}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "90px", height: "90px", borderRadius: "50%",
          background: "radial-gradient(circle,#fbbf24,#f59e0b)", boxShadow: "0 0 60px 30px rgba(251,191,36,0.25)" }} />
      </div>
      <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", opacity: 0.1 }} viewBox="0 0 1200 260" preserveAspectRatio="xMidYMax meet">
        {[...Array(8)].map((_, col) => [0, 1, 2].map((row) => (
          <g key={`${col}-${row}`} transform={`translate(${col * 155 + 10},${row * 84 + 10})`}>
            <rect width="140" height="74" rx="4" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1.5" />
            {[1, 2].map(c => <line key={c} x1={c * 47} y1="0" x2={c * 47} y2="74" stroke="#3b82f6" strokeWidth="0.8" />)}
            <line x1="0" y1="37" x2="140" y2="37" stroke="#3b82f6" strokeWidth="0.8" />
          </g>
        )))}
      </svg>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
function Input({ label, value, onChange, type = "text", placeholder, icon, onEnter }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      {label && <div style={{ color: "#9ca3af", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>{label}</div>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "15px" }}>{icon}</span>}
        <input type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onEnter?.()}
          style={{ width: "100%", padding: icon ? "11px 12px 11px 38px" : "11px 12px",
            borderRadius: "8px", border: "1px solid #374151", background: "#1f2937",
            color: "#f9fafb", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
      </div>
    </div>
  );
}

// ── Register ──────────────────────────────────────────────────────────────────
function RegisterPage({ onSwitch, onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.name || !form.email || !form.password) return setError("అన్ని fields పూరించండి");
    if (form.password !== form.confirm) return setError("Passwords match కావడం లేదు");
    if (form.password.length < 6) return setError("Password కనీసం 6 characters ఉండాలి");
    setLoading(true); setError("");
    const res = await apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ name: form.name, email: form.email, password: form.password }) });
    setLoading(false);
    if (res.token) onSuccess(res);
    else setError(res.message || "Registration failed");
  };

  return (
    <div style={S.card}>
      <div style={S.sun}>☀️</div>
      <h1 style={S.brand}>HASINI SOLAR INDIA PVT LTD</h1>
      <h2 style={S.title}>కొత్త Account తెరవండి</h2>
      {error && <div style={S.error}>{error}</div>}
      <Input placeholder="మీ పూర్తి పేరు" value={form.name} onChange={v => setForm({ ...form, name: v })} icon="👤" />
      <Input placeholder="Email Address" value={form.email} onChange={v => setForm({ ...form, email: v })} type="email" icon="📧" />
      <Input placeholder="Password (min 6)" value={form.password} onChange={v => setForm({ ...form, password: v })} type="password" icon="🔒" />
      <Input placeholder="Confirm Password" value={form.confirm} onChange={v => setForm({ ...form, confirm: v })} type="password" icon="🔑" onEnter={submit} />
      <button style={S.btn} onClick={submit} disabled={loading}>{loading ? "⏳ Loading..." : "✅ Register చేయండి"}</button>
      <p style={S.switchText}>ఖాతా ఉందా? <span style={S.link} onClick={onSwitch}>Login చేయండి</span></p>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginPage({ onSwitch, onSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.email || !form.password) return setError("Email మరియు Password ఇవ్వండి");
    setLoading(true); setError("");
    const res = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify(form) });
    setLoading(false);
    if (res.token) onSuccess(res);
    else setError(res.message || "Login failed");
  };

  return (
    <div style={S.card}>
      <div style={S.sun}>☀️</div>
      <h1 style={S.brand}>HASINI SOLAR INDIA PVT LTD</h1>
      <h2 style={S.title}>లాగిన్ చేయండి</h2>
      <p style={{ textAlign: "center", color: "#6b7280", fontSize: "13px", marginBottom: "18px" }}>Customer Management System</p>
      {error && <div style={S.error}>{error}</div>}
      <Input placeholder="Email Address" value={form.email} onChange={v => setForm({ ...form, email: v })} type="email" icon="📧" />
      <Input placeholder="Password" value={form.password} onChange={v => setForm({ ...form, password: v })} type="password" icon="🔒" onEnter={submit} />
      <button style={S.btn} onClick={submit} disabled={loading}>{loading ? "⏳ Logging in..." : "🔓 Login చేయండి"}</button>
      <p style={S.switchText}>ఖాతా లేదా? <span style={S.link} onClick={onSwitch}>Register చేయండి</span></p>
    </div>
  );
}

// ── Status Pill ───────────────────────────────────────────────────────────────
function Pill({ status }) {
  const c = STATUS_CONFIG[status];
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "20px",
      fontSize: "11px", fontWeight: 700, background: c.bg, color: c.color,
      border: `1px solid ${c.color}40`, whiteSpace: "nowrap" }}>
      {c.step}. {c.en}
    </span>
  );
}

// ── Customer Modal ────────────────────────────────────────────────────────────
function Modal({ customer, token, onClose, onSaved }) {
  const [form, setForm] = useState({
    customerName: customer?.customerName || "",
    village: customer?.village || "",
    bank: customer?.bank || "",
    bankVillage: customer?.bankVillage || "",
    phone: customer?.phone || "",
    status: customer?.status || "bank_payment_1",
    notes: customer?.notes || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.customerName || !form.village || !form.bank || !form.phone)
      return setError("అన్ని * fields పూరించండి");
    setLoading(true); setError("");
    const isEdit = !!customer;
    const res = await apiFetch(isEdit ? `/customers/${customer._id}` : "/customers",
      { method: isEdit ? "PUT" : "POST", body: JSON.stringify(form) }, token);
    setLoading(false);
    if (res._id) onSaved();
    else setError(res.message || "Save failed");
  };

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h2 style={{ margin: 0, color: "#f9fafb", fontSize: "17px" }}>{customer ? "✏️ Customer Edit" : "➕ కొత్త Customer"}</h2>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        {error && <div style={S.error}>{error}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <Input label="కస్టమర్ పేరు *" value={form.customerName} onChange={set("customerName")} placeholder="Customer Name" />
          <Input label="కస్టమర్ ఊరు *" value={form.village} onChange={set("village")} placeholder="Village" />
          <Input label="బ్యాంక్ *" value={form.bank} onChange={set("bank")} placeholder="Bank Name" />
          <Input label="బ్యాంక్ ఊరు" value={form.bankVillage} onChange={set("bankVillage")} placeholder="Bank Location" />
          <Input label="ఫోన్ నంబర్ *" value={form.phone} onChange={set("phone")} placeholder="Phone Number" />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <div style={{ color: "#9ca3af", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>స్టేటస్ Select చేయండి</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} onClick={() => set("status")(key)} style={{
                padding: "10px 8px", borderRadius: "8px", cursor: "pointer", textAlign: "center",
                background: form.status === key ? cfg.color : "#1f2937",
                color: form.status === key ? "white" : "#6b7280",
                border: `2px solid ${form.status === key ? cfg.color : "transparent"}`,
                transition: "all 0.2s", fontSize: "12px", fontWeight: 600
              }}>
                <div style={{ fontSize: "18px", marginBottom: "3px" }}>{"💳🔧💰✅"[cfg.step - 1]}</div>
                {cfg.step}. {cfg.en}
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: "14px" }}>
          <div style={{ color: "#9ca3af", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>Notes</div>
          <textarea value={form.notes} onChange={e => set("notes")(e.target.value)} placeholder="అదనపు వివరాలు..."
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #374151",
              background: "#1f2937", color: "#f9fafb", fontSize: "13px", outline: "none",
              boxSizing: "border-box", height: "65px", resize: "vertical" }} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ ...S.btn, flex: 1, marginBottom: 0 }} onClick={save} disabled={loading}>
            {loading ? "⏳ Saving..." : customer ? "💾 Update చేయండి" : "✅ Save చేయండి"}
          </button>
          <button style={S.cancelBtn} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Delete ────────────────────────────────────────────────────────────
function Confirm({ onConfirm, onCancel }) {
  return (
    <div style={S.overlay}>
      <div style={{ ...S.modal, maxWidth: "320px", textAlign: "center" }}>
        <div style={{ fontSize: "42px", marginBottom: "12px" }}>⚠️</div>
        <p style={{ color: "#f9fafb", fontSize: "16px", marginBottom: "20px" }}>ఈ customer ని delete చేయాలా?</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={onConfirm} style={{ background: "#7f1d1d", color: "#fca5a5", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>🗑️ Delete</button>
          <button style={S.cancelBtn} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ user, token, onLogout }) {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ total: 0, byStatus: [] });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [view, setView] = useState("table");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (filterStatus) params.append("status", filterStatus);
    const data = await apiFetch(`/customers?${params}`, {}, token);
    setCustomers(Array.isArray(data) ? data : []);
    const s = await apiFetch("/stats", {}, token);
    if (s.total !== undefined) setStats(s);
    setLoading(false);
  }, [search, filterStatus, token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getCount = key => stats.byStatus?.find(s => s._id === key)?.count || 0;

  const handleDelete = async () => {
    await apiFetch(`/customers/${deleteId}`, { method: "DELETE" }, token);
    setDeleteId(null); fetchAll();
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 24px", background: "rgba(17,24,39,0.96)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ margin: 0, color: "#fbbf24", fontSize: "18px", fontWeight: 800 }}>☀️ HASINI SOLAR INDIA PVT LTD</h1>
          <p style={{ margin: "2px 0 0", color: "#9ca3af", fontSize: "12px" }}>Customer Management System</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ background: "#1f2937", color: "#d1d5db", padding: "6px 12px", borderRadius: "20px", fontSize: "13px" }}>👤 {user.name}</span>
          <button style={S.cancelBtn} onClick={onLogout}>🚪 Logout</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "12px", padding: "20px 24px 0" }}>
        {[
          { label: "Total", value: stats.total, icon: "👥", color: "#3b82f6" },
          { label: "1st Payment", value: getCount("bank_payment_1"), icon: "💳", color: "#f59e0b" },
          { label: "Installation", value: getCount("site_installation"), icon: "🔧", color: "#3b82f6" },
          { label: "2nd Payment", value: getCount("bank_payment_2"), icon: "💰", color: "#8b5cf6" },
          { label: "Completed", value: getCount("site_completed"), icon: "✅", color: "#10b981" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(17,24,39,0.9)", borderRadius: "10px", padding: "14px 12px",
            display: "flex", alignItems: "center", gap: "10px",
            border: "1px solid rgba(255,255,255,0.07)", borderTop: `4px solid ${s.color}` }}>
            <span style={{ fontSize: "22px" }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "10px", padding: "16px 24px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "180px", maxWidth: "360px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input placeholder="పేరు, ఊరు, బ్యాంక్, ఫోన్..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px",
              border: "1px solid #374151", background: "#1f2937", color: "#f9fafb",
              fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #374151",
            background: "#1f2937", color: "#f9fafb", fontSize: "13px", outline: "none" }}>
          <option value="">అన్ని Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.step}. {v.en}</option>)}
        </select>
        <div style={{ display: "flex", gap: "6px" }}>
          {["table", "cards"].map(m => (
            <button key={m} onClick={() => setView(m)}
              style={{ width: "38px", height: "38px", borderRadius: "7px", border: "none",
                background: view === m ? "#3b82f6" : "#374151", color: "white", cursor: "pointer", fontSize: "15px" }}>
              {m === "table" ? "☰" : "⊞"}
            </button>
          ))}
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }}
          style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "white",
            border: "none", padding: "10px 16px", borderRadius: "8px",
            fontWeight: 700, cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap" }}>
          + కొత్త Customer
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#9ca3af", fontSize: "18px" }}>⏳ Loading...</div>
      ) : customers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#6b7280", fontSize: "17px" }}>
          📭 Customers లేరు. + కొత్త Customer నొక్కండి!
        </div>
      ) : view === "table" ? (
        <div style={{ margin: "0 24px", background: "rgba(17,24,39,0.9)", borderRadius: "12px", overflow: "auto", border: "1px solid rgba(255,255,255,0.07)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "650px" }}>
            <thead>
              <tr>{["#", "పేరు", "ఊరు", "బ్యాంక్", "బ్యాంక్ ఊరు", "ఫోన్", "స్టేటస్", "Actions"].map(h => (
                <th key={h} style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", padding: "12px 14px",
                  textAlign: "left", fontSize: "12px", fontWeight: 700,
                  borderBottom: "1px solid rgba(255,255,255,0.07)", whiteSpace: "nowrap" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={c._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={S.td}>{i + 1}</td>
                  <td style={{ ...S.td, fontWeight: 600, color: "#f9fafb" }}>{c.customerName}</td>
                  <td style={S.td}>{c.village}</td>
                  <td style={S.td}>{c.bank}</td>
                  <td style={S.td}>{c.bankVillage}</td>
                  <td style={S.td}>{c.phone}</td>
                  <td style={S.td}><Pill status={c.status} /></td>
                  <td style={S.td}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button onClick={() => { setEditItem(c); setShowModal(true); }}
                        style={{ background: "#1d4ed8", color: "white", border: "none", padding: "5px 11px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>✏️ Edit</button>
                      <button onClick={() => setDeleteId(c._id)}
                        style={{ background: "#7f1d1d", color: "#fca5a5", border: "none", padding: "5px 9px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "12px", padding: "0 24px" }}>
          {customers.map(c => {
            const cfg = STATUS_CONFIG[c.status];
            return (
              <div key={c._id} style={{ background: "rgba(17,24,39,0.9)", borderRadius: "12px", padding: "16px",
                border: "1px solid rgba(255,255,255,0.07)", borderLeft: `5px solid ${cfg.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#f9fafb", fontSize: "16px" }}>{c.customerName}</h3>
                    <p style={{ margin: "3px 0 0", color: "#9ca3af", fontSize: "12px" }}>📍 {c.village}</p>
                  </div>
                  <Pill status={c.status} />
                </div>
                <div style={{ fontSize: "12px", color: "#d1d5db", marginBottom: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                  <span>🏦 {c.bank}</span><span>📍 {c.bankVillage}</span><span>📱 {c.phone}</span>
                </div>
                <div style={{ display: "flex", gap: "3px", marginBottom: "10px" }}>
                  {Object.values(STATUS_CONFIG).map(s => (
                    <div key={s.step} style={{ flex: 1, height: "4px", borderRadius: "2px", background: s.step <= cfg.step ? cfg.color : "#374151" }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => { setEditItem(c); setShowModal(true); }}
                    style={{ flex: 1, background: "#1d4ed8", color: "white", border: "none", padding: "7px", borderRadius: "7px", cursor: "pointer", fontSize: "12px" }}>✏️ Edit</button>
                  <button onClick={() => setDeleteId(c._id)}
                    style={{ background: "#7f1d1d", color: "#fca5a5", border: "none", padding: "7px 10px", borderRadius: "7px", cursor: "pointer", fontSize: "12px" }}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <Modal customer={editItem} token={token} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchAll(); }} />}
      {deleteId && <Confirm onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  card: { background: "rgba(17,24,39,0.93)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "18px", padding: "40px 34px", width: "100%", maxWidth: "420px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", animation: "fadeUp 0.5s ease" },
  sun: { textAlign: "center", fontSize: "42px", marginBottom: "6px" },
  brand: { textAlign: "center", fontSize: "14px", fontWeight: 800, color: "#fbbf24", letterSpacing: "0.8px", margin: "0 0 12px", lineHeight: 1.4 },
  title: { textAlign: "center", color: "#f9fafb", margin: "0 0 18px", fontSize: "21px" },
  btn: { width: "100%", padding: "12px", borderRadius: "9px", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "white", fontWeight: 700, fontSize: "15px", border: "none", cursor: "pointer", marginBottom: "12px" },
  cancelBtn: { background: "#374151", color: "#d1d5db", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" },
  error: { background: "#7f1d1d", color: "#fca5a5", padding: "9px 12px", borderRadius: "8px", marginBottom: "12px", fontSize: "13px" },
  switchText: { textAlign: "center", color: "#6b7280", fontSize: "13px", margin: 0 },
  link: { color: "#fbbf24", cursor: "pointer", textDecoration: "underline" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" },
  modal: { background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "26px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", animation: "fadeUp 0.3s ease" },
  closeBtn: { background: "#374151", color: "#d1d5db", border: "none", width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer", fontSize: "14px" },
  td: { padding: "11px 14px", color: "#d1d5db", fontSize: "13px" },
};

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("login");
  const [authData, setAuthData] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hasini_auth")) || null; }
    catch { return null; }
  });

  const handleAuth = data => { localStorage.setItem("hasini_auth", JSON.stringify(data)); setAuthData(data); };
  const handleLogout = () => { localStorage.removeItem("hasini_auth"); setAuthData(null); };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <SolarBG />
      <div style={{ position: "relative", zIndex: 1 }}>
        {authData ? (
          <Dashboard user={authData.user} token={authData.token} onLogout={handleLogout} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "20px" }}>
            {page === "login"
              ? <LoginPage onSwitch={() => setPage("register")} onSuccess={handleAuth} />
              : <RegisterPage onSwitch={() => setPage("login")} onSuccess={handleAuth} />}
          </div>
        )}
      </div>
    </div>
  );
}
