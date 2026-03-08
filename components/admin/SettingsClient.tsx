"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Settings = Record<string, string>;
interface Props { initialSettings: Settings }

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { key: "General",       icon: "▦", desc: "Brand name, logo & maintenance" },
  { key: "Contact",       icon: "✉", desc: "Email, phone & social links" },
  { key: "Theme",         icon: "◑", desc: "Colours, fonts & shape" },
  { key: "Email",         icon: "⊕", desc: "SMTP & transactional email" },
  { key: "Checkout",      icon: "◇", desc: "Currency, shipping & rules" },
  { key: "SEO",           icon: "◎", desc: "Meta tags & tracking codes" },
  { key: "Notifications", icon: "◌", desc: "Admin alerts & email triggers" },
] as const;
type Tab = (typeof TABS)[number]["key"];

// ─── Preset theme collections ─────────────────────────────────────────────────

const PRESET_THEMES = [
  {
    name: "Maison d'Or",
    desc: "Warm gold on ivory — the original luxury palette",
    primaryColor: "#B8860B", bgColor: "#FFFFFF", textColor: "#1A1A1A",
    creamColor: "#FAF7F0", borderRadius: "0px",
  },
  {
    name: "Noir Absolu",
    desc: "Stark black with champagne accents",
    primaryColor: "#C5A028", bgColor: "#0E0E0E", textColor: "#EDE8DC",
    creamColor: "#1A1A18", borderRadius: "0px",
  },
  {
    name: "Rose Lumière",
    desc: "Blush rose with soft gold — feminine and modern",
    primaryColor: "#B5846A", bgColor: "#FFFFFF", textColor: "#2C1F1A",
    creamColor: "#FDF4F0", borderRadius: "4px",
  },
  {
    name: "Ivoire Classique",
    desc: "Deep espresso on warm cream — timeless editorial",
    primaryColor: "#8B6914", bgColor: "#F5F0E8", textColor: "#2A1F0E",
    creamColor: "#EDE5D5", borderRadius: "0px",
  },
] as const;

// ─── Color presets ────────────────────────────────────────────────────────────

const PALETTE = {
  "Warm Gold":   ["#B8860B","#C5A028","#D4AF37","#CFB53B","#A07820","#8B6914","#6B4F12","#3D2B0D"],
  "Ivory & Cream":["#FAF7F0","#F5F0E8","#EDE8DC","#E5DDD0","#DDD5C5","#D0C8B8","#C5BBA8","#B8AE9C"],
  "Neutral":     ["#FFFFFF","#F5F5F5","#E8E8E8","#D0D0D0","#A0A0A0","#686868","#404040","#1A1A1A"],
  "Blush & Rose":["#F2E0D8","#E8C8BA","#D4A090","#C08070","#B5846A","#9E6A54","#7A4F3E","#4A2E24"],
  "Jewel Tone":  ["#2C4A7C","#4A3A8A","#7C3A6A","#3A6A4A","#6A4A3A","#3A4A6A","#5A3A7C","#2A6A6A"],
};

// ─── Shared styles ─────────────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  width: "100%", padding: "0.625rem 0.875rem",
  border: "1px solid var(--color-gray-200)",
  background: "var(--color-white)", color: "var(--color-black)",
  fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem",
  outline: "none", boxSizing: "border-box", transition: "border-color 150ms",
};

const labelSt: React.CSSProperties = {
  display: "block", fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase",
  color: "var(--color-gray-600)", fontWeight: 600, marginBottom: "0.4rem",
};

