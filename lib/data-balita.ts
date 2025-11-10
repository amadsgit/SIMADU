// lib/data-posyandu.ts
import { prisma } from './prisma';

export async function getTotalBalita() {
  const total = await prisma.balita.count();
  return total;
}
