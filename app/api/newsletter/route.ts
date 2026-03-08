import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Please provide a valid email address."),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message ?? "Invalid email." },
        { status: 400 }
      );
    }

    // TODO: Integrate with Mailchimp / Klaviyo / etc.
    // For now, just acknowledge the subscription.
    return NextResponse.json(
      { success: true, message: "You're on the list!" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