const hintSt: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.5625rem", color: "var(--color-gray-400)",
  marginTop: "0.3rem", lineHeight: 1.5,
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function Field({ id, lab, hint, children }: { id?: string; lab: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      {id ? <label htmlFor={id} style={labelSt}>{lab}</label> : <p style={labelSt}>{lab}</p>}
      {children}
      {hint && <p style={hintSt}>{hint}</p>}
    </div>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>{children}</div>;
}

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--color-white)", border: "1px solid var(--color-gray-200)", padding: "1.75rem 2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ borderLeft: "3px solid var(--color-primary)", paddingLeft: "0.875rem" }}>
        <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.125rem", fontWeight: 400, color: "var(--color-black)", margin: 0 }}>{title}</h3>
        {desc && <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "var(--color-gray-600)", margin: "0.2rem 0 0", letterSpacing: "0.03em" }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ val, onToggle, lab, desc }: { val: boolean; onToggle: () => void; lab: string; desc?: string }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", cursor: "pointer" }}>
      <span
        onClick={onToggle}
        style={{
          display: "inline-flex", alignItems: "center", width: "40px", height: "22px",
          borderRadius: "11px", flexShrink: 0, marginTop: "1px",
          background: val ? "var(--color-primary)" : "var(--color-gray-200)",
          position: "relative", transition: "background 200ms", cursor: "pointer",
        }}>
        <span style={{
          position: "absolute", top: "3px", width: "16px", height: "16px", borderRadius: "50%",
          background: "white", transition: "left 200ms", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          left: val ? "21px" : "3px",
        }} />
      </span>
      <div>
        <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", fontWeight: 500, color: "var(--color-black)", margin: 0 }}>{lab}</p>
        {desc && <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "var(--color-gray-600)", margin: "0.15rem 0 0", lineHeight: 1.4 }}>{desc}</p>}
      </div>
    </label>
  );
}

// ─── Custom Color Picker ───────────────────────────────────────────────────────

