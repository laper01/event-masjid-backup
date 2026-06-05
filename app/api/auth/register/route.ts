import { NextRequest, NextResponse } from "next/server";
import { proxyPOST } from "@/lib/proxyHelper";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, username, password, firstName, lastName, phoneNumber, gender } = body;
    const missing: string[] = [];
    if (!email) missing.push("email");
    if (!username) missing.push("username");
    if (!password) missing.push("password");
    if (!firstName) missing.push("firstName");
    if (!lastName) missing.push("lastName");
    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed.", errors: Object.fromEntries(missing.map((f) => [f, [`${f} is required.`]])) },
        { status: 422 }
      );
    }
    const backendPayload = { email, username, password, first_name: firstName, last_name: lastName, phone_number: phoneNumber, gender };
    const newHeaders = new Headers(req.headers);
    newHeaders.delete("content-length");
    newHeaders.set("content-type", "application/json");
    const modifiedReq = new Request(req.url, { method: "POST", headers: newHeaders, body: JSON.stringify(backendPayload) });
    return proxyPOST(modifiedReq, "/auth/register", undefined);
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
