import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { username, password } =
    await request.json();

  if (
    username === "matias" &&
    password === process.env.ADMIN_PASSWORD
  ) {
    (await cookies()).set(
      "admin",
      "true"
    );

    return Response.json({
      success: true,
    });
  }

  return Response.json(
    {
      success: false,
    },
    { status: 401 }
  );
}