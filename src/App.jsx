import { useState, useEffect, useCallback } from "react";

const HOUSES = [
  { id: "altus",   name: "Altus",   mascot: "🦘", color: "#D92B2B", colorDim: "rgba(217,43,43,0.15)", colorBorder: "rgba(217,43,43,0.35)" },
  { id: "stedman", name: "Stedman", mascot: "🦅", color: "#F5C518", colorDim: "rgba(245,197,24,0.12)", colorBorder: "rgba(245,197,24,0.3)" },
  { id: "kessler", name: "Kessler", mascot: "🐊", color: "#C8C8DC", colorDim: "rgba(200,200,220,0.1)",  colorBorder: "rgba(200,200,220,0.25)" },
];

const AMOUNTS = [5, 10, 25, 50, 100];
const PIN = "1234";
const INITIAL_POINTS = { altus: 1000, stedman: 1000, kessler: 1000 };

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; width: 100%; }
  body { background: #0A0A0F; overflow-x: hidden; }

  .hp { min-height: 100vh; width: 100%; background: #0A0A0F; color: #fff; font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; }

  /* HEADER */
  .hp-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 4rem;
    height: 80px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    background: #0D0D14;
    flex-shrink: 0;
  }
  .hp-logo { font-family: 'Bebas Neue', sans-serif; font-size: 2.6rem; letter-spacing: 0.14em; color: #fff; }
  .hp-logo span { color: #F5C518; }
  .hp-nav { display: flex; gap: 8px; }
  .hp-nav-btn {
    padding: 0.6rem 1.8rem; background: none; border: 1px solid transparent;
    border-radius: 6px; color: rgba(255,255,255,0.4); cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase; transition: all 0.15s;
  }
  .hp-nav-btn:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.1); }
  .hp-nav-btn.active { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.12); color: #fff; }

  /* BODY */
  .hp-body { flex: 1; display: flex; flex-direction: column; padding: 3rem 4rem; gap: 2.5rem; width: 100%; }

  /* SCOREBOARD HOUSE CARDS */
  .hp-house-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
  .hp-house-card {
    border-radius: 16px; border: 1px solid rgba(255,255,255,0.07);
    background: #0D0D14; overflow: hidden; transition: transform 0.2s;
    position: relative;
  }
  .hp-house-card:hover { transform: translateY(-3px); }
  .hp-house-accent { height: 6px; width: 100%; }
  .hp-house-inner { padding: 3rem 3rem; display: flex; align-items: center; gap: 2.4rem; }
  .hp-house-mascot { font-size: 7rem; line-height: 1; flex-shrink: 0; }
  .hp-house-info { flex: 1; }
  .hp-house-name { font-family: 'Bebas Neue', sans-serif; font-size: 3.8rem; letter-spacing: 0.1em; line-height: 1; }
  .hp-house-sub { font-size: 0.9rem; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 6px; opacity: 0.4; }
  .hp-house-pts-wrap { text-align: right; }
  .hp-house-pts { font-family: 'Bebas Neue', sans-serif; font-size: 7rem; line-height: 1; }
  .hp-house-pts-label { font-size: 0.85rem; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.4; margin-top: 6px; }
  .hp-rank-badge {
    position: absolute; top: 16px; left: 20px;
    font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem;
    letter-spacing: 0.08em; opacity: 0.35;
  }
  .hp-leading-bar {
    position: absolute; top: 0; right: 0; bottom: 0; left: 0;
    pointer-events: none; border-radius: 16px;
  }

  /* BOTTOM ROW */
  .hp-bottom { display: grid; grid-template-columns: 1fr 1.4fr; gap: 2rem; min-height: 420px; }

  /* BAR CHART */
  .hp-panel { background: #0D0D14; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 2.5rem 2.8rem; }
  .hp-panel-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; letter-spacing: 0.15em; color: rgba(255,255,255,0.35); margin-bottom: 2rem; }
  .hp-bar-row { display: flex; align-items: center; gap: 20px; margin-bottom: 1.6rem; }
  .hp-bar-row:last-child { margin-bottom: 0; }
  .hp-bar-label { font-size: 1.1rem; font-weight: 500; width: 100px; flex-shrink: 0; letter-spacing: 0.05em; }
  .hp-bar-track { flex: 1; height: 44px; background: rgba(255,255,255,0.04); border-radius: 6px; overflow: hidden; }
  .hp-bar-fill { height: 100%; border-radius: 6px; display: flex; align-items: center; justify-content: flex-end; padding-right: 14px; transition: width 0.7s cubic-bezier(.22,.68,0,.97); min-width: 3px; }
  .hp-bar-num { font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; color: rgba(0,0,0,0.75); }

  /* LOG */
  .hp-log-list { display: flex; flex-direction: column; gap: 0; max-height: 500px; overflow-y: auto; }
  .hp-log-list::-webkit-scrollbar { width: 4px; }
  .hp-log-list::-webkit-scrollbar-track { background: transparent; }
  .hp-log-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  .hp-log-entry { display: flex; align-items: center; gap: 16px; padding: 1.1rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 1.05rem; }
  .hp-log-entry:last-child { border-bottom: none; }
  .hp-log-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
  .hp-log-house { font-weight: 600; font-size: 1rem; letter-spacing: 0.04em; flex-shrink: 0; width: 90px; }
  .hp-log-reason { flex: 1; color: rgba(255,255,255,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 1rem; }
  .hp-log-delta { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; flex-shrink: 0; }
  .hp-log-time { color: rgba(255,255,255,0.2); font-size: 0.88rem; flex-shrink: 0; }
  .hp-log-empty { color: rgba(255,255,255,0.25); font-size: 1.05rem; font-style: italic; padding: 2rem 0; }

  /* TEACHER GATE */
  .hp-gate { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 0; padding: 3rem; }
  .hp-gate-title { font-family: 'Bebas Neue', sans-serif; font-size: 2.8rem; letter-spacing: 0.12em; margin-bottom: 0.5rem; }
  .hp-gate-sub { color: rgba(255,255,255,0.35); font-size: 0.95rem; margin-bottom: 2.5rem; letter-spacing: 0.04em; }
  .hp-pin-row { display: flex; gap: 14px; margin-bottom: 1rem; }
  .hp-pin-digit {
    width: 64px; height: 76px; background: #0D0D14;
    border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
    text-align: center; font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem;
    color: #fff; outline: none; transition: border 0.2s; caret-color: transparent;
  }
  .hp-pin-digit:focus { border-color: #F5C518; }
  .hp-pin-error { color: #D92B2B; font-size: 0.88rem; min-height: 1.2em; margin-bottom: 1.2rem; }
  .hp-btn-enter {
    background: #F5C518; color: #0A0A0F; border: none;
    padding: 0.85rem 3rem; border-radius: 8px;
    font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; letter-spacing: 0.12em;
    cursor: pointer; transition: all 0.15s;
  }
  .hp-btn-enter:hover { background: #FFD740; transform: translateY(-1px); }
  .hp-hint { margin-top: 1rem; font-size: 0.75rem; color: rgba(255,255,255,0.15); letter-spacing: 0.08em; }

  /* TEACHER PANEL */
  .hp-t-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
  .hp-t-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 0.12em; color: rgba(255,255,255,0.6); }
  .hp-btn-lock {
    background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.35);
    padding: 0.5rem 1.3rem; border-radius: 6px; font-size: 0.82rem; letter-spacing: 0.08em;
    text-transform: uppercase; cursor: pointer; transition: all 0.15s;
  }
  .hp-btn-lock:hover { border-color: #D92B2B; color: #D92B2B; }
  .hp-ctrl-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
  .hp-ctrl-card { background: #0D0D14; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; overflow: hidden; }
  .hp-ctrl-top { display: flex; align-items: center; gap: 14px; padding: 1.3rem 1.5rem; }
  .hp-ctrl-mascot { font-size: 2.2rem; }
  .hp-ctrl-name { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; letter-spacing: 0.1em; }
  .hp-ctrl-pts { margin-left: auto; font-family: 'Bebas Neue', sans-serif; font-size: 2rem; }
  .hp-ctrl-body { padding: 1.3rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); }
  .hp-reason {
    width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px; padding: 0.65rem 0.9rem; color: #fff; font-size: 0.9rem;
    font-family: 'DM Sans', sans-serif; margin-bottom: 0.9rem; outline: none; transition: border 0.2s;
  }
  .hp-reason:focus { border-color: rgba(255,255,255,0.25); }
  .hp-reason::placeholder { color: rgba(255,255,255,0.2); }
  .hp-amt-row { display: flex; gap: 6px; margin-bottom: 0.8rem; }
  .hp-amt-btn {
    flex: 1; padding: 0.55rem 0; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07); border-radius: 6px;
    color: rgba(255,255,255,0.4); font-size: 0.85rem; cursor: pointer; transition: all 0.15s; text-align: center;
  }
  .hp-amt-btn:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
  .hp-amt-btn.sel { color: #0A0A0F; font-weight: 700; border-color: transparent; }
  .hp-custom-input {
    width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px; padding: 0.55rem 0.9rem; color: #fff; font-size: 0.9rem;
    font-family: 'DM Sans', sans-serif; margin-bottom: 0.9rem; outline: none; transition: border 0.2s;
  }
  .hp-custom-input:focus { border-color: rgba(255,255,255,0.25); }
  .hp-custom-input::placeholder { color: rgba(255,255,255,0.2); }
  .hp-action-row { display: flex; gap: 10px; }
  .hp-btn-add {
    flex: 1; padding: 0.7rem; background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.3);
    color: #81C784; border-radius: 7px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
  }
  .hp-btn-add:hover { background: rgba(76,175,80,0.2); }
  .hp-btn-sub {
    flex: 1; padding: 0.7rem; background: rgba(217,43,43,0.1); border: 1px solid rgba(217,43,43,0.28);
    color: #EF9A9A; border-radius: 7px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
  }
  .hp-btn-sub:hover { background: rgba(217,43,43,0.2); }

  /* TOAST */
  .hp-toast {
    position: fixed; bottom: 2rem; left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: #1A1A24; border: 1px solid rgba(245,197,24,0.4);
    border-radius: 8px; padding: 0.8rem 1.8rem; font-size: 0.92rem; color: #fff;
    transition: transform 0.3s; z-index: 999; white-space: nowrap; pointer-events: none;
  }
  .hp-toast.show { transform: translateX(-50%) translateY(0); }

  .hp-loading { display: flex; align-items: center; justify-content: center; flex: 1; color: rgba(255,255,255,0.2); font-size: 0.85rem; letter-spacing: 0.12em; text-transform: uppercase; }

  .bump-anim { animation: bump 0.2s ease; }
  @keyframes bump { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
`;

function getRanks(points) {
  const sorted = [...HOUSES].sort((a, b) => (points[b.id] ?? 0) - (points[a.id] ?? 0));
  const ranks = {};
  sorted.forEach((h, i) => { ranks[h.id] = i + 1; });
  return ranks;
}

export default function HousePoints() {
  const [tab, setTab] = useState("scoreboard");
  const [points, setPoints] = useState(null);
  const [log, setLog] = useState([]);
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinVal, setPinVal] = useState(["", "", "", ""]);
  const [pinError, setPinError] = useState("");
  const [selectedAmt, setSelectedAmt] = useState({ altus: 10, stedman: 10, kessler: 10 });
  const [customAmt, setCustomAmt] = useState({ altus: "", stedman: "", kessler: "" });
  const [reasons, setReasons] = useState({ altus: "", stedman: "", kessler: "" });
  const [toast, setToast] = useState({ msg: "", show: false });
  const [bumping, setBumping] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ptsRes, logRes] = await Promise.all([
          window.storage.get("hp_points"),
          window.storage.get("hp_log"),
        ]);
        setPoints(ptsRes ? JSON.parse(ptsRes.value) : { ...INITIAL_POINTS });
        setLog(logRes ? JSON.parse(logRes.value) : []);
      } catch {
        setPoints({ ...INITIAL_POINTS });
        setLog([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const save = useCallback(async (newPoints, newLog) => {
    try {
      await window.storage.set("hp_points", JSON.stringify(newPoints));
      await window.storage.set("hp_log", JSON.stringify(newLog));
    } catch (e) { console.error(e); }
  }, []);

  const showToast = (msg) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  };

  const adjustPoints = (houseId, sign) => {
    const h = HOUSES.find(x => x.id === houseId);
    const amt = customAmt[houseId] !== "" ? parseInt(customAmt[houseId]) || 0 : selectedAmt[houseId];
    if (!amt || amt <= 0) return;
    const delta = sign * amt;
    const newPoints = { ...points, [houseId]: Math.max(0, (points[houseId] ?? 0) + delta) };
    const now = new Date();
    const time = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
    const entry = { id: Date.now(), houseId, houseName: h.name, color: h.color, delta, reason: reasons[houseId] || "No reason given", time };
    const newLog = [...log, entry].slice(-60);
    setPoints(newPoints);
    setLog(newLog);
    save(newPoints, newLog);
    setBumping(b => ({ ...b, [houseId]: true }));
    setTimeout(() => setBumping(b => ({ ...b, [houseId]: false })), 250);
    showToast(`${sign > 0 ? "+" : ""}${delta} pts — ${h.name}`);
    setReasons(r => ({ ...r, [houseId]: "" }));
    setCustomAmt(c => ({ ...c, [houseId]: "" }));
  };

  const checkPin = () => {
    if (pinVal.join("") === PIN) {
      setPinUnlocked(true); setPinError(""); setPinVal(["", "", "", ""]);
    } else {
      setPinError("Incorrect PIN. Try again.");
      setPinVal(["", "", "", ""]);
      setTimeout(() => document.querySelectorAll(".hp-pin-digit")[0]?.focus(), 50);
    }
  };

  const handlePinChange = (i, val) => {
    const next = [...pinVal];
    next[i] = val.replace(/\D/, "").slice(-1);
    setPinVal(next);
    if (next[i] && i < 3) document.querySelectorAll(".hp-pin-digit")[i + 1]?.focus();
  };

  const handlePinKey = (i, e) => {
    if (e.key === "Backspace" && !pinVal[i] && i > 0) document.querySelectorAll(".hp-pin-digit")[i - 1]?.focus();
    if (e.key === "Enter") checkPin();
  };

  if (loading || !points) {
    return (
      <>
        <style>{styles}</style>
        <div className="hp"><div className="hp-loading">Loading…</div></div>
      </>
    );
  }

  const ranks = getRanks(points);
  const maxPts = Math.max(...HOUSES.map(h => points[h.id] ?? 0), 1);
  const rankEmoji = r => r === 1 ? "1ST" : r === 2 ? "2ND" : "3RD";

  return (
    <>
      <style>{styles}</style>
      <div className="hp">
        {/* HEADER */}
        <div className="hp-header">
          <div className="hp-logo">HOUSE <span>POINTS</span></div>
          <div className="hp-nav">
            <button className={`hp-nav-btn ${tab === "scoreboard" ? "active" : ""}`} onClick={() => setTab("scoreboard")}>Standings</button>
            <button className={`hp-nav-btn ${tab === "teacher" ? "active" : ""}`} onClick={() => setTab("teacher")}>Teacher</button>
          </div>
        </div>

        {tab === "scoreboard" && (
          <div className="hp-body">
            {/* HOUSE CARDS */}
            <div className="hp-house-grid">
              {[...HOUSES].sort((a, b) => ranks[a.id] - ranks[b.id]).map(h => (
                <div key={h.id} className="hp-house-card" style={{ borderColor: ranks[h.id] === 1 ? h.colorBorder : "rgba(255,255,255,0.07)" }}>
                  <div className="hp-house-accent" style={{ background: h.color }} />
                  {ranks[h.id] === 1 && (
                    <div className="hp-leading-bar" style={{ boxShadow: `inset 0 0 0 1px ${h.colorBorder}` }} />
                  )}
                  <div className="hp-house-inner">
                    <div className="hp-house-mascot">{h.mascot}</div>
                    <div className="hp-house-info">
                      <div className="hp-rank-badge" style={{ color: h.color }}>{rankEmoji(ranks[h.id])}</div>
                      <div className="hp-house-name" style={{ color: h.color }}>{h.name}</div>
                      <div className="hp-house-sub">House</div>
                    </div>
                    <div className="hp-house-pts-wrap">
                      <div className={`hp-house-pts ${bumping[h.id] ? "bump-anim" : ""}`} style={{ color: h.color }}>{points[h.id]}</div>
                      <div className="hp-house-pts-label">Points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* BOTTOM ROW */}
            <div className="hp-bottom">
              <div className="hp-panel">
                <div className="hp-panel-title">Comparison</div>
                {[...HOUSES].sort((a, b) => ranks[a.id] - ranks[b.id]).map(h => {
                  const pct = Math.round((points[h.id] / maxPts) * 100);
                  return (
                    <div key={h.id} className="hp-bar-row">
                      <div className="hp-bar-label" style={{ color: h.color }}>{h.name}</div>
                      <div className="hp-bar-track">
                        <div className="hp-bar-fill" style={{ width: `${pct}%`, background: h.color }}>
                          {points[h.id] > 0 && <span className="hp-bar-num">{points[h.id]}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hp-panel">
                <div className="hp-panel-title">Recent Activity</div>
                <div className="hp-log-list">
                  {log.length === 0
                    ? <div className="hp-log-empty">No activity yet.</div>
                    : [...log].reverse().slice(0, 20).map(e => (
                      <div key={e.id} className="hp-log-entry">
                        <div className="hp-log-dot" style={{ background: e.color }} />
                        <span className="hp-log-house" style={{ color: e.color }}>{e.houseName}</span>
                        <span className="hp-log-reason">{e.reason}</span>
                        <span className="hp-log-delta" style={{ color: e.delta > 0 ? "#81C784" : "#EF9A9A" }}>
                          {e.delta > 0 ? "+" : ""}{e.delta}
                        </span>
                        <span className="hp-log-time">{e.time}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "teacher" && !pinUnlocked && (
          <div className="hp-gate">
            <div className="hp-gate-title">Teacher Access</div>
            <div className="hp-gate-sub">Enter your PIN to manage house points</div>
            <div className="hp-pin-row">
              {pinVal.map((v, i) => (
                <input key={i} className="hp-pin-digit" type="password" inputMode="numeric"
                  maxLength={1} value={v}
                  onChange={e => handlePinChange(i, e.target.value)}
                  onKeyDown={e => handlePinKey(i, e)} />
              ))}
            </div>
            <div className="hp-pin-error">{pinError}</div>
            <button className="hp-btn-enter" onClick={checkPin}>Enter</button>
            <div className="hp-hint">Default PIN: 1234</div>
          </div>
        )}

        {tab === "teacher" && pinUnlocked && (
          <div className="hp-body">
            <div className="hp-t-header">
              <div className="hp-t-title">Teacher Panel</div>
              <button className="hp-btn-lock" onClick={() => setPinUnlocked(false)}>Lock</button>
            </div>
            <div className="hp-ctrl-grid">
              {HOUSES.map(h => (
                <div key={h.id} className="hp-ctrl-card">
                  <div className="hp-ctrl-top" style={{ background: h.colorDim, borderBottom: `1px solid ${h.colorBorder}` }}>
                    <span className="hp-ctrl-mascot">{h.mascot}</span>
                    <span className="hp-ctrl-name" style={{ color: h.color }}>{h.name}</span>
                    <span className="hp-ctrl-pts" style={{ color: h.color }}>{points[h.id]}</span>
                  </div>
                  <div className="hp-ctrl-body">
                    <input className="hp-reason" placeholder="Reason (e.g. won the quiz)"
                      value={reasons[h.id]}
                      onChange={e => setReasons(r => ({ ...r, [h.id]: e.target.value }))} />
                    <div className="hp-amt-row">
                      {AMOUNTS.map(a => (
                        <button key={a}
                          className={`hp-amt-btn ${selectedAmt[h.id] === a && customAmt[h.id] === "" ? "sel" : ""}`}
                          style={selectedAmt[h.id] === a && customAmt[h.id] === "" ? { background: h.color } : {}}
                          onClick={() => { setSelectedAmt(s => ({ ...s, [h.id]: a })); setCustomAmt(c => ({ ...c, [h.id]: "" })); }}>
                          {a}
                        </button>
                      ))}
                    </div>
                    <input className="hp-custom-input" type="number" min="1" placeholder="Custom amount…"
                      value={customAmt[h.id]}
                      onChange={e => setCustomAmt(c => ({ ...c, [h.id]: e.target.value }))} />
                    <div className="hp-action-row">
                      <button className="hp-btn-add" onClick={() => adjustPoints(h.id, 1)}>+ Award</button>
                      <button className="hp-btn-sub" onClick={() => adjustPoints(h.id, -1)}>− Deduct</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={`hp-toast ${toast.show ? "show" : ""}`}>{toast.msg}</div>
    </>
  );
}
