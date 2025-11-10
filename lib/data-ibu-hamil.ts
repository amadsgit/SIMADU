// lib/data-posyandu.ts
import { prisma } from './prisma';

export async function getTotalIbuHamil() {
  const total = await prisma.ibuHamil.count();
  return total;
}
