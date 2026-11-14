import { getStore } from "@netlify/blobs";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async (req) => {
  const store = getStore("house-of-drip-data");

  if (req.method === "GET") {
    const products = (await store.get("products", { type: "json" })) || [];
    const settings = (await store.get("settings", { type: "json" })) || { logo: "", saleText: "" };
    
    return Response.json({ products, settings }, {
      headers: { "cache-control": "public, max-age=30" }
    });
  }

  if (req.method === "POST") {
    const auth = req.headers.get("x-admin-password");
    if (!auth || auth !== ADMIN_PASSWORD) {
      return new Response("Unauthorized", { status: 401 });
    }
    
    const body = await req.json();
    
    // Backward compatibility for old payloads
    if (Array.isArray(body)) {
      await store.setJSON("products", body);
    } else {
      if (body.products) await store.setJSON("products", body.products);
      if (body.settings) await store.setJSON("settings", body.settings);
    }
    
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/products" };
