import { cookies } from "next/headers";

export async function POST() {
  (await cookies()).delete("admin");

  return Response.json({
    success: true,
  });
}