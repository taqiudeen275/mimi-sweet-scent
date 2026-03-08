"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle: string | null;
  metaDesc: string | null;
  updatedAt: Date | string;
}

const CORE_SLUGS = ["about", "services", "privacy-policy", "terms"];

// ─── Markdown renderer ────────────────────────────────────────────────────────

function renderMarkdown(md: string): string {
  const escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  let html = escaped
    .replace(/^### (.+)$/gm, '<h3 style="font-family:var(--font-cormorant),Georgia,serif;font-size:1.25rem;font-weight:500;margin:1.5rem 0 0.5rem">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-family:var(--font-cormorant),Georgia,serif;font-size:1.625rem;font-weight:400;margin:2rem 0 0.75rem">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-family:var(--font-cormorant),Georgia,serif;font-size:2rem;font-weight:300;margin:0 0 1rem">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid var(--color-primary);padding-left:1rem;margin:1rem 0;color:#666;font-style:italic">$1</blockquote>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e5e7eb;margin:2rem 0">')
    .replace(/^- (.+)$/gm, '<li style="margin:0.25rem 0">$1</li>')
    .replace(/^[0-9]+\. (.+)$/gm, '<li style="margin:0.25rem 0">$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:var(--color-primary);text-decoration:underline" target="_blank">$1</a>')
    .replace(/\n\n/g, '</p><p style="margin:0 0 1rem;line-height:1.75">')
    .replace(/\n/g, "<br/>");

  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>\s*)+/g, (match) =>
    `<ul style="margin:1rem 0;padding-left:1.5rem;list-style:disc">${match}</ul>`
  );

  return `<p style="margin:0 0 1rem;line-height:1.75">${html}</p>`;
}

// ─── Toolbar config ───────────────────────────────────────────────────────────

type ToolbarAction = {
  icon: string;
  label: string;
  prefix: string;
  suffix: string;
  block?: boolean;
  placeholder?: string;
};

