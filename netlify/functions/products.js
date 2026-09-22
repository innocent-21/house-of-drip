import { getStore } from "@netlify/blobs";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async (req) => {
  const store = getStore("house-of-drip-data");

  // PUBLIC: anyone can read the catalogue
  if (req.method === "GET") {
    const products = (await store.get("products", { type: "json" })) || [];
    return Response.json(products, {
      headers: { "cache-control": "public, max-age=60" }
    });
  }

  // ADMIN ONLY: save the catalogue
  if (req.method === "POST") {
    const auth = req.headers.get("x-admin-password");
    if (!auth || auth !== ADMIN_PASSWORD) {
      return new Response("Unauthorized", { status: 401 });
    }
    const { products } = await req.json();
    if (!Array.isArray(products)) {
      return new Response("Invalid payload", { status: 400 });
    }
    await store.setJSON("products", products);
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/products" };