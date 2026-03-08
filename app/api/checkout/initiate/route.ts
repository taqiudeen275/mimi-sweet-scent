import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const cartItemSchema = z.object({
  variantId:    z.string(),
  quantity:     z.number().int().positive(),
  price:        z.number().int().positive(),
  productName:  z.string(),
  variantLabel: z.string(),
  imageUrl:     z.string(),
});

const checkoutSchema = z.object({
  email:    z.string().email(),
  phone:    z.string().min(7),
  provider: z.enum(["MTN", "VODAFONE", "AIRTELTIGO", "MPESA", "WAVE", "ORANGE"]),
  shippingAddress: z.object({
    name:    z.string().optional(),
    line1:   z.string(),
    city:    z.string(),
    country: z.string(),
    phone:   z.string().optional(),
  }),
  items: z.array(cartItemSchema).min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, phone, provider, shippingAddress, items } = parsed.data;

  // Verify variants exist and fetch canonical prices from DB
  const variantIds = items.map((i) => i.variantId);
  const dbVariants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, price: true, stock: true, product: { select: { id: true } } },
  });

  if (dbVariants.length !== variantIds.length) {
    return NextResponse.json({ error: "One or more items are no longer available." }, { status: 400 });
  }

  // Check stock
  for (const item of items) {
    const dbV = dbVariants.find((v) => v.id === item.variantId)!;
    if (dbV.stock < item.quantity) {
      return NextResponse.json({ error: `Insufficient stock for one or more items.` }, { status: 400 });
    }
  }

  // Calculate total using DB prices (not client-submitted prices)
  const totalAmount = dbVariants.reduce((sum, dbV) => {
    const item = items.find((i) => i.variantId === dbV.id)!;
    return sum + dbV.price * item.quantity;
  }, 0);

  // Create order in DB (PENDING until webhook confirms)
  const order = await prisma.order.create({
    data: {
      email,
      totalAmount,
      shippingAddress,
      status: "PENDING",
      paymentStatus: "UNPAID",
      items: {
        create: items.map((item) => {
          const dbV = dbVariants.find((v) => v.id === item.variantId)!;
          return {
            productVariantId: item.variantId,
            quantity: item.quantity,
            unitPrice: dbV.price,
            productSnapshot: {
              productName:  item.productName,
              variantLabel: item.variantLabel,
              imageUrl:     item.imageUrl,
              price:        dbV.price,
            },
          };
        }),
      },
    },
  });

  // Initiate Paystack Mobile Money charge
  const paystackRes = await fetch("https://api.paystack.co/charge", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: totalAmount,
      mobile_money: { phone, provider },
      metadata: { orderId: order.id },
    }),
  });

  const paystackData = await paystackRes.json();

  if (!paystackRes.ok || !paystackData.data?.reference) {
    // Clean up the order if Paystack fails
    await prisma.order.delete({ where: { id: order.id } });
    return NextResponse.json(
      { error: paystackData.message ?? "Payment initiation failed" },
      { status: 502 }
    );
  }

  // Save payment reference
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentRef: paystackData.data.reference },
  });

  return NextResponse.json({
    reference:    paystackData.data.reference,
    status:       paystackData.data.status,
    display_text: paystackData.data.display_text,
    orderId:      order.id,
  });
}
