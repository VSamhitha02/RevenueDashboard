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
          "X-API-Key":
            "XgshOzUVLPgvzOrY_AVz0d8sMU57Cd5crVdP-2HnIYY",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch revenue data");
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}