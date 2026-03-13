import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    "unknown";

  await prisma.visitor.create({
    data: { ip },
  });

  const total = await prisma.visitor.count();

  return NextResponse.json({ total });
}