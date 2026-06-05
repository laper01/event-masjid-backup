import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) return NextResponse.json({ message: "Token is missing" }, { status: 400 });
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/verify?token=${token}`, {
      method: "GET", headers: { "Content-Type": "application/json" }, cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
