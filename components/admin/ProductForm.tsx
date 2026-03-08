"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantRow {
  id?: string;
  optionLabel: string;
  sku: string;
  priceGHS: string;
  compareAtGHS: string;
  stock: string;
}

interface NoteRow {
  id?: string;
  type: "TOP" | "HEART" | "BASE";
  name: string;
  icon: string;
}

interface ImageRow {
  id?: string;
  url: string;
  altText: string;
  position: number;
}

export interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  productType: "PERFUME" | "JEWELRY";
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  tagline: string;
  description: string;
  concentration: string;
  genderTag: string;
  sillage: string;
  longevity: string;
  seasonRec: string;
  perfumerProfile: string;
  material: string;
  stone: string;
  seoTitle: string;
  seoDesc: string;
  collectionId: string;
  variants: VariantRow[];
  fragranceNotes: NoteRow[];
  images: ImageRow[];
}

interface Collection { id: string; name: string; }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function emptyVariant(): VariantRow {
  return { optionLabel: "", sku: "", priceGHS: "", compareAtGHS: "", stock: "0" };
}

function emptyNote(): NoteRow {
  return { type: "TOP", name: "", icon: "" };
}

function emptyImage(): ImageRow {
  return { url: "", altText: "", position: 0 };
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.5625rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--color-gray-600)",
  marginBottom: "0.375rem",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "38px",
  padding: "0 0.75rem",
  border: "1px solid var(--color-gray-200)",
  background: "var(--color-white)",
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.8125rem",
  color: "var(--color-black)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 150ms ease",
};

const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = "var(--color-primary)";
};
const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = "var(--color-gray-200)";
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.75rem center",
  paddingRight: "2.25rem",
  cursor: "pointer",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  height: "auto",
  padding: "0.625rem 0.75rem",
  resize: "vertical",
  minHeight: "100px",
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-cormorant), Georgia, serif",
  fontSize: "1.25rem",
  fontWeight: 400,
  color: "var(--color-black)",
  margin: "0 0 1.25rem",
  paddingBottom: "0.75rem",
  borderBottom: "1px solid var(--color-gray-200)",
};

const sectionStyle: React.CSSProperties = {
  background: "var(--color-white)",
  border: "1px solid var(--color-gray-200)",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const fieldRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1rem",
};

const iconBtnStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--color-gray-200)",
  cursor: "pointer",
  padding: "0.375rem 0.5rem",
  color: "var(--color-gray-600)",
  borderRadius: "2px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.875rem",
  lineHeight: 1,
  flexShrink: 0,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductForm({ initial, mode }: { initial: ProductFormData; mode: "create" | "edit" }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(initial);
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Fetch collections
  useEffect(() => {
    fetch("/api/admin/collections")
      .then(r => r.ok ? r.json() : { data: [] })
      .then(json => setCollections(json.data ?? []))
      .catch(() => {});
  }, []);

  // Auto-slug from name
  useEffect(() => {
    if (!slugEdited && form.name) {
      setForm(f => ({ ...f, slug: slugify(f.name) }));
    }
  }, [form.name, slugEdited]);

  const set = useCallback(<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm(f => ({ ...f, [key]: value }));
  }, []);

  // ─── Variants ──────────────────────────────────────────────────────────────

  function setVariant(i: number, patch: Partial<VariantRow>) {
    setForm(f => {
      const variants = [...f.variants];
      variants[i] = { ...variants[i], ...patch };
      return { ...f, variants };
    });
  }

  function addVariant() {
    setForm(f => ({ ...f, variants: [...f.variants, emptyVariant()] }));
  }

  function removeVariant(i: number) {
    setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));
  }

  // ─── Fragrance Notes ───────────────────────────────────────────────────────

  function setNote(i: number, patch: Partial<NoteRow>) {
    setForm(f => {
      const fragranceNotes = [...f.fragranceNotes];
      fragranceNotes[i] = { ...fragranceNotes[i], ...patch };
      return { ...f, fragranceNotes };
    });
  }

  function addNote() {
    setForm(f => ({ ...f, fragranceNotes: [...f.fragranceNotes, emptyNote()] }));
  }

  function removeNote(i: number) {
    setForm(f => ({ ...f, fragranceNotes: f.fragranceNotes.filter((_, idx) => idx !== i) }));
  }

  // ─── Images ────────────────────────────────────────────────────────────────

  function addImageUrl() {
    const url = imageUrlInput.trim();
    if (!url) return;
    setForm(f => ({
      ...f,
      images: [...f.images, { url, altText: "", position: f.images.length }],
    }));
    setImageUrlInput("");
  }

  function removeImage(i: number) {
    setForm(f => ({
      ...f,
      images: f.images.filter((_, idx) => idx !== i).map((img, idx) => ({ ...img, position: idx })),
    }));
  }

  function moveImage(i: number, dir: -1 | 1) {
    const j = i + dir;
    setForm(f => {
      if (j < 0 || j >= f.images.length) return f;
      const images = [...f.images];
      [images[i], images[j]] = [images[j], images[i]];
      return { ...f, images: images.map((img, idx) => ({ ...img, position: idx })) };
    });
  }

  function setImageAlt(i: number, altText: string) {
    setForm(f => {
      const images = [...f.images];
      images[i] = { ...images[i], altText };
      return { ...f, images };
    });
  }

  // ─── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate required fields
    if (!form.name.trim()) { setError("Product name is required"); setLoading(false); return; }
    if (!form.slug.trim()) { setError("Slug is required"); setLoading(false); return; }
    if (form.variants.length === 0) { setError("At least one variant is required"); setLoading(false); return; }

    for (const v of form.variants) {
      if (!v.sku.trim()) { setError("All variants must have a SKU"); setLoading(false); return; }
      if (!v.priceGHS || isNaN(parseFloat(v.priceGHS))) { setError("All variants must have a valid price"); setLoading(false); return; }
    }

    const payload = {
      name:            form.name.trim(),
      slug:            form.slug.trim(),
      productType:     form.productType,
      status:          form.status,
      tagline:         form.tagline.trim() || undefined,
      description:     form.description.trim() || undefined,
      concentration:   form.productType === "PERFUME" && form.concentration ? form.concentration : undefined,
      genderTag:       form.genderTag || undefined,
      sillage:         form.productType === "PERFUME" ? form.sillage.trim() || undefined : undefined,
      longevity:       form.productType === "PERFUME" ? form.longevity.trim() || undefined : undefined,
      seasonRec:       form.productType === "PERFUME" ? form.seasonRec.trim() || undefined : undefined,
      perfumerProfile: form.productType === "PERFUME" ? form.perfumerProfile.trim() || undefined : undefined,
      material:        form.productType === "JEWELRY" ? form.material.trim() || undefined : undefined,
      stone:           form.productType === "JEWELRY" ? form.stone.trim() || undefined : undefined,
      seoTitle:        form.seoTitle.trim() || undefined,
      seoDesc:         form.seoDesc.trim() || undefined,
      collectionId:    form.collectionId || undefined,
      variants: form.variants.map(v => ({
        id:             v.id,
        optionLabel:    v.optionLabel.trim() || "Default",
        sku:            v.sku.trim(),
        price:          Math.round(parseFloat(v.priceGHS) * 100),
        compareAtPrice: v.compareAtGHS ? Math.round(parseFloat(v.compareAtGHS) * 100) : undefined,
        stock:          parseInt(v.stock, 10) || 0,
      })),
      fragranceNotes: form.productType === "PERFUME" ? form.fragranceNotes
        .filter(n => n.name.trim())
        .map(n => ({ id: n.id, type: n.type, name: n.name.trim(), icon: n.icon.trim() || undefined })) : [],
      images: form.images
        .filter(img => img.url.trim())
        .map((img, idx) => ({ id: img.id, url: img.url.trim(), altText: img.altText.trim() || undefined, position: idx })),
    };

    const url    = mode === "create" ? "/api/admin/products" : `/api/admin/products/${form.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "An error occurred");
        setLoading(false);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  }

  const isPerfume = form.productType === "PERFUME";

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* ── Basic Info ── */}
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>Basic Information</h2>

        <div>
          <label style={labelStyle}>Product Name *</label>
          <input
            style={inputStyle}
            value={form.name}
            onChange={e => set("name", e.target.value)}
            onFocus={focusInput}
            onBlur={blurInput}
            placeholder="e.g. Lumière Noire"
            required
          />
        </div>

        <div style={fieldRow}>
          <div>
            <label style={labelStyle}>Slug *</label>
            <input
              style={inputStyle}
              value={form.slug}
              onChange={e => { setSlugEdited(true); set("slug", e.target.value); }}
              onFocus={focusInput}
              onBlur={blurInput}
              placeholder="lumiere-noire"
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select style={selectStyle} value={form.status} onChange={e => set("status", e.target.value as ProductFormData["status"])} onFocus={focusInput} onBlur={blurInput}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div style={fieldRow}>
          <div>
            <label style={labelStyle}>Product Type *</label>
            <select style={selectStyle} value={form.productType} onChange={e => set("productType", e.target.value as "PERFUME" | "JEWELRY")} onFocus={focusInput} onBlur={blurInput}>
              <option value="PERFUME">Perfume</option>
              <option value="JEWELRY">Jewelry</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Collection</label>
            <select style={selectStyle} value={form.collectionId} onChange={e => set("collectionId", e.target.value)} onFocus={focusInput} onBlur={blurInput}>
              <option value="">None</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Tagline</label>
          <input
            style={inputStyle}
            value={form.tagline}
            onChange={e => set("tagline", e.target.value)}
            onFocus={focusInput}
            onBlur={blurInput}
            placeholder="A short evocative line"
          />
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...textareaStyle, minHeight: "140px" }}
            value={form.description}
            onChange={e => set("description", e.target.value)}
            onFocus={focusInput}
            onBlur={blurInput}
            placeholder="Full product description…"
          />
        </div>
      </section>

      {/* ── Type-specific Details ── */}
      {isPerfume ? (
        <section style={sectionStyle}>
          <h2 style={sectionHeadingStyle}>Perfume Details</h2>

          <div style={fieldRow}>
            <div>
              <label style={labelStyle}>Concentration</label>
              <select style={selectStyle} value={form.concentration} onChange={e => set("concentration", e.target.value)} onFocus={focusInput} onBlur={blurInput}>
                <option value="">Select…</option>
                <option value="PARFUM">Parfum</option>
                <option value="EDP">Eau de Parfum (EDP)</option>
                <option value="EDT">Eau de Toilette (EDT)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Gender Tag</label>
              <select style={selectStyle} value={form.genderTag} onChange={e => set("genderTag", e.target.value)} onFocus={focusInput} onBlur={blurInput}>
                <option value="">Select…</option>
                <option value="WOMEN">Women</option>
                <option value="MEN">Men</option>
                <option value="UNISEX">Unisex</option>
              </select>
            </div>
          </div>

          <div style={fieldRow}>
            <div>
              <label style={labelStyle}>Sillage</label>
              <input style={inputStyle} value={form.sillage} onChange={e => set("sillage", e.target.value)} onFocus={focusInput} onBlur={blurInput} placeholder="e.g. Moderate, Heavy" />
            </div>
            <div>
              <label style={labelStyle}>Longevity</label>
              <input style={inputStyle} value={form.longevity} onChange={e => set("longevity", e.target.value)} onFocus={focusInput} onBlur={blurInput} placeholder="e.g. 8–12 hours" />
            </div>
          </div>

          <div style={fieldRow}>
            <div>
              <label style={labelStyle}>Season Recommendation</label>
              <input style={inputStyle} value={form.seasonRec} onChange={e => set("seasonRec", e.target.value)} onFocus={focusInput} onBlur={blurInput} placeholder="e.g. Spring / Summer" />
            </div>
            <div>
              <label style={labelStyle}>Perfumer Profile</label>
              <input style={inputStyle} value={form.perfumerProfile} onChange={e => set("perfumerProfile", e.target.value)} onFocus={focusInput} onBlur={blurInput} placeholder="e.g. Jean-Claude Ellena" />
            </div>
          </div>
        </section>
      ) : (
        <section style={sectionStyle}>
          <h2 style={sectionHeadingStyle}>Jewelry Details</h2>

          <div style={fieldRow}>
            <div>
              <label style={labelStyle}>Material</label>
              <input style={inputStyle} value={form.material} onChange={e => set("material", e.target.value)} onFocus={focusInput} onBlur={blurInput} placeholder="e.g. 18k Gold Plated" />
            </div>
            <div>
              <label style={labelStyle}>Stone</label>
              <input style={inputStyle} value={form.stone} onChange={e => set("stone", e.target.value)} onFocus={focusInput} onBlur={blurInput} placeholder="e.g. Diamond, Pearl" />
            </div>
          </div>

          <div style={{ maxWidth: "320px" }}>
            <label style={labelStyle}>Gender Tag</label>
            <select style={selectStyle} value={form.genderTag} onChange={e => set("genderTag", e.target.value)} onFocus={focusInput} onBlur={blurInput}>
              <option value="">Select…</option>
              <option value="WOMEN">Women</option>
              <option value="MEN">Men</option>
              <option value="UNISEX">Unisex</option>
            </select>
          </div>
        </section>
      )}

      {/* ── Fragrance Notes (perfume only) ── */}
      {isPerfume && (
        <section style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-gray-200)" }}>
            <h2 style={{ ...sectionHeadingStyle, margin: 0, border: "none", padding: 0 }}>Fragrance Notes</h2>
            <button type="button" onClick={addNote} style={{
              padding: "0.375rem 0.875rem",
              background: "none",
              border: "1px solid var(--color-primary)",
              color: "var(--color-primary)",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.625rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}>
              + Add Note
            </button>
          </div>

          {form.fragranceNotes.length === 0 && (
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "#9CA3AF", textAlign: "center", padding: "1rem 0", margin: 0 }}>
              No fragrance notes yet — add some
            </p>
          )}

          {form.fragranceNotes.map((note, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr 80px auto", gap: "0.625rem", alignItems: "flex-end" }}>
              <div>
                {i === 0 && <label style={labelStyle}>Layer</label>}
                <select style={selectStyle} value={note.type} onChange={e => setNote(i, { type: e.target.value as NoteRow["type"] })} onFocus={focusInput} onBlur={blurInput}>
                  <option value="TOP">Top</option>
                  <option value="HEART">Heart</option>
                  <option value="BASE">Base</option>
                </select>
              </div>
              <div>
                {i === 0 && <label style={labelStyle}>Note Name</label>}
                <input style={inputStyle} value={note.name} onChange={e => setNote(i, { name: e.target.value })} onFocus={focusInput} onBlur={blurInput} placeholder="e.g. Bergamot" />
              </div>
              <div>
                {i === 0 && <label style={labelStyle}>Icon</label>}
                <input style={inputStyle} value={note.icon} onChange={e => setNote(i, { icon: e.target.value })} onFocus={focusInput} onBlur={blurInput} placeholder="🍋" />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "1px" }}>
                <button type="button" onClick={() => removeNote(i)} style={{ ...iconBtnStyle, color: "#EF4444", borderColor: "#FCA5A5" }} title="Remove note">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Variants ── */}
      <section style={sectionStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-gray-200)" }}>
          <h2 style={{ ...sectionHeadingStyle, margin: 0, border: "none", padding: 0 }}>Variants *</h2>
          <button type="button" onClick={addVariant} style={{
            padding: "0.375rem 0.875rem",
            background: "none",
            border: "1px solid var(--color-primary)",
            color: "var(--color-primary)",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.625rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}>
            + Add Variant
          </button>
        </div>

        {form.variants.length === 0 && (
          <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "#EF4444", textAlign: "center", padding: "1rem 0", margin: 0 }}>
            At least one variant is required
          </p>
        )}

        {form.variants.map((v, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 110px 110px 80px auto", gap: "0.625rem", alignItems: "flex-end" }}>
            <div>
              {i === 0 && <label style={labelStyle}>Option Label</label>}
              <input style={inputStyle} value={v.optionLabel} onChange={e => setVariant(i, { optionLabel: e.target.value })} onFocus={focusInput} onBlur={blurInput} placeholder="e.g. 50ml" />
            </div>
            <div>
              {i === 0 && <label style={labelStyle}>SKU *</label>}
              <input style={inputStyle} value={v.sku} onChange={e => setVariant(i, { sku: e.target.value })} onFocus={focusInput} onBlur={blurInput} placeholder="MSS-001-50" required />
            </div>
            <div>
              {i === 0 && <label style={labelStyle}>Price (GHS) *</label>}
              <input style={inputStyle} type="number" min="0" step="0.01" value={v.priceGHS} onChange={e => setVariant(i, { priceGHS: e.target.value })} onFocus={focusInput} onBlur={blurInput} placeholder="0.00" required />
            </div>
            <div>
              {i === 0 && <label style={labelStyle}>Compare At</label>}
              <input style={inputStyle} type="number" min="0" step="0.01" value={v.compareAtGHS} onChange={e => setVariant(i, { compareAtGHS: e.target.value })} onFocus={focusInput} onBlur={blurInput} placeholder="0.00" />
            </div>
            <div>
              {i === 0 && <label style={labelStyle}>Stock</label>}
              <input style={inputStyle} type="number" min="0" step="1" value={v.stock} onChange={e => setVariant(i, { stock: e.target.value })} onFocus={focusInput} onBlur={blurInput} placeholder="0" />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "1px" }}>
              <button type="button" onClick={() => removeVariant(i)} style={{ ...iconBtnStyle, color: "#EF4444", borderColor: "#FCA5A5" }} title="Remove variant" disabled={form.variants.length === 1}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* ── Images ── */}
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>Images</h2>

        {/* URL input */}
        <div>
          <label style={labelStyle}>Add Image by URL</label>
          <div style={{ display: "flex", gap: "0.625rem" }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={imageUrlInput}
              onChange={e => setImageUrlInput(e.target.value)}
              onFocus={focusInput}
              onBlur={blurInput}
              placeholder="https://… or /uploads/image.jpg"
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
            />
            <button
              type="button"
              onClick={addImageUrl}
              style={{
                padding: "0 1.25rem",
                height: "38px",
                background: "var(--color-primary)",
                border: "none",
                color: "#fff",
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.625rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Image list */}
        {form.images.length === 0 && (
          <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "#9CA3AF", textAlign: "center", padding: "1rem 0", margin: 0 }}>
            No images yet
          </p>
        )}

        {form.images.map((img, i) => (
          <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "center", padding: "0.75rem", background: "#FAFAFA", border: "1px solid var(--color-gray-200)" }}>
            {/* Preview */}
            {img.url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={img.url}
                alt={img.altText || `Image ${i + 1}`}
                style={{ width: "48px", height: "56px", objectFit: "cover", flexShrink: 0, background: "var(--color-cream)" }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "var(--color-gray-600)", margin: "0 0 0.375rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {img.url}
              </p>
              <input
                style={{ ...inputStyle, height: "30px", fontSize: "0.6875rem" }}
                value={img.altText}
                onChange={e => setImageAlt(i, e.target.value)}
                onFocus={focusInput}
                onBlur={blurInput}
                placeholder="Alt text…"
              />
            </div>
            {/* Reorder */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} style={{ ...iconBtnStyle, fontSize: "0.75rem", padding: "0.25rem 0.375rem" }} title="Move up">↑</button>
              <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} style={{ ...iconBtnStyle, fontSize: "0.75rem", padding: "0.25rem 0.375rem" }} title="Move down">↓</button>
            </div>
            <button type="button" onClick={() => removeImage(i)} style={{ ...iconBtnStyle, color: "#EF4444", borderColor: "#FCA5A5", flexShrink: 0 }} title="Remove image">✕</button>
          </div>
        ))}
      </section>

      {/* ── SEO ── */}
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>SEO</h2>
        <div>
          <label style={labelStyle}>SEO Title</label>
          <input style={inputStyle} value={form.seoTitle} onChange={e => set("seoTitle", e.target.value)} onFocus={focusInput} onBlur={blurInput} placeholder="Leave blank to use product name" />
        </div>
        <div>
          <label style={labelStyle}>SEO Description</label>
          <textarea style={textareaStyle} value={form.seoDesc} onChange={e => set("seoDesc", e.target.value)} onFocus={focusInput} onBlur={blurInput} placeholder="Meta description for search engines…" />
        </div>
      </section>

      {/* ── Submit ── */}
      {error && (
        <div style={{
          padding: "0.875rem 1.25rem",
          background: "#FEF2F2",
          border: "1px solid #FCA5A5",
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.8125rem",
          color: "#B91C1C",
        }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.875rem", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            padding: "0.625rem 1.5rem",
            border: "1px solid var(--color-gray-200)",
            background: "var(--color-white)",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            color: "var(--color-gray-600)",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.625rem 2rem",
            border: "none",
            background: loading ? "#D4B896" : "var(--color-primary)",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            color: "#fff",
            fontWeight: 600,
            transition: "background 150ms ease",
          }}
        >
          {loading ? (mode === "create" ? "Creating…" : "Saving…") : (mode === "create" ? "Create Product" : "Save Changes")}
        </button>
      </div>
    </form>
  );
}
