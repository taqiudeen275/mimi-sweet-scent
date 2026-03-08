import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const checkoutSchema = z.object({
  email:    z.string().email(),
  amount:   z.number().int().positive(), // in kobo/pesewas
  phone:    z.string().min(7),
  provider: z.enum(["MTN", "VODAFONE", "AIRTELTIGO", "MPESA", "WAVE", "ORANGE"]),
  // Order metadata
  cartId:   z.string(),
  shippingAddress: z.object({
    line1:   z.string(),
    city:    z.string(),
    country: z.string(),
  }),
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, amount, phone, provider } = parsed.data;

  const paystackRes = await fetch("https://api.paystack.co/charge", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      mobile_money: { phone, provider },
    }),
  });

  if (!paystackRes.ok) {
    const err = await paystackRes.json();
    return NextResponse.json({ error: err.message ?? "Payment initiation failed" }, { status: 502 });
  }

  const data = await paystackRes.json();
  return NextResponse.json({
    reference:    data.data?.reference,
    status:       data.data?.status,
    display_text: data.data?.display_text,
  });
}
