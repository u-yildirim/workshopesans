const { LISTE, redis } = require("./_depo.js");

const PUAN_5 = ["1", "2", "3", "4", "5"];
const PUAN_10 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const SURE = ["Kısaydı", "Tam kararındaydı", "Uzundu"];
const SEVILEN = [
  "Kendi parfümümü hazırlamak",
  "Notaları ve kokuları tanımak",
  "Parfümün tarihi ve hikayeleri",
  "Bilgi kartları",
  "Atmosfer ve mekan",
  "Yeni insanlarla tanışmak",
];

const metin = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const secim = (v, izinli) => (izinli.includes(v) ? v : "");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false });
  }
  let b = req.body || {};
  if (typeof b === "string") {
    try { b = JSON.parse(b || "{}"); } catch { return res.status(400).json({ ok: false }); }
  }

  // Bot tuzağı doluysa kaydetmeden başarılı dön
  if (metin(b.website, 200)) return res.status(200).json({ ok: true });

  const satir = {
    zaman: new Date().toISOString(),
    genel: secim(b.genel, PUAN_5),
    parfum: secim(b.parfum, PUAN_5),
    anlatim: secim(b.anlatim, PUAN_5),
    sure: secim(b.sure, SURE),
    oneri: secim(b.oneri, PUAN_10),
    sevilen: (Array.isArray(b.sevilen) ? b.sevilen : []).filter((x) => SEVILEN.includes(x)).join(" | "),
    istek: metin(b.istek, 1000),
    yorum: metin(b.yorum, 1500),
    ad: metin(b.ad, 80),
    // Instagram adı: baştaki @ ve link kısmı atılır, yalnızca harf, rakam, nokta ve alt çizgi kalır
    instagram: metin(b.instagram, 120).replace(/^.*instagram\.com\//i, "").replace(/^@+/, "").replace(/[^A-Za-z0-9._]/g, "").slice(0, 30),
    eposta: metin(b.eposta, 120),
    izin: b.izin === "evet" && metin(b.eposta, 120) ? "evet" : "hayır",
  };
  if (!satir.genel || !satir.oneri) return res.status(400).json({ ok: false });

  try {
    await redis("RPUSH", LISTE, JSON.stringify(satir));
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false });
  }
};
