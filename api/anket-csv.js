const { timingSafeEqual } = require("node:crypto");
const { LISTE, redis } = require("./_depo.js");

// Cevapları CSV olarak indirir: /api/anket-csv?anahtar=...  (anahtar = ANKET_ANAHTAR ortam değişkeni)
const SUTUNLAR = [
  ["zaman", "Tarih"],
  ["genel", "Genel puan (1-5)"],
  ["sevilen", "En çok sevdikleri"],
  ["parfum", "Parfüm memnuniyeti (1-5)"],
  ["anlatim", "Anlatım (1-5)"],
  ["sure", "Süre"],
  ["oneri", "Önerme olasılığı (0-10)"],
  ["istek", "Sonraki atölye isteği"],
  ["yorum", "Ek yorum"],
  ["ad", "Ad"],
  ["eposta", "E-posta"],
  ["izin", "E-posta izni"],
];

function esit(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

const hucre = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function trSaat(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso || "";
  return d.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
}

module.exports = async function handler(req, res) {
  const anahtar = process.env.ANKET_ANAHTAR;
  if (!anahtar || !esit(req.query.anahtar || "", anahtar)) return res.status(401).send("Yetkisiz");

  try {
    const kayitlar = (await redis("LRANGE", LISTE, "0", "-1")) || [];
    const satirlar = kayitlar.map((k) => {
      let o = {};
      try { o = JSON.parse(k); } catch {}
      o.zaman = trSaat(o.zaman);
      return SUTUNLAR.map(([alan]) => hucre(o[alan])).join(",");
    });
    const csv = "﻿" + [SUTUNLAR.map(([, baslik]) => hucre(baslik)).join(","), ...satirlar].join("\r\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="atolye-anket-cevaplari.csv"');
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(csv);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Cevaplar okunamadı");
  }
};