const TOOLBAR: ToolbarAction[] = [
  { icon: "B", label: "Bold", prefix: "**", suffix: "**", placeholder: "bold text" },
  { icon: "I", label: "Italic", prefix: "*", suffix: "*", placeholder: "italic text" },
  { icon: "H1", label: "Heading 1", prefix: "# ", suffix: "", block: true, placeholder: "Heading" },
  { icon: "H2", label: "Heading 2", prefix: "## ", suffix: "", block: true, placeholder: "Heading" },
  { icon: "H3", label: "Heading 3", prefix: "### ", suffix: "", block: true, placeholder: "Heading" },
  { icon: "❝", label: "Quote / Callout", prefix: "> ", suffix: "", block: true, placeholder: "Quote text" },
  { icon: "•", label: "Bullet list", prefix: "- ", suffix: "", block: true, placeholder: "List item" },
  { icon: "—", label: "Divider line", prefix: "\n---\n", suffix: "", block: true, placeholder: "" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function PageEditor({ page, isNew }: { page: PageData | null; isNew: boolean }) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [content, setContent] = useState(page?.content ?? "");
  const [metaTitle, setMetaTitle] = useState(page?.metaTitle ?? "");
  const [metaDesc, setMetaDesc] = useState(page?.metaDesc ?? "");
  const [viewMode, setViewMode] = useState<"write" | "split" | "preview">("split");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"content" | "seo">("content");
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const currentSlug = isNew ? slug : (page?.slug ?? "");
  const isCore = CORE_SLUGS.includes(currentSlug);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  // ── Toolbar format ──
  const applyFormat = useCallback((action: ToolbarAction) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end);
    const text = selected || action.placeholder || "";
    let newContent: string;
    let newStart: number;
    let newEnd: number;

    if (action.block) {
      const before = content.slice(0, start);
      const after = content.slice(end);
      const prefix = before.length > 0 && !before.endsWith("\n") ? "\n" + action.prefix : action.prefix;
      newContent = before + prefix + text + action.suffix + after;
      newStart = start + prefix.length;
      newEnd = newStart + text.length;
    } else {
      const before = content.slice(0, start);
      const after = content.slice(end);
      newContent = before + action.prefix + text + action.suffix + after;
      newStart = start + action.prefix.length;
      newEnd = newStart + text.length;
    }

    setContent(newContent);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newStart, newEnd);
    });
  }, [content]);

  // ── Save ──
  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      if (isNew) {
        if (!slug.trim()) { setError("Slug is required"); setSaving(false); return; }
        if (!title.trim()) { setError("Title is required"); setSaving(false); return; }
        const res = await fetch("/api/admin/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"), title: title.trim(), content, metaTitle: metaTitle || null, metaDesc: metaDesc || null }),
        });
        const data = await res.json() as { slug?: string; error?: string };
        if (!res.ok) { setError(data.error ?? "Failed to create page"); return; }
        router.push(`/admin/content/${data.slug}`);
        return;
      }
      const res = await fetch(`/api/admin/pages/${currentSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content, metaTitle: metaTitle || null, metaDesc: metaDesc || null }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to save"); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/pages/${currentSlug}`, { method: "DELETE" });
      if (res.ok) { router.push("/admin/content"); }
      else { const d = await res.json() as { error?: string }; setError(d.error ?? "Failed to delete"); setConfirmDelete(false); }
    } finally { setDeleting(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, height: "calc(100vh - 64px)", overflow: "hidden" }}>

      {/* ── Top bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: "56px", flexShrink: 0,
        background: "var(--color-white)", borderBottom: "1px solid var(--color-gray-200)", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", minWidth: 0, flex: 1 }}>
          <a href="/admin/content" style={{
            fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem",
            letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-gray-600)", textDecoration: "none", flexShrink: 0,
          }}>← Pages</a>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page title…"
            style={{
              border: "none", outline: "none", background: "transparent",
              fontFamily: "var(--font-cormorant),Georgia,serif", fontSize: "1.375rem",
              fontWeight: 400, color: "var(--color-black)", minWidth: 0, flex: 1,
            }}
          />
          <span style={{
            background: saved ? "#DCFCE7" : "var(--color-cream)",
            color: saved ? "#166534" : "var(--color-gray-600)",
            fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5rem",
            letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.25rem 0.625rem",
            flexShrink: 0, transition: "all 300ms",
          }}>
            {saved ? "✓ Saved" : isNew ? "New page" : "Editing"}
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", background: "#F3F4F6", padding: "2px", gap: "2px" }}>
            {(["write", "split", "preview"] as const).map((m) => (
              <button key={m} onClick={() => setViewMode(m)} style={{
                padding: "0.3rem 0.625rem", background: viewMode === m ? "var(--color-white)" : "transparent",
                border: "none", cursor: "pointer", fontFamily: "var(--font-montserrat),sans-serif",
                fontSize: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase",
                color: viewMode === m ? "var(--color-black)" : "var(--color-gray-600)",
                fontWeight: viewMode === m ? 600 : 400,
                boxShadow: viewMode === m ? "0 1px 2px rgba(0,0,0,0.1)" : "none", transition: "all 150ms",
              }}>
                {m === "split" ? "⧉ Split" : m === "write" ? "✎ Write" : "◉ Preview"}
              </button>
            ))}
          </div>
          {!isNew && (
            <a href={`/${currentSlug}`} target="_blank" rel="noreferrer" style={{
              fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem",
              letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-primary)",
              textDecoration: "none", border: "1px solid var(--color-primary)", padding: "0.4rem 0.75rem",
            }}>View ↗</a>
          )}
          <button onClick={handleSave} disabled={saving} style={{
            background: saving ? "#9CA3AF" : "var(--color-black)", color: "var(--color-white)",
            border: "none", padding: "0.5rem 1.25rem", fontFamily: "var(--font-montserrat),sans-serif",
            fontSize: "0.5625rem", letterSpacing: "0.12em", textTransform: "uppercase",
            cursor: saving ? "not-allowed" : "pointer", fontWeight: 600,
          }}>
            {saving ? "Saving…" : isNew ? "Publish" : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "0.625rem 2rem", background: "#FEF2F2", flexShrink: 0,
          fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.75rem",
          color: "#B91C1C", borderBottom: "1px solid #FECACA",
        }}>{error}</div>
      )}

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

        {/* Editor pane */}
        {viewMode !== "preview" && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, borderRight: "1px solid var(--color-gray-200)", overflow: "hidden" }}>

            {/* Toolbar */}
            <div style={{
              display: "flex", alignItems: "center", padding: "0 0.75rem", height: "44px",
              flexShrink: 0, background: "#FAFAFA", borderBottom: "1px solid var(--color-gray-200)", overflowX: "auto",
            }}>
              {TOOLBAR.map((action, i) => (
                <div key={action.label} style={{ position: "relative" }}>
                  <button
                    onMouseEnter={() => setHoveredTool(action.label)}
                    onMouseLeave={() => setHoveredTool(null)}
                    onMouseDown={(e) => { e.preventDefault(); applyFormat(action); }}
                    title={action.label}
                    style={{
                      width: action.icon.length > 2 ? "38px" : "32px", height: "32px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "transparent", border: "none", cursor: "pointer",
                      fontFamily: action.icon === "B" || action.icon === "I" ? "Georgia,serif" : "var(--font-montserrat),sans-serif",
                      fontWeight: action.icon === "B" ? 700 : 400, fontStyle: action.icon === "I" ? "italic" : "normal",
                      fontSize: ["❝", "•", "—"].includes(action.icon) ? "1rem" : "0.6875rem",
                      color: "var(--color-gray-600)", borderRadius: "3px",
                      marginRight: i === 1 || i === 4 ? "6px" : 0,
                      transition: "background 100ms",
                    }}
                    onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#E5E7EB"; }}
                    onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    {action.icon}
                  </button>
                  {hoveredTool === action.label && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 4px)", left: "50%", transform: "translateX(-50%)",
                      background: "var(--color-black)", color: "var(--color-white)",
                      padding: "0.2rem 0.5rem", whiteSpace: "nowrap",
                      fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5rem",
                      letterSpacing: "0.05em", pointerEvents: "none", zIndex: 100,
                    }}>{action.label}</div>
                  )}
                </div>
              ))}
              <div style={{ width: "1px", height: "20px", background: "var(--color-gray-200)", margin: "0 8px" }} />
              <span style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5rem", color: "var(--color-gray-600)", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                {wordCount} words · {readTime} min read
              </span>
              <div style={{ flex: 1 }} />
              <span style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5rem", color: "#9CA3AF", letterSpacing: "0.05em", padding: "0 0.5rem", whiteSpace: "nowrap" }}>
                Select text, then click a button to format it
              </span>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`# ${title || "Page Title"}\n\nStart writing here…\n\nTip: Select any word above, then click the B button in the toolbar to make it bold, or H2 for a section heading.`}
              spellCheck
              style={{
                flex: 1, width: "100%", resize: "none", padding: "2rem",
                fontFamily: "'Courier New','Menlo',monospace", fontSize: "0.9rem",
                lineHeight: 1.8, color: "#1E293B", background: "var(--color-white)",
                border: "none", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {/* Preview pane */}
        {viewMode !== "write" && (
          <div style={{
            flex: 1, overflow: "auto", padding: "2.5rem 3rem",
            background: viewMode === "preview" ? "var(--color-white)" : "#FAFAFA", minWidth: 0,
          }}>
            <div style={{ maxWidth: "640px", margin: "0 auto" }}>
              {viewMode === "split" && (
                <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "1.5rem" }}>
                  Live Preview
                </p>
              )}
              {title && (
                <h1 style={{ fontFamily: "var(--font-cormorant),Georgia,serif", fontSize: "2.5rem", fontWeight: 300, color: "var(--color-black)", marginBottom: "0.5rem", lineHeight: 1.1 }}>
                  {title}
                </h1>
              )}
              {!isNew && page && (
                <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-gray-600)", marginBottom: "2.5rem" }}>
                  Last updated {new Date(page.updatedAt).toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
              <div
                style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.9375rem", lineHeight: 1.75, color: "var(--color-black)" }}
                dangerouslySetInnerHTML={{ __html: content ? renderMarkdown(content) : "<p style='color:#9CA3AF;font-style:italic'>Nothing to preview yet…</p>" }}
              />
            </div>
          </div>
        )}

        {/* Right sidebar */}
        <div style={{
          width: "272px", flexShrink: 0, borderLeft: "1px solid var(--color-gray-200)",
          background: "var(--color-white)", display: "flex", flexDirection: "column", overflow: "auto",
        }}>
          <div style={{ display: "flex", borderBottom: "1px solid var(--color-gray-200)" }}>
            {(["content", "seo"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveSection(tab)} style={{
                flex: 1, padding: "0.75rem", background: activeSection === tab ? "var(--color-white)" : "#FAFAFA",
                border: "none", borderBottom: activeSection === tab ? "2px solid var(--color-primary)" : "2px solid transparent",
                cursor: "pointer", fontFamily: "var(--font-montserrat),sans-serif",
                fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase",
                color: activeSection === tab ? "var(--color-black)" : "var(--color-gray-600)",
                fontWeight: activeSection === tab ? 600 : 400, transition: "all 150ms",
              }}>
                {tab === "content" ? "📄 Page" : "🔍 SEO"}
              </button>
            ))}
          </div>

          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {activeSection === "content" ? (
              <>
                {/* Slug */}
                <div>
                  <SideLabel>URL Slug</SideLabel>
                  <SideHelp>The URL where this page lives on your site</SideHelp>
                  {isNew ? (
                    <input type="text" value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                      placeholder="e.g. about" style={sideInputStyle} />
                  ) : (
                    <div style={{ ...sideInputStyle, background: "#F9FAFB", color: "var(--color-gray-600)", cursor: "default" }}>
                      /{currentSlug}
                    </div>
                  )}
                </div>

                {/* Formatting cheatsheet */}
                <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", padding: "0.875rem" }}>
                  <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, color: "#92400E", marginBottom: "0.625rem" }}>
                    ✦ Formatting guide
                  </p>
                  {[
                    ["# Heading 1", "Big title"],
                    ["## Heading 2", "Section heading"],
                    ["**text**", "Bold"],
                    ["*text*", "Italic"],
                    ["- item", "Bullet list"],
                    ["> quote", "Callout box"],
                    ["---", "Divider line"],
                  ].map(([code, desc]) => (
                    <div key={code} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                      <code style={{ fontFamily: "monospace", fontSize: "0.625rem", color: "#92400E", background: "#FEF3C7", padding: "1px 4px" }}>{code}</code>
                      <span style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem", color: "#6B7280" }}>{desc}</span>
                    </div>
                  ))}
                  <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem", color: "#92400E", marginTop: "0.5rem", lineHeight: 1.5 }}>
                    Tip: You can also select text in the editor and click toolbar buttons above.
                  </p>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {[
                    ["Words", wordCount.toLocaleString()],
                    ["Read time", `${readTime} min`],
                    ["Characters", content.length.toLocaleString()],
                    ["Lines", content.split("\n").length.toString()],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: "#F9FAFB", padding: "0.625rem", textAlign: "center" }}>
                      <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-black)", margin: "0 0 2px" }}>{value}</p>
                      <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-gray-600)", margin: 0 }}>{label}</p>
                    </div>
                  ))}
                </div>

                {!isNew && page && (
                  <div>
                    <SideLabel>Last Updated</SideLabel>
                    <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.75rem", color: "var(--color-gray-600)", margin: 0 }}>
                      {new Date(page.updatedAt).toLocaleString("en-GH")}
                    </p>
                  </div>
                )}

                {!isNew && !isCore && (
                  <div style={{ paddingTop: "1rem", borderTop: "1px solid #FEE2E2" }}>
                    <SideLabel>Danger Zone</SideLabel>
                    {confirmDelete ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.6875rem", color: "#7F1D1D" }}>This cannot be undone.</p>
                        <button onClick={handleDelete} disabled={deleting} style={{ background: "#EF4444", color: "white", border: "none", padding: "0.5rem", cursor: "pointer", fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
                          {deleting ? "Deleting…" : "Yes, Delete Page"}
                        </button>
                        <button onClick={() => setConfirmDelete(false)} style={{ background: "none", border: "1px solid var(--color-gray-200)", padding: "0.5rem", cursor: "pointer", fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-gray-600)" }}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(true)} style={{ background: "none", border: "1px solid #FECACA", padding: "0.5rem 0.75rem", cursor: "pointer", fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#EF4444", width: "100%" }}>
                        Delete Page
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.6875rem", color: "var(--color-gray-600)", lineHeight: 1.6 }}>
                  These help Google understand your page. Leave blank to use the page title automatically.
                </p>

                <div>
                  <SideLabel>Browser & Search Title</SideLabel>
                  <SideHelp>What appears in the browser tab and search results</SideHelp>
                  <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title || "Leave blank to use page title"} style={sideInputStyle} maxLength={70} />
                  <ProgressBar value={metaTitle.length} max={70} warn={60} />
                  <span style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5rem", color: metaTitle.length > 60 ? "#F59E0B" : "var(--color-gray-600)" }}>
                    {metaTitle.length}/70 characters
                  </span>
                </div>

                <div>
                  <SideLabel>Search Description</SideLabel>
                  <SideHelp>The snippet shown below your link in Google</SideHelp>
                  <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)}
                    placeholder="A short, compelling description…" maxLength={160} rows={4}
                    style={{ ...sideInputStyle, resize: "vertical", lineHeight: 1.5 }} />
                  <ProgressBar value={metaDesc.length} max={160} warn={140} />
                  <span style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5rem", color: metaDesc.length > 140 ? "#F59E0B" : "var(--color-gray-600)" }}>
                    {metaDesc.length}/160 characters
                  </span>
                </div>

                {/* SERP preview */}
                <div>
                  <SideLabel>Google Preview</SideLabel>
                  <div style={{ border: "1px solid var(--color-gray-200)", padding: "0.875rem", background: "var(--color-white)" }}>
                    <p style={{ fontFamily: "Arial,sans-serif", fontSize: "0.8rem", color: "#1558D6", textDecoration: "underline", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {metaTitle || title || "Page Title"}
                    </p>
                    <p style={{ fontFamily: "Arial,sans-serif", fontSize: "0.5625rem", color: "#006621", margin: "0 0 3px" }}>
                      mimissweetscent.com/{currentSlug || "page"}
                    </p>
                    <p style={{ fontFamily: "Arial,sans-serif", fontSize: "0.6875rem", color: "#545454", margin: 0, lineHeight: 1.4 }}>
                      {metaDesc || "No description yet. Add one above to control what appears here in Google."}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function SideLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-black)", fontWeight: 600, marginBottom: "0.25rem" }}>
      {children}
    </label>
  );
}

function SideHelp({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem", color: "var(--color-gray-600)", marginBottom: "0.5rem", lineHeight: 1.5 }}>
      {children}
    </p>
  );
}

function ProgressBar({ value, max, warn }: { value: number; max: number; warn: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = value > warn ? (value > max ? "#EF4444" : "#F59E0B") : "var(--color-primary)";
  return (
    <div style={{ height: "3px", background: "#E5E7EB", marginBottom: "3px", borderRadius: "2px" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "2px", transition: "width 200ms, background 200ms" }} />
    </div>
  );
}

const sideInputStyle: React.CSSProperties = {
  width: "100%", padding: "0.5rem 0.625rem",
  fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.8125rem",
  color: "var(--color-black)", background: "var(--color-white)",
  border: "1px solid var(--color-gray-200)", outline: "none", boxSizing: "border-box",
};
