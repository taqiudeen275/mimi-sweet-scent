"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PageSummary {
  id: string;
  slug: string;
  title: string;
  metaTitle: string | null;
  updatedAt: Date | string;
}

const CORE_SLUGS = ["about", "services", "privacy-policy", "terms"];

export function ContentPagesList({ pages }: { pages: PageSummary[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function quickCreate(slug: string, title: string) {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title, content: `# ${title}\n\nEdit this page content.` }),
      });
      const data = (await res.json()) as { slug?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to create page");
        return;
      }
      router.push(`/admin/content/${data.slug}`);
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "2rem",
            fontWeight: 400,
            color: "var(--color-black)",
            margin: 0,
          }}>
            Content Pages
          </h1>
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            color: "var(--color-gray-600)",
            marginTop: "0.25rem",
            letterSpacing: "0.03em",
          }}>
            Manage your site&apos;s static pages
          </p>
        </div>
        <a
          href="/admin/content/new"
          style={{
            background: "var(--color-black)",
            color: "var(--color-white)",
            textDecoration: "none",
            padding: "0.625rem 1.25rem",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.625rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 600,
            display: "inline-block",
          }}
        >
          + New Page
        </a>
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

      {/* Empty state */}
      {pages.length === 0 ? (
        <div style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-gray-200)",
          padding: "4rem 2rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}>
          <p style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.5rem",
            fontWeight: 300,
            color: "var(--color-black)",
            margin: 0,
          }}>
            No pages yet
          </p>
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.8125rem",
            color: "var(--color-gray-600)",
            maxWidth: "400px",
            margin: 0,
            lineHeight: 1.6,
          }}>
            Get started by creating your first content page. Quick-start with a pre-configured template:
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => quickCreate("about", "About Us")}
              disabled={creating}
              style={{
                background: "var(--color-black)",
                color: "var(--color-white)",
                border: "none",
                padding: "0.75rem 1.5rem",
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.625rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: creating ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              Create About Page
            </button>
            <button
              onClick={() => quickCreate("services", "Our Services")}
              disabled={creating}
              style={{
                background: "none",
                color: "var(--color-black)",
                border: "1px solid var(--color-black)",
                padding: "0.75rem 1.5rem",
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.625rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: creating ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              Create Services Page
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}>
          {pages.map((page) => (
            <div
              key={page.id}
              style={{
                background: "var(--color-white)",
                border: "1px solid var(--color-gray-200)",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
                transition: "border-color 200ms ease, box-shadow 200ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-primary)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(184,134,11,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-gray-200)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                <div>
                  <h3 style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "1.25rem",
                    fontWeight: 400,
                    color: "var(--color-black)",
                    margin: 0,
                    lineHeight: 1.3,
                  }}>
                    {page.title}
                  </h3>
                  <span style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.625rem",
                    color: "var(--color-primary)",
                    letterSpacing: "0.05em",
                  }}>
                    /{page.slug}
                  </span>
                </div>
                {CORE_SLUGS.includes(page.slug) && (
                  <span style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.4375rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    background: "#EDE9FE",
                    color: "#7C3AED",
                    padding: "0.2rem 0.4rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}>
                    Core
                  </span>
                )}
              </div>

              <p style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.6875rem",
                color: "var(--color-gray-600)",
                margin: 0,
              }}>
                Updated {new Date(page.updatedAt).toLocaleDateString("en-GH", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                <a
                  href={`/admin/content/${page.slug}`}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    background: "var(--color-black)",
                    color: "var(--color-white)",
                    textDecoration: "none",
                    padding: "0.5rem",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.5625rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  Edit
                </a>
                <a
                  href={`/${page.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textAlign: "center",
                    background: "none",
                    color: "var(--color-gray-600)",
                    textDecoration: "none",
                    padding: "0.5rem 0.75rem",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.5625rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    border: "1px solid var(--color-gray-200)",
                    display: "block",
                    whiteSpace: "nowrap",
                  }}
                >
                  View ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
