import React, { useState, useEffect, useCallback } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const STATUS_CONFIG = {
  bank_payment_1:   { label: "బ్యాంక్ నుండి మొదటి పేమెంట్", labelEn: "1st Bank Payment",  color: "#f59e0b", bg: "#fef3c7", step: 1 },
  site_installation:{ label: "సైట్ Installation Completed",  labelEn: "Site Installation",  color: "#3b82f6", bg: "#dbeafe", step: 2 },
  bank_payment_2:   { label: "బ్యాంక్ నుండి రెండోవ పేమెంట్", labelEn: "2nd Bank Payment", color: "#8b5cf6", bg: "#ede9fe", step: 3 },
  site_completed:   { label: "కస్టమర్ సైట్ Completed ✓",     labelEn: "Site Completed",    color: "#10b981", bg: "#d1fae5", step: 4 },
};

function apiFetch(path, opts = {}, token) {
  return fetch(API + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  }).then((r) => r.json());
}

function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""));
}

// ─── Background with uploaded image ───────────────────────────────────────────
const SolarBG = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
    {/* The uploaded poster image as background */}
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: "url('/bg.png')",
      backgroundSize: "100% 100%",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      filter: "brightness(0.5) contrast(1.1)",
    }} />
    {/* Dynamic Vibrant Overlay for Readability & Color */}
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(135deg, rgba(8,17,40,0.85) 0%, rgba(31,10,65,0.75) 50%, rgba(13,65,58,0.7) 100%)",
      mixBlendMode: "multiply"
    }} />
    <style>{`
      @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes fadeIn  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes slideIn { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
      @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
      
      /* Vibrant Hover Effects */
      .hover-row:hover {
        background-color: rgba(251, 191, 36, 0.08) !important;
        transition: background-color 0.2s ease;
      }
      .hover-card {
        transition: all 0.3s ease;
      }
      .hover-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 15px rgba(251,191,36,0.15);
        border-color: rgba(251,191,36,0.3) !important;
      }
      .hover-btn {
        transition: all 0.2s ease;
      }
      .hover-btn:hover {
        filter: brightness(1.2);
        transform: scale(1.02);
      }
    `}</style>
  </div>
);

// ─── Input Component ───────────────────────────────────────────────────────────
function Input({ placeholder, value, onChange, type = "text", icon, onEnter }) {
  return (
    <div style={{ position: "relative", marginBottom: "12px" }}>
      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>{icon}</span>
      <input type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        style={styles.input} />
    </div>
  );
}

// ─── Register Page ─────────────────────────────────────────────────────────────
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
    <div style={styles.authCard}>
      <div style={styles.logo}>☀️</div>
      <h1 style={styles.companyTitle}>HASINI SOLAR INDIA PVT LTD</h1>
      <h2 style={styles.authTitle}>కొత్త ఖాతా తెరవండి</h2>
      <p style={styles.authSub}>New Account Registration</p>
      {error && <div style={styles.error}>{error}</div>}
      <Input placeholder="మీ పేరు (Full Name)" value={form.name} onChange={(v) => setForm({...form, name: v})} icon="👤" />
      <Input placeholder="Email Address" value={form.email} onChange={(v) => setForm({...form, email: v})} type="email" icon="📧" />
      <Input placeholder="Password (min 6 chars)" value={form.password} onChange={(v) => setForm({...form, password: v})} type="password" icon="🔒" />
      <Input placeholder="Confirm Password" value={form.confirm} onChange={(v) => setForm({...form, confirm: v})} type="password" icon="🔑" />
      <button className="hover-btn" style={styles.primaryBtn} onClick={submit} disabled={loading}>{loading ? "⏳ Registering..." : "✅ Register చేయండి"}</button>
      <p style={styles.switchText}>ఖాతా ఉందా? <span style={styles.link} onClick={onSwitch}>Login చేయండి</span></p>
    </div>
  );
}

