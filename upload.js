import { getStore } from "@netlify/blobs";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const auth = req.headers.get("x-admin-password");
  if (!auth || auth !== ADMIN_PASSWORD) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("image");
  const key = formData.get("key"); // e.g. "product-1-black-red.jpg"

  if (!file || !key) {
    return new Response("Missing file or key", { status: 400 });
  }
  if (file.size > 4 * 1024 * 1024) {
    return new Response("Image too large (max 4MB)", { status: 413 });
  }

  const store = getStore("house-of-drip-images");
  const buffer = await file.arrayBuffer();
  await store.set(key, buffer, {
    metadata: { contentType: file.type || "image/jpeg" }
  });

  return Response.json({
    url: `/api/image?key=${encodeURIComponent(key)}`
  });
};

export const config = { path: "/api/upload" };
