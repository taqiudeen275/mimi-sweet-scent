"use client";

import { useState } from "react";

type Settings = Record<string, string>;

interface Props { initialSettings: Settings }

const TABS = ["General", "Contact", "Theme", "Email", "Checkout", "SEO", "Notifications"] as const;
type Tab = (typeof TABS)[number];

const input: React.CSSProperties = {
  width: "100%", padding: "0.625rem 0.75rem",
  border: "1px solid var(--color-gray-200)",
  background: "var(--color-white)", color: "var(--color-black)",
  fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem",
  outline: "none", boxSizing: "border-box",
};

const label: React.CSSProperties = {
  display: "block", fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase",
  color: "var(--color-gray-600)", fontWeight: 600, marginBottom: "0.375rem",
};

const hint: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.5625rem", color: "var(--color-gray-400)",
  marginTop: "0.25rem", letterSpacing: "0.02em",
};

function Field({ id, lab, hint: h, children }: { id?: string; lab: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      {id ? <label htmlFor={id} style={label}>{lab}</label> : <p style={label}>{lab}</p>}
      {children}
      {h && <p style={hint}>{h}</p>}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>{children}</div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.25rem", fontWeight: 400, color: "var(--color-black)", margin: 0, paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-gray-200)" }}>{title}</h3>
      {children}
    </div>
  );
}