function ColorPicker({ value, onChange, label: lab }: { value: string; onChange: (v: string) => void; label: string }) {
  const [open, setOpen]   = useState(false);
  const [hex, setHex]     = useState(value || "");
  const ref               = useRef<HTMLDivElement>(null);

  // Sync local hex when value changes externally
  useEffect(() => { setHex(value || ""); }, [value]);

  // Click outside to close
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  function applyHex(v: string) {
    setHex(v);
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v);
  }

  const displayColor = value || "#B8860B";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <p style={labelSt}>{lab}</p>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: "0.625rem",
          padding: "0.5rem 0.75rem", border: `1px solid ${open ? "var(--color-primary)" : "var(--color-gray-200)"}`,
          background: "var(--color-white)", cursor: "pointer", width: "100%",
          transition: "border-color 150ms",
        }}
      >
        <span style={{
          width: "24px", height: "24px", background: displayColor,
          border: "1px solid rgba(0,0,0,0.12)", flexShrink: 0, display: "block",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)",
        }} />
        <span style={{ fontFamily: "monospace", fontSize: "0.8125rem", color: "var(--color-black)", letterSpacing: "0.04em", flex: 1, textAlign: "left" }}>
          {displayColor.toUpperCase()}
        </span>
        <span style={{ fontSize: "0.4rem", color: "var(--color-gray-400)", transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms" }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 200,
          background: "var(--color-white)", border: "1px solid var(--color-gray-200)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)", padding: "1.25rem",
          minWidth: "280px", maxWidth: "320px",
        }}>

          {/* Palette groups */}
          {Object.entries(PALETTE).map(([group, colors]) => (
            <div key={group} style={{ marginBottom: "0.875rem" }}>
              <p style={{ ...labelSt, marginBottom: "0.375rem", color: "var(--color-gray-400)" }}>{group}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "3px" }}>
                {colors.map(c => (
                  <button
                    key={c} type="button" title={c}
                    onClick={() => { onChange(c); setHex(c); }}
                    style={{
                      width: "100%", aspectRatio: "1", background: c, cursor: "pointer", padding: 0,
                      border: value === c ? "2px solid var(--color-primary)" : "1px solid rgba(0,0,0,0.08)",
                      transition: "transform 100ms, border-color 100ms",
                      outline: "none",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.15)"; (e.currentTarget as HTMLButtonElement).style.zIndex = "1"; (e.currentTarget as HTMLButtonElement).style.position = "relative"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--color-gray-200)", paddingTop: "0.875rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="color" value={displayColor}
              onChange={e => { onChange(e.target.value); setHex(e.target.value); }}
              style={{ width: "36px", height: "36px", padding: "1px", border: "1px solid var(--color-gray-200)", cursor: "pointer", background: "none", flexShrink: 0 }}
            />
            <input
              type="text" value={hex} maxLength={7} placeholder="#B8860B"
              onChange={e => applyHex(e.target.value)}
              style={{ flex: 1, padding: "0.5rem 0.625rem", border: "1px solid var(--color-gray-200)", fontFamily: "monospace", fontSize: "0.8125rem", color: "var(--color-black)", background: "var(--color-white)", outline: "none" }}
            />
            <button
              type="button" onClick={() => setOpen(false)}
              style={{ padding: "0.5rem 1rem", background: "var(--color-primary)", border: "none", color: "white", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function SettingsClient({ initialSettings }: Props) {
  const [s, setS]             = useState<Settings>(initialSettings);
  const [tab, setTab]         = useState<Tab>("General");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [saveError, setSaveError] = useState("");
  const [dirty, setDirty]     = useState(false);

  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState("");
  const [testErr, setTestErr] = useState("");

  const f  = (key: string) => s[key] ?? "";
  const bv = (key: string) => s[key] === "true";

  const set = useCallback((key: string, val: string) => {
    setS(prev => ({ ...prev, [key]: val }));
    setDirty(true);
    setSaved(false);
  }, []);

  const toggle = (key: string) => {
    setS(prev => ({ ...prev, [key]: prev[key] === "true" ? "false" : "true" }));
    setDirty(true);
    setSaved(false);
  };

  async function save() {
    setSaving(true); setSaved(false); setSaveError(""); setDirty(false);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 4000); }
    else { setSaveError("Save failed — please try again."); setDirty(true); }
  }

  async function testEmail() {
    setTesting(true); setTestMsg(""); setTestErr("");
    const res = await fetch("/api/admin/settings/test-email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: f("smtpHost"), port: f("smtpPort"), secure: f("smtpSecure"), user: f("smtpUser"), pass: f("smtpPass"), fromName: f("fromName"), fromEmail: f("fromEmail") }),
    });
    const data = await res.json();
    setTesting(false);
    if (res.ok) setTestMsg(data.message ?? "Test email sent successfully!");
    else        setTestErr(data.error ?? "Connection failed.");
  }

  function applyPreset(preset: (typeof PRESET_THEMES)[number]) {
    setS(prev => ({ ...prev, ...preset }));
    setDirty(true);
    setSaved(false);
  }

  const inp = (key: string, type = "text", placeholder = "") => (
    <input
      id={key} type={type} value={f(key)} placeholder={placeholder}
      onChange={e => set(key, e.target.value)}
      onFocus={e => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
      onBlur={e => { e.currentTarget.style.borderColor = "var(--color-gray-200)"; }}
      style={inputBase}
    />
  );

  const sel = (key: string, options: { value: string; label: string }[]) => (
    <select
      id={key} value={f(key)} onChange={e => set(key, e.target.value)}
      onFocus={e => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
      onBlur={e => { e.currentTarget.style.borderColor = "var(--color-gray-200)"; }}
      style={inputBase}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  const ta = (key: string, rows: number, placeholder = "") => (
    <textarea
      id={key} value={f(key)} rows={rows} placeholder={placeholder}
      onChange={e => set(key, e.target.value)}
      onFocus={e => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
      onBlur={e => { e.currentTarget.style.borderColor = "var(--color-gray-200)"; }}
      style={{ ...inputBase, resize: "vertical", lineHeight: 1.6 }}
    />
  );

  return (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", position: "relative" }}>

      {/* ── Sidebar nav ── */}
      <nav style={{
        width: "200px", flexShrink: 0,
        background: "var(--color-white)", border: "1px solid var(--color-gray-200)",
        padding: "0.5rem",
        position: "sticky", top: "80px",
      }}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button
              key={t.key} type="button"
              onClick={() => setTab(t.key as Tab)}
              style={{
                display: "flex", alignItems: "center", gap: "0.625rem",
                width: "100%", padding: "0.75rem 0.875rem", border: "none",
                background: active ? "rgba(184,134,11,0.08)" : "transparent",
                borderLeft: `3px solid ${active ? "var(--color-primary)" : "transparent"}`,
                cursor: "pointer", textAlign: "left", transition: "background 150ms, border-color 150ms",
              }}
            >
              <span style={{ fontSize: "0.875rem", color: active ? "var(--color-primary)" : "var(--color-gray-400)", width: "18px", flexShrink: 0, textAlign: "center" }}>{t.icon}</span>
              <div>
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: active ? 700 : 500, color: active ? "var(--color-primary)" : "var(--color-black)", margin: 0 }}>
                  {t.key}
                </p>
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", color: "var(--color-gray-400)", margin: "0.1rem 0 0", lineHeight: 1.3, letterSpacing: "0.02em" }}>
                  {t.desc}
                </p>
              </div>
            </button>
          );
        })}

        {/* Save in sidebar on desktop */}
        <div style={{ borderTop: "1px solid var(--color-gray-200)", marginTop: "0.5rem", paddingTop: "0.75rem", padding: "0.75rem 0.5rem 0.5rem" }}>
          {saved && (
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", color: "#16A34A", letterSpacing: "0.08em", textAlign: "center", marginBottom: "0.5rem" }}>
              ✓ Saved
            </p>
          )}
          {saveError && (
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", color: "#EF4444", letterSpacing: "0.06em", textAlign: "center", marginBottom: "0.5rem", lineHeight: 1.4 }}>
              {saveError}
            </p>
          )}
          <button
            type="button" onClick={save} disabled={saving}
            style={{
              width: "100%", padding: "0.625rem 0.5rem",
              background: saving ? "rgba(184,134,11,0.4)" : dirty ? "var(--color-primary)" : "rgba(184,134,11,0.15)",
              border: "none", color: dirty || saving ? "white" : "var(--color-primary)",
              fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem",
              letterSpacing: "0.15em", textTransform: "uppercase", cursor: saving ? "not-allowed" : "pointer",
              fontWeight: 700, transition: "background 200ms, color 200ms",
            }}>
            {saving ? "Saving…" : "Save Settings"}
          </button>
          {dirty && !saving && (
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.4375rem", color: "var(--color-gray-400)", textAlign: "center", margin: "0.375rem 0 0", letterSpacing: "0.06em" }}>
              Unsaved changes
            </p>
          )}
        </div>
      </nav>

      {/* ── Content area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: 0 }}>

        {/* ── GENERAL ── */}
        {tab === "General" && (
          <>
            <Card title="Brand Identity" desc="Your site name and visual identity assets">
              <Row2>
                <Field id="siteName" lab="Site / Brand Name" hint="Appears in the browser tab, emails, and throughout the site.">
                  {inp("siteName", "text", "Mimi's Sweet Scent")}
                </Field>
                <Field id="copyrightText" lab="Copyright Text" hint='Use {year} for the current year.'>
                  {inp("copyrightText", "text", "© {year} Mimi's Sweet Scent")}
                </Field>
              </Row2>
              <Field id="tagline" lab="Tagline" hint="Short description used in the footer and meta tags.">
                {inp("tagline", "text", "Luxury perfumes and fine jewelry…")}
              </Field>
              <Row2>
                <Field id="logoUrl" lab="Logo URL" hint="Leave blank to display text logo. Recommend SVG or 2× PNG.">
                  {inp("logoUrl", "url", "https://…/logo.png")}
                </Field>
                <Field id="faviconUrl" lab="Favicon URL" hint="32×32 .ico or .png file.">
                  {inp("faviconUrl", "url", "https://…/favicon.ico")}
                </Field>
              </Row2>
            </Card>

            <Card title="Maintenance Mode" desc="Temporarily restrict access to the storefront">
              <Toggle
                val={bv("maintenanceMode")}
                onToggle={() => toggle("maintenanceMode")}
                lab="Enable maintenance mode"
                desc="All non-admin visitors will see a coming-soon page. Admin users can still access the store normally."
              />
              {bv("maintenanceMode") && (
                <div style={{ padding: "0.75rem 1rem", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <span style={{ color: "#EF4444", fontSize: "0.75rem" }}>⚠</span>
                  <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "#EF4444", margin: 0, letterSpacing: "0.03em" }}>
                    Maintenance mode is active — the storefront is hidden from customers.
                  </p>
                </div>
              )}
            </Card>
          </>
        )}

        {/* ── CONTACT ── */}
        {tab === "Contact" && (
          <>
            <Card title="Contact Details" desc="Displayed in the footer and contact sections">
              <Row2>
                <Field id="contactEmail" lab="Contact Email">
                  {inp("contactEmail", "email", "hello@mimissweetscent.com")}
                </Field>
                <Field id="contactPhone" lab="Phone Number">
                  {inp("contactPhone", "tel", "+233 XX XXX XXXX")}
                </Field>
              </Row2>
              <Row2>
                <Field id="whatsappNumber" lab="WhatsApp Number" hint="Include country code. Becomes a direct wa.me chat link.">
                  {inp("whatsappNumber", "tel", "+233XXXXXXXXX")}
                </Field>
                <Field id="contactAddress" lab="Address / Hours">
                  {inp("contactAddress", "text", "Accra, Ghana · Mon–Sat 9am–6pm WAT")}
                </Field>
              </Row2>
            </Card>

            <Card title="Social Media" desc="Links appear as labelled buttons in the footer">
              <Row2>
                <Field id="instagramUrl" lab="Instagram">
                  {inp("instagramUrl", "url", "https://instagram.com/…")}
                </Field>
                <Field id="facebookUrl" lab="Facebook">
                  {inp("facebookUrl", "url", "https://facebook.com/…")}
                </Field>
              </Row2>
              <Row2>
                <Field id="tiktokUrl" lab="TikTok">
                  {inp("tiktokUrl", "url", "https://tiktok.com/@…")}
                </Field>
                <Field id="twitterUrl" lab="X / Twitter">
                  {inp("twitterUrl", "url", "https://x.com/…")}
                </Field>
              </Row2>
              <Row2>
                <Field id="pinterestUrl" lab="Pinterest">
                  {inp("pinterestUrl", "url", "https://pinterest.com/…")}
                </Field>
                <div />
              </Row2>
            </Card>
          </>
        )}

        {/* ── THEME ── */}
        {tab === "Theme" && (
          <>
            {/* Preset themes */}
            <Card title="Preset Themes" desc="Apply a curated colour palette instantly — you can fine-tune after">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.875rem" }}>
                {PRESET_THEMES.map(pt => (
                  <button
                    key={pt.name} type="button"
                    onClick={() => applyPreset(pt)}
                    style={{
                      padding: "1rem", border: "1px solid var(--color-gray-200)",
                      background: pt.bgColor, cursor: "pointer", textAlign: "left",
                      transition: "border-color 150ms, box-shadow 150ms",
                      position: "relative", overflow: "hidden",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-primary)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-gray-200)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
                  >
                    {/* Color swatch row */}
                    <div style={{ display: "flex", gap: "4px", marginBottom: "0.75rem" }}>
                      {[pt.primaryColor, pt.creamColor, pt.textColor].map(c => (
                        <span key={c} style={{ width: "20px", height: "20px", background: c, border: "1px solid rgba(0,0,0,0.1)", display: "block" }} />
                      ))}
                    </div>
                    <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "0.9375rem", fontWeight: 400, color: pt.textColor, margin: "0 0 0.25rem", letterSpacing: "0.04em" }}>{pt.name}</p>
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", color: pt.textColor, margin: 0, opacity: 0.65, lineHeight: 1.4, letterSpacing: "0.03em" }}>{pt.desc}</p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Colour palette */}
            <Card title="Colour Palette" desc="Customise individual colours — changes apply site-wide on save">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
                <ColorPicker label="Primary / Accent" value={f("primaryColor")} onChange={v => set("primaryColor", v)} />
                <ColorPicker label="Page Background"  value={f("bgColor")}      onChange={v => set("bgColor", v)} />
                <ColorPicker label="Body Text"        value={f("textColor")}    onChange={v => set("textColor", v)} />
                <ColorPicker label="Cream / Off-White" value={f("creamColor")}  onChange={v => set("creamColor", v)} />
              </div>

              {/* Live palette preview */}
              <div>
                <p style={labelSt}>Live Preview</p>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                  {[
                    { key: "primaryColor", name: "Primary",    h: "64px" },
                    { key: "bgColor",      name: "Background", h: "48px" },
                    { key: "textColor",    name: "Text",       h: "48px" },
                    { key: "creamColor",   name: "Cream",      h: "48px" },
                  ].map(({ key, name, h }) => (
                    <div key={key} style={{ textAlign: "center" }}>
                      <div style={{
                        width: "56px", height: h, background: f(key) || "#ccc",
                        border: "1px solid var(--color-gray-200)",
                        borderRadius: f("borderRadius") || "0",
                        transition: "background 300ms",
                      }} />
                      <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.4375rem", color: "var(--color-gray-600)", margin: "0.375rem 0 0", letterSpacing: "0.08em", textTransform: "uppercase" }}>{name}</p>
                      <p style={{ fontFamily: "monospace", fontSize: "0.5625rem", color: "var(--color-gray-400)", margin: "0.1rem 0 0" }}>{(f(key) || "—").toUpperCase()}</p>
                    </div>
                  ))}

                  {/* Sample UI element */}
                  <div style={{ marginLeft: "auto", padding: "1rem", background: f("creamColor") || "#FAF7F0", border: "1px solid var(--color-gray-200)", minWidth: "140px" }}>
                    <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1rem", color: f("textColor") || "#1A1A1A", margin: "0 0 0.5rem" }}>Sample Card</p>
                    <div style={{ padding: "0.35rem 0.75rem", background: f("primaryColor") || "#B8860B", display: "inline-block" }}>
                      <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "white" }}>Add to Bag</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Typography */}
            <Card title="Typography" desc="Select fonts loaded from Google Fonts">
              <Row2>
                <Field id="headingFont" lab="Heading Font" hint="Used for h1–h4 display text.">
                  {sel("headingFont", [
                    { value: "Cormorant Garamond", label: "Cormorant Garamond (Default)" },
                    { value: "Playfair Display",   label: "Playfair Display" },
                    { value: "EB Garamond",        label: "EB Garamond" },
                    { value: "Libre Baskerville",  label: "Libre Baskerville" },
                    { value: "Lora",               label: "Lora" },
                    { value: "DM Serif Display",   label: "DM Serif Display" },
                    { value: "Marcellus",          label: "Marcellus" },
                  ])}
                </Field>
                <Field id="bodyFont" lab="Body / UI Font" hint="Used for paragraphs, labels, and UI text.">
                  {sel("bodyFont", [
                    { value: "Montserrat", label: "Montserrat (Default)" },
                    { value: "Inter",      label: "Inter" },
                    { value: "Poppins",    label: "Poppins" },
                    { value: "Nunito",     label: "Nunito" },
                    { value: "Jost",       label: "Jost" },
                    { value: "DM Sans",    label: "DM Sans" },
                  ])}
                </Field>
              </Row2>
            </Card>

            {/* Shape */}
            <Card title="Shape & Corners" desc="Controls the border radius of buttons, cards, and inputs">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem" }}>
                {[
                  { value: "0px",  label: "Sharp",   desc: "Luxury" },
                  { value: "2px",  label: "Subtle",  desc: "Almost sharp" },
                  { value: "4px",  label: "Soft",    desc: "Modern" },
                  { value: "8px",  label: "Rounded", desc: "Friendly" },
                  { value: "12px", label: "Pill",    desc: "Playful" },
                ].map(opt => (
                  <button
                    key={opt.value} type="button"
                    onClick={() => set("borderRadius", opt.value)}
                    style={{
                      padding: "0.875rem 0.5rem", border: `1px solid ${f("borderRadius") === opt.value ? "var(--color-primary)" : "var(--color-gray-200)"}`,
                      background: f("borderRadius") === opt.value ? "rgba(184,134,11,0.06)" : "var(--color-white)",
                      cursor: "pointer", transition: "border-color 150ms, background 150ms",
                    }}
                  >
                    <div style={{ width: "32px", height: "32px", background: f("primaryColor") || "var(--color-primary)", borderRadius: opt.value, margin: "0 auto 0.625rem" }} />
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", fontWeight: 600, color: f("borderRadius") === opt.value ? "var(--color-primary)" : "var(--color-black)", margin: 0, letterSpacing: "0.05em" }}>{opt.label}</p>
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", color: "var(--color-gray-400)", margin: "0.1rem 0 0", letterSpacing: "0.03em" }}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* ── EMAIL ── */}
        {tab === "Email" && (
          <>
            <Card title="SMTP Configuration" desc="Outgoing email server settings for order confirmations and alerts">
              <div style={{ padding: "0.75rem 1rem", background: "rgba(184,134,11,0.05)", border: "1px solid rgba(184,134,11,0.2)" }}>
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "var(--color-black)", margin: 0, lineHeight: 1.6 }}>
                  These settings override the <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 4px" }}>.env</code> SMTP variables.
                  For Gmail, use <strong>smtp.gmail.com</strong> on port 587 with an <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)" }}>App Password</a>.
                </p>
              </div>
              <Row2>
                <Field id="smtpHost" lab="SMTP Host">
                  {inp("smtpHost", "text", "smtp.gmail.com")}
                </Field>
                <Field id="smtpPort" lab="SMTP Port">
                  {sel("smtpPort", [
                    { value: "587", label: "587 — STARTTLS (recommended)" },
                    { value: "465", label: "465 — SSL/TLS" },
                    { value: "25",  label: "25 — Plain (not recommended)" },
                  ])}
                </Field>
              </Row2>
              <Row2>
                <Field id="smtpUser" lab="Username / Email">
                  {inp("smtpUser", "email", "you@gmail.com")}
                </Field>
                <Field id="smtpPass" lab="Password / App Password" hint="For Gmail: generate via Google Account → Security → App Passwords.">
                  {inp("smtpPass", "password", "••••••••••••••••")}
                </Field>
              </Row2>
              <Row2>
                <Field id="fromName" lab="Sender Display Name">
                  {inp("fromName", "text", "Mimi's Sweet Scent")}
                </Field>
                <Field id="fromEmail" lab="From Email Address" hint="If blank, the SMTP username is used.">
                  {inp("fromEmail", "email", "orders@mimissweetscent.com")}
                </Field>
              </Row2>
            </Card>

            <Card title="Test Connection" desc="Verify your SMTP settings by sending a real test email">
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <button
                  type="button" onClick={testEmail}
                  disabled={testing || !f("smtpHost") || !f("smtpUser") || !f("smtpPass")}
                  style={{
                    padding: "0.75rem 1.75rem", border: "1px solid var(--color-primary)",
                    background: testing ? "rgba(184,134,11,0.12)" : "var(--color-primary)",
                    color: testing ? "var(--color-primary)" : "white",
                    fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem",
                    letterSpacing: "0.12em", textTransform: "uppercase", cursor: testing ? "not-allowed" : "pointer",
                    opacity: (!f("smtpHost") || !f("smtpUser") || !f("smtpPass")) ? 0.4 : 1,
                    transition: "background 150ms",
                  }}>
                  {testing ? "Connecting…" : "Send Test Email →"}
                </button>
                {testMsg && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.875rem", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)" }}>
                    <span style={{ color: "#16A34A", fontSize: "0.875rem" }}>✓</span>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "#16A34A" }}>{testMsg}</span>
                  </div>
                )}
                {testErr && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.875rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <span style={{ color: "#EF4444", fontSize: "0.875rem" }}>✗</span>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "#EF4444" }}>{testErr}</span>
                  </div>
                )}
              </div>
              <p style={hintSt}>A test email will be sent to your admin account email address.</p>
            </Card>
          </>
        )}

        {/* ── CHECKOUT ── */}
        {tab === "Checkout" && (
          <>
            <Card title="Currency" desc="Currency displayed throughout the storefront and used for Paystack">
              <Row2>
                <Field id="currency" lab="Currency Code" hint="ISO 4217 — e.g. GHS, NGN, KES, USD, GBP.">
                  {inp("currency", "text", "GHS")}
                </Field>
                <Field id="currencySymbol" lab="Currency Symbol" hint="Displayed before prices, e.g. ₵, ₦, $, £.">
                  {inp("currencySymbol", "text", "₵")}
                </Field>
              </Row2>
            </Card>

            <Card title="Order Rules" desc="Thresholds and guest access control">
              <Row2>
                <Field id="freeShipping" lab="Free Shipping Threshold (pesewas)" hint="0 = disabled. E.g. 50000 = ₵500 free shipping.">
                  {inp("freeShipping", "number", "0")}
                </Field>
                <Field id="minOrder" lab="Minimum Order Value (pesewas)" hint="0 = no minimum. E.g. 10000 = ₵100.">
                  {inp("minOrder", "number", "0")}
                </Field>
              </Row2>
              <Toggle
                val={bv("enableGuest")}
                onToggle={() => toggle("enableGuest")}
                lab="Allow guest checkout"
                desc="Customers can place orders without creating an account. Recommended on — reduces friction and increases conversions."
              />
            </Card>
          </>
        )}

        {/* ── SEO ── */}
        {tab === "SEO" && (
          <>
            <Card title="Default Meta Tags" desc="Used on pages that don't define their own SEO fields">
              <Field id="defaultMetaTitle" lab="Default Page Title" hint="Recommended: 50–60 characters. Shown in browser tab and search results.">
                {inp("defaultMetaTitle", "text", "Mimi's Sweet Scent — Luxury Perfumes & Fine Jewelry")}
              </Field>
              <Field id="defaultMetaDesc" lab="Default Meta Description" hint={`${f("defaultMetaDesc").length}/160 characters — keep under 160 for Google.`}>
                {ta("defaultMetaDesc", 3, "Luxury perfumes and fine jewelry — crafted with artistry, worn with elegance.")}
              </Field>
              <Field id="defaultOgImage" lab="Default Open Graph Image" hint="Recommended 1200×630px. Used when sharing pages on WhatsApp, Facebook, Twitter.">
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    {inp("defaultOgImage", "url", "https://…/og-default.jpg")}
                  </div>
                  {f("defaultOgImage") && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f("defaultOgImage")} alt="OG preview" style={{ width: "64px", height: "34px", objectFit: "cover", border: "1px solid var(--color-gray-200)", flexShrink: 0 }} />
                  )}
                </div>
              </Field>
            </Card>

            <Card title="Analytics & Tracking" desc="Third-party tracking codes injected into every page">
              <Row2>
                <Field id="gaId" lab="Google Analytics ID" hint="Format: G-XXXXXXXXXX. Leave blank to disable.">
                  {inp("gaId", "text", "G-XXXXXXXXXX")}
                </Field>
                <Field id="fbPixelId" lab="Meta / Facebook Pixel ID" hint="Numbers only. Leave blank to disable.">
                  {inp("fbPixelId", "text", "1234567890")}
                </Field>
              </Row2>
            </Card>
          </>
        )}

        {/* ── NOTIFICATIONS ── */}
        {tab === "Notifications" && (
          <>
            <Card title="Admin Alert Email" desc="Who receives store notifications">
              <Field id="adminEmail" lab="Admin Notification Email" hint="Receives new order notifications and low-stock alerts. Defaults to the logged-in admin email.">
                {inp("adminEmail", "email", "admin@mimissweetscent.com")}
              </Field>
              <Field id="lowStockQty" lab="Low-Stock Alert Threshold" hint="An alert is sent when any variant's stock drops to or below this number.">
                {inp("lowStockQty", "number", "5")}
              </Field>
            </Card>

            <Card title="Email Triggers" desc="Control which events send automatic emails">
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <Toggle
                  val={bv("notifyOnOrder")}
                  onToggle={() => toggle("notifyOnOrder")}
                  lab="Order confirmation to customer"
                  desc="Sends a branded email to the customer after each successful Paystack payment."
                />
                <Toggle
                  val={bv("notifyOnLow")}
                  onToggle={() => toggle("notifyOnLow")}
                  lab="Low-stock alert to admin"
                  desc="Sends an email to the admin notification address when stock drops below the threshold above."
                />
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