// ─── Login Page ────────────────────────────────────────────────────────────────
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
    <div style={styles.authCard}>
      <div style={styles.logo}>☀️</div>
      <h1 style={styles.companyTitle}>HASINI SOLAR INDIA PVT LTD</h1>
      <h2 style={styles.authTitle}>లాగిన్ చేయండి</h2>
      <p style={styles.authSub}>Customer Management System</p>
      {error && <div style={styles.error}>{error}</div>}
      <Input placeholder="Email Address" value={form.email} onChange={(v) => setForm({...form, email: v})} type="email" icon="📧" />
      <Input placeholder="Password" value={form.password} onChange={(v) => setForm({...form, password: v})} type="password" icon="🔒" onEnter={submit} />
      <button className="hover-btn" style={styles.primaryBtn} onClick={submit} disabled={loading}>{loading ? "⏳ Logging in..." : "🔓 Login చేయండి"}</button>
      <p style={styles.switchText}>ఖాతా లేదా? <span style={styles.link} onClick={onSwitch}>Register చేయండి</span></p>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ user, token, onLogout }) {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ total: 0, byStatus: [] });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [view, setView] = useState("table");
  const [deleteId, setDeleteId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [editAnnouncement, setEditAnnouncement] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isSavingAnn, setIsSavingAnn] = useState(false);

  const fetchCustomers = useCallback(async () => {
    if (user.role === 'admin') return;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (filterStatus) params.append("status", filterStatus);
    const data = await apiFetch(`/customers?${params}`, {}, token);
    const sortedData = (Array.isArray(data) ? data : []).sort((a, b) => 
      (a.customerName || "").localeCompare(b.customerName || "", undefined, { sensitivity: 'base' })
    );
    setCustomers(sortedData);
    setLoading(false);
  }, [search, filterStatus, token, user.role]);

  const fetchStats = useCallback(async () => {
    if (user.role === 'admin') return;
    const data = await apiFetch("/stats", {}, token);
    if (data.total !== undefined) setStats(data);
  }, [token, user.role]);

  const fetchAnnouncements = useCallback(async () => {
    const data = await apiFetch("/announcements", {}, token);
    if (Array.isArray(data)) setAnnouncements(data);
  }, [token]);

  const saveAnnouncement = async () => {
    if (!editAnnouncement.trim()) return;
    setIsSavingAnn(true);
    if (editingId) {
      await apiFetch(`/announcements/${editingId}`, { method: "PUT", body: JSON.stringify({ message: editAnnouncement }) }, token);
    } else {
      await apiFetch("/announcements", { method: "POST", body: JSON.stringify({ message: editAnnouncement }) }, token);
    }
    setEditAnnouncement("");
    setEditingId(null);
    fetchAnnouncements();
    setIsSavingAnn(false);
  };

  const deleteAnnouncement = async (id) => {
    await apiFetch(`/announcements/${id}`, { method: "DELETE" }, token);
    fetchAnnouncements();
  };

  useEffect(() => { 
    if (user.role !== 'admin') {
      fetchCustomers(); fetchStats(); 
    }
    fetchAnnouncements(); 
  }, [fetchCustomers, fetchStats, fetchAnnouncements, user.role]);

  const getStatusCount = (key) => stats.byStatus?.find((s) => s._id === key)?.count || 0;

  return (
    <div style={styles.dashboard}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>☀️ HASINI SOLAR INDIA PVT LTD</h1>
          <p style={styles.headerSub}>Customer Management System</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={styles.userBadge}>
            <span style={{ fontSize: "20px" }}>👤</span>
            <div>
              <div style={{ fontWeight: 700, color: "#fbbf24", fontSize: "14px" }}>{user.name}</div>
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>My Dashboard</div>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={onLogout}>🚪 Logout</button>
        </div>
      </div>

      {user.role === 'admin' ? (
        <div style={{ padding: "24px 32px" }}>
          <h2 style={{ color: "#fbbf24", margin: "0 0 16px" }}>📢 Broadcast Messages Manager</h2>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
             <input value={editAnnouncement} onChange={(e) => setEditAnnouncement(e.target.value)} placeholder="Type new announcement for all users..." style={{ ...styles.input, flex: 1, marginBottom: 0 }} />
             <button className="hover-btn" onClick={saveAnnouncement} disabled={isSavingAnn} style={{ ...styles.addBtn, padding: "10px 20px" }}>
               {isSavingAnn ? "⏳" : (editingId ? "Update" : "Add Broadcast")}
             </button>
             {editingId && <button onClick={() => { setEditingId(null); setEditAnnouncement(""); }} style={{ ...styles.logoutBtn, padding: "10px 20px", marginTop: "0px" }}>Cancel</button>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {announcements.map(ann => (
              <div key={ann._id} style={{ ...styles.card, padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#f9fafb", fontSize: "15px" }}>{ann.message}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="hover-btn" onClick={() => { setEditingId(ann._id); setEditAnnouncement(ann.message); }} style={styles.editBtn}>✏️ Edit</button>
                  <button className="hover-btn" onClick={() => deleteAnnouncement(ann._id)} style={styles.deleteBtn}>🗑️ Delete</button>
                </div>
              </div>
            ))}
            {announcements.length === 0 && <div style={{ color: "#9ca3af" }}>No broadcast messages yet.</div>}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {announcements.slice(0, 1).map(ann => (
              <div key={ann._id} style={{ background: "linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)", color: "#111827", padding: "12px 32px", fontWeight: "700", fontSize: "15px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                <span>📢</span>
                <span>{ann.message}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "10px 32px", background: "rgba(251,191,36,0.07)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
              📊 {user.name} యొక్క Customers మాత్రమే — Your data only
            </p>
          </div>

          {/* Stats */}
          <div style={styles.statsGrid}>
            <StatCard label="నా మొత్తం Customers" value={stats.total} icon="👥" color="#3b82f6" />
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <StatCard key={key} label={cfg.labelEn} value={getStatusCount(key)} icon={["💳","🔧","💰","✅"][cfg.step-1]} color={cfg.color} />
            ))}
          </div>

          {/* Controls */}
          <div style={styles.controls}>
            <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
              <input placeholder="పేరు, ఊరు, బ్యాంక్, ఫోన్ తో వెతకండి..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...styles.input, paddingLeft: "42px", marginBottom: 0 }} />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.select}>
              <option value="">అన్ని Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.labelEn}</option>)}
            </select>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="hover-btn" style={{ ...styles.iconBtn, background: view === "table" ? "#3b82f6" : "#374151" }} onClick={() => setView("table")}>☰</button>
              <button className="hover-btn" style={{ ...styles.iconBtn, background: view === "cards" ? "#3b82f6" : "#374151" }} onClick={() => setView("cards")}>⊞</button>
            </div>
            <button className="hover-btn" style={styles.addBtn} onClick={() => { setEditCustomer(null); setShowModal(true); }}>+ కొత్త కస్టమర్</button>
          </div>

          {loading ? (
            <div style={styles.loading}>⏳ Loading...</div>
          ) : view === "table" ? (
            <CustomerTable
              customers={customers}
              token={token}
              onEdit={(c) => { setEditCustomer(c); setShowModal(true); }}
              onDelete={(id) => setDeleteId(id)}
              onInlineUpdate={() => { fetchCustomers(); fetchStats(); }}
            />
          ) : (
            <CustomerCards customers={customers} onEdit={(c) => { setEditCustomer(c); setShowModal(true); }} onDelete={(id) => setDeleteId(id)} />
          )}

          {showModal && (
            <CustomerModal customer={editCustomer} token={token} onClose={() => setShowModal(false)}
              onSaved={() => { setShowModal(false); fetchCustomers(); fetchStats(); }} />
          )}

          {deleteId && (
            <ConfirmDialog message="ఈ customer ని delete చేయాలా?"
              onConfirm={async () => {
                await apiFetch(`/customers/${deleteId}`, { method: "DELETE" }, token);
                setDeleteId(null); fetchCustomers(); fetchStats();
              }}
              onCancel={() => setDeleteId(null)} />
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
      <span style={{ fontSize: "28px" }}>{icon}</span>
      <div>
        <div style={{ fontSize: "28px", fontWeight: 800, color }}>{value}</div>
        <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Inline editable cell ──────────────────────────────────────────────────────
function InlineEdit({ value, customerId, field, token, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || "");

  const save = async () => {
    setEditing(false);
    if (val === value) return;
    await apiFetch(`/customers/${customerId}`, {
      method: "PUT",
      body: JSON.stringify({ [field]: val })
    }, token);
    onSaved();
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid #fbbf24",
          background: "#1f2937", color: "#f9fafb", fontSize: "13px", outline: "none", minWidth: "120px" }}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      style={{ cursor: "pointer", borderBottom: "1px dashed #4b5563", paddingBottom: "1px",
        color: val ? "#d1d5db" : "#4b5563", fontSize: "13px" }}
    >
      {val || "— click to add —"}
    </span>
  );
}

// ─── Customer Table ────────────────────────────────────────────────────────────
function CustomerTable({ customers, onEdit, onDelete, token, onInlineUpdate }) {
  return (
    <div style={styles.tableWrapper}>
      {customers.length === 0 ? (
        <div style={styles.empty}>📭 మీ Customers లేరు. కొత్త customer add చేయండి!</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              {["#", "కస్టమర్ పేరు", "ఊరు", "బ్యాంక్", "బ్యాంక్ ఊరు", "ఫోన్ 1", "స్టేటస్", "📝 Notes", "Bank Officer Name", "Bank Office No", "Actions"].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from(new Set(customers.map(c => c.customerName[0].toUpperCase()))).sort().map(letter => (
              <React.Fragment key={letter}>
                {/* Alphabet Header Row */}
                <tr style={{ background: "#374151" }}>
                  <td colSpan="11" style={{ padding: "8px 16px", fontWeight: "bold", color: "#fbbf24", fontSize: "16px" }}>
                    {letter}
                  </td>
                </tr>
                {/* Customers for this letter */}
                {customers.filter(c => c.customerName[0].toUpperCase() === letter).map((c, i) => {
              const cfg = STATUS_CONFIG[c.status];
              return (
                <tr className="hover-row" key={c._id} style={{ animation: "fadeIn 0.3s ease" }}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{c.customerName}</td>
                  <td style={styles.td}>{c.village}</td>
                  <td style={styles.td}>{c.bank}</td>
                  <td style={styles.td}>{c.bankVillage}</td>
                  <td style={styles.td}>
                    <a href={`tel:${c.phone}`} style={{ color: "#60a5fa", textDecoration: "none" }}>📱 {c.phone}</a>
                  </td>
                  <td style={styles.td}><StatusPill cfg={cfg} /></td>

                  {/* ✅ NEW: Inline editable notes column between status and phone2 */}
                  <td style={{ ...styles.td, minWidth: "180px" }}>
                    <InlineEdit
                      value={c.notes}
                      customerId={c._id}
                      field="notes"
                      token={token}
                      onSaved={onInlineUpdate}
                    />
                  </td>

                  <td style={styles.td}>
                    <InlineEdit value={c.bankAccountName} customerId={c._id} field="bankAccountName" token={token} onSaved={onInlineUpdate} />
                  </td>
                  <td style={styles.td}>
                    {c.bankOfficePhone 
                      ? <a href={`tel:${c.bankOfficePhone}`} style={{ color: "#fbbf24", textDecoration: "none", fontWeight: 700 }}>📞 {c.bankOfficePhone}</a>
                      : <InlineEdit value={c.bankOfficePhone} customerId={c._id} field="bankOfficePhone" token={token} onSaved={onInlineUpdate} />
                    }
                  </td>

                  {/* ✅ Edit + Delete always visible */}
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <button className="hover-btn" style={styles.editBtn} onClick={() => onEdit(c)}>✏️ Edit</button>
                      <button className="hover-btn" style={styles.deleteBtn} onClick={() => onDelete(c._id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatusPill({ cfg }) {
  return (
    <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: "20px", fontSize: "11px",
      fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`, whiteSpace: "nowrap" }}>
      {cfg.step}. {cfg.labelEn}
    </span>
  );
}

// ─── Customer Cards ────────────────────────────────────────────────────────────
function CustomerCards({ customers, onEdit, onDelete }) {
  if (customers.length === 0)
    return <div style={styles.empty}>📭 మీ Customers లేరు. కొత్త customer add చేయండి!</div>;
    
  // Get unique sorted letters
  const letters = Array.from(new Set(customers.map(c => c.customerName[0].toUpperCase()))).sort();

  return (
    <div style={{ padding: "16px" }}>
      {letters.map(letter => (
        <div key={letter} style={{ marginBottom: "24px" }}>
          {/* Alphabet Section Header */}
          <h2 style={{ color: "#fbbf24", borderBottom: "2px solid #374151", paddingBottom: "8px", margin: "0 0 16px 0" }}>
            {letter}
          </h2>
          {/* Grid of Cards for this letter */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "16px" }}>
            {customers.filter(c => c.customerName[0].toUpperCase() === letter).map((c) => {
              const cfg = STATUS_CONFIG[c.status];
              return (
                <div className="hover-card" key={c._id} style={{ ...styles.card, borderLeft: `5px solid ${cfg.color}`, animation: "fadeIn 0.3s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ margin: 0, color: "#f9fafb", fontSize: "18px" }}>{c.customerName}</h3>
                      <p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: "13px" }}>📍 {c.village}</p>
                    </div>
                    <StatusPill cfg={cfg} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px", color: "#d1d5db", marginBottom: "8px" }}>
                    <span>🏦 {c.bank}</span>
                    <span>📍 {c.bankVillage}</span>
                    <span style={{ gridColumn: "1 / -1", color: "#fbbf24" }}>💳 {c.bankAccountName || "No Officer Name"}</span>
                    {c.bankOfficePhone && <a href={`tel:${c.bankOfficePhone}`} style={{ color: "#fbbf24", textDecoration: "none", gridColumn: "1 / -1" }}>📞 Bank Office: {c.bankOfficePhone}</a>}
                    <a href={`tel:${c.phone}`} style={{ color: "#60a5fa", textDecoration: "none", gridColumn: "1 / -1" }}>📱 Phone 1: {c.phone}</a>
                  </div>
                  {c.notes && <div style={{ fontSize: "12px", color: "#9ca3af", padding: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", marginBottom: "10px" }}>📝 {c.notes}</div>}
                  <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
                    {Object.entries(STATUS_CONFIG).map(([key, s]) => (
                      <div key={key} style={{ flex: 1, height: "6px", borderRadius: "3px", background: s.step <= cfg.step ? cfg.color : "#374151" }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="hover-btn" style={{ ...styles.editBtn, flex: 1 }} onClick={() => onEdit(c)}>✏️ Edit</button>
                    <button className="hover-btn" style={{ ...styles.deleteBtn, flex: 1 }} onClick={() => onDelete(c._id)}>🗑️ Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Customer Modal ────────────────────────────────────────────────────────────
function CustomerModal({ customer, token, onClose, onSaved }) {
  const [form, setForm] = useState({
    customerName: customer?.customerName || "",
    village:      customer?.village || "",
    bank:         customer?.bank || "",
    bankVillage:  customer?.bankVillage || "",
    bankAccountName: customer?.bankAccountName || "",
    bankOfficePhone: customer?.bankOfficePhone || "",
    phone:        customer?.phone || "",
    status:       customer?.status || "bank_payment_1",
    notes:        customer?.notes || "",
  });
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const validateAndSave = async () => {
    setError(""); setPhoneError("");
    if (!form.customerName || !form.village || !form.bank || !form.phone)
      return setError("అన్ని required fields పూరించండి");
    if (!isValidPhone(form.phone))
      return setPhoneError("చెల్లుబాటు అయ్యే 10-digit ఫోన్ నంబర్ ఇవ్వండి (6-9తో మొదలవ్వాలి)");
    setLoading(true);
    const isEdit = !!customer;
    const res = await apiFetch(
      isEdit ? `/customers/${customer._id}` : "/customers",
      { method: isEdit ? "PUT" : "POST", body: JSON.stringify(form) }, token
    );
    setLoading(false);
    if (res._id || res.customerName) onSaved();
    else setError(res.message || "Save failed");
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, color: "#f9fafb" }}>{customer ? "✏️ Customer Edit చేయండి" : "➕ కొత్త Customer Add చేయండి"}</h2>
          <button className="hover-btn" style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        {error && <div style={styles.error}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={styles.label}>కస్టమర్ పేరు *</label>
            <input style={styles.modalInput} value={form.customerName} onChange={(e) => set("customerName")(e.target.value)} placeholder="Customer Name" />
          </div>
          <div>
            <label style={styles.label}>కస్టమర్ ఊరు *</label>
            <input style={styles.modalInput} value={form.village} onChange={(e) => set("village")(e.target.value)} placeholder="Village/City" />
          </div>
          <div>
            <label style={styles.label}>బ్యాంక్ *</label>
            <input style={styles.modalInput} value={form.bank} onChange={(e) => set("bank")(e.target.value)} placeholder="Bank Name" />
          </div>
          <div>
            <label style={styles.label}>బ్యాంక్ ఊరు</label>
            <input style={styles.modalInput} value={form.bankVillage} onChange={(e) => set("bankVillage")(e.target.value)} placeholder="Bank Location" />
          </div>
          <div>
            <label style={styles.label}>ఫోన్ నంబర్ * 📱</label>
            <input style={{ ...styles.modalInput, borderColor: phoneError ? "#ef4444" : "#374151" }}
              value={form.phone} onChange={(e) => { set("phone")(e.target.value); setPhoneError(""); }}
              placeholder="10-digit mobile number" maxLength={10} type="tel" />
            {phoneError && <p style={{ color: "#ef4444", fontSize: "11px", margin: "4px 0 0" }}>⚠️ {phoneError}</p>}
          </div>
          <div>
            <label style={styles.label}>Bank Officer Name 💳</label>
            <input style={styles.modalInput} value={form.bankAccountName} onChange={(e) => set("bankAccountName")(e.target.value)} placeholder="Bank Officer Name" />
          </div>
          <div>
            <label style={styles.label}>Bank Office Number 📞</label>
            <input style={styles.modalInput} value={form.bankOfficePhone} onChange={(e) => set("bankOfficePhone")(e.target.value)} placeholder="Bank Office Phone" />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={styles.label}>స్టేటస్</label>
            <select style={styles.modalInput} value={form.status} onChange={(e) => set("status")(e.target.value)}>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.step}. {v.label}</option>)}
            </select>
          </div>
        </div>

        {/* Status Progress */}
        <div style={{ margin: "16px 0", padding: "16px", background: "#111827", borderRadius: "10px" }}>
          <p style={{ margin: "0 0 10px", color: "#9ca3af", fontSize: "12px" }}>స్టేటస్ Progress:</p>
          <div style={{ display: "flex", gap: "8px" }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} onClick={() => set("status")(key)} style={{
                flex: 1, padding: "8px", borderRadius: "8px", textAlign: "center", cursor: "pointer", fontSize: "11px",
                background: form.status === key ? cfg.color : "#1f2937",
                color: form.status === key ? "white" : "#6b7280",
                border: `2px solid ${form.status === key ? cfg.color : "transparent"}`, transition: "all 0.2s",
              }}>
                <div style={{ fontSize: "18px" }}>{"💳🔧💰✅"[cfg.step - 1]}</div>
                <div>{cfg.step}. {cfg.labelEn}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label style={styles.label}>📝 Notes / Extra Info (అదనపు వివరాలు)</label>
          <textarea style={{ ...styles.modalInput, height: "80px", resize: "vertical" }}
            value={form.notes} onChange={(e) => set("notes")(e.target.value)}
            placeholder="అదనపు వివరాలు ఇక్కడ రాయండి..." />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button className="hover-btn" style={{ ...styles.primaryBtn, flex: 1, marginBottom: 0 }} onClick={validateAndSave} disabled={loading}>
            {loading ? "⏳ Saving..." : customer ? "💾 Update చేయండి" : "✅ Save చేయండి"}
          </button>
          <button className="hover-btn" style={{ ...styles.logoutBtn, padding: "14px 20px" }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modal, maxWidth: "380px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
        <p style={{ color: "#f9fafb", fontSize: "18px", marginBottom: "24px" }}>{message}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button className="hover-btn" style={{ ...styles.deleteBtn, padding: "12px 24px", fontSize: "14px" }} onClick={onConfirm}>🗑️ Delete చేయండి</button>
          <button className="hover-btn" style={{ ...styles.logoutBtn, padding: "12px 24px" }} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  authCard: { background: "rgba(17,24,39,0.92)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "48px 40px", width: "100%", maxWidth: "440px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", animation: "fadeIn 0.5s ease" },
  logo: { textAlign: "center", fontSize: "48px", marginBottom: "8px" },
  companyTitle: { textAlign: "center", fontSize: "16px", fontWeight: 800, color: "#fbbf24", letterSpacing: "1px", margin: "0 0 16px", lineHeight: 1.3 },
  authTitle: { textAlign: "center", color: "#f9fafb", margin: "0 0 4px", fontSize: "24px" },
  authSub: { textAlign: "center", color: "#6b7280", margin: "0 0 24px", fontSize: "14px" },
  input: { width: "100%", padding: "12px 14px 12px 42px", borderRadius: "10px", border: "1px solid #374151", background: "#1f2937", color: "#f9fafb", fontSize: "15px", outline: "none", boxSizing: "border-box" },
  primaryBtn: { width: "100%", padding: "14px", borderRadius: "10px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", fontWeight: 700, fontSize: "16px", border: "none", cursor: "pointer", marginBottom: "16px" },
  error: { background: "#7f1d1d", color: "#fca5a5", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" },
  switchText: { textAlign: "center", color: "#6b7280", fontSize: "14px" },
  link: { color: "#fbbf24", cursor: "pointer", textDecoration: "underline" },
  dashboard: { minHeight: "100vh", padding: "0 0 40px", animation: "slideIn 0.4s ease" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", background: "rgba(17,24,39,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)", flexWrap: "wrap", gap: "12px" },
  headerTitle: { margin: 0, color: "#fbbf24", fontSize: "22px", fontWeight: 800 },
  headerSub: { margin: "4px 0 0", color: "#9ca3af", fontSize: "13px" },
  userBadge: { display: "flex", alignItems: "center", gap: "10px", background: "#1f2937", padding: "10px 16px", borderRadius: "20px", border: "1px solid rgba(251,191,36,0.3)" },
  logoutBtn: { background: "#374151", color: "#d1d5db", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", padding: "24px 32px 0" },
  statCard: { background: "rgba(17,24,39,0.9)", backdropFilter: "blur(10px)", borderRadius: "12px", padding: "20px 16px", display: "flex", alignItems: "center", gap: "14px", border: "1px solid rgba(255,255,255,0.08)" },
  controls: { display: "flex", gap: "12px", padding: "20px 32px", flexWrap: "wrap", alignItems: "center" },
  select: { padding: "12px 14px", borderRadius: "10px", border: "1px solid #374151", background: "#1f2937", color: "#f9fafb", fontSize: "14px", outline: "none" },
  addBtn: { background: "linear-gradient(135deg, #10b981, #059669)", color: "white", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "14px", whiteSpace: "nowrap" },
  iconBtn: { width: "42px", height: "42px", borderRadius: "8px", border: "none", color: "white", cursor: "pointer", fontSize: "16px" },
  tableWrapper: { margin: "0 32px", background: "rgba(17,24,39,0.9)", backdropFilter: "blur(10px)", borderRadius: "16px", overflow: "auto", border: "1px solid rgba(255,255,255,0.08)" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "1000px" },
  th: { background: "rgba(251,191,36,0.15)", color: "#fbbf24", padding: "14px 16px", textAlign: "left", fontSize: "13px", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap" },
  td: { padding: "12px 16px", color: "#d1d5db", fontSize: "14px", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  editBtn: { background: "#1d4ed8", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" },
  deleteBtn: { background: "#7f1d1d", color: "#fca5a5", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" },
  card: { background: "rgba(17,24,39,0.9)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px" },
  empty: { textAlign: "center", padding: "60px", color: "#6b7280", fontSize: "18px" },
  loading: { textAlign: "center", padding: "60px", color: "#9ca3af", fontSize: "18px", animation: "pulse 1.5s infinite" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modal: { background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", animation: "fadeIn 0.3s ease" },
  label: { display: "block", color: "#9ca3af", fontSize: "12px", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" },
  modalInput: { width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #374151", background: "#1f2937", color: "#f9fafb", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  closeBtn: { background: "#374151", color: "#d1d5db", border: "none", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "16px" },
};

// ─── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("login");
  const [authData, setAuthData] = useState(() => {
    try { const saved = localStorage.getItem("hasini_auth"); return saved ? JSON.parse(saved) : null; }
    catch { return null; }
  });

  const handleAuth = (data) => { localStorage.setItem("hasini_auth", JSON.stringify(data)); setAuthData(data); };
  const handleLogout = () => { localStorage.removeItem("hasini_auth"); setAuthData(null); setPage("login"); };

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
