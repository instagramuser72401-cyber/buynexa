// Creates the first admin user, default delivery settings, and a few
// demo categories/products so the storefront isn't empty on first run.
// Run: node prisma/seed.js  (after `npx prisma db push`)
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // --- Admin user ---
  const email = process.env.ADMIN_SEED_EMAIL || "admin@buynexa.com";
  const password = process.env.ADMIN_SEED_PASSWORD || "ChangeThisImmediately123!";

  const existingAdmin = await prisma.adminUser.findUnique({ where: { email } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.adminUser.create({
      data: { email, passwordHash, name: "Super Admin", role: "superadmin" },
    });
    console.log(`Admin user created: ${email} (change the password after first login!)`);
  } else {
    console.log("Admin user already exists, skipping.");
  }

  // --- Delivery settings ---
  await prisma.deliverySettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      fixedCharge: Number(process.env.DEFAULT_DELIVERY_CHARGE || 49),
      freeDeliveryAbove: Number(process.env.FREE_DELIVERY_ABOVE || 999),
    },
  });

  // --- Demo categories ---
  const categoryDefs = [
    { name: "Electronics", slug: "electronics" },
    { name: "Fashion", slug: "fashion" },
    { name: "Home & Kitchen", slug: "home-kitchen" },
    { name: "Beauty", slug: "beauty" },
  ];
  const categories = {};
  for (const c of categoryDefs) {
    categories[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  // --- Demo products (placeholder images - replace via Admin > Products) ---
  const productDefs = [
    {
      sku: "ELEC-001", name: "Wireless Bluetooth Earbuds", slug: "wireless-bluetooth-earbuds",
      description: "True wireless earbuds with 24-hour battery life and active noise cancellation.",
      specifications: [{ key: "Battery", value: "24 hrs with case" }, { key: "Bluetooth", value: "5.3" }],
      price: 1499, originalPrice: 2999, stock: 40, categoryId: categories["electronics"].id,
      isFeatured: true, isBestseller: true,
      images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600"],
    },
    {
      sku: "ELEC-002", name: "Smart Fitness Band", slug: "smart-fitness-band",
      description: "Track steps, heart rate, and sleep with a bright AMOLED display.",
      specifications: [{ key: "Display", value: "1.1\" AMOLED" }, { key: "Water resistance", value: "IP68" }],
      price: 1299, originalPrice: 1999, stock: 25, categoryId: categories["electronics"].id,
      isFeatured: true, images: ["https://images.unsplash.com/photo-1575311373937-8f8b52ceb3e0?w=600"],
    },
    {
      sku: "FASH-001", name: "Men's Cotton Casual Shirt", slug: "mens-cotton-casual-shirt",
      description: "Breathable 100% cotton shirt, perfect for everyday wear.",
      specifications: [{ key: "Material", value: "100% Cotton" }, { key: "Fit", value: "Regular" }],
      price: 699, originalPrice: 1199, stock: 60, categoryId: categories["fashion"].id,
      isBestseller: true, images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"],
    },
    {
      sku: "HOME-001", name: "Non-Stick Cooking Pan Set (3 pcs)", slug: "non-stick-cooking-pan-set",
      description: "Durable non-stick pan set - ideal for everyday Indian cooking.",
      specifications: [{ key: "Material", value: "Aluminium, non-stick coating" }, { key: "Pieces", value: "3" }],
      price: 1099, originalPrice: 1799, stock: 30, categoryId: categories["home-kitchen"].id,
      images: ["https://images.unsplash.com/photo-1584990347449-a3d3d0c2d2e0?w=600"],
    },
    {
      sku: "BEAUTY-001", name: "Herbal Face Wash 150ml", slug: "herbal-face-wash-150ml",
      description: "Gentle daily face wash with neem and tulsi extracts.",
      specifications: [{ key: "Volume", value: "150ml" }, { key: "Skin type", value: "All" }],
      price: 199, originalPrice: 299, stock: 100, categoryId: categories["beauty"].id,
      images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600"],
    },
  ];

  for (const p of productDefs) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) continue;
    await prisma.product.create({
      data: {
        sku: p.sku, name: p.name, slug: p.slug, description: p.description,
        specifications: p.specifications, price: p.price, originalPrice: p.originalPrice,
        stock: p.stock, categoryId: p.categoryId,
        isFeatured: !!p.isFeatured, isBestseller: !!p.isBestseller,
        images: { create: p.images.map((url, i) => ({ url, sortOrder: i })) },
      },
    });
  }

  console.log("Seed complete. Demo categories & products added (if not already present).");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
