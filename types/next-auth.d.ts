import "next-auth";

declare module "next-auth" {
  interface Session {
    sub?: string;
  }
}
