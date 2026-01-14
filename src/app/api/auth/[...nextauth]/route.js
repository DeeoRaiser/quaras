import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { compare } from "bcrypt";
import { getConnection } from "@/lib/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        usuario: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const conn = await getConnection();
        const [rows] = await conn.execute(
          "SELECT * FROM usuarios WHERE usuario = ? LIMIT 1",
          [credentials.usuario]
        );

        if (!rows.length) return null;

        const user = rows[0];
        const isValid = await compare(credentials.password, user.password);

        if (!isValid) return null;

        // 🔹 DEVOLVER EL USER PLANO
        return {
          id: user.id,
          usuario: user.usuario,
          access: user.access,
          role: user.admin,
          nombre: user.nombre,
          // podés agregar todos los campos que quieras
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      // user existe solo al hacer login
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

  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
