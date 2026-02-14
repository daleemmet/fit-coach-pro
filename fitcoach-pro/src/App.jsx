import { useState, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const EXERCISE_LIBRARY = [
  "Barbell Squat","Leg Press","Romanian Deadlift","Leg Curl","Leg Extension",
  "Bench Press","Incline Dumbbell Press","Cable Fly","Push-Up","Chest Dip",
  "Pull-Up","Lat Pulldown","Seated Row","Dumbbell Row","Face Pull",
  "Overhead Press","Lateral Raise","Front Raise","Arnold Press","Upright Row",
  "Bicep Curl","Hammer Curl","Preacher Curl","Tricep Dip","Skull Crusher","Tricep Pushdown",
  "Plank","Russian Twist","Cable Crunch","Hanging Leg Raise","Ab Wheel",
  "Treadmill Run","Rowing Machine","Bike","Jump Rope","Stair Climber",
  "Deadlift","Sumo Deadlift","Hip Thrust","Walking Lunge","Box Jump","Kettlebell Swing",
  "Hip Flexor Stretch","Pigeon Pose","Cat-Cow","Thoracic Rotation","Band Pull-Apart",
  "Foam Roll Quads","Ankle Circles","World's Greatest Stretch","Glute Bridge","Bird Dog",
];

const SECTION_SUGGESTIONS = [
  "Warm-Up","Mobility","Activation","Strength Training","Hypertrophy",
  "Core","Conditioning","Cardio","Cool-Down","Stretching","Power","Plyometrics",
];

const SAMPLE_CLIENTS = [
  { id: 1, name: "Sarah M.", goal: "Weight Loss", since: "2024-01" },
  { id: 2, name: "Jake T.", goal: "Muscle Gain", since: "2024-03" },
  { id: 3, name: "Priya K.", goal: "Endurance", since: "2023-11" },
];

const STORAGE_KEY = "fitcoach_v3";
const todayStr = () => new Date().toISOString().split("T")[0];

// Migrate old templates that had flat exercises[] to sections[]
function migrateTemplate(t) {
  if (t.sections) return t;
  return {
    ...t,
    sections: [{ id: Date.now(), title: "Exercises", exercises: t.exercises || [] }],
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      return { ...d, templates: (d.templates || []).map(migrateTemplate) };
    }
    // Also try migrating from old key
    const old = localStorage.getItem("fitcoach_v2");
    if (old) {
      const d = JSON.parse(old);
      return { ...d, templates: (d.templates || []).map(migrateTemplate) };
    }
  } catch {}
  return { clients: SAMPLE_CLIENTS, workouts: [], templates: [] };
}
function saveData(d) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {}
}

