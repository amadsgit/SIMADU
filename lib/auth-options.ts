import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const schema = z.object({
          email: z.string().email(),
          password: z.string(),
        });

        const { email, password } = schema.parse(credentials);

        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: true },
        });

        if (!user) throw new Error("Pengguna tidak ditemukan");
        if (!user.password) throw new Error("Akun tidak memiliki password");
        if (!user.verifiedAt) throw new Error("Akun belum diverifikasi");

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error("Password salah");

        return {
          id: user.id,
          email: user.email,
          name: user.nama,
          role: user.role.slug,
          verifiedAt: user.verifiedAt.toISOString(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.verifiedAt = user.verifiedAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.verifiedAt = token.verifiedAt as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
