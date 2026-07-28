// app/api/revenue/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(
      "http://hima-01.ordermatic.tech:30309/graphs/revenue_trends_dashboard",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
          "X-API-Key": "XgshOzUVLPgvzOrY_AVz0d8sMU57Cd5crVdP-2HnIYY",
        },
        body: JSON.stringify(body),
      }
    );

    const rawText = await response.text();

    if (!response.ok) {
      console.error(`Backend returned ${response.status}:`, rawText);
      return NextResponse.json(
        { details: `Backend error (${response.status}): ${rawText}` },
        { status: response.status }
      );
    }

    // Try parsing JSON safely
    const data = JSON.parse(rawText);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { details: error.message || "Failed to reach internal server" },
      { status: 500 }
    );
  }
}