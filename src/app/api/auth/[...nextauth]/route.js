import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        usuario: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.usuario || !credentials?.password) {
          return null;
        }

const user = await prisma.usuarios.findFirst({
  where: {
    usuario: credentials.usuario
  }
});


        if (!user) return null;

        const isValid = await compare(
          credentials.password,
          user.password
        );

        if (!isValid) return null;

        // 🔴 DEVOLVER OBJETO PLANO (CRÍTICO EN NEXTAUTH)
        return {
          id: user.id,
          usuario: user.usuario,
          access: user.access,
          role: user.admin,
          nombre: user.nombre
        };
      },
    }),
  ],

  session: {
    strategy: "jwt"
  },

  callbacks: {
    async jwt({ token, user }) {
      // user SOLO existe en el login
      if (user) {
        token.id = user.id;
        token.usuario = user.usuario;
        token.access = user.access;
        token.role = user.role;
        token.nombre = user.nombre;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.usuario = token.usuario;
      session.user.access = token.access;
      session.user.role = token.role;
      session.user.nombre = token.nombre;

      return session;
    },
  },

  pages: {
    signIn: "/login"
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
