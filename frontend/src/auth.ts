import NextAuth from "next-auth"
// import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    // GitHub
  ],
  pages: {
    signIn: "/login", 
  },
  callbacks: {
    // Reason: This function runs on EVERY page load to check if the user is allowed there.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname === "/";
      const isOnLoginPage = nextUrl.pathname === "/login";

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; 
      } else if (isOnLoginPage && isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl)); 
      }
      return true;
    },
  },
})