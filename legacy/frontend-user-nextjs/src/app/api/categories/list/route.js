import { connectDB } from "@/lib/mongodb";
import Categories from "@/models/Categories";
import { NextResponse } from "next/server";

// CORS helper (clean + reusable)
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

// OPTIONS (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

// GET /api/categories
export async function GET() {
  try {
    await connectDB();

    const categories = await Categories.find({}, "title link misc");

    return NextResponse.json(
      { categories },
      { status: 200, headers: corsHeaders() }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}