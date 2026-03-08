import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load env files (same pattern as prisma.config.ts)
function loadEnvFile(filename: string) {
  const filePath = resolve(process.cwd(), filename);
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const eqIdx = trimmed.indexOf("=");
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Mimi's Sweet Scent...\n");

  // ── Admin user ──────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@mimi.com" },
    update: {},
    create: {
      email: "admin@mimi.com",
      name: "Mimi Admin",
      passwordHash: await hash("admin123", 12),
      role: "ADMIN",
    },
  });

  // ── Collections ─────────────────────────────────────────────────────────────
  const garden = await prisma.collection.upsert({
    where: { slug: "garden-collection" },
    update: {},
    create: {
      name: "The Garden Collection",
      slug: "garden-collection",
      description: "Florals reimagined — from dewy dawn petals to sun-drenched blooms.",
      bannerUrl: "https://images.unsplash.com/photo-1490750967868-88df5691cc1a?w=1400&q=80",
      position: 1,
    },
  });

  const noir = await prisma.collection.upsert({
    where: { slug: "noir-collection" },
    update: {},
    create: {
      name: "Noir Collection",
      slug: "noir-collection",
      description: "Deep. Mysterious. Unforgettable. Woods, resins, and shadows.",
      bannerUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1400&q=80",
      position: 2,
    },
  });

  const fineJewelry = await prisma.collection.upsert({
    where: { slug: "fine-jewelry" },
    update: {},
    create: {
      name: "Fine Jewelry",
      slug: "fine-jewelry",
      description: "Handcrafted pieces in 18k gold and sterling silver.",
      bannerUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1400&q=80",
      position: 3,
    },
  });

  // ── Categories ───────────────────────────────────────────────────────────────
  const [women, men, unisex, rings, necklaces, bracelets] = await Promise.all([
    prisma.category.upsert({ where: { slug: "women" }, update: {}, create: { name: "Women", slug: "women", productType: "PERFUME" } }),
    prisma.category.upsert({ where: { slug: "men" }, update: {}, create: { name: "Men", slug: "men", productType: "PERFUME" } }),
    prisma.category.upsert({ where: { slug: "unisex" }, update: {}, create: { name: "Unisex", slug: "unisex", productType: null } }),
    prisma.category.upsert({ where: { slug: "rings" }, update: {}, create: { name: "Rings", slug: "rings", productType: "JEWELRY" } }),
    prisma.category.upsert({ where: { slug: "necklaces" }, update: {}, create: { name: "Necklaces", slug: "necklaces", productType: "JEWELRY" } }),
    prisma.category.upsert({ where: { slug: "bracelets" }, update: {}, create: { name: "Bracelets", slug: "bracelets", productType: "JEWELRY" } }),
  ]);

  // ── Perfumes ─────────────────────────────────────────────────────────────────
  const perfumes = [
    {
      name: "Rose Lumière", slug: "rose-lumiere",
      description: "A luminous floral built on Bulgarian rose absolute, softened by white musk and warmed by sandalwood. An eternal ode to femininity.",
      tagline: "Where roses meet morning light",
      concentration: "EDP" as const, genderTag: "WOMEN" as const,
      collectionId: garden.id,
      sillage: "Moderate to strong", longevity: "8–12 hours", seasonRec: "Spring, Summer",
      perfumerProfile: "Inspired by the rose gardens of Grasse",
      imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
      notes: [
        { type: "TOP" as const, name: "Pink Pepper" }, { type: "TOP" as const, name: "Bergamot" },
        { type: "HEART" as const, name: "Bulgarian Rose" }, { type: "HEART" as const, name: "Peony" },
        { type: "BASE" as const, name: "Sandalwood" }, { type: "BASE" as const, name: "White Musk" },
      ],
      variants: [
        { optionLabel: "30ml", sku: "RL-30", price: 45000, stock: 12 },
        { optionLabel: "50ml", sku: "RL-50", price: 75000, compareAtPrice: 90000, stock: 8 },
        { optionLabel: "100ml", sku: "RL-100", price: 120000, stock: 5 },
      ],
      categories: [women.id],
    },
    {
      name: "Oud Mystique", slug: "oud-mystique",
      description: "A journey to the souks of the Middle East. Rich oud meets amber and rose petals in a fragrance of extraordinary depth.",
      tagline: "Ancient woods, modern soul",
      concentration: "PARFUM" as const, genderTag: "UNISEX" as const,
      collectionId: noir.id,
      sillage: "Very strong", longevity: "14–18 hours", seasonRec: "Autumn, Winter",
      perfumerProfile: "Crafted with sustainably sourced oud",
      imageUrl: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80",
      notes: [
        { type: "TOP" as const, name: "Saffron" }, { type: "TOP" as const, name: "Cardamom" },
        { type: "HEART" as const, name: "Oud" }, { type: "HEART" as const, name: "Rose Absolute" },
        { type: "BASE" as const, name: "Amber" }, { type: "BASE" as const, name: "Vetiver" },
      ],
      variants: [
        { optionLabel: "30ml", sku: "OM-30", price: 95000, stock: 6 },
        { optionLabel: "50ml", sku: "OM-50", price: 155000, stock: 4 },
      ],
      categories: [unisex.id],
    },
    {
      name: "Jardin de Nuit", slug: "jardin-de-nuit",
      description: "White florals bloom after sunset. Tuberose and jasmine woven with warm amber and night-blooming musk.",
      tagline: "The garden after dark",
      concentration: "EDP" as const, genderTag: "WOMEN" as const,
      collectionId: noir.id,
      sillage: "Strong", longevity: "10–14 hours", seasonRec: "All seasons",
      perfumerProfile: "White floral nocturnal accord",
      imageUrl: "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800&q=80",
      notes: [
        { type: "TOP" as const, name: "Neroli" }, { type: "TOP" as const, name: "Green Leaves" },
        { type: "HEART" as const, name: "Tuberose" }, { type: "HEART" as const, name: "Jasmine Sambac" },
        { type: "BASE" as const, name: "Amber" }, { type: "BASE" as const, name: "Night Musk" },
      ],
      variants: [
        { optionLabel: "50ml", sku: "JN-50", price: 80000, stock: 10 },
        { optionLabel: "100ml", sku: "JN-100", price: 130000, compareAtPrice: 150000, stock: 7 },
      ],
      categories: [women.id],
    },
    {
      name: "Bois Sauvage", slug: "bois-sauvage",
      description: "A rugged, untamed woodland. Cedar, vetiver, and a breath of fresh air — the forest at first light.",
      tagline: "Where civilization ends",
      concentration: "EDT" as const, genderTag: "MEN" as const,
      collectionId: noir.id,
      sillage: "Moderate", longevity: "6–8 hours", seasonRec: "Autumn, Winter",
      perfumerProfile: "A tribute to raw masculine elegance",
      imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80",
      notes: [
        { type: "TOP" as const, name: "Bergamot" }, { type: "TOP" as const, name: "Black Pepper" },
        { type: "HEART" as const, name: "Cedarwood" }, { type: "HEART" as const, name: "Cardamom" },
        { type: "BASE" as const, name: "Vetiver" }, { type: "BASE" as const, name: "Tobacco" },
      ],
      variants: [
        { optionLabel: "50ml", sku: "BS-50", price: 65000, stock: 15 },
        { optionLabel: "100ml", sku: "BS-100", price: 100000, stock: 9 },
      ],
      categories: [men.id],
    },
    {
      name: "Fleur Céleste", slug: "fleur-celeste",
      description: "Delicate. Translucent. A whisper of iris and violet leaf lifted by sheer musks. Wear it like a second skin.",
      tagline: "Light as morning dew",
      concentration: "EDP" as const, genderTag: "WOMEN" as const,
      collectionId: garden.id,
      sillage: "Light to moderate", longevity: "6–8 hours", seasonRec: "Spring, Summer",
      perfumerProfile: "Modern powdery-floral",
      imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80",
      notes: [
        { type: "TOP" as const, name: "Violet Leaf" }, { type: "TOP" as const, name: "Lemon" },
        { type: "HEART" as const, name: "Iris" }, { type: "HEART" as const, name: "Magnolia" },
        { type: "BASE" as const, name: "White Musk" }, { type: "BASE" as const, name: "Cashmere Wood" },
      ],
      variants: [
        { optionLabel: "30ml", sku: "FC-30", price: 40000, stock: 20 },
        { optionLabel: "50ml", sku: "FC-50", price: 68000, stock: 12 },
        { optionLabel: "100ml", sku: "FC-100", price: 110000, compareAtPrice: 125000, stock: 6 },
      ],
      categories: [women.id],
    },
    {
      name: "Ambre Solaire", slug: "ambre-solaire",
      description: "Golden warmth. Benzoin, vanilla, and labdanum capture the last rays of a Mediterranean sunset.",
      tagline: "Bottled sunlight",
      concentration: "EDP" as const, genderTag: "UNISEX" as const,
      collectionId: noir.id,
      sillage: "Strong", longevity: "10–12 hours", seasonRec: "All seasons",
      perfumerProfile: "Warm oriental accord",
      imageUrl: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80",
      notes: [
        { type: "TOP" as const, name: "Mandarin" }, { type: "TOP" as const, name: "Ginger" },
        { type: "HEART" as const, name: "Labdanum" }, { type: "HEART" as const, name: "Benzoin" },
        { type: "BASE" as const, name: "Vanilla" }, { type: "BASE" as const, name: "Musk" },
      ],
      variants: [
        { optionLabel: "50ml", sku: "AS-50", price: 72000, stock: 8 },
        { optionLabel: "100ml", sku: "AS-100", price: 115000, stock: 5 },
      ],
      categories: [unisex.id],
    },
  ];

  for (const p of perfumes) {
    const { notes, variants, categories: cats, imageUrl, ...data } = p;
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        productType: "PERFUME",
        status: "ACTIVE",
        seoTitle: `${data.name} | Mimi's Sweet Scent`,
        seoDesc: data.description.slice(0, 160),
        images: {
          create: [
            { url: imageUrl, altText: data.name, position: 0 },
            { url: imageUrl.replace("w=800", "w=600"), altText: `${data.name} — detail`, position: 1 },
          ],
        },
        fragranceNotes: { create: notes },
        variants: { create: variants.map(v => ({ ...v, weight: 200 })) },
      },
    });
    await prisma.product.update({
      where: { id: product.id },
      data: { categories: { connect: cats.map(id => ({ id })) } },
    });
  }

  // ── Jewelry ──────────────────────────────────────────────────────────────────
  const jewelry = [
    {
      name: "Celeste Solitaire Ring", slug: "celeste-solitaire-ring",
      description: "A timeless round brilliant diamond set in 18k yellow gold. The solitaire that endures.",
      tagline: "One stone, infinite story",
      material: "18k Yellow Gold", stone: "Diamond",
      genderTag: "WOMEN" as const, collectionId: fineJewelry.id,
      imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
      variants: [
        { optionLabel: "Size 5", sku: "CSR-5", price: 350000, stock: 3 },
        { optionLabel: "Size 6", sku: "CSR-6", price: 350000, stock: 5 },
        { optionLabel: "Size 7", sku: "CSR-7", price: 350000, stock: 4 },
        { optionLabel: "Size 8", sku: "CSR-8", price: 350000, stock: 2 },
      ],
      categories: [rings.id],
    },
    {
      name: "Luna Crescent Necklace", slug: "luna-crescent-necklace",
      description: "A crescent moon pendant pavé-set with white sapphires on a delicate 18-inch chain. Wear the night sky.",
      tagline: "Wear the night sky",
      material: "Sterling Silver", stone: "White Sapphire",
      genderTag: "WOMEN" as const, collectionId: fineJewelry.id,
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
      variants: [
        { optionLabel: "16 inch", sku: "LCN-16", price: 180000, compareAtPrice: 220000, stock: 8 },
        { optionLabel: "18 inch", sku: "LCN-18", price: 180000, compareAtPrice: 220000, stock: 10 },
        { optionLabel: "20 inch", sku: "LCN-20", price: 195000, stock: 6 },
      ],
      categories: [necklaces.id],
    },
    {
      name: "Étoile Stacking Ring", slug: "etoile-stacking-ring",
      description: "A slender band of pavé diamonds — the perfect partner or the statement alone. In 18k rose gold.",
      tagline: "Stack your story",
      material: "18k Rose Gold", stone: "Diamond",
      genderTag: "WOMEN" as const, collectionId: fineJewelry.id,
      imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
      variants: [
        { optionLabel: "Size 5", sku: "ESR-5", price: 195000, stock: 6 },
        { optionLabel: "Size 6", sku: "ESR-6", price: 195000, stock: 8 },
        { optionLabel: "Size 7", sku: "ESR-7", price: 195000, stock: 5 },
      ],
      categories: [rings.id],
    },
    {
      name: "Soleil Cuff Bracelet", slug: "soleil-cuff-bracelet",
      description: "A bold open cuff in hammered 18k gold that catches light with every movement.",
      tagline: "Bold as the sun",
      material: "18k Yellow Gold", stone: null,
      genderTag: "UNISEX" as const, collectionId: fineJewelry.id,
      imageUrl: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80",
      variants: [
        { optionLabel: 'Small (6.5")', sku: "SCB-S", price: 420000, stock: 4 },
        { optionLabel: 'Medium (7")', sku: "SCB-M", price: 420000, stock: 6 },
        { optionLabel: 'Large (7.5")', sku: "SCB-L", price: 420000, stock: 3 },
      ],
      categories: [bracelets.id],
    },
    {
      name: "Rosette Pendant", slug: "rosette-pendant",
      description: "A rose-cut ruby pendant suspended from a yellow gold box chain. Romantic and singular.",
      tagline: "A ruby for every rose",
      material: "18k Yellow Gold", stone: "Ruby",
      genderTag: "WOMEN" as const, collectionId: fineJewelry.id,
      imageUrl: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80",
      variants: [
        { optionLabel: "16 inch", sku: "RP-16", price: 280000, stock: 5 },
        { optionLabel: "18 inch", sku: "RP-18", price: 280000, stock: 7 },
      ],
      categories: [necklaces.id],
    },
    {
      name: "Noir Signet Ring", slug: "noir-signet-ring",
      description: "A modern reinterpretation of the signet. Flat face in 18k gold with a brushed finish.",
      tagline: "Your mark on the world",
      material: "18k Yellow Gold", stone: null,
      genderTag: "UNISEX" as const, collectionId: fineJewelry.id,
      imageUrl: "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=800&q=80",
      variants: [
        { optionLabel: "Size 7", sku: "NSR-7", price: 310000, stock: 4 },
        { optionLabel: "Size 8", sku: "NSR-8", price: 310000, stock: 6 },
        { optionLabel: "Size 9", sku: "NSR-9", price: 310000, stock: 3 },
        { optionLabel: "Size 10", sku: "NSR-10", price: 310000, stock: 2 },
      ],
      categories: [rings.id, unisex.id],
    },
  ];

  for (const j of jewelry) {
    const { variants, categories: cats, imageUrl, ...data } = j;
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        productType: "JEWELRY",
        status: "ACTIVE",
        seoTitle: `${data.name} | Mimi's Sweet Scent`,
        seoDesc: data.description.slice(0, 160),
        images: { create: [{ url: imageUrl, altText: data.name, position: 0 }] },
        variants: { create: variants.map(v => ({ ...v, weight: 50 })) },
      },
    });
    await prisma.product.update({
      where: { id: product.id },
      data: { categories: { connect: cats.map(id => ({ id })) } },
    });
  }

  console.log("✅ Seeding complete!");
  console.log("   • Admin: admin@mimi.com / admin123");
  console.log(`   • ${perfumes.length} perfumes`);
  console.log(`   • ${jewelry.length} jewelry pieces`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
