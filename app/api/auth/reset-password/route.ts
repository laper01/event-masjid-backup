import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, new_password, confirm_password } = body;
    if (!token || !new_password || !confirm_password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password, confirm_password }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
