import { getStore } from "@netlify/blobs";

export default async (req) => {
  const key = new URL(req.url).searchParams.get("key");
  if (!key) return new Response("Missing key", { status: 400 });

  const store = getStore("house-of-drip-images");
  const blob = await store.getWithMetadata(key, { type: "arrayBuffer" });

  if (!blob) return new Response("Not found", { status: 404 });

  return new Response(blob.data, {
    headers: {
      "content-type": blob.metadata?.contentType || "image/jpeg",
      "cache-control": "public, max-age=31536000, immutable"
    }
  });
};

export const config = { path: "/api/image" };