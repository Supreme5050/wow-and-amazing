import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This checkout endpoint has been replaced by the secure Paystack initialization and confirmation flow." },
    { status: 410 },
  );
}
