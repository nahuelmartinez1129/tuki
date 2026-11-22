import { cookies } from "next/headers";
import { COOKIE_ADMIN } from "@/lib/sesion";

export async function POST() {
  const jar = await cookies();

  jar.delete(COOKIE_ADMIN);
  jar.delete("admin");

  return Response.json({
    success: true,
  });
}
