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

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function emptyVariant(): VariantRow { return { optionLabel: "", sku: "", priceGHS: "", compareAtGHS: "", stock: "0" }; }
function emptyNote(): NoteRow { return { type: "TOP", name: "", icon: "" }; }
function emptyImage(): ImageRow { return { url: "", altText: "", position: 0 }; }

// ─── Steps ───────────────────────────────────────────────────────────────────

type Step = "basics" | "details" | "pricing" | "media";
const STEPS: { id: Step; label: string; icon: string; desc: string }[] = [
  { id: "basics",  label: "Basics",  icon: "①", desc: "Name, type & description" },
  { id: "details", label: "Details", icon: "②", desc: "Perfume or jewelry attributes" },
  { id: "pricing", label: "Pricing", icon: "③", desc: "Variants, stock & discounts" },
  { id: "media",   label: "Media",   icon: "④", desc: "Images & SEO" },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const inp: React.CSSProperties = {
  width: "100%", padding: "0.625rem 0.75rem",
  fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.8125rem",
  color: "var(--color-black)", background: "var(--color-white)",
  border: "1px solid #D1D5DB", outline: "none", boxSizing: "border-box",
  transition: "border-color 150ms",
};

const ta: React.CSSProperties = { ...inp, resize: "vertical", lineHeight: 1.6 };

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductForm({ initial }: { initial?: ProductFormData }) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [step, setStep] = useState<Step>("basics");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  // ── Form state ──
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!initial?.slug);
  const [productType, setProductType] = useState<"PERFUME" | "JEWELRY">(initial?.productType ?? "PERFUME");
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE" | "ARCHIVED">(initial?.status ?? "DRAFT");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [collectionId, setCollectionId] = useState(initial?.collectionId ?? "");

  // Perfume
  const [concentration, setConcentration] = useState(initial?.concentration ?? "");
  const [genderTag, setGenderTag] = useState(initial?.genderTag ?? "");
  const [sillage, setSillage] = useState(initial?.sillage ?? "");
  const [longevity, setLongevity] = useState(initial?.longevity ?? "");
  const [seasonRec, setSeasonRec] = useState(initial?.seasonRec ?? "");
  const [perfumerProfile, setPerfumerProfile] = useState(initial?.perfumerProfile ?? "");

  // Jewelry
  const [material, setMaterial] = useState(initial?.material ?? "");
  const [stone, setStone] = useState(initial?.stone ?? "");

  // SEO
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = useState(initial?.seoDesc ?? "");

  // Dynamic rows
  const [variants, setVariants] = useState<VariantRow[]>(initial?.variants?.length ? initial.variants.map(v => ({ ...v, priceGHS: String((v as unknown as { priceGHS: string }).priceGHS ?? ""), compareAtGHS: String((v as unknown as { compareAtGHS: string }).compareAtGHS ?? "") })) : [emptyVariant()]);
  const [notes, setNotes] = useState<NoteRow[]>(initial?.fragranceNotes ?? []);
  const [images, setImages] = useState<ImageRow[]>(initial?.images ?? []);

  // Load collections
  useEffect(() => {
    fetch("/api/admin/collections").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setCollections(d);
    }).catch(() => {});
  }, []);

  // Auto-slug from name
  useEffect(() => {
    if (!slugManual) setSlug(slugify(name));
  }, [name, slugManual]);

  // ── Variant helpers ──
  const setVariantField = useCallback((i: number, field: keyof VariantRow, val: string) => {
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v));
  }, []);
  const addVariant = () => setVariants(prev => [...prev, emptyVariant()]);
  const removeVariant = (i: number) => setVariants(prev => prev.filter((_, idx) => idx !== i));

  // ── Note helpers ──
  const setNoteField = useCallback((i: number, field: keyof NoteRow, val: string) => {
    setNotes(prev => prev.map((n, idx) => idx === i ? { ...n, [field]: val } : n));
  }, []);
  const addNote = (type: "TOP" | "HEART" | "BASE") => setNotes(prev => [...prev, { ...emptyNote(), type }]);
  const removeNote = (i: number) => setNotes(prev => prev.filter((_, idx) => idx !== i));

  // ── Image helpers ──
  const addImageByUrl = () => {
    const url = imagePreviewUrl.trim();
    if (!url) return;
    setImages(prev => [...prev, { url, altText: name, position: prev.length }]);
    setImagePreviewUrl("");
  };
  const removeImage = (i: number) => setImages(prev => prev.filter((_, idx) => idx !== i));

  const uploadFile = async (i: number, file: File) => {
    setUploadingIdx(i);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const d = await res.json() as { url?: string; error?: string };
    if (d.url) {
      if (i === -1) {
        setImages(prev => [...prev, { url: d.url!, altText: name, position: prev.length }]);
      } else {
        setImages(prev => prev.map((img, idx) => idx === i ? { ...img, url: d.url! } : img));
      }
    }
    setUploadingIdx(null);
  };

  // ── Submit ──
  async function handleSubmit() {
    if (!name.trim()) { setStep("basics"); setError("Product name is required."); return; }
    if (variants.some(v => !v.optionLabel.trim() || !v.sku.trim() || !v.priceGHS)) {
      setStep("pricing"); setError("Each variant needs a label, SKU, and price."); return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      name: name.trim(), slug: slug.trim(), productType, status, tagline, description, collectionId: collectionId || null,
      concentration: concentration || null, genderTag: genderTag || null,
      sillage: sillage || null, longevity: longevity || null, seasonRec: seasonRec || null,
      perfumerProfile: perfumerProfile || null, material: material || null, stone: stone || null,
      seoTitle: seoTitle || null, seoDesc: seoDesc || null,
      variants: variants.map((v, i) => ({
        id: v.id, optionLabel: v.optionLabel, sku: v.sku,
        price: Math.round(parseFloat(v.priceGHS || "0") * 100),
        compareAtPrice: v.compareAtGHS ? Math.round(parseFloat(v.compareAtGHS) * 100) : null,
        stock: parseInt(v.stock || "0"),
        position: i,
      })),
      fragranceNotes: notes.map(n => ({ id: n.id, type: n.type, name: n.name, icon: n.icon || null })),
      images: images.map((img, i) => ({ id: img.id, url: img.url, altText: img.altText || null, position: i })),
    };

    try {
      const url = isEdit ? `/api/admin/products/${initial!.id}` : "/api/admin/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { id?: string; error?: string };
      if (!res.ok) { setError(data.error ?? "Save failed."); return; }
      setSaved(true);
      setTimeout(() => router.push("/admin/products"), 800);
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  }

  const currentStepIdx = STEPS.findIndex(s => s.id === step);

  // ── Validate step before advance ──
  function canGoNext(): { ok: boolean; msg?: string } {
    if (step === "basics" && !name.trim()) return { ok: false, msg: "Please enter a product name." };
    if (step === "pricing") {
      const bad = variants.find(v => !v.optionLabel.trim() || !v.sku.trim() || !v.priceGHS);
      if (bad) return { ok: false, msg: "Each variant needs a label, SKU, and price." };
    }
    return { ok: true };
  }

  function goNext() {
    const v = canGoNext();
    if (!v.ok) { setError(v.msg ?? null); return; }
    setError(null);
    const next = STEPS[currentStepIdx + 1];
    if (next) setStep(next.id);
  }

  function goPrev() {
    setError(null);
    const prev = STEPS[currentStepIdx - 1];
    if (prev) setStep(prev.id);
  }

  const isLastStep = currentStepIdx === STEPS.length - 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 64px)" }}>

      {/* ── Top bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: "56px", background: "var(--color-white)",
        borderBottom: "1px solid var(--color-gray-200)", flexShrink: 0, gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <a href="/admin/products" style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-gray-600)", textDecoration: "none" }}>
            ← Products
          </a>
          <h1 style={{ fontFamily: "var(--font-cormorant),Georgia,serif", fontSize: "1.375rem", fontWeight: 400, color: "var(--color-black)", margin: 0 }}>
            {isEdit ? `Editing: ${initial?.name}` : "New Product"}
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {/* Status badge */}
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} style={{
            fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem",
            letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
            padding: "0.375rem 0.625rem", border: "none", cursor: "pointer",
            background: status === "ACTIVE" ? "#DCFCE7" : status === "DRAFT" ? "#FEF3C7" : "#F3F4F6",
            color: status === "ACTIVE" ? "#166534" : status === "DRAFT" ? "#92400E" : "#6B7280",
          }}>
            <option value="DRAFT">● Draft</option>
            <option value="ACTIVE">● Active</option>
            <option value="ARCHIVED">● Archived</option>
          </select>

          <button onClick={handleSubmit} disabled={saving || saved} style={{
            background: saved ? "#10B981" : saving ? "#9CA3AF" : "var(--color-black)",
            color: "var(--color-white)", border: "none", padding: "0.5rem 1.5rem",
            fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem",
            letterSpacing: "0.12em", textTransform: "uppercase", cursor: saving || saved ? "not-allowed" : "pointer",
            fontWeight: 600, transition: "background 200ms",
          }}>
            {saved ? "✓ Saved!" : saving ? "Saving…" : isEdit ? "Save Changes" : "Publish Product"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "0.625rem 2rem", background: "#FEF2F2", borderBottom: "1px solid #FECACA", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.75rem", color: "#B91C1C" }}>⚠ {error}</span>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#B91C1C", fontSize: "1rem", padding: "0 0.5rem" }}>×</button>
        </div>
      )}

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* ── Step sidebar ── */}
        <div style={{ width: "220px", flexShrink: 0, borderRight: "1px solid var(--color-gray-200)", background: "var(--color-white)", padding: "1.5rem 0" }}>
          {STEPS.map((s, i) => {
            const isActive = s.id === step;
            const isDone = i < currentStepIdx;
            return (
              <button key={s.id} onClick={() => { setError(null); setStep(s.id); }} style={{
                display: "flex", alignItems: "flex-start", gap: "0.75rem", width: "100%",
                padding: "0.875rem 1.25rem", background: isActive ? "rgba(184,134,11,0.06)" : "transparent",
                border: "none", borderLeft: isActive ? "3px solid var(--color-primary)" : "3px solid transparent",
                cursor: "pointer", textAlign: "left", transition: "all 150ms",
              }}>
                <span style={{
                  width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem", fontWeight: 700,
                  background: isDone ? "var(--color-primary)" : isActive ? "var(--color-black)" : "var(--color-gray-200)",
                  color: isDone || isActive ? "white" : "var(--color-gray-600)",
                }}>
                  {isDone ? "✓" : String(i + 1)}
                </span>
                <div>
                  <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.6875rem", fontWeight: isActive ? 600 : 400, color: isActive ? "var(--color-black)" : "var(--color-gray-600)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
                  <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem", color: "#9CA3AF", margin: 0, lineHeight: 1.4 }}>{s.desc}</p>
                </div>
              </button>
            );
          })}

          {/* Completion summary */}
          <div style={{ margin: "1.5rem 1.25rem 0", padding: "0.875rem", background: "#F9FAFB", border: "1px solid var(--color-gray-200)" }}>
            <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-gray-600)", fontWeight: 600, margin: "0 0 0.5rem" }}>Product summary</p>
            <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem", color: "var(--color-black)", margin: "0 0 3px" }}>{name || <span style={{ color: "#9CA3AF" }}>No name yet</span>}</p>
            <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem", color: "var(--color-gray-600)", margin: "0 0 3px" }}>
              {productType === "PERFUME" ? "🌸 Perfume" : "💎 Jewelry"}
            </p>
            <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem", color: "var(--color-gray-600)", margin: "0 0 3px" }}>
              {variants.length} variant{variants.length !== 1 ? "s" : ""}
              {variants[0]?.priceGHS ? ` · from GHS ${variants[0].priceGHS}` : ""}
            </p>
            <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem", color: "var(--color-gray-600)", margin: 0 }}>
              {images.length} image{images.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, overflow: "auto", padding: "2rem 2.5rem 5rem", minWidth: 0 }}>

          {/* ════ STEP 1: BASICS ════ */}
          {step === "basics" && (
            <div style={{ maxWidth: "720px", display: "flex", flexDirection: "column", gap: "2rem" }}>
              <StepHeader title="Product Basics" subtitle="The core information every product needs." />

              {/* Product type */}
              <FormCard label="Product Type" required help="Choose whether this is a fragrance or a piece of jewelry. This affects which fields appear later.">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {(["PERFUME", "JEWELRY"] as const).map((type) => (
                    <button key={type} type="button" onClick={() => setProductType(type)} style={{
                      padding: "1.25rem", border: `2px solid ${productType === type ? "var(--color-primary)" : "var(--color-gray-200)"}`,
                      background: productType === type ? "rgba(184,134,11,0.06)" : "var(--color-white)",
                      cursor: "pointer", textAlign: "left", transition: "all 150ms",
                    }}>
                      <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{type === "PERFUME" ? "🌸" : "💎"}</div>
                      <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: productType === type ? "var(--color-primary)" : "var(--color-gray-600)", margin: "0 0 4px" }}>
                        {type === "PERFUME" ? "Fragrance" : "Jewelry"}
                      </p>
                      <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem", color: "var(--color-gray-600)", margin: 0, lineHeight: 1.4 }}>
                        {type === "PERFUME" ? "Perfumes, colognes & eau de toilette" : "Necklaces, rings, bracelets & earrings"}
                      </p>
                    </button>
                  ))}
                </div>
              </FormCard>

              {/* Name */}
              <FormCard label="Product Name" required help="The full name displayed to customers (e.g. 'Rose Lumière Eau de Parfum' or 'Golden Crescent Necklace')">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rose Lumière Eau de Parfum" style={{ ...inp, fontSize: "1rem", fontFamily: "var(--font-cormorant),Georgia,serif", padding: "0.75rem" }} />
              </FormCard>

              {/* Slug */}
              <FormCard label="URL Slug" help="The URL-friendly version of the name. Auto-generated — only change if needed.">
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.75rem", color: "var(--color-gray-600)", flexShrink: 0 }}>/product/</span>
                  <input value={slug} onChange={(e) => { setSlugManual(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")); }} placeholder="rose-lumiere" style={{ ...inp, flex: 1 }} />
                </div>
              </FormCard>

              {/* Tagline */}
              <FormCard label="Tagline" help="A short, poetic one-liner shown on product cards and in the hero (e.g. 'Bloom like dawn')">
                <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Bloom like dawn" maxLength={120} style={inp} />
                <CharCount value={tagline.length} max={120} />
              </FormCard>

              {/* Description */}
              <FormCard label="Description" help="The full product description shown on the product page. Be vivid and sensory — especially for fragrances.">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={productType === "PERFUME" ? "Describe the fragrance journey, the mood it evokes, when to wear it…" : "Describe the materials, craftsmanship, who would wear it…"} rows={7} style={ta} />
                <CharCount value={description.length} max={2000} />
              </FormCard>

              {/* Collection */}
              <FormCard label="Collection" help="Optionally assign this product to a collection (e.g. 'The Rose Collection')">
                <select value={collectionId} onChange={(e) => setCollectionId(e.target.value)} style={inp}>
                  <option value="">— No collection —</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormCard>
            </div>
          )}

          {/* ════ STEP 2: DETAILS ════ */}
          {step === "details" && (
            <div style={{ maxWidth: "720px", display: "flex", flexDirection: "column", gap: "2rem" }}>
              <StepHeader
                title={productType === "PERFUME" ? "Fragrance Details" : "Jewelry Details"}
                subtitle={productType === "PERFUME" ? "Technical and sensory attributes that help customers find the right scent." : "Material, stone, and style details that help customers choose."}
              />

              {productType === "PERFUME" ? (
                <>
                  <FormCard label="Concentration" required help="The strength of the fragrance. Parfum is strongest, EDT is lightest.">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.625rem" }}>
                      {[
                        { val: "PARFUM", label: "Parfum", pct: "20–30%", note: "Strongest" },
                        { val: "EDP", label: "Eau de Parfum", pct: "15–20%", note: "Most popular" },
                        { val: "EDT", label: "Eau de Toilette", pct: "5–15%", note: "Everyday" },
                      ].map(({ val, label, pct, note }) => (
                        <button key={val} type="button" onClick={() => setConcentration(val)} style={{
                          padding: "0.875rem 0.625rem", border: `2px solid ${concentration === val ? "var(--color-primary)" : "var(--color-gray-200)"}`,
                          background: concentration === val ? "rgba(184,134,11,0.06)" : "transparent",
                          cursor: "pointer", textAlign: "center", transition: "all 150ms",
                        }}>
                          <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem", fontWeight: 700, color: concentration === val ? "var(--color-primary)" : "var(--color-black)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>{label}</p>
                          <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem", color: "#9CA3AF", margin: "0 0 2px" }}>{pct}</p>
                          <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5rem", color: "var(--color-gray-600)", margin: 0, letterSpacing: "0.05em" }}>{note}</p>
                        </button>
                      ))}
                    </div>
                  </FormCard>

                  <FormCard label="For Who?" help="The primary audience for this fragrance.">
                    <div style={{ display: "flex", gap: "0.625rem" }}>
                      {[["WOMEN","👩 Women"],["MEN","👨 Men"],["UNISEX","⟷ Unisex"]].map(([val,lbl]) => (
                        <button key={val} type="button" onClick={() => setGenderTag(genderTag === val ? "" : val)} style={{
                          flex: 1, padding: "0.625rem", border: `2px solid ${genderTag === val ? "var(--color-primary)" : "var(--color-gray-200)"}`,
                          background: genderTag === val ? "rgba(184,134,11,0.06)" : "transparent",
                          cursor: "pointer", fontFamily: "var(--font-montserrat),sans-serif",
                          fontSize: "0.625rem", letterSpacing: "0.05em", transition: "all 150ms",
                          color: genderTag === val ? "var(--color-primary)" : "var(--color-gray-600)",
                        }}>{lbl}</button>
                      ))}
                    </div>
                  </FormCard>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <FormCard label="Sillage (Projection)" help="How far the scent projects from the skin.">
                      <select value={sillage} onChange={(e) => setSillage(e.target.value)} style={inp}>
                        <option value="">— Select —</option>
                        {["Intimate","Moderate","Strong","Enormous"].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </FormCard>
                    <FormCard label="Longevity" help="How long it lasts on skin.">
                      <select value={longevity} onChange={(e) => setLongevity(e.target.value)} style={inp}>
                        <option value="">— Select —</option>
                        {["1-3 hours","3-6 hours","6-9 hours","9-12 hours","12+ hours"].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </FormCard>
                  </div>

                  <FormCard label="Best Season" help="When this fragrance is best worn.">
                    <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
                      {[["Spring","🌸"],["Summer","☀️"],["Autumn","🍂"],["Winter","❄️"],["All Year","✦"]].map(([val, ico]) => (
                        <button key={val} type="button" onClick={() => setSeasonRec(seasonRec === val ? "" : val)} style={{
                          padding: "0.5rem 0.875rem", border: `2px solid ${seasonRec === val ? "var(--color-primary)" : "var(--color-gray-200)"}`,
                          background: seasonRec === val ? "rgba(184,134,11,0.06)" : "transparent",
                          cursor: "pointer", fontFamily: "var(--font-montserrat),sans-serif",
                          fontSize: "0.625rem", letterSpacing: "0.05em", transition: "all 150ms",
                          color: seasonRec === val ? "var(--color-primary)" : "var(--color-gray-600)",
                        }}>{ico} {val}</button>
                      ))}
                    </div>
                  </FormCard>

                  <FormCard label="Perfumer / Creator" help="The name of the perfumer or creative director (optional).">
                    <input value={perfumerProfile} onChange={(e) => setPerfumerProfile(e.target.value)} placeholder="e.g. Jean-Claude Ellena" style={inp} />
                  </FormCard>

                  {/* Fragrance Notes */}
                  <FormCard label="Fragrance Notes" help="The scent pyramid — top notes hit first, heart notes emerge after 15 mins, base notes last longest.">
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {(["TOP", "HEART", "BASE"] as const).map((noteType) => {
                        const icon = noteType === "TOP" ? "🎵" : noteType === "HEART" ? "💛" : "🌱";
                        const label = noteType === "TOP" ? "Top Notes" : noteType === "HEART" ? "Heart Notes" : "Base Notes";
                        const desc = noteType === "TOP" ? "First impression — citrus, herbs, light florals" : noteType === "HEART" ? "The core — roses, jasmine, spices" : "Long-lasting — woods, musks, vanilla";
                        const thisNotes = notes.filter(n => n.type === noteType);
                        const indices = notes.map((n, i) => ({ n, i })).filter(({ n }) => n.type === noteType);
                        return (
                          <div key={noteType} style={{ border: "1px solid var(--color-gray-200)", padding: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                              <div>
                                <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.6875rem", fontWeight: 600, color: "var(--color-black)", margin: "0 0 2px" }}>{icon} {label}</p>
                                <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem", color: "var(--color-gray-600)", margin: 0 }}>{desc}</p>
                              </div>
                              <button type="button" onClick={() => addNote(noteType)} style={{ background: "var(--color-black)", color: "white", border: "none", padding: "0.35rem 0.75rem", cursor: "pointer", fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                + Add
                              </button>
                            </div>
                            {thisNotes.length === 0 ? (
                              <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem", color: "#9CA3AF", fontStyle: "italic" }}>No {label.toLowerCase()} added yet.</p>
                            ) : (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {indices.map(({ n, i }) => (
                                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "#F9FAFB", border: "1px solid var(--color-gray-200)", padding: "0.25rem 0.375rem 0.25rem 0.625rem" }}>
                                    <input value={n.name} onChange={(e) => setNoteField(i, "name", e.target.value)} placeholder="e.g. Rose" style={{ border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.6875rem", color: "var(--color-black)", width: "80px" }} />
                                    <button onClick={() => removeNote(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "0.875rem", lineHeight: 1, padding: "0 2px" }}>×</button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </FormCard>
                </>
              ) : (
                <>
                  <FormCard label="Material" required help="The primary material (e.g. '18k Gold Plated', 'Sterling Silver', 'Rose Gold')">
                    <input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g. 18k Gold Plated Sterling Silver" style={inp} />
                  </FormCard>

                  <FormCard label="Stone / Gemstone" help="The stone used, if any (e.g. 'Diamond', 'Pearl', 'Amethyst', 'No stone')">
                    <input value={stone} onChange={(e) => setStone(e.target.value)} placeholder="e.g. Freshwater Pearl" style={inp} />
                  </FormCard>

                  <FormCard label="Style" help="Who this piece is primarily designed for.">
                    <div style={{ display: "flex", gap: "0.625rem" }}>
                      {[["WOMEN","👩 Women"],["MEN","👨 Men"],["UNISEX","⟷ Unisex"]].map(([val,lbl]) => (
                        <button key={val} type="button" onClick={() => setGenderTag(genderTag === val ? "" : val)} style={{
                          flex: 1, padding: "0.625rem", border: `2px solid ${genderTag === val ? "var(--color-primary)" : "var(--color-gray-200)"}`,
                          background: genderTag === val ? "rgba(184,134,11,0.06)" : "transparent",
                          cursor: "pointer", fontFamily: "var(--font-montserrat),sans-serif",
                          fontSize: "0.625rem", letterSpacing: "0.05em", transition: "all 150ms",
                          color: genderTag === val ? "var(--color-primary)" : "var(--color-gray-600)",
                        }}>{lbl}</button>
                      ))}
                    </div>
                  </FormCard>
                </>
              )}
            </div>
          )}

          {/* ════ STEP 3: PRICING ════ */}
          {step === "pricing" && (
            <div style={{ maxWidth: "860px", display: "flex", flexDirection: "column", gap: "2rem" }}>
              <StepHeader title="Variants & Pricing" subtitle="Each variant is a separate option customers can buy (e.g. different sizes, colours, or quantities)." />

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {/* Header row */}
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 80px 40px", gap: "0.5rem", padding: "0 0.75rem" }}>
                  {["Option / Size", "SKU", "Price (GHS)", "Compare At", "Stock", ""].map((h) => (
                    <span key={h} style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-gray-600)", fontWeight: 600 }}>{h}</span>
                  ))}
                </div>

                {variants.map((v, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 80px 40px",
                    gap: "0.5rem", padding: "0.875rem 0.75rem",
                    background: "var(--color-white)", border: "1px solid var(--color-gray-200)",
                    alignItems: "center",
                  }}>
                    <input value={v.optionLabel} onChange={(e) => setVariantField(i, "optionLabel", e.target.value)}
                      placeholder={productType === "PERFUME" ? "50ml" : "Size 7 / Rose Gold"}
                      style={{ ...inp, padding: "0.5rem 0.625rem" }} />
                    <input value={v.sku} onChange={(e) => setVariantField(i, "sku", e.target.value.toUpperCase())}
                      placeholder="SKU-001"
                      style={{ ...inp, padding: "0.5rem 0.625rem", fontFamily: "monospace", letterSpacing: "0.05em" }} />
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "0.5rem", top: "50%", transform: "translateY(-50%)", fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem", color: "var(--color-gray-600)", pointerEvents: "none" }}>₵</span>
                      <input type="number" min="0" step="0.01" value={v.priceGHS} onChange={(e) => setVariantField(i, "priceGHS", e.target.value)}
                        placeholder="0.00" style={{ ...inp, padding: "0.5rem 0.5rem 0.5rem 1.5rem" }} />
                    </div>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "0.5rem", top: "50%", transform: "translateY(-50%)", fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem", color: "var(--color-gray-600)", pointerEvents: "none" }}>₵</span>
                      <input type="number" min="0" step="0.01" value={v.compareAtGHS} onChange={(e) => setVariantField(i, "compareAtGHS", e.target.value)}
                        placeholder="0.00" style={{ ...inp, padding: "0.5rem 0.5rem 0.5rem 1.5rem" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <button type="button" onClick={() => setVariantField(i, "stock", String(Math.max(0, parseInt(v.stock || "0") - 1)))}
                        style={{ width: "24px", height: "32px", border: "1px solid var(--color-gray-200)", background: "transparent", cursor: "pointer", fontSize: "1rem", color: "var(--color-gray-600)" }}>−</button>
                      <input type="number" min="0" value={v.stock} onChange={(e) => setVariantField(i, "stock", e.target.value)}
                        style={{ ...inp, padding: "0.5rem 0.375rem", textAlign: "center", width: "40px", flex: "none" }} />
                      <button type="button" onClick={() => setVariantField(i, "stock", String(parseInt(v.stock || "0") + 1))}
                        style={{ width: "24px", height: "32px", border: "1px solid var(--color-gray-200)", background: "transparent", cursor: "pointer", fontSize: "1rem", color: "var(--color-gray-600)" }}>+</button>
                    </div>
                    <button type="button" onClick={() => removeVariant(i)} disabled={variants.length === 1}
                      style={{ width: "32px", height: "32px", border: "1px solid #FECACA", background: "transparent", cursor: variants.length === 1 ? "not-allowed" : "pointer", color: "#EF4444", fontSize: "1.125rem", opacity: variants.length === 1 ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      ×
                    </button>
                  </div>
                ))}

                <button type="button" onClick={addVariant} style={{
                  padding: "0.75rem", border: "2px dashed var(--color-gray-200)", background: "transparent",
                  cursor: "pointer", fontFamily: "var(--font-montserrat),sans-serif",
                  fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "var(--color-gray-600)", transition: "all 150ms",
                }}
                  onMouseOver={(e) => { (e.currentTarget).style.borderColor = "var(--color-primary)"; (e.currentTarget).style.color = "var(--color-primary)"; }}
                  onMouseOut={(e) => { (e.currentTarget).style.borderColor = "var(--color-gray-200)"; (e.currentTarget).style.color = "var(--color-gray-600)"; }}
                >
                  + Add Another Variant
                </button>
              </div>

              {/* Help tip */}
              <div style={{ padding: "1rem 1.25rem", background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1D4ED8", margin: "0 0 0.375rem" }}>💡 Pricing tips</p>
                <ul style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem", color: "#1E40AF", margin: 0, paddingLeft: "1.25rem", lineHeight: 1.7 }}>
                  <li>Enter prices in Ghana Cedis (GHS) — e.g. 150 for ₵150</li>
                  <li>"Compare at" is the original price before a sale — shows as crossed out to customers</li>
                  <li>SKU must be unique across all products. E.g. ROSE-EDP-50ML</li>
                </ul>
              </div>
            </div>
          )}

          {/* ════ STEP 4: MEDIA ════ */}
          {step === "media" && (
            <div style={{ maxWidth: "720px", display: "flex", flexDirection: "column", gap: "2rem" }}>
              <StepHeader title="Images & SEO" subtitle="Add product photos and help search engines find your product." />

              {/* Images */}
              <FormCard label="Product Images" help="Add images by pasting a URL or uploading a file. The first image is used as the main photo.">
                {/* URL input */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                  <input
                    value={imagePreviewUrl}
                    onChange={(e) => setImagePreviewUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageByUrl(); } }}
                    placeholder="Paste an image URL… (https://…)"
                    style={{ ...inp, flex: 1 }}
                  />
                  <button type="button" onClick={addImageByUrl} style={{
                    background: "var(--color-black)", color: "white", border: "none",
                    padding: "0 1rem", cursor: "pointer", fontFamily: "var(--font-montserrat),sans-serif",
                    fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0,
                  }}>Add URL</button>
                </div>

                {/* File upload zone */}
                <label style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: "1.5rem", border: "2px dashed var(--color-gray-200)", cursor: "pointer",
                  marginBottom: "1rem", background: "#FAFAFA", transition: "all 150ms",
                }}
                  onDragOver={(e) => { e.preventDefault(); (e.currentTarget).style.borderColor = "var(--color-primary)"; }}
                  onDragLeave={(e) => { (e.currentTarget).style.borderColor = "var(--color-gray-200)"; }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    (e.currentTarget).style.borderColor = "var(--color-gray-200)";
                    const file = e.dataTransfer.files[0];
                    if (file) await uploadFile(-1, file);
                  }}
                >
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await uploadFile(-1, file);
                    e.target.value = "";
                  }} />
                  {uploadingIdx === -1 ? (
                    <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.75rem", color: "var(--color-primary)", margin: 0 }}>Uploading…</p>
                  ) : (
                    <>
                      <span style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📸</span>
                      <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.6875rem", color: "var(--color-gray-600)", margin: 0, textAlign: "center", lineHeight: 1.5 }}>
                        Drag & drop an image here, or <span style={{ color: "var(--color-primary)", textDecoration: "underline" }}>click to upload</span>
                      </p>
                      <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5rem", color: "#9CA3AF", marginTop: "0.25rem" }}>JPG, PNG, WebP — max 10MB</p>
                    </>
                  )}
                </label>

                {/* Image grid */}
                {images.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: "0.75rem" }}>
                    {images.map((img, i) => (
                      <div key={i} style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", background: "#F3F4F6" }}>
                        {img.url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={img.url} alt={img.altText || "Product"} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.currentTarget).style.display = "none"; }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: "1.5rem" }}>🖼</div>
                        )}
                        {i === 0 && (
                          <span style={{ position: "absolute", top: "4px", left: "4px", background: "var(--color-primary)", color: "white", fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.4375rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 5px" }}>Main</span>
                        )}
                        <button type="button" onClick={() => removeImage(i)} style={{
                          position: "absolute", top: "4px", right: "4px", width: "20px", height: "20px",
                          background: "rgba(0,0,0,0.7)", color: "white", border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", borderRadius: "2px",
                        }}>×</button>
                        {i > 0 && (
                          <button type="button" onClick={() => {
                            const arr = [...images];
                            [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                            setImages(arr);
                          }} style={{
                            position: "absolute", bottom: "4px", left: "4px", width: "20px", height: "20px",
                            background: "rgba(0,0,0,0.5)", color: "white", border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.625rem", borderRadius: "2px",
                          }}>↑</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {images.length === 0 && (
                  <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem", color: "#9CA3AF", fontStyle: "italic", textAlign: "center", padding: "0.5rem" }}>
                    No images yet. Add a URL above or drag & drop a file.
                  </p>
                )}
              </FormCard>

              {/* SEO */}
              <FormCard label="SEO" help="Optional: customise how this product appears in Google search results. Leave blank to use the product name automatically.">
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <FieldLabel>Search Title</FieldLabel>
                    <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={name || "Leave blank to use product name"} style={inp} maxLength={70} />
                    <CharCount value={seoTitle.length} max={70} />
                  </div>
                  <div>
                    <FieldLabel>Search Description</FieldLabel>
                    <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="A brief, compelling description for search results…" rows={3} style={ta} maxLength={160} />
                    <CharCount value={seoDesc.length} max={160} />
                  </div>
                </div>
              </FormCard>
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-gray-200)",
            maxWidth: step === "pricing" ? "860px" : "720px",
          }}>
            <button type="button" onClick={goPrev} disabled={currentStepIdx === 0} style={{
              padding: "0.75rem 1.5rem", border: "1px solid var(--color-gray-200)",
              background: "transparent", cursor: currentStepIdx === 0 ? "not-allowed" : "pointer",
              fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem",
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: currentStepIdx === 0 ? "var(--color-gray-200)" : "var(--color-gray-600)",
            }}>← Back</button>

            {isLastStep ? (
              <button type="button" onClick={handleSubmit} disabled={saving || saved} style={{
                padding: "0.875rem 2.5rem", border: "none",
                background: saved ? "#10B981" : saving ? "#9CA3AF" : "var(--color-primary)",
                color: "var(--color-white)", cursor: saving || saved ? "not-allowed" : "pointer",
                fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.6875rem",
                letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600,
              }}>
                {saved ? "✓ Published!" : saving ? "Saving…" : isEdit ? "Save Changes" : "Publish Product"}
              </button>
            ) : (
              <button type="button" onClick={goNext} style={{
                padding: "0.875rem 2rem", border: "none",
                background: "var(--color-black)", color: "var(--color-white)", cursor: "pointer",
                fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem",
                letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600,
              }}>
                Continue →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <h2 style={{ fontFamily: "var(--font-cormorant),Georgia,serif", fontSize: "2rem", fontWeight: 300, color: "var(--color-black)", margin: "0 0 0.375rem" }}>{title}</h2>
      <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.8125rem", color: "var(--color-gray-600)", margin: 0, lineHeight: 1.5 }}>{subtitle}</p>
    </div>
  );
}

function FormCard({ label, required, help, children }: { label: string; required?: boolean; help?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.375rem", marginBottom: "0.25rem" }}>
          <label style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-black)" }}>
            {label}
          </label>
          {required && <span style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5rem", color: "var(--color-primary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Required</span>}
        </div>
        {help && <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.6875rem", color: "var(--color-gray-600)", margin: 0, lineHeight: 1.5 }}>{help}</p>}
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-black)", marginBottom: "0.25rem" }}>{children}</label>;
}

function CharCount({ value, max }: { value: number; max: number }) {
  const pct = (value / max) * 100;
  const color = pct > 90 ? "#EF4444" : pct > 75 ? "#F59E0B" : "var(--color-gray-600)";
  return (
    <p style={{ fontFamily: "var(--font-montserrat),sans-serif", fontSize: "0.5rem", color, textAlign: "right", margin: "2px 0 0" }}>
      {value}/{max}
    </p>
  );
}