// Flatten sections → exercises array for backward-compat (progress, etc.)
function flatExercises(sections) {
  return (sections || []).flatMap(s => s.exercises || []);
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color }) => {
  const s = { width: size, height: size, display: "block", flexShrink: 0 };
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color || "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    plus:     <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    check:    <svg {...p} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>,
    edit:     <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash:    <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    back:     <svg {...p} strokeWidth={2.5}><polyline points="15 18 9 12 15 6"/></svg>,
    chart:    <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    user:     <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    template: <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
    close:    <svg {...p} strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    save:     <svg {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
    copy:     <svg {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    trophy:   <svg {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
    assign:   <svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
    play:     <svg {...p} fill={color || "currentColor"} stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    up:       <svg {...p} strokeWidth={2.5}><polyline points="18 15 12 9 6 15"/></svg>,
    down:     <svg {...p} strokeWidth={2.5}><polyline points="6 9 12 15 18 9"/></svg>,
    section:  <svg {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>,
  };
  return <span style={s}>{icons[name]}</span>;
};

const inp = (extra = {}) => ({
  padding: "9px 12px", borderRadius: 10, border: "1px solid #2a2a40",
  background: "#13131f", color: "#e8e8f0", fontSize: 13,
  outline: "none", boxSizing: "border-box", ...extra,
});

// ─── Set Row ──────────────────────────────────────────────────────────────────
function SetRow({ set, idx, onChange, onRemove, isLive }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#1e1e30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#555", flexShrink: 0 }}>{idx + 1}</div>
      <input type="number" placeholder="Reps" value={set.reps} onChange={e => onChange({ ...set, reps: e.target.value })}
        style={{ ...inp(), width: "30%", background: isLive ? "#0e1f16" : "#13131f" }} />
      <input type="number" placeholder="Wt" value={set.weight} onChange={e => onChange({ ...set, weight: e.target.value })}
        style={{ ...inp(), width: "30%", background: isLive ? "#0e1f16" : "#13131f" }} />
      <select value={set.unit || "lbs"} onChange={e => onChange({ ...set, unit: e.target.value })}
        style={{ ...inp(), width: "24%", padding: "9px 4px" }}>
        <option>lbs</option><option>kg</option><option>BW</option><option>min</option>
      </select>
      <button onClick={onRemove} style={{ background: "none", border: "none", color: "#ff4455", cursor: "pointer", padding: 2 }}>
        <Icon name="close" size={13} />
      </button>
    </div>
  );
}

// ─── Exercise Card ────────────────────────────────────────────────────────────
function ExerciseCard({ ex, idx, total, onChange, onRemove, onMoveUp, onMoveDown, isLive }) {
  const addSet = () => onChange({ ...ex, sets: [...ex.sets, { reps: ex.sets[0]?.reps || "", weight: ex.sets[0]?.weight || "", unit: ex.sets[0]?.unit || "lbs" }] });
  const removeLastSet = () => { if (ex.sets.length > 1) onChange({ ...ex, sets: ex.sets.slice(0, -1) }); };

  // In template mode: show a compact "Sets × Reps @ Weight" quick-entry row at top,
  // plus expandable per-set detail if needed.
  const [expanded, setExpanded] = useState(false);
  const setCount = ex.sets.length;
  const firstSet = ex.sets[0] || { reps: "", weight: "", unit: "lbs" };

  // Sync all sets when quick-entry fields change (template mode only)
  const syncAll = (field, val) => {
    onChange({ ...ex, sets: ex.sets.map(s => ({ ...s, [field]: val })) });
  };

  return (
    <div style={{ background: isLive ? "#0f1e16" : "#141424", border: `1px solid ${isLive ? "#1e3028" : "#22223a"}`, borderRadius: 12, padding: 12, marginBottom: 8 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
          <button onClick={onMoveUp} disabled={idx === 0}
            style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", padding: "1px 3px" }}>
            <Icon name="up" size={13} color={idx === 0 ? "#252535" : "#555"} />
          </button>
          <button onClick={onMoveDown} disabled={idx === total - 1}
            style={{ background: "none", border: "none", cursor: idx === total - 1 ? "default" : "pointer", padding: "1px 3px" }}>
            <Icon name="down" size={13} color={idx === total - 1 ? "#252535" : "#555"} />
          </button>
        </div>
        <div style={{ fontWeight: 700, fontSize: 13, color: isLive ? "#5dde8a" : "#a78bfa", flex: 1 }}>{ex.name}</div>
        <button onClick={onRemove} style={{ background: "none", border: "none", color: "#333", cursor: "pointer" }}>
          <Icon name="trash" size={13} />
        </button>
      </div>

      {!isLive ? (
        /* ── TEMPLATE MODE: compact quick-entry ── */
        <>
          {/* Set count stepper + shared reps/weight */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 28, marginBottom: 6 }}>
            {/* Sets stepper */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, background: "#1a1a2e", borderRadius: 9, border: "1px solid #2a2a44", overflow: "hidden", flexShrink: 0 }}>
              <button onClick={removeLastSet} disabled={setCount <= 1}
                style={{ background: "none", border: "none", color: setCount <= 1 ? "#333" : "#a78bfa", fontSize: 16, fontWeight: 700, cursor: setCount <= 1 ? "default" : "pointer", padding: "5px 10px", lineHeight: 1 }}>−</button>
              <div style={{ padding: "5px 8px", fontSize: 13, fontWeight: 800, color: "#a78bfa", minWidth: 28, textAlign: "center", borderLeft: "1px solid #2a2a44", borderRight: "1px solid #2a2a44" }}>
                {setCount}<span style={{ fontSize: 9, color: "#666", fontWeight: 400, marginLeft: 2 }}>sets</span>
              </div>
              <button onClick={addSet}
                style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 16, fontWeight: 700, cursor: "pointer", padding: "5px 10px", lineHeight: 1 }}>+</button>
            </div>

            {/* Reps (shared) */}
            <input type="number" placeholder="Reps" value={firstSet.reps}
              onChange={e => syncAll("reps", e.target.value)}
              style={{ ...inp(), width: "25%", fontSize: 13 }} />

            {/* Weight (shared) */}
            <input type="number" placeholder="Wt" value={firstSet.weight}
              onChange={e => syncAll("weight", e.target.value)}
              style={{ ...inp(), width: "25%", fontSize: 13 }} />

            {/* Unit */}
            <select value={firstSet.unit || "lbs"} onChange={e => syncAll("unit", e.target.value)}
              style={{ ...inp(), flex: 1, padding: "9px 4px", fontSize: 12 }}>
              <option>lbs</option><option>kg</option><option>BW</option><option>min</option>
            </select>
          </div>

          {/* Toggle to show per-set detail */}
          {setCount > 1 && (
            <button onClick={() => setExpanded(x => !x)}
              style={{ marginLeft: 28, background: "none", border: "none", color: "#555", fontSize: 11, cursor: "pointer", padding: "2px 0", display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name={expanded ? "up" : "down"} size={11} color="#555" />
              {expanded ? "Hide" : "Edit individual sets"}
            </button>
          )}

          {/* Per-set detail (expanded) */}
          {expanded && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 4, fontSize: 10, color: "#444", marginBottom: 5, paddingLeft: 28 }}>
                <span style={{ width: "30%" }}>REPS</span><span style={{ width: "30%" }}>WEIGHT</span><span style={{ width: "24%" }}>UNIT</span>
              </div>
              {ex.sets.map((s, i) => (
                <div key={i} style={{ paddingLeft: 28 }}>
                  <SetRow set={s} idx={i} isLive={false}
                    onChange={v => onChange({ ...ex, sets: ex.sets.map((ss, ii) => ii === i ? v : ss) })}
                    onRemove={() => onChange({ ...ex, sets: ex.sets.filter((_, ii) => ii !== i) })} />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ── LIVE SESSION MODE: full per-set rows ── */
        <>
          <div style={{ display: "flex", gap: 4, fontSize: 10, color: "#444", marginBottom: 5, paddingLeft: 28 }}>
            <span style={{ width: "30%" }}>REPS</span><span style={{ width: "30%" }}>WEIGHT</span><span style={{ width: "24%" }}>UNIT</span>
          </div>
          {ex.sets.map((s, i) => (
            <div key={i} style={{ paddingLeft: 28 }}>
              <SetRow set={s} idx={i} isLive={true}
                onChange={v => onChange({ ...ex, sets: ex.sets.map((ss, ii) => ii === i ? v : ss) })}
                onRemove={() => onChange({ ...ex, sets: ex.sets.filter((_, ii) => ii !== i) })} />
            </div>
          ))}
          <button onClick={addSet} style={{ marginLeft: 28, background: "none", border: "1px dashed #252540", borderRadius: 7, color: "#444", fontSize: 11, padding: "4px 10px", cursor: "pointer", width: "calc(100% - 28px)", marginTop: 2 }}>
            + Add Set
          </button>
          <textarea placeholder="Notes for this exercise..." value={ex.note || ""} rows={2}
            onChange={e => onChange({ ...ex, note: e.target.value })}
            style={{ ...inp({ width: "100%", marginTop: 7, resize: "none", background: "#0a1a10", fontSize: 12 }) }} />
        </>
      )}
    </div>
  );
}

// ─── Exercise Picker ──────────────────────────────────────────────────────────
function ExercisePicker({ onSelect, onClose }) {
  const [q, setQ] = useState("");
  const filtered = EXERCISE_LIBRARY.filter(e => e.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 300, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: "#0d0d1c", borderRadius: "22px 22px 0 0", width: "100%", maxHeight: "78vh", display: "flex", flexDirection: "column", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontWeight: 800, color: "#fff", fontSize: 15 }}>Add Exercise</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><Icon name="close" /></button>
        </div>
        <input autoFocus placeholder="Search or type custom name..." value={q} onChange={e => setQ(e.target.value)}
          style={{ ...inp({ width: "100%", marginBottom: 10, fontSize: 14 }) }} />
        {q && !EXERCISE_LIBRARY.find(e => e.toLowerCase() === q.toLowerCase()) && (
          <button onClick={() => { onSelect(q); onClose(); }}
            style={{ background: "#a78bfa18", border: "1px solid #a78bfa44", borderRadius: 10, color: "#a78bfa", padding: "10px 14px", marginBottom: 8, cursor: "pointer", fontSize: 13, textAlign: "left", fontWeight: 600 }}>
            + Add "{q}" as custom exercise
          </button>
        )}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {filtered.map(e => (
            <button key={e} onClick={() => { onSelect(e); onClose(); }}
              style={{ display: "block", width: "100%", background: "none", border: "none", borderBottom: "1px solid #181828", color: "#ccc", padding: "12px 4px", cursor: "pointer", textAlign: "left", fontSize: 14 }}>
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
// The color accent cycles through a palette per section index
const SECTION_COLORS = ["#a78bfa", "#f6c85d", "#5dde8a", "#ff6b9d", "#4ecdc4", "#f97316", "#38bdf8"];

function SectionBlock({ section, sIdx, totalSections, onChange, onRemove, onMoveUp, onMoveDown, isLive, pickerTarget, setPickerTarget }) {
  const color = SECTION_COLORS[sIdx % SECTION_COLORS.length];
  const [showSuggestions, setShowSuggestions] = useState(false);

  const updateTitle = v => onChange({ ...section, title: v });
  const addExercise = name => onChange({ ...section, exercises: [...section.exercises, { name, sets: [{ reps: "", weight: "", unit: "lbs" }], note: "" }] });
  const updateExercise = (i, v) => onChange({ ...section, exercises: section.exercises.map((e, ii) => ii === i ? v : e) });
  const removeExercise = i => onChange({ ...section, exercises: section.exercises.filter((_, ii) => ii !== i) });
  const moveExercise = (i, dir) => {
    const arr = [...section.exercises];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange({ ...section, exercises: arr });
  };

  const isPickerOpen = pickerTarget === section.id;

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Section Header Row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        {/* Move section up/down */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
          <button onClick={onMoveUp} disabled={sIdx === 0}
            style={{ background: "none", border: "none", cursor: sIdx === 0 ? "default" : "pointer", padding: "1px 2px" }}>
            <Icon name="up" size={13} color={sIdx === 0 ? "#1e1e2e" : "#555"} />
          </button>
          <button onClick={onMoveDown} disabled={sIdx === totalSections - 1}
            style={{ background: "none", border: "none", cursor: sIdx === totalSections - 1 ? "default" : "pointer", padding: "1px 2px" }}>
            <Icon name="down" size={13} color={sIdx === totalSections - 1 ? "#1e1e2e" : "#555"} />
          </button>
        </div>

        {/* Colored accent bar */}
        <div style={{ width: 4, height: 38, borderRadius: 4, background: color, flexShrink: 0 }} />

        {/* Editable section title */}
        <div style={{ flex: 1, position: "relative" }}>
          <input
            placeholder="Section name (e.g. Mobility, Strength)"
            value={section.title}
            onChange={e => { updateTitle(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            style={{
              width: "100%", padding: "9px 12px", borderRadius: 10,
              border: `1.5px solid ${color}55`, background: `${color}10`,
              color: color, fontSize: 14, fontWeight: 800,
              outline: "none", boxSizing: "border-box",
              letterSpacing: 0.2,
            }}
          />
          {/* Suggestions dropdown */}
          {showSuggestions && !isLive && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#0d0d1c", border: "1px solid #252540", borderRadius: 10, zIndex: 100, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
              {SECTION_SUGGESTIONS.filter(s => s.toLowerCase().includes(section.title.toLowerCase()) && s.toLowerCase() !== section.title.toLowerCase()).slice(0, 5).map(s => (
                <button key={s} onMouseDown={() => { updateTitle(s); setShowSuggestions(false); }}
                  style={{ display: "block", width: "100%", background: "none", border: "none", borderBottom: "1px solid #181828", color: "#bbb", padding: "10px 14px", cursor: "pointer", textAlign: "left", fontSize: 13 }}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delete section */}
        <button onClick={onRemove}
          style={{ background: "none", border: "none", color: "#333", cursor: "pointer", padding: "4px", flexShrink: 0 }}>
          <Icon name="trash" size={14} />
        </button>
      </div>

      {/* Exercises inside this section */}
      <div style={{ paddingLeft: 24, borderLeft: `2px solid ${color}22` }}>
        {section.exercises.length === 0 && (
          <div style={{ color: "#333", fontSize: 12, fontStyle: "italic", padding: "8px 0 10px" }}>
            No exercises yet — add one below
          </div>
        )}
        {section.exercises.map((ex, i) => (
          <ExerciseCard key={`${section.id}-ex-${i}`} ex={ex} idx={i} total={section.exercises.length} isLive={isLive}
            onChange={v => updateExercise(i, v)}
            onRemove={() => removeExercise(i)}
            onMoveUp={() => moveExercise(i, -1)}
            onMoveDown={() => moveExercise(i, 1)}
          />
        ))}

        {/* Add exercise to this section */}
        <button
          onClick={() => setPickerTarget(section.id)}
          style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: `1px dashed ${color}44`, background: `${color}08`, color: color, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 2 }}>
          <Icon name="plus" size={13} color={color} /> Add Exercise to {section.title || "Section"}
        </button>
      </div>

      {/* Exercise picker for this section */}
      {isPickerOpen && (
        <ExercisePicker
          onSelect={name => { addExercise(name); setPickerTarget(null); }}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Template Builder / Editor ────────────────────────────────────────────────
function TemplateBuilder({ template, onSave, onBack }) {
  const isEdit = !!template;
  const [title, setTitle] = useState(template?.title || "");
  const [category, setCategory] = useState(template?.category || "");
  const [sections, setSections] = useState(
    template?.sections
      ? template.sections.map(s => ({ ...s, exercises: s.exercises.map(e => ({ ...e, sets: e.sets.map(st => ({ ...st })) })) }))
      : [{ id: Date.now(), title: "", exercises: [] }]
  );
  const [pickerTarget, setPickerTarget] = useState(null); // section.id that wants a picker
  const [saved, setSaved] = useState(false);

  const addSection = () => setSections(prev => [...prev, { id: Date.now() + Math.random(), title: "", exercises: [] }]);
  const updateSection = (i, v) => setSections(prev => prev.map((s, ii) => ii === i ? v : s));
  const removeSection = i => setSections(prev => prev.filter((_, ii) => ii !== i));
  const moveSection = (i, dir) => {
    const arr = [...sections];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setSections([...arr]);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: template?.id || Date.now(),
      title: title.trim(),
      category: category.trim(),
      sections,
      // Keep flat exercises for backward compat (progress view, etc.)
      exercises: flatExercises(sections),
      updatedAt: todayStr(),
      createdAt: template?.createdAt || todayStr(),
      assignedClients: template?.assignedClients || [],
    });
    setSaved(true);
    setTimeout(() => onBack(), 600);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "#0d0d1c", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #1a1a2e", position: "sticky", top: 0, zIndex: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer" }}><Icon name="back" size={22} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "#a78bfa", textTransform: "uppercase", letterSpacing: 1.5 }}>{isEdit ? "EDIT TEMPLATE" : "NEW TEMPLATE"}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e8e8f0", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title || "Untitled"}</div>
        </div>
        <button onClick={handleSave}
          style={{ background: saved ? "#2d5a3d" : "#a78bfa", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 13, transition: "background 0.3s" }}>
          {saved ? <><Icon name="check" size={14} />Saved!</> : <><Icon name="save" size={14} />Save</>}
        </button>
      </div>

      <div style={{ padding: 16 }}>
        {/* Template name + category */}
        <input placeholder="Template name (e.g. Push Day A, Full Body)" value={title} onChange={e => setTitle(e.target.value)}
          style={{ ...inp({ width: "100%", fontSize: 16, fontWeight: 700, marginBottom: 10, padding: "13px 14px" }) }} />
        <input placeholder="Category / tag (optional, e.g. Upper Body, Cardio)" value={category} onChange={e => setCategory(e.target.value)}
          style={{ ...inp({ width: "100%", marginBottom: 22 }) }} />

        {/* Sections */}
        <div style={{ fontSize: 10, color: "#444", letterSpacing: 1.5, marginBottom: 14, textTransform: "uppercase" }}>
          SECTIONS — type a header, then add exercises underneath
        </div>

        {sections.map((sec, i) => (
          <SectionBlock
            key={sec.id}
            section={sec}
            sIdx={i}
            totalSections={sections.length}
            onChange={v => updateSection(i, v)}
            onRemove={() => removeSection(i)}
            onMoveUp={() => moveSection(i, -1)}
            onMoveDown={() => moveSection(i, 1)}
            isLive={false}
            pickerTarget={pickerTarget}
            setPickerTarget={setPickerTarget}
          />
        ))}

        {/* Add section */}
        <button onClick={addSection}
          style={{ width: "100%", padding: "13px", borderRadius: 12, border: "2px dashed #2a2a44", background: "none", color: "#a78bfa", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
          <Icon name="section" size={15} color="#a78bfa" /> Add New Section
        </button>
      </div>
    </div>
  );
}

// ─── Session Logger ───────────────────────────────────────────────────────────
function SessionLogger({ client, template, onSave, onBack }) {
  const [title, setTitle] = useState(template?.title || "");
  const [date, setDate] = useState(todayStr());
  // Deep-copy sections from template (or start with one blank section)
  const [sections, setSections] = useState(
    template?.sections
      ? template.sections.map(s => ({ ...s, id: s.id || Date.now() + Math.random(), exercises: s.exercises.map(e => ({ ...e, sets: e.sets.map(st => ({ ...st })), note: "" })) }))
      : [{ id: Date.now(), title: "Exercises", exercises: [] }]
  );
  const [pickerTarget, setPickerTarget] = useState(null);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const updateSection = (i, v) => setSections(prev => prev.map((s, ii) => ii === i ? v : s));
  const addSection = () => setSections(prev => [...prev, { id: Date.now() + Math.random(), title: "", exercises: [] }]);
  const removeSection = i => setSections(prev => prev.filter((_, ii) => ii !== i));
  const moveSection = (i, dir) => {
    const arr = [...sections];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setSections([...arr]);
  };

  const handleSave = () => {
    onSave({
      id: Date.now(),
      clientId: client.id,
      title: title || "Session",
      date,
      sections,
      exercises: flatExercises(sections), // flat list for progress tracking
      notes,
      isLive: true,
      templateId: template?.id,
    });
    setSaved(true);
    setTimeout(() => onBack(), 600);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: "#0d0d1c", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #0e2018", position: "sticky", top: 0, zIndex: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#5dde8a", cursor: "pointer" }}><Icon name="back" size={22} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "#5dde8a", textTransform: "uppercase", letterSpacing: 1.5 }}>SESSION — {client.name}</div>
          <div style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{title || "Untitled"}</div>
        </div>
        <button onClick={handleSave}
          style={{ background: saved ? "#2d5a3d" : "#5dde8a", color: saved ? "#fff" : "#072010", border: "none", borderRadius: 10, padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 13, transition: "background 0.3s" }}>
          {saved ? <><Icon name="check" size={14} />Saved!</> : <><Icon name="save" size={14} />Save</>}
        </button>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input placeholder="Session title..." value={title} onChange={e => setTitle(e.target.value)}
            style={{ ...inp({ flex: 1, fontWeight: 700, fontSize: 14, minWidth: 0 }) }} />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ ...inp({ width: 142, flexShrink: 0 }) }} />
        </div>

        {sections.map((sec, i) => (
          <SectionBlock
            key={sec.id}
            section={sec}
            sIdx={i}
            totalSections={sections.length}
            onChange={v => updateSection(i, v)}
            onRemove={() => removeSection(i)}
            onMoveUp={() => moveSection(i, -1)}
            onMoveDown={() => moveSection(i, 1)}
            isLive={true}
            pickerTarget={pickerTarget}
            setPickerTarget={setPickerTarget}
          />
        ))}

        <button onClick={addSection}
          style={{ width: "100%", padding: "11px", borderRadius: 12, border: "2px dashed #1a2a1a", background: "none", color: "#5dde8a", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
          <Icon name="section" size={15} color="#5dde8a" /> Add Section
        </button>

        <textarea placeholder="Overall session notes (energy, mood, client feedback...)" value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          style={{ ...inp({ width: "100%", resize: "none", background: "#0d1f16" }) }} />
      </div>
    </div>
  );
}

// ─── Progress View ────────────────────────────────────────────────────────────
function ProgressView({ client, workouts, onBack }) {
  const [sessionDetail, setSessionDetail] = useState(null);
  const cw = workouts.filter(w => w.clientId === client.id && w.isLive).sort((a, b) => a.date.localeCompare(b.date));
  const allEx = [...new Set(cw.flatMap(w => (w.exercises || []).map(e => e.name)))];
  const [selEx, setSelEx] = useState(allEx[0] || "");

  if (sessionDetail) return <SessionDetailView workout={sessionDetail} client={client} allWorkouts={workouts} onBack={() => setSessionDetail(null)} onCopyToSession={() => setSessionDetail(null)} />;

  const getMax = (w, n) => { const e = (w.exercises || []).find(x => x.name === n); if (!e) return null; const ws = e.sets.map(s => parseFloat(s.weight)).filter(v => !isNaN(v)); return ws.length ? Math.max(...ws) : null; };
  const data = cw.map(w => ({ date: w.date.slice(5), max: getMax(w, selEx) })).filter(d => d.max !== null);
  const maxW = data.length ? Math.max(...data.map(d => d.max)) : 1;
  const minW = data.length ? Math.min(...data.map(d => d.max)) : 0;
  const prs = allEx.map(ex => ({ ex, max: Math.max(...cw.map(w => getMax(w, ex) || 0)) })).filter(r => r.max > 0);
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: "#0d0d1c", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #1a1a2e", position: "sticky", top: 0, zIndex: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#f6c85d", cursor: "pointer" }}><Icon name="back" size={22} /></button>
        <div><div style={{ fontSize: 10, color: "#f6c85d", textTransform: "uppercase", letterSpacing: 1.5 }}>PROGRESS REPORT</div><div style={{ fontSize: 14, fontWeight: 700 }}>{client.name}</div></div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          {[{ l: "Sessions", v: cw.length, c: "#f6c85d" }, { l: "Exercises", v: allEx.length, c: "#a78bfa" }].map(({ l, v, c }) => (
            <div key={l} style={{ background: "#181828", borderRadius: 14, padding: 14, border: `1px solid ${c}22` }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: c }}>{v}</div><div style={{ fontSize: 11, color: "#555" }}>{l}</div>
            </div>
          ))}
        </div>
        {allEx.length > 0 && (
          <div style={{ background: "#181828", borderRadius: 14, padding: 16, border: "1px solid #252540", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "#f6c85d" }}>Max Weight Over Time</div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 10 }}>
              {allEx.map(ex => (
                <button key={ex} onClick={() => setSelEx(ex)} style={{ whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 8, border: "1px solid", borderColor: selEx === ex ? "#f6c85d" : "#252540", background: selEx === ex ? "#f6c85d18" : "none", color: selEx === ex ? "#f6c85d" : "#555", fontSize: 11, cursor: "pointer" }}>{ex}</button>
              ))}
            </div>
            {data.length < 2
              ? <div style={{ color: "#333", fontSize: 13, textAlign: "center", padding: "16px 0" }}>Need 2+ sessions with weights to show trend</div>
              : <div style={{ position: "relative", height: 110 }}>
                  <svg viewBox={`0 0 ${Math.max(data.length * 52, 200)} 100`} style={{ width: "100%", height: "100%" }} preserveAspectRatio="none">
                    {data.map((d, i) => { const x = i*52+26; const y = 88-((d.max-minW)/(maxW-minW||1))*72; const nx = data[i+1]; return (<g key={i}>{nx && <line x1={x} y1={y} x2={(i+1)*52+26} y2={88-((nx.max-minW)/(maxW-minW||1))*72} stroke="#f6c85d" strokeWidth={2}/>}<circle cx={x} cy={y} r={4} fill="#f6c85d"/><text x={x} y={y-7} textAnchor="middle" fill="#f6c85d" fontSize={9}>{d.max}</text><text x={x} y={98} textAnchor="middle" fill="#444" fontSize={8}>{d.date}</text></g>); })}
                  </svg>
                </div>}
          </div>
        )}
        <div style={{ background: "#181828", borderRadius: 14, padding: 16, border: "1px solid #252540", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#f6c85d" }}>
            <Icon name="trophy" size={15} /><span style={{ fontSize: 12, fontWeight: 700 }}>Personal Records</span>
          </div>
          {prs.length === 0 ? <div style={{ color: "#333", fontSize: 12 }}>No records yet</div>
            : prs.map(({ ex, max }) => (
              <div key={ex} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1a28" }}>
                <span style={{ fontSize: 13, color: "#ccc" }}>{ex}</span><span style={{ fontSize: 13, fontWeight: 700, color: "#f6c85d" }}>{max} lbs</span>
              </div>
            ))}
        </div>
        <div style={{ background: "#181828", borderRadius: 14, padding: 16, border: "1px solid #252540" }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, color: "#a78bfa" }}>Recent Sessions</div>
          {[...cw].reverse().slice(0, 6).map(w => (
            <button key={w.id} onClick={() => setSessionDetail(w)}
              style={{ width: "100%", background: "none", border: "none", borderBottom: "1px solid #181828", paddingBottom: 10, marginBottom: 10, textAlign: "left", cursor: "pointer", display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 13, fontWeight: 600, color: "#e8e8f0" }}>{w.title}</span><span style={{ fontSize: 11, color: "#5dde8a" }}>{w.date}</span></div>
              <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{(w.exercises||[]).length} exercises · {(w.exercises||[]).reduce((s, ex) => s + (ex.sets?.length || 0), 0)} sets</div>
              {w.notes && <div style={{ fontSize: 11, color: "#a78bfa", marginTop: 3, fontStyle: "italic" }}>"{w.notes}"</div>}
              <div style={{ fontSize: 10, color: "#333", marginTop: 4 }}>Tap to view →</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Export helpers ───────────────────────────────────────────────────────────
function buildSessionText(workout, client) {
  const sections = workout.sections || [{ title: "", exercises: workout.exercises || [] }];
  let out = `WORKOUT SESSION REPORT\n`;
  out += `Client: ${client.name} | Goal: ${client.goal}\n`;
  out += `Session: ${workout.title}\nDate: ${workout.date}\n`;
  const exs = workout.exercises || [];
  const sets = exs.reduce((s, e) => s + (e.sets?.length || 0), 0);
  const vol = exs.reduce((s, e) => s + (e.sets || []).reduce((s2, st) => s2 + (parseFloat(st.reps)||0)*(parseFloat(st.weight)||0), 0), 0);
  out += `Exercises: ${exs.length} | Total Sets: ${sets}${vol > 0 ? ` | Volume: ${vol.toLocaleString()} lbs` : ""}\n`;
  if (workout.notes) out += `\nSession Notes: ${workout.notes}\n`;
  out += `\n${"─".repeat(40)}\n`;
  sections.forEach(sec => {
    if (sec.title) out += `\n[ ${sec.title.toUpperCase()} ]\n`;
    (sec.exercises || []).forEach(ex => {
      const maxWt = Math.max(0, ...(ex.sets||[]).map(s => parseFloat(s.weight)||0));
      out += `\n  ${ex.name}${maxWt > 0 ? ` (Max: ${maxWt} lbs)` : ""}\n`;
      (ex.sets||[]).forEach((s, i) => {
        out += `    Set ${i+1}: ${s.reps||"—"} reps @ ${s.weight||"—"} ${s.unit||"lbs"}\n`;
      });
      if (ex.note) out += `    Note: ${ex.note}\n`;
    });
  });
  return out;
}

function buildCSV(workout, client) {
  const rows = [["Client","Date","Session","Section","Exercise","Set #","Reps","Weight","Unit","Volume","Exercise Note","Session Note"]];
  const sections = workout.sections || [{ title: "", exercises: workout.exercises || [] }];
  sections.forEach(sec => {
    (sec.exercises||[]).forEach(ex => {
      (ex.sets||[]).forEach((s, i) => {
        const vol = (parseFloat(s.reps)||0)*(parseFloat(s.weight)||0);
        rows.push([client.name, workout.date, workout.title, sec.title||"", ex.name, i+1, s.reps||"", s.weight||"", s.unit||"lbs", vol||"", ex.note||"", i===0 ? (workout.notes||"") : ""]);
      });
    });
  });
  return rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function buildHTMLReport(workout, client, allWorkouts) {
  const sections = workout.sections || [{ title: "", exercises: workout.exercises || [] }];
  const exs = workout.exercises || [];
  const totalSets = exs.reduce((s, e) => s + (e.sets?.length||0), 0);
  const totalVol = exs.reduce((s, e) => s + (e.sets||[]).reduce((s2,st) => s2+(parseFloat(st.reps)||0)*(parseFloat(st.weight)||0),0),0);

  // PRs across all sessions
  const clientW = allWorkouts.filter(w => w.clientId === client.id && w.isLive);
  const allExNames = [...new Set(clientW.flatMap(w => (w.exercises||[]).map(e=>e.name)))];
  const prs = allExNames.map(name => {
    const maxWt = Math.max(0,...clientW.flatMap(w=>(w.exercises||[]).filter(e=>e.name===name).flatMap(e=>(e.sets||[]).map(s=>parseFloat(s.weight)||0))));
    return { name, maxWt };
  }).filter(p=>p.maxWt>0);

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${workout.title} — ${client.name}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#0a0a14;color:#e8e8f0;padding:32px 20px;max-width:680px;margin:0 auto}
  h1{font-size:26px;font-weight:900;margin-bottom:4px}
  .sub{color:#a78bfa;font-size:13px;letter-spacing:1px;text-transform:uppercase;margin-bottom:20px}
  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
  .stat{background:#181828;border-radius:12px;padding:14px;text-align:center;border:1px solid #2a2a40}
  .stat-val{font-size:24px;font-weight:900;color:#5dde8a}
  .stat-label{font-size:11px;color:#555;margin-top:3px}
  .notes-box{background:#181828;border-left:4px solid #a78bfa;border-radius:8px;padding:14px;margin-bottom:24px;font-style:italic;color:#bbb;font-size:13px}
  .section-hdr{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#f6c85d;border-bottom:1px solid #f6c85d33;padding-bottom:6px;margin:20px 0 12px}
  .ex{background:#181828;border-radius:10px;padding:14px;margin-bottom:10px}
  .ex-name{font-weight:700;font-size:15px;color:#5dde8a;margin-bottom:8px}
  .ex-meta{font-size:11px;color:#666;margin-bottom:8px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;color:#555;font-size:10px;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;border-bottom:1px solid #252540}
  td{padding:6px 8px;border-bottom:1px solid #181828;color:#ccc}
  .ex-note{margin-top:8px;font-size:12px;color:#888;font-style:italic;padding:6px 10px;background:#0f0f1e;border-radius:6px;border-left:3px solid #5dde8a44}
  .prs{margin-top:28px}
  .pr-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1a1a2a;font-size:13px}
  .pr-val{font-weight:700;color:#f6c85d}
  .footer{margin-top:32px;font-size:11px;color:#333;text-align:center}
  @media print{body{background:#fff;color:#000}.stat{background:#f5f5f5;border-color:#ddd}.stat-val{color:#333}.ex{background:#f9f9f9}}
</style></head><body>
<h1>${workout.title}</h1>
<div class="sub">${client.name} &nbsp;·&nbsp; ${client.goal} &nbsp;·&nbsp; ${workout.date}</div>
<div class="stats">
  <div class="stat"><div class="stat-val">${exs.length}</div><div class="stat-label">Exercises</div></div>
  <div class="stat"><div class="stat-val">${totalSets}</div><div class="stat-label">Total Sets</div></div>
  <div class="stat"><div class="stat-val">${totalVol>0?totalVol.toLocaleString():"—"}</div><div class="stat-label">Volume (lbs)</div></div>
</div>
${workout.notes?`<div class="notes-box">"${workout.notes}"</div>`:""}
${sections.map(sec=>`
${sec.title?`<div class="section-hdr">${sec.title}</div>`:""}
${(sec.exercises||[]).map(ex=>{
  const maxWt=Math.max(0,...(ex.sets||[]).map(s=>parseFloat(s.weight)||0));
  const vol=(ex.sets||[]).reduce((s,st)=>s+(parseFloat(st.reps)||0)*(parseFloat(st.weight)||0),0);
  return `<div class="ex">
<div class="ex-name">${ex.name}</div>
<div class="ex-meta">${maxWt>0?`Max Weight: <strong>${maxWt} lbs</strong>`:""}${vol>0?` &nbsp;·&nbsp; Volume: ${vol.toLocaleString()} lbs`:""}</div>
<table><thead><tr><th>#</th><th>Reps</th><th>Weight</th><th>Unit</th></tr></thead><tbody>
${(ex.sets||[]).map((s,i)=>`<tr><td>${i+1}</td><td>${s.reps||"—"}</td><td>${s.weight||"—"}</td><td>${s.unit||"lbs"}</td></tr>`).join("")}
</tbody></table>${ex.note?`<div class="ex-note">${ex.note}</div>`:""}</div>`;
}).join("")}`).join("")}
${prs.length?`<div class="prs"><div class="section-hdr">Personal Records (All Time)</div>${prs.map(p=>`<div class="pr-row"><span>${p.name}</span><span class="pr-val">${p.maxWt} lbs</span></div>`).join("")}</div>`:""}
<div class="footer">Generated by FitCoach Pro &nbsp;·&nbsp; ${new Date().toLocaleDateString()}</div>
</body></html>`;
}

// ─── Session Detail View ──────────────────────────────────────────────────────
function SessionDetailView({ workout, client, onBack, onCopyToSession, allWorkouts }) {
  const sections = workout.sections || [{ title: "", exercises: workout.exercises || [] }];
  const exs = workout.exercises || [];
  const totalSets = exs.reduce((s, e) => s + (e.sets?.length||0), 0);
  const totalVolume = exs.reduce((s, e) => s + (e.sets||[]).reduce((s2, st) => s2+(parseFloat(st.reps)||0)*(parseFloat(st.weight)||0), 0), 0);
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyText = () => {
    navigator.clipboard?.writeText(buildSessionText(workout, client)).catch(()=>{});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleCSV = () => downloadFile(buildCSV(workout, client), `${client.name.replace(/\s+/g,"-")}_${workout.date}.csv`, "text/csv");
  const handleHTML = () => downloadFile(buildHTMLReport(workout, client, allWorkouts), `${client.name.replace(/\s+/g,"-")}_${workout.date}_report.html`, "text/html");
  const handlePrint = () => {
    const win = window.open("","_blank");
    win.document.write(buildHTMLReport(workout, client, allWorkouts));
    win.document.close();
    setTimeout(()=>win.print(), 400);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0d0d1c", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #0e2018", position: "sticky", top: 0, zIndex: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#5dde8a", cursor: "pointer" }}><Icon name="back" size={22} /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: "#5dde8a", textTransform: "uppercase", letterSpacing: 1.5 }}>SESSION — {client.name}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#e8e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{workout.title}</div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#5dde8a", flexShrink: 0 }}>{workout.date}</div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Action buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
          <button onClick={() => onCopyToSession(workout)}
            style={{ padding: "11px 0", borderRadius: 11, background: "#a78bfa18", border: "1px solid #a78bfa44", color: "#a78bfa", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Icon name="copy" size={13} color="#a78bfa" /> Copy & Edit as New Session
          </button>
          <button onClick={() => setShowExport(x => !x)}
            style={{ padding: "11px 0", borderRadius: 11, background: "#f6c85d18", border: "1px solid #f6c85d44", color: "#f6c85d", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Icon name="save" size={13} color="#f6c85d" /> Export / Share ▾
          </button>
        </div>

        {/* Export options panel */}
        {showExport && (
          <div style={{ background: "#181828", border: "1px solid #2a2a40", borderRadius: 14, padding: 14, marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Choose export format</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "A  —  In-app summary card", desc: "Copy plain text to clipboard — paste into any message, email, or note", action: handleCopyText, color: "#a78bfa", done: copied, doneLabel: "✓ Copied!" },
                { label: "B  —  PDF-ready report", desc: "Opens a formatted HTML report — print it or Save as PDF from your browser", action: handlePrint, color: "#5dde8a" },
                { label: "C  —  Download HTML report", desc: "Save a styled report file you can email or share with the client", action: handleHTML, color: "#38bdf8" },
                { label: "D  —  CSV / Spreadsheet", desc: "Download raw session data — opens in Excel, Google Sheets, Numbers", action: handleCSV, color: "#f6c85d" },
              ].map(({ label, desc, action, color, done, doneLabel }) => (
                <button key={label} onClick={action}
                  style={{ background: `${color}10`, border: `1px solid ${color}33`, borderRadius: 11, padding: "12px 14px", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: done ? "#5dde8a" : color, marginBottom: 3 }}>{done ? doneLabel : label}</div>
                  <div style={{ fontSize: 11, color: "#555", lineHeight: 1.4 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
          {[
            { label: "Exercises", value: exs.length, color: "#a78bfa" },
            { label: "Total Sets", value: totalSets, color: "#f6c85d" },
            { label: "Volume", value: totalVolume > 0 ? totalVolume.toLocaleString() + " lbs" : "—", color: "#5dde8a" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#181828", borderRadius: 12, padding: "12px 10px", border: `1px solid ${color}22`, textAlign: "center" }}>
              <div style={{ fontSize: String(value).length > 7 ? 12 : 20, fontWeight: 900, color, lineHeight: 1.2 }}>{value}</div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Overall session notes */}
        {workout.notes && (
          <div style={{ background: "#181828", border: "1px solid #2a2a3a", borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: "#a78bfa", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Session Notes</div>
            <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6, fontStyle: "italic" }}>"{workout.notes}"</div>
          </div>
        )}

        {/* Sections and exercises */}
        {sections.map((sec, si) => {
          const secColor = SECTION_COLORS[si % SECTION_COLORS.length];
          return (
            <div key={si} style={{ marginBottom: 24 }}>
              {sec.title && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 4, height: 20, borderRadius: 4, background: secColor, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: secColor, textTransform: "uppercase", letterSpacing: 1 }}>{sec.title}</span>
                  <div style={{ flex: 1, height: 1, background: `${secColor}22` }} />
                </div>
              )}
              {(sec.exercises || []).map((ex, ei) => {
                const exVolume = (ex.sets||[]).reduce((s, set) => s+(parseFloat(set.reps)||0)*(parseFloat(set.weight)||0), 0);
                const maxWt = Math.max(0, ...(ex.sets||[]).map(s => parseFloat(s.weight)||0));
                return (
                  <div key={ei} style={{ background: "#0f1e16", border: "1px solid #1e3028", borderRadius: 12, padding: 14, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#5dde8a" }}>{ex.name}</div>
                      <div style={{ textAlign: "right" }}>
                        {maxWt > 0 && <div style={{ fontSize: 12, fontWeight: 700, color: "#f6c85d" }}>Max: {maxWt} {ex.sets?.[0]?.unit||"lbs"}</div>}
                        {exVolume > 0 && <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>Vol: {exVolume.toLocaleString()} lbs</div>}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "22px 1fr 1fr 52px", gap: 6, fontSize: 10, color: "#555", marginBottom: 5 }}>
                      <span /><span>REPS</span><span>WEIGHT</span><span>UNIT</span>
                    </div>
                    {(ex.sets||[]).map((set, si2) => (
                      <div key={si2} style={{ display: "grid", gridTemplateColumns: "22px 1fr 1fr 52px", gap: 6, marginBottom: 5, alignItems: "center" }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#1a2e20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#5dde8a", fontWeight: 700 }}>{si2+1}</div>
                        <div style={{ background: "#0a1a10", borderRadius: 7, padding: "7px 10px", fontSize: 14, fontWeight: 700, color: set.reps ? "#e8e8f0" : "#2a2a2a", textAlign: "center" }}>{set.reps||"—"}</div>
                        <div style={{ background: "#0a1a10", borderRadius: 7, padding: "7px 10px", fontSize: 14, fontWeight: 700, color: set.weight ? "#e8e8f0" : "#2a2a2a", textAlign: "center" }}>{set.weight||"—"}</div>
                        <div style={{ background: "#0a1a10", borderRadius: 7, padding: "7px 8px", fontSize: 11, color: "#777", textAlign: "center" }}>{set.unit||"lbs"}</div>
                      </div>
                    ))}
                    {ex.note && (
                      <div style={{ marginTop: 8, padding: "8px 10px", background: "#0a1a10", borderRadius: 8, borderLeft: "3px solid #5dde8a44" }}>
                        <div style={{ fontSize: 10, color: "#5dde8a55", marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>Note</div>
                        <div style={{ fontSize: 12, color: "#999", fontStyle: "italic" }}>{ex.note}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Assign Modal ─────────────────────────────────────────────────────────────
function AssignModal({ template, clients, alreadyAssigned, onAssign, onClose }) {
  const [selected, setSelected] = useState([]);
  const toggle = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const unassigned = clients.filter(c => !alreadyAssigned.includes(c.id));
  const colors = ["#a78bfa","#5dde8a","#f6c85d","#ff6b9d","#4ecdc4"];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: "#0d0d1c", borderRadius: "22px 22px 0 0", width: "100%", padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Assign to Clients</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><Icon name="close" /></button>
        </div>
        <div style={{ fontSize: 12, color: "#555", marginBottom: 14 }}>"{template.title}"</div>
        {unassigned.length === 0 ? <div style={{ color: "#444", fontSize: 13, textAlign: "center", padding: "16px 0" }}>All clients already assigned.</div>
          : unassigned.map(c => {
            const col = colors[c.id % colors.length];
            return (
              <button key={c.id} onClick={() => toggle(c.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: selected.includes(c.id) ? "#a78bfa18" : "none", border: `1px solid ${selected.includes(c.id) ? "#a78bfa55" : "#1e1e30"}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${col}18`, border: `2px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: col }}>
                  {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1, textAlign: "left" }}><div style={{ color: "#e8e8f0", fontWeight: 600, fontSize: 14 }}>{c.name}</div><div style={{ color: "#555", fontSize: 11 }}>{c.goal}</div></div>
                {selected.includes(c.id) && <Icon name="check" size={16} color="#5dde8a" />}
              </button>
            );
          })}
        {unassigned.length > 0 && (
          <button onClick={() => { if (selected.length) { onAssign(selected); onClose(); } }} disabled={!selected.length}
            style={{ width: "100%", padding: "14px", borderRadius: 12, background: selected.length ? "#a78bfa" : "#1e1e30", color: selected.length ? "#fff" : "#555", border: "none", fontSize: 15, fontWeight: 700, cursor: selected.length ? "pointer" : "default", marginTop: 4, transition: "background 0.2s" }}>
            Assign to {selected.length} Client{selected.length !== 1 ? "s" : ""}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Client Detail ────────────────────────────────────────────────────────────
function ClientDetail({ client, allTemplates, workouts, onBack, onSaveWorkout, onDeleteWorkout, onRemoveAssignment }) {
  const [view, setView] = useState("main");
  const [sessionTemplate, setSessionTemplate] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // session id awaiting confirm
  const assigned = allTemplates.filter(t => t.assignedClients?.includes(client.id));
  const clientWorkouts = workouts.filter(w => w.clientId === client.id && w.isLive).sort((a, b) => b.date.localeCompare(a.date));

  const handleCopyToSession = (workout) => {
    const asTemplate = {
      id: `copy-${Date.now()}`,
      title: `${workout.title} (Copy)`,
      sections: (workout.sections || [{ id: Date.now(), title: "", exercises: workout.exercises || [] }])
        .map(s => ({ ...s, id: Date.now() + Math.random(), exercises: (s.exercises||[]).map(e => ({ ...e, sets: (e.sets||[]).map(st => ({ ...st })), note: "" })) })),
      exercises: workout.exercises || [],
    };
    setSessionTemplate(asTemplate);
    setSelectedSession(null);
    setView("session");
  };

  if (view === "session") return <SessionLogger key={sessionTemplate?.id || "blank"} client={client} template={sessionTemplate} onSave={w => { onSaveWorkout(w); setView("main"); }} onBack={() => setView("main")} />;
  if (view === "progress") return <ProgressView client={client} workouts={workouts} onBack={() => setView("main")} />;
  if (view === "sessionDetail" && selectedSession) return (
    <SessionDetailView
      workout={selectedSession}
      client={client}
      allWorkouts={workouts}
      onBack={() => { setSelectedSession(null); setView("main"); }}
      onCopyToSession={handleCopyToSession}
    />
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: "#0d0d1c", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #1a1a2e", position: "sticky", top: 0, zIndex: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer" }}><Icon name="back" size={22} /></button>
        <div style={{ flex: 1 }}><div style={{ fontSize: 17, fontWeight: 900 }}>{client.name}</div><div style={{ fontSize: 12, color: "#a78bfa" }}>{client.goal}</div></div>
        <button onClick={() => setView("progress")} style={{ background: "#f6c85d18", border: "1px solid #f6c85d33", color: "#f6c85d", borderRadius: 10, padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700 }}>
          <Icon name="chart" size={13} /> Progress
        </button>
      </div>
      <div style={{ padding: 16 }}>
        <button onClick={() => { setSessionTemplate(null); setView("session"); }}
          style={{ width: "100%", padding: 14, borderRadius: 14, background: "linear-gradient(135deg, #5dde8a, #3cb869)", color: "#072010", border: "none", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          <Icon name="play" size={14} color="#072010" /> Start Blank Session
        </button>

        <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>ASSIGNED TEMPLATES ({assigned.length})</div>
        {assigned.length === 0
          ? <div style={{ color: "#252535", fontSize: 13, textAlign: "center", padding: "16px 0", marginBottom: 16 }}>No templates assigned. Go to the Templates tab.</div>
          : assigned.map(t => (
            <div key={t.id} style={{ background: "#181828", border: "1px solid #252538", borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{t.title}</div>
                  {t.category && <div style={{ fontSize: 11, color: "#a78bfa", marginTop: 1 }}>{t.category}</div>}
                  <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>
                    {(t.sections || []).length} sections · {(t.exercises || []).length} exercises
                  </div>
                </div>
                <button onClick={() => onRemoveAssignment(t.id, client.id)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 11 }}>Remove</button>
              </div>
              {t.sections && t.sections.length > 0 && (
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {t.sections.map((s, i) => (
                    <span key={i} style={{ background: `${SECTION_COLORS[i % SECTION_COLORS.length]}18`, border: `1px solid ${SECTION_COLORS[i % SECTION_COLORS.length]}44`, borderRadius: 6, padding: "3px 8px", fontSize: 10, color: SECTION_COLORS[i % SECTION_COLORS.length], fontWeight: 700 }}>
                      {s.title || "Section"} ({s.exercises.length})
                    </span>
                  ))}
                </div>
              )}
              <button onClick={() => { setSessionTemplate(t); setView("session"); }}
                style={{ width: "100%", padding: "10px", borderRadius: 10, background: "#5dde8a18", border: "1px solid #5dde8a33", color: "#5dde8a", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                ▶ Start Session with This Template
              </button>
            </div>
          ))}

        <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, marginTop: 20 }}>RECENT SESSIONS ({clientWorkouts.length})</div>
        {clientWorkouts.length === 0
          ? <div style={{ color: "#252535", fontSize: 13, textAlign: "center", padding: "16px 0" }}>No sessions yet.</div>
          : clientWorkouts.slice(0, 20).map(w => (
            <div key={w.id} style={{ background: "#181828", border: "1px solid #1e2e1e", borderRadius: 12, marginBottom: 8, overflow: "hidden" }}>
              {/* Tappable session info area */}
              <button
                onClick={() => { setConfirmDeleteId(null); setSelectedSession(w); setView("sessionDetail"); }}
                style={{ width: "100%", background: "none", border: "none", padding: 14, cursor: "pointer", textAlign: "left", display: "block" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#e8e8f0" }}>{w.title}</span>
                  <span style={{ fontSize: 11, color: "#5dde8a", fontWeight: 600 }}>{w.date}</span>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                  <span style={{ fontSize: 11, color: "#555" }}>{(w.exercises || []).length} exercises</span>
                  <span style={{ fontSize: 11, color: "#555" }}>·</span>
                  <span style={{ fontSize: 11, color: "#555" }}>{(w.exercises || []).reduce((s, ex) => s + (ex.sets?.length || 0), 0)} sets</span>
                </div>
                {w.notes && <div style={{ fontSize: 11, color: "#a78bfa", marginTop: 4, fontStyle: "italic" }}>"{w.notes}"</div>}
              </button>

              {/* Delete row */}
              {confirmDeleteId === w.id ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#1a0a0a", borderTop: "1px solid #3a1a1a" }}>
                  <span style={{ fontSize: 12, color: "#ff6b6b", flex: 1 }}>Delete this session?</span>
                  <button onClick={() => { onDeleteWorkout(w.id); setConfirmDeleteId(null); }}
                    style={{ background: "#ff4455", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 14px", cursor: "pointer" }}>
                    Delete
                  </button>
                  <button onClick={() => setConfirmDeleteId(null)}
                    style={{ background: "#252535", border: "none", borderRadius: 8, color: "#888", fontSize: 12, padding: "6px 12px", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ borderTop: "1px solid #141e14", padding: "7px 14px" }}>
                  <button onClick={() => setConfirmDeleteId(w.id)}
                    style={{ background: "none", border: "none", color: "#3a3a4a", fontSize: 11, cursor: "pointer", padding: 0 }}>
                    Delete session
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Templates Tab ────────────────────────────────────────────────────────────
function TemplatesTab({ templates, clients, onNew, onEdit, onDuplicate, onDelete, onAssign }) {
  const [assignTarget, setAssignTarget] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  return (
    <div style={{ padding: 16 }}>
      <button onClick={onNew}
        style={{ width: "100%", padding: 14, borderRadius: 14, background: "linear-gradient(135deg, #a78bfa, #7c5ce7)", color: "#fff", border: "none", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
        <Icon name="plus" size={16} /> Create New Template
      </button>
      {templates.length === 0
        ? <div style={{ color: "#252535", fontSize: 14, textAlign: "center", padding: "50px 0" }}>No templates yet.<br />Create one and assign it to any client!</div>
        : templates.map(t => (
          <div key={t.id} style={{ background: "#181828", border: "1px solid #252538", borderRadius: 16, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{t.title}</div>
                {t.category && <div style={{ fontSize: 11, color: "#a78bfa", marginTop: 2 }}>{t.category}</div>}
                <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>
                  {(t.sections||[]).length} sections · {(t.exercises||[]).length} exercises · Updated {t.updatedAt}
                </div>
              </div>
              {t.sections && t.sections.length > 0 && (
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {t.sections.map((s, i) => (
                    <span key={i} style={{ background: `${SECTION_COLORS[i % SECTION_COLORS.length]}15`, border: `1px solid ${SECTION_COLORS[i % SECTION_COLORS.length]}40`, borderRadius: 6, padding: "3px 9px", fontSize: 10, color: SECTION_COLORS[i % SECTION_COLORS.length], fontWeight: 700 }}>
                      {s.title || "Section"} · {s.exercises.length}
                    </span>
                  ))}
                </div>
              )}
              {t.assignedClients?.length > 0 && (
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {t.assignedClients.map(cid => { const c = clients.find(x => x.id === cid); return c ? <span key={cid} style={{ background: "#a78bfa15", borderRadius: 6, padding: "3px 8px", fontSize: 10, color: "#a78bfa", border: "1px solid #a78bfa30" }}>{c.name}</span> : null; })}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
                {[["edit","#a78bfa","Edit"],["copy","#f6c85d","Copy"]].map(([icon,col,lbl]) => (
                  <button key={lbl} onClick={() => lbl === "Edit" ? onEdit(t) : onDuplicate(t)}
                    style={{ padding: "9px 0", borderRadius: 10, background: `${col}18`, border: `1px solid ${col}30`, color: col, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <Icon name={icon} size={12} color={col} /> {lbl}
                  </button>
                ))}
                <button onClick={() => setAssignTarget(t)}
                  style={{ padding: "9px 0", borderRadius: 10, background: "#5dde8a18", border: "1px solid #5dde8a30", color: "#5dde8a", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                  <Icon name="assign" size={12} color="#5dde8a" /> Assign
                </button>
              </div>
            </div>

            {/* Delete row — inline confirm */}
            {confirmDeleteId === t.id ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#1a0a0a", borderTop: "1px solid #3a1a1a" }}>
                <span style={{ fontSize: 12, color: "#ff6b6b", flex: 1 }}>Delete "{t.title}"?</span>
                <button onClick={() => { onDelete(t.id); setConfirmDeleteId(null); }}
                  style={{ background: "#ff4455", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 14px", cursor: "pointer" }}>
                  Delete
                </button>
                <button onClick={() => setConfirmDeleteId(null)}
                  style={{ background: "#252535", border: "none", borderRadius: 8, color: "#888", fontSize: 12, padding: "6px 12px", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ borderTop: "1px solid #1e1e28", padding: "8px 16px" }}>
                <button onClick={() => setConfirmDeleteId(t.id)}
                  style={{ background: "none", border: "none", color: "#3a3a4a", fontSize: 11, cursor: "pointer", padding: 0 }}>
                  Delete template
                </button>
              </div>
            )}
          </div>
        ))}
      {assignTarget && (
        <AssignModal template={assignTarget} clients={clients} alreadyAssigned={assignTarget.assignedClients || []}
          onAssign={ids => { onAssign(assignTarget, ids); setAssignTarget(null); }}
          onClose={() => setAssignTarget(null)} />
      )}
    </div>
  );
}

// ─── Add Client Modal ─────────────────────────────────────────────────────────
function AddClientModal({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("General Fitness");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: "#0d0d1c", borderRadius: "22px 22px 0 0", width: "100%", padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>Add New Client</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><Icon name="close" /></button>
        </div>
        <input placeholder="Client name" value={name} onChange={e => setName(e.target.value)}
          style={{ ...inp({ width: "100%", fontSize: 15, marginBottom: 10 }) }} />
        <select value={goal} onChange={e => setGoal(e.target.value)} style={{ ...inp({ width: "100%", marginBottom: 16 }) }}>
          {["Weight Loss","Muscle Gain","Endurance","Flexibility","General Fitness","Athletic Performance","Rehab/Recovery"].map(g => <option key={g}>{g}</option>)}
        </select>
        <button onClick={() => { if (name.trim()) { onAdd({ id: Date.now(), name: name.trim(), goal, since: todayStr() }); onClose(); } }}
          style={{ width: "100%", padding: 14, borderRadius: 12, background: "#a78bfa", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          Add Client
        </button>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(loadData());
  const [tab, setTab] = useState("clients");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [buildingTemplate, setBuildingTemplate] = useState(false);

  useEffect(() => { saveData(data); }, [data]);

  const addClient = c => setData(d => ({ ...d, clients: [...d.clients, c] }));
  const saveWorkout = w => setData(d => ({ ...d, workouts: [...d.workouts, w] }));
  const deleteWorkout = id => setData(d => ({ ...d, workouts: d.workouts.filter(w => w.id !== id) }));
  const saveTemplate = t => setData(d => ({ ...d, templates: d.templates.find(x => x.id === t.id) ? d.templates.map(x => x.id === t.id ? t : x) : [...d.templates, t] }));
  const duplicateTemplate = t => setData(d => ({ ...d, templates: [...d.templates, { ...t, id: Date.now(), title: `${t.title} (Copy)`, assignedClients: [], createdAt: todayStr(), updatedAt: todayStr() }] }));
  const deleteTemplate = id => setData(d => ({ ...d, templates: d.templates.filter(t => t.id !== id) }));
  const assignTemplate = (tmpl, clientIds) => setData(d => ({ ...d, templates: d.templates.map(t => t.id === tmpl.id ? { ...t, assignedClients: [...new Set([...(t.assignedClients || []), ...clientIds])] } : t) }));
  const removeAssignment = (templateId, clientId) => setData(d => ({ ...d, templates: d.templates.map(t => t.id === templateId ? { ...t, assignedClients: (t.assignedClients || []).filter(id => id !== clientId) } : t) }));

  if (buildingTemplate !== false) {
    return <TemplateBuilder template={buildingTemplate || null} onSave={t => { saveTemplate(t); setBuildingTemplate(false); }} onBack={() => setBuildingTemplate(false)} />;
  }
  if (selectedClient) {
    return <ClientDetail client={selectedClient} allTemplates={data.templates} workouts={data.workouts} onBack={() => setSelectedClient(null)} onSaveWorkout={saveWorkout} onDeleteWorkout={deleteWorkout} onRemoveAssignment={removeAssignment} />;
  }

  const totalSessions = data.workouts.filter(w => w.isLive).length;
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const clientColors = ["#a78bfa","#5dde8a","#f6c85d","#ff6b9d","#4ecdc4"];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#fff", fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ padding: "20px 16px 8px", background: "linear-gradient(180deg, #0d0d1e 0%, #0a0a14 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}><span style={{ color: "#a78bfa" }}>Fit</span>Coach Pro</div>
            <div style={{ fontSize: 11, color: "#333" }}>Training Management</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#5dde8a", lineHeight: 1 }}>{totalSessions}</div>
            <div style={{ fontSize: 10, color: "#333" }}>total sessions</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
          {[{ l: "Clients", v: data.clients.length, c: "#a78bfa" }, { l: "Templates", v: data.templates.length, c: "#f6c85d" }, { l: "This Week", v: data.workouts.filter(w => w.isLive && w.date >= weekAgo).length, c: "#5dde8a" }].map(({ l, v, c }) => (
            <div key={l} style={{ background: "#181828", borderRadius: 12, padding: "10px 12px", border: `1px solid ${c}20` }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: c }}>{v}</div>
              <div style={{ fontSize: 10, color: "#333" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", padding: "12px 16px 0", gap: 8 }}>
        {[{ id: "clients", label: "Clients", icon: "user" }, { id: "templates", label: "Templates", icon: "template" }].map(({ id, label, icon }) => {
          const active = tab === id; const col = id === "clients" ? "#a78bfa" : "#f6c85d";
          return (
            <button key={id} onClick={() => setTab(id)}
              style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", background: active ? col : "#181828", color: active ? (id === "templates" ? "#0a0a14" : "#fff") : "#444", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s" }}>
              <Icon name={icon} size={14} color={active ? (id === "templates" ? "#0a0a14" : "#fff") : "#444"} /> {label}
            </button>
          );
        })}
      </div>

      {tab === "clients" && (
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button onClick={() => setShowAddClient(true)}
              style={{ background: "#a78bfa18", border: "1px solid #a78bfa33", color: "#a78bfa", borderRadius: 10, padding: "7px 13px", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
              <Icon name="plus" size={13} /> Add Client
            </button>
          </div>
          {data.clients.map(client => {
            const sessions = data.workouts.filter(w => w.clientId === client.id && w.isLive).length;
            const tCount = data.templates.filter(t => t.assignedClients?.includes(client.id)).length;
            const last = data.workouts.filter(w => w.clientId === client.id && w.isLive).sort((a, b) => b.date.localeCompare(a.date))[0];
            const col = clientColors[client.id % clientColors.length];
            const initials = client.name.split(" ").map(n => n[0]).join("").slice(0, 2);
            return (
              <button key={client.id} onClick={() => setSelectedClient(client)}
                style={{ width: "100%", background: "#181828", border: "1px solid #252538", borderRadius: 16, padding: 14, marginBottom: 10, cursor: "pointer", textAlign: "left", display: "block" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${col}18`, border: `2px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: col, flexShrink: 0 }}>{initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#e8e8f0" }}>{client.name}</div>
                    <div style={{ fontSize: 12, color: "#555", marginTop: 1 }}>{client.goal}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#5dde8a" }}>{sessions}</div>
                    <div style={{ fontSize: 9, color: "#333" }}>sessions</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <span style={{ background: "#13131f", borderRadius: 8, padding: "3px 9px", fontSize: 10, color: "#555" }}>{tCount} template{tCount !== 1 ? "s" : ""}</span>
                  {last && <span style={{ background: "#13131f", borderRadius: 8, padding: "3px 9px", fontSize: 10, color: "#555" }}>Last: {last.date}</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {tab === "templates" && (
        <TemplatesTab templates={data.templates} clients={data.clients} onNew={() => setBuildingTemplate(null)} onEdit={t => setBuildingTemplate(t)} onDuplicate={duplicateTemplate} onDelete={deleteTemplate} onAssign={assignTemplate} />
      )}

      {showAddClient && <AddClientModal onAdd={addClient} onClose={() => setShowAddClient(false)} />}
    </div>
  );
}