export function SettingsClient({ initialSettings }: Props) {
  const [s, setS] = useState<Settings>(initialSettings);
  const [tab, setTab]             = useState<Tab>("General");
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState("");

  // Email test state
  const [testing, setTesting]   = useState(false);
  const [testMsg, setTestMsg]   = useState("");
  const [testErr, setTestErr]   = useState("");

  function f(key: string) { return s[key] ?? ""; }
  function set(key: string, val: string) { setS(prev => ({ ...prev, [key]: val })); }
  function toggle(key: string) { setS(prev => ({ ...prev, [key]: prev[key] === "true" ? "false" : "true" })); }

  async function save() {
    setSaving(true); setSaved(false); setSaveError("");
    const res = await fetch("/api/admin/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    else        { setSaveError("Save failed — please try again."); }
  }

  async function testEmail() {
    setTesting(true); setTestMsg(""); setTestErr("");
    const res = await fetch("/api/admin/settings/test-email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: f("smtpHost"), port: f("smtpPort"), secure: f("smtpSecure"), user: f("smtpUser"), pass: f("smtpPass"), fromName: f("fromName"), fromEmail: f("fromEmail") }),
    });
    const data = await res.json();
    setTesting(false);
    if (res.ok) setTestMsg(data.message ?? "Test email sent!");
    else        setTestErr(data.error  ?? "Connection failed.");
  }

  const inp = (key: string, type = "text", placeholder = "") => (
    <input id={key} type={type} value={f(key)} placeholder={placeholder} onChange={e => set(key, e.target.value)} style={input} />
  );

  const colorInp = (key: string) => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <input type="color" value={f(key) || "#B8860B"} onChange={e => set(key, e.target.value)}
        style={{ width: "40px", height: "36px", padding: "2px", border: "1px solid var(--color-gray-200)", cursor: "pointer", background: "none" }} />
      <input type="text" value={f(key)} onChange={e => set(key, e.target.value)} placeholder="#000000"
        style={{ ...input, width: "120px", fontFamily: "monospace", fontSize: "0.75rem" }} />
    </div>
  );

  const Toggle = ({ k, lab }: { k: string; lab: string }) => (
    <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer" }}>
      <span style={{
        display: "inline-block", width: "36px", height: "20px", borderRadius: "10px",
        background: f(k) === "true" ? "var(--color-primary)" : "var(--color-gray-200)",
        position: "relative", transition: "background 200ms", flexShrink: 0,
      }}>
        <span style={{
          position: "absolute", top: "3px",
          left: f(k) === "true" ? "19px" : "3px",
          width: "14px", height: "14px", borderRadius: "50%",
          background: "white", transition: "left 200ms",
        }} />
      </span>
      <input type="checkbox" checked={f(k) === "true"} onChange={() => toggle(k)} style={{ display: "none" }} />
      <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "var(--color-black)" }}>{lab}</span>
    </label>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "0", borderBottom: "1px solid var(--color-gray-200)", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "0.625rem 1.25rem", border: "none",
            borderBottom: `2px solid ${tab === t ? "var(--color-primary)" : "transparent"}`,
            background: "none", cursor: "pointer",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase",
            color: tab === t ? "var(--color-primary)" : "var(--color-gray-600)",
            fontWeight: tab === t ? 600 : 400, whiteSpace: "nowrap",
            transition: "color 150ms",
          }}>{t}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: "var(--color-white)", border: "1px solid var(--color-gray-200)", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {tab === "General" && (
          <>
            <Section title="Brand Identity">
              <Row>
                <Field id="siteName" lab="Site / Brand Name" hint="Appears in the browser tab, emails, and throughout the site.">
                  {inp("siteName", "text", "Mimi's Sweet Scent")}
                </Field>
                <Field id="tagline" lab="Tagline">
                  {inp("tagline", "text", "Luxury perfumes and fine jewelry…")}
                </Field>
              </Row>
              <Row>
                <Field id="logoUrl" lab="Logo URL" hint="Full URL or path to your logo image. Leave blank to show text logo.">
                  {inp("logoUrl", "url", "https://…/logo.png")}
                </Field>
                <Field id="faviconUrl" lab="Favicon URL" hint="32×32 .ico or .png file.">
                  {inp("faviconUrl", "url", "https://…/favicon.ico")}
                </Field>
              </Row>
              <Field id="copyrightText" lab="Footer Copyright Text" hint='Use {year} for the current year.'>
                {inp("copyrightText", "text", "© {year} Mimi's Sweet Scent. All rights reserved.")}
              </Field>
            </Section>
            <Section title="Maintenance">
              <Toggle k="maintenanceMode" lab="Maintenance Mode — show a coming-soon page to all non-admin visitors" />
            </Section>
          </>
        )}

        {tab === "Contact" && (
          <>
            <Section title="Contact Details">
              <Row>
                <Field id="contactEmail" lab="Contact Email" hint="Shown in the footer and contact pages.">
                  {inp("contactEmail", "email", "hello@mimissweetscent.com")}
                </Field>
                <Field id="contactPhone" lab="Phone Number">
                  {inp("contactPhone", "tel", "+233 XX XXX XXXX")}
                </Field>
              </Row>
              <Row>
                <Field id="whatsappNumber" lab="WhatsApp Number" hint="Include country code. Used for WhatsApp chat link.">
                  {inp("whatsappNumber", "tel", "+233XXXXXXXXX")}
                </Field>
                <Field id="contactAddress" lab="Physical Address">
                  {inp("contactAddress", "text", "Accra, Ghana")}
                </Field>
              </Row>
            </Section>
            <Section title="Social Media Links">
              <Row>
                <Field id="instagramUrl" lab="Instagram URL">
                  {inp("instagramUrl", "url", "https://instagram.com/mimissweetscent")}
                </Field>
                <Field id="facebookUrl" lab="Facebook URL">
                  {inp("facebookUrl", "url", "https://facebook.com/…")}
                </Field>
              </Row>
              <Row>
                <Field id="tiktokUrl" lab="TikTok URL">
                  {inp("tiktokUrl", "url", "https://tiktok.com/@…")}
                </Field>
                <Field id="twitterUrl" lab="X / Twitter URL">
                  {inp("twitterUrl", "url", "https://x.com/…")}
                </Field>
              </Row>
              <Row>
                <Field id="pinterestUrl" lab="Pinterest URL">
                  {inp("pinterestUrl", "url", "https://pinterest.com/…")}
                </Field>
                <div />
              </Row>
            </Section>
          </>
        )}

        {tab === "Theme" && (
          <>
            <Section title="Colour Palette">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
                <Field id="primaryColor" lab="Primary / Gold" hint="Used for buttons, links, accents.">
                  {colorInp("primaryColor")}
                </Field>
                <Field id="bgColor" lab="Page Background">
                  {colorInp("bgColor")}
                </Field>
                <Field id="textColor" lab="Body Text Colour">
                  {colorInp("textColor")}
                </Field>
                <Field id="creamColor" lab="Cream / Off-White" hint="Used for card backgrounds, sections.">
                  {colorInp("creamColor")}
                </Field>
                <Field id="accentColor" lab="Accent Colour" hint="Secondary highlights.">
                  {colorInp("accentColor")}
                </Field>
              </div>

              {/* Live preview swatch strip */}
              <div>
                <p style={label}>Live Preview</p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {[
                    { key: "primaryColor", name: "Primary" },
                    { key: "bgColor",      name: "Background" },
                    { key: "textColor",    name: "Text" },
                    { key: "creamColor",   name: "Cream" },
                    { key: "accentColor",  name: "Accent" },
                  ].map(({ key, name }) => (
                    <div key={key} style={{ textAlign: "center" }}>
                      <div style={{ width: "56px", height: "56px", background: f(key) || "#ccc", border: "1px solid var(--color-gray-200)", borderRadius: f("borderRadius") || "0px" }} />
                      <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", color: "var(--color-gray-600)", margin: "0.25rem 0 0", letterSpacing: "0.05em" }}>{name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section title="Typography">
              <Row>
                <Field id="headingFont" lab="Heading Font" hint="Google Fonts name used for h1–h4.">
                  <select id="headingFont" value={f("headingFont")} onChange={e => set("headingFont", e.target.value)} style={input}>
                    <option>Cormorant Garamond</option>
                    <option>Playfair Display</option>
                    <option>EB Garamond</option>
                    <option>Libre Baskerville</option>
                    <option>Lora</option>
                    <option>DM Serif Display</option>
                  </select>
                </Field>
                <Field id="bodyFont" lab="Body / UI Font">
                  <select id="bodyFont" value={f("bodyFont")} onChange={e => set("bodyFont", e.target.value)} style={input}>
                    <option>Montserrat</option>
                    <option>Inter</option>
                    <option>Poppins</option>
                    <option>Nunito</option>
                    <option>Jost</option>
                  </select>
                </Field>
              </Row>
            </Section>

            <Section title="Shape">
              <Row>
                <Field id="borderRadius" lab="Border Radius" hint="0px = sharp edges (luxury). 4px = slightly rounded. 8px = modern rounded.">
                  <select id="borderRadius" value={f("borderRadius")} onChange={e => set("borderRadius", e.target.value)} style={input}>
                    <option value="0px">0px — Sharp (Luxury)</option>
                    <option value="2px">2px — Very Subtle</option>
                    <option value="4px">4px — Slightly Rounded</option>
                    <option value="8px">8px — Modern Rounded</option>
                    <option value="12px">12px — Soft</option>
                  </select>
                </Field>
                <div />
              </Row>
            </Section>
          </>
        )}

        {tab === "Email" && (
          <>
            <Section title="SMTP Configuration">
              <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "var(--color-gray-600)", margin: 0, lineHeight: 1.6 }}>
                Configure your outgoing email server. These settings override the environment variables set at deploy time.
                For Gmail, use <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 4px", borderRadius: "2px" }}>smtp.gmail.com</code> port 587 with an App Password.
              </p>
              <Row>
                <Field id="smtpHost" lab="SMTP Host">
                  {inp("smtpHost", "text", "smtp.gmail.com")}
                </Field>
                <Field id="smtpPort" lab="SMTP Port">
                  <select id="smtpPort" value={f("smtpPort")} onChange={e => set("smtpPort", e.target.value)} style={input}>
                    <option value="587">587 (STARTTLS — recommended)</option>
                    <option value="465">465 (SSL/TLS)</option>
                    <option value="25">25 (plain, not recommended)</option>
                  </select>
                </Field>
              </Row>
              <Row>
                <Field id="smtpUser" lab="SMTP Username / Email">
                  {inp("smtpUser", "email", "you@gmail.com")}
                </Field>
                <Field id="smtpPass" lab="SMTP Password / App Password" hint="For Gmail: generate an App Password in your Google Account security settings.">
                  {inp("smtpPass", "password", "••••••••••••••••")}
                </Field>
              </Row>
              <Row>
                <Field id="fromName" lab="Sender Display Name">
                  {inp("fromName", "text", "Mimi's Sweet Scent")}
                </Field>
                <Field id="fromEmail" lab="From Email Address" hint="If blank, SMTP username is used.">
                  {inp("fromEmail", "email", "orders@mimissweetscent.com")}
                </Field>
              </Row>

              {/* Test button */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <button
                  onClick={testEmail}
                  disabled={testing || !f("smtpHost") || !f("smtpUser") || !f("smtpPass")}
                  style={{
                    padding: "0.625rem 1.5rem", border: "1px solid var(--color-primary)",
                    background: testing ? "rgba(184,134,11,0.1)" : "var(--color-primary)",
                    color: testing ? "var(--color-primary)" : "white",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.5625rem", letterSpacing: "0.12em", textTransform: "uppercase",
                    cursor: testing ? "not-allowed" : "pointer", opacity: (!f("smtpHost") || !f("smtpUser") || !f("smtpPass")) ? 0.4 : 1,
                  }}>
                  {testing ? "Testing…" : "Send Test Email"}
                </button>
                {testMsg && <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "#16A34A" }}>✓ {testMsg}</span>}
                {testErr && <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "#EF4444" }}>✗ {testErr}</span>}
              </div>
            </Section>
          </>
        )}

        {tab === "Checkout" && (
          <>
            <Section title="Currency">
              <Row>
                <Field id="currency" lab="Currency Code" hint="ISO 4217 code, e.g. GHS, NGN, KES, USD.">
                  {inp("currency", "text", "GHS")}
                </Field>
                <Field id="currencySymbol" lab="Currency Symbol" hint="Displayed before prices.">
                  {inp("currencySymbol", "text", "₵")}
                </Field>
              </Row>
            </Section>
            <Section title="Order Rules">
              <Row>
                <Field id="freeShipping" lab="Free Shipping Threshold (in pesewas)" hint="Set to 0 to disable. E.g. 50000 = ₵500.">
                  {inp("freeShipping", "number", "0")}
                </Field>
                <Field id="minOrder" lab="Minimum Order Value (in pesewas)" hint="Set to 0 for no minimum.">
                  {inp("minOrder", "number", "0")}
                </Field>
              </Row>
              <Toggle k="enableGuest" lab="Allow guest checkout — customers can place orders without creating an account" />
            </Section>
          </>
        )}

        {tab === "SEO" && (
          <>
            <Section title="Default Meta Tags">
              <Field id="defaultMetaTitle" lab="Default Page Title" hint="Used on pages without a specific title.">
                {inp("defaultMetaTitle", "text", "Mimi's Sweet Scent — Luxury Perfumes & Fine Jewelry")}
              </Field>
              <Field id="defaultMetaDesc" lab="Default Meta Description" hint="Shown in search engine results. Keep under 160 characters.">
                <textarea
                  id="defaultMetaDesc"
                  value={f("defaultMetaDesc")} onChange={e => set("defaultMetaDesc", e.target.value)}
                  rows={3}
                  style={{ ...input, resize: "vertical", lineHeight: 1.5 }}
                  placeholder="Luxury perfumes and fine jewelry — crafted with artistry, worn with elegance."
                />
              </Field>
              <Field id="defaultOgImage" lab="Default Open Graph Image URL" hint="Recommended: 1200×630px. Used when sharing pages on social media.">
                {inp("defaultOgImage", "url", "https://…/og-default.jpg")}
              </Field>
            </Section>
            <Section title="Analytics & Tracking">
              <Row>
                <Field id="gaId" lab="Google Analytics Measurement ID" hint="Format: G-XXXXXXXXXX">
                  {inp("gaId", "text", "G-XXXXXXXXXX")}
                </Field>
                <Field id="fbPixelId" lab="Facebook Pixel ID">
                  {inp("fbPixelId", "text", "XXXXXXXXXXXXXXXXXX")}
                </Field>
              </Row>
            </Section>
          </>
        )}

        {tab === "Notifications" && (
          <>
            <Section title="Admin Alerts">
              <Field id="adminEmail" lab="Admin Notification Email" hint="Receives new order alerts and low-stock warnings. Defaults to the admin account email.">
                {inp("adminEmail", "email", "admin@mimissweetscent.com")}
              </Field>
              <Field id="lowStockQty" lab="Low Stock Threshold" hint="Alert when a variant's stock falls to or below this number.">
                {inp("lowStockQty", "number", "5")}
              </Field>
            </Section>
            <Section title="Email Notifications">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <Toggle k="notifyOnOrder" lab="Send order confirmation email to customer on purchase" />
                <Toggle k="notifyOnLow"  lab="Send low-stock alert email to admin" />
              </div>
            </Section>
          </>
        )}
      </div>

      {/* Save bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "flex-end", padding: "1rem 0" }}>
        {saveError && <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "#EF4444" }}>{saveError}</span>}
        {saved && <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "#16A34A" }}>✓ Settings saved</span>}
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: "0.75rem 2rem", background: saving ? "rgba(184,134,11,0.4)" : "var(--color-primary)",
            border: "none", color: "white",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.5625rem", letterSpacing: "0.15em", textTransform: "uppercase",
            cursor: saving ? "not-allowed" : "pointer", fontWeight: 600,
          }}>
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
