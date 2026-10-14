// Saves and loads a learner's progress in Netlify Blobs, keyed by a 6-digit code.
//   POST /api/progress            body: progress JSON -> { code }  (makes a new code)
//   PUT  /api/progress?code=123456 body: progress JSON -> { ok: true }
//   GET  /api/progress?code=123456                     -> progress JSON, or 404
import { randomInt } from "node:crypto";
import { getStore } from "@netlify/blobs";

const CODE = /^\d{6}$/;
const MAX_BYTES = 200_000;

const reply = (body, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

async function readBody(req) {
  const text = await req.text();
  if (text.length > MAX_BYTES) return { error: reply({ error: "too big" }, 413) };
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("not an object");
    return { data };
  } catch {
    return { error: reply({ error: "bad json" }, 400) };
  }
}

export default async (req) => {
  const store = getStore({ name: "progress", consistency: "strong" });
  const code = new URL(req.url).searchParams.get("code") || "";

  if (req.method === "GET") {
    if (!CODE.test(code)) return reply({ error: "bad code" }, 400);
    const data = await store.get(code, { type: "json" });
    return data ? reply(data) : reply({ error: "not found" }, 404);
  }

  if (req.method === "POST") {
    const { data, error } = await readBody(req);
    if (error) return error;
    for (let i = 0; i < 20; i++) {
      const fresh = String(randomInt(100000, 1000000));
      const { modified } = await store.setJSON(fresh, data, { onlyIfNew: true });
      if (modified) return reply({ code: fresh }, 201);
    }
    return reply({ error: "no free code" }, 503);
  }

  if (req.method === "PUT") {
    if (!CODE.test(code)) return reply({ error: "bad code" }, 400);
    const { data, error } = await readBody(req);
    if (error) return error;
    await store.setJSON(code, data);
    return reply({ ok: true });
  }

  return reply({ error: "method not allowed" }, 405);
};

export const config = { path: "/api/progress" };
