import BBU from './bbu.json'; // 0..60 months
import TBU_24_60 from './tbu.json'; // 24..60 months (HAZ)
import TBU_WEEKS_0_13 from './tbu_weeks_0_13.json'; // 0..13 weeks (LAZ weekly)
import TBU_MONTHS_0_24 from './tbu_months_0_24.json'; // 0..24 months (LAZ monthly)
import BBTB_WFL from './bbtb_wfl.json'; // weight-for-length 0..24 months (for <87 cm)
import BBTB_WFH from './bbtb_wfh.json'; // weight-for-height 24..60 months (>=87 cm)

interface LMSRef { L: number; M: number; S: number; }
type GenderKey = 'boys' | 'girls';

function safeGetMonth(refSet: any, gender: GenderKey, key: number): LMSRef | null {
  if (!refSet || !refSet[gender]) return null;

  // months selalu integer
  const row = refSet[gender][String(key)];
  return row ?? null;
}

function safeGetLength(refSet: any, gender: GenderKey, key: number): LMSRef | null {
  if (!refSet || !refSet[gender]) return null;

  // BBTB menggunakan angka 1 desimal
  const formatted = key % 1 === 0 ? key.toFixed(1) : String(key);

  const row = refSet[gender][formatted];
  return row ?? null;
}


function lmsZ(value: number, ref?: LMSRef | null) {
  if (!ref || value <= 0) return null;
  const { L, M, S } = ref;
  const z = L === 0 ? Math.log(value / M) / S : (Math.pow(value / M, L) - 1) / (L * S);
  // Limit Z-score ±5
  return Math.max(Math.min(z, 5), -5);
}


function calcAges(birth: Date, measuredAt: Date) {
  const diffMs = measuredAt.getTime() - birth.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months =
    (measuredAt.getFullYear() - birth.getFullYear()) * 12 +
    (measuredAt.getMonth() - birth.getMonth()) -
    (measuredAt.getDate() < birth.getDate() ? 1 : 0);
  return { days, months };
}

function roundHalf(num: number) {
  return Math.round(num * 2) / 2;
}

export function hitungZScoreWHO({
  tanggalLahir,
  tanggalPengukuran,
  jenisKelamin,
  beratBadan,
  tinggiBadan
}: {
  tanggalLahir: string | Date;
  tanggalPengukuran: string | Date;
  jenisKelamin: 'L' | 'P';
  beratBadan: number;
  tinggiBadan: number;
}) {
  // ---- Validasi input dasar ----
  if (beratBadan <= 0 || tinggiBadan <= 0) return { error: 'Berat/Tinggi tidak valid' };

  const genderKey: GenderKey = jenisKelamin === 'L' ? 'boys' : 'girls';
  const birth = new Date(tanggalLahir);
  const measured = new Date(tanggalPengukuran);
  const { days, months } = calcAges(birth, measured);

  // ---- Weight-for-age (BB/U) ----
  const refBBU = safeGetMonth(BBU, genderKey, months);
  const zBBU = lmsZ(beratBadan, refBBU);

  // ---- Height/Length-for-age (TB/U) ----
  let refTBU: LMSRef | null = null;
  let zTBU: number | null = null;

  if (days <= 13 * 7) {
    const week = Math.floor(days / 7);
    refTBU = safeGetMonth(TBU_WEEKS_0_13, genderKey, week);
    zTBU = lmsZ(tinggiBadan, refTBU);
  } else if (months < 24) {
    refTBU = safeGetMonth(TBU_MONTHS_0_24, genderKey, months);
    zTBU = lmsZ(tinggiBadan, refTBU);
  } else {
    refTBU = safeGetMonth(TBU_24_60, genderKey, months);
    zTBU = lmsZ(tinggiBadan, refTBU);
  }

  // ---- Weight-for-length / Weight-for-height (BB/TB) ----
  const tinggiBulat = roundHalf(tinggiBadan);
  let refBBTB: LMSRef | null = null;
  let zBBTB: number | null = null;

  if (tinggiBulat < 87) {
    refBBTB = safeGetLength(BBTB_WFL, genderKey, tinggiBulat);
    zBBTB = lmsZ(beratBadan, refBBTB);
  } else {
    refBBTB = safeGetLength(BBTB_WFH, genderKey, tinggiBulat);
    zBBTB = lmsZ(beratBadan, refBBTB);
  }

  // ---- Tentukan kategori gizi otomatis berdasarkan BB/U ----
  let kategoriGizi = 'Gizi Baik';
  if (zBBU !== null) {
    if (zBBU < -3) kategoriGizi = 'Gizi Buruk';
    else if (zBBU < -2) kategoriGizi = 'Gizi Kurang';
    else if (zBBU > 2) kategoriGizi = 'Risiko Gizi Lebih';
  }

  return {
    zBBU,
    zTBU,
    zBBTB,
    kategoriGizi,
    ref: { bbu: refBBU, tbu: refTBU, bbtb: refBBTB },
    meta: { days, months, weekOrMonthUsed: days <= 13*7 ? `week:${Math.floor(days/7)}` : `month:${months}` }
  };
}
