import { NextResponse } from "next/server";
import FawaterkService from "@/lib/fawaterk";

// For demo purposes, we use a default key if not provided
// In production, this should come from your database per tenant
const DEFAULT_API_KEY = "33519f37762e0a1fa5bb195d0ab4e08314280b68e11138f56d";

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, data, apiKey, isSandbox = true } = body;

    const fawaterk = new FawaterkService(apiKey || DEFAULT_API_KEY, isSandbox);

    if (action === "createInvoice") {
      console.log("Fawaterk Request Payload:", JSON.stringify(data, null, 2));
      const result = await fawaterk.createInvoice(data);
      console.log("Fawaterk Response:", JSON.stringify(result, null, 2));
      return NextResponse.json(result);
    }

    if (action === "getInvoiceData") {
      const result = await fawaterk.getInvoiceData(data.invoiceId);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { status: "error", message: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}
