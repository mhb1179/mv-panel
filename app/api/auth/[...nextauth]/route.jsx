import NextAuth from "next-auth";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
const handler = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          const admin = await prisma.admin.findFirst({
            where: { username: credentials.username },
          });
          if (!admin) throw new Error("نام کاربری یا رمز عبور اشتباه است.");
          if (admin.password != credentials.password)
            throw new Error("نام کاربری یا رمز عبور اشتباه است.");
          if (admin.active === false)
            throw new Error("ادمین اجازه ورود به پنل را ندارد.");
          //successfull login
          return admin;
        } catch (error) {
          throw new Error(error);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      token.grade = user ? user.grade : token.grade;
      token.username = user ? user.username : token.username;
      token.id = user ? user.id : token.id;
      return { ...token };
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.grade = token.grade;
        session.user.username = token.username;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
});

export { handler as GET, handler as POST };
