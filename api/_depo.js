// Cevaplar Upstash Redis'te tek bir listede tutulur (Vercel > Storage > Upstash for Redis).
// Entegrasyon eklendiğinde Vercel ortam değişkenlerini kendisi tanımlar; iki isim kalıbı da desteklenir.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const LISTE = "workshop:anket:2026-10-25";

async function redis(...komut) {
  if (!REDIS_URL || !TOKEN) throw new Error("Redis ortam değişkenleri tanımlı değil");
  const r = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(komut),
  });
  if (!r.ok) throw new Error(`Redis ${r.status}`);
  const { result, error } = await r.json();
  if (error) throw new Error(error);
  return result;
}

module.exports = { LISTE, redis };
