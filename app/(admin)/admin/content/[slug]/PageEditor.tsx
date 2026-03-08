"use client";

import { useState } from "react";
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

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.5625rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--color-gray-600)",
  fontWeight: 600,
  display: "block",
  marginBottom: "0.375rem",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "0.625rem 0.75rem",
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.8125rem",
  color: "var(--color-black)",
  background: "var(--color-white)",
  border: "1px solid var(--color-gray-200)",
  outline: "none",
  boxSizing: "border-box",
};

/**
 * Very minimal markdown → HTML for admin preview only.
 * All HTML is escaped first so this is safe for admin-authored content.
 */
function renderMarkdownPreview(md: string): string {
  // Escape HTML entities first to prevent injection
  const escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const html = escaped
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />");

  return `<p>${html}</p>`;
}

export function PageEditor({
  page,
  isNew,
}: {
  page: PageData | null;
  isNew: boolean;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [content, setContent] = useState(page?.content ?? "");
  const [metaTitle, setMetaTitle] = useState(page?.metaTitle ?? "");
  const [metaDesc, setMetaDesc] = useState(page?.metaDesc ?? "");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSlug = isNew ? slug : (page?.slug ?? "");
  const isCore = CORE_SLUGS.includes(currentSlug);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      let res: Response;

      if (isNew) {
        if (!slug.trim()) {
          setError("Slug is required");
          setSaving(false);
          return;
        }
        if (!title.trim()) {
          setError("Title is required");
          setSaving(false);
          return;
        }
        res = await fetch("/api/admin/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
            title: title.trim(),
            content,
            metaTitle: metaTitle || null,
            metaDesc: metaDesc || null,
          }),
        });
        const data = (await res.json()) as { slug?: string; error?: string };
        if (!res.ok) {
          setError(data.error ?? "Failed to create page");
          return;
        }
        router.push(`/admin/content/${data.slug}`);
        return;
      }

      res = await fetch(`/api/admin/pages/${currentSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content,
          metaTitle: metaTitle || null,
          metaDesc: metaDesc || null,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to save");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/pages/${currentSlug}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/content");
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Failed to delete");
        setConfirmDelete(false);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "1200px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <a
            href="/admin/content"
            style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.625rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-gray-600)",
              textDecoration: "none",
            }}
          >
            ← Pages
          </a>
          <h1 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.75rem",
            fontWeight: 400,
            color: "var(--color-black)",
            margin: 0,
          }}>
            {isNew ? "New Page" : title || page?.slug}
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          {!isNew && (
            <a
              href={`/${currentSlug}`}
              target="_blank"
              rel="noreferrer"
              style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.5625rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-primary)",
                textDecoration: "none",
                border: "1px solid var(--color-primary)",
                padding: "0.5rem 0.875rem",
              }}
            >
              View on Site ↗
            </a>
          )}

          {!isNew && !isCore && (
            confirmDelete ? (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.625rem",
                  color: "var(--color-gray-600)",
                }}>
                  Are you sure?
                </span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    background: "#EF4444",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 0.875rem",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.5625rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: deleting ? "not-allowed" : "pointer",
                    fontWeight: 600,
                  }}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    background: "none",
                    border: "1px solid var(--color-gray-200)",
                    padding: "0.5rem 0.875rem",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.5625rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    color: "var(--color-gray-600)",
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  background: "none",
                  border: "1px solid #FECACA",
                  padding: "0.5rem 0.875rem",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.5625rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  color: "#EF4444",
                }}
              >
                Delete Page
              </button>
            )
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? "#999" : saved ? "#10B981" : "var(--color-black)",
              color: "var(--color-white)",
              border: "none",
              padding: "0.625rem 1.5rem",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.625rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: 600,
              transition: "background 300ms ease",
            }}
          >
            {saving ? "Saving..." : saved ? "Saved" : isNew ? "Create Page" : "Save Changes"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "0.75rem 1rem",
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.75rem",
          color: "#EF4444",
        }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
        {/* Main editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Title */}
          <div style={{
            background: "var(--color-white)",
            border: "1px solid var(--color-gray-200)",
            padding: "1.25rem",
          }}>
            <label style={LABEL_STYLE}>Page Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. About Us"
              style={{
                ...INPUT_STYLE,
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.25rem",
                fontWeight: 400,
              }}
            />
          </div>

          {/* Content editor */}
          <div style={{
            background: "var(--color-white)",
            border: "1px solid var(--color-gray-200)",
          }}>
            {/* Toolbar */}
            <div style={{
              padding: "0.75rem 1.25rem",
              borderBottom: "1px solid var(--color-gray-200)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.5625rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-gray-600)",
                fontWeight: 600,
              }}>
                Content (Markdown)
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.5625rem",
                  color: "var(--color-gray-600)",
                  letterSpacing: "0.05em",
                }}>
                  {content.length.toLocaleString()} chars
                </span>
                <div style={{ display: "flex", gap: "2px" }}>
                  <button
                    onClick={() => setPreview(false)}
                    style={{
                      background: !preview ? "var(--color-black)" : "transparent",
                      color: !preview ? "white" : "var(--color-gray-600)",
                      border: "1px solid var(--color-gray-200)",
                      padding: "0.25rem 0.625rem",
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.5rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Write
                  </button>
                  <button
                    onClick={() => setPreview(true)}
                    style={{
                      background: preview ? "var(--color-black)" : "transparent",
                      color: preview ? "white" : "var(--color-gray-600)",
                      border: "1px solid var(--color-gray-200)",
                      padding: "0.25rem 0.625rem",
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.5rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>

            {preview ? (
              <div
                style={{
                  minHeight: "480px",
                  padding: "1.5rem",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.875rem",
                  lineHeight: 1.7,
                  color: "var(--color-black)",
                }}
                /* Admin-only preview: content is HTML-entity-escaped before parsing */
                /* eslint-disable-next-line react/no-danger */
                dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(content) }}
              />
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={"# Page Title\n\nWrite your page content here using Markdown..."}
                spellCheck
                style={{
                  width: "100%",
                  minHeight: "480px",
                  padding: "1.5rem",
                  fontFamily: "'Courier New', monospace",
                  fontSize: "0.8125rem",
                  lineHeight: 1.7,
                  color: "#E2E8F0",
                  background: "#1A1A2E",
                  border: "none",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                  display: "block",
                }}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "1rem" }}>
          {/* Page details */}
          <div style={{
            background: "var(--color-white)",
            border: "1px solid var(--color-gray-200)",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}>
            <p style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.5625rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-gray-600)",
              fontWeight: 600,
              margin: 0,
            }}>
              Page Details
            </p>

            {/* Slug */}
            <div>
              <label style={LABEL_STYLE}>Slug</label>
              {isNew ? (
                <input
                  type="text"
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                  }
                  placeholder="e.g. about"
                  style={INPUT_STYLE}
                />
              ) : (
                <div style={{
                  padding: "0.625rem 0.75rem",
                  background: "#FAFAFA",
                  border: "1px solid var(--color-gray-200)",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.8125rem",
                  color: "var(--color-gray-600)",
                }}>
                  /{currentSlug}
                </div>
              )}
            </div>

            {!isNew && (
              <div>
                <label style={LABEL_STYLE}>Last Updated</label>
                <p style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.75rem",
                  color: "var(--color-gray-600)",
                  margin: 0,
                }}>
                  {page ? new Date(page.updatedAt).toLocaleString("en-GH") : "—"}
                </p>
              </div>
            )}
          </div>

          {/* SEO */}
          <div style={{
            background: "var(--color-white)",
            border: "1px solid var(--color-gray-200)",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}>
            <p style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.5625rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-gray-600)",
              fontWeight: 600,
              margin: 0,
            }}>
              SEO
            </p>

            <div>
              <label style={LABEL_STYLE}>Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Leave blank to use page title"
                style={INPUT_STYLE}
                maxLength={70}
              />
              <p style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.5rem",
                color: metaTitle.length > 60 ? "#F59E0B" : "var(--color-gray-600)",
                marginTop: "0.25rem",
              }}>
                {metaTitle.length}/70 chars
              </p>
            </div>

            <div>
              <label style={LABEL_STYLE}>Meta Description</label>
              <textarea
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                placeholder="Brief description for search engines"
                maxLength={160}
                rows={3}
                style={{
                  ...INPUT_STYLE,
                  resize: "vertical",
                  fontFamily: "var(--font-montserrat), sans-serif",
                }}
              />
              <p style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.5rem",
                color: metaDesc.length > 140 ? "#F59E0B" : "var(--color-gray-600)",
                marginTop: "0.25rem",
              }}>
                {metaDesc.length}/160 chars
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
