// 달의 위상 계산 — 순수 함수만 둔다 (화면 코드 없음)
// 단순화: 원궤도, 평행광. 실제 위상 시각과 최대 약 ±0.5일 차이가 날 수 있다.

/** 삭망월(일) */
export const SYNODIC_MONTH = 29.530588;

/** 기준 삭: 2000-01-06 18:14 UTC */
export const REFERENCE_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

const DAY_MS = 24 * 60 * 60 * 1000;

/** 0 이상 P 미만으로 감싸기 (음수 월령·날짜도 처리) */
export function wrapAge(age) {
  return ((age % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
}

/** 날짜 → 월령(일). date는 Date 객체 또는 밀리초 */
export function moonAgeFromDate(date) {
  const t = date instanceof Date ? date.getTime() : date;
  return wrapAge((t - REFERENCE_NEW_MOON) / DAY_MS);
}

/** 월령 → 위상각 θ(도, 0–360). 0=삭, 180=보름 */
export function phaseAngle(age) {
  return (360 * wrapAge(age)) / SYNODIC_MONTH;
}

/** 월령 → 밝게 보이는 비율 k (0–1) = (1 − cos θ) / 2 */
export function illuminatedFraction(age) {
  const theta = (phaseAngle(age) * Math.PI) / 180;
  return (1 - Math.cos(theta)) / 2;
}

// 위상 이름 경계(월령, 일). 각 항목: [이 값 미만까지, 이름]
const PHASE_NAMES = [
  [1, '삭'],
  [6.4, '초승달'],
  [8.4, '상현달'],
  [13.8, '상현과 보름 사이(볼록달)'],
  [15.8, '보름달(망)'],
  [21.1, '보름과 하현 사이(볼록달)'],
  [23.1, '하현달'],
  [28.5, '그믐달'],
  [Infinity, '삭'],
];

/** 월령 → 위상 이름 */
export function phaseName(age) {
  const a = wrapAge(age);
  return PHASE_NAMES.find(([limit]) => a < limit)[1];
}

/**
 * 월령 → 대략적인 월출·남중·월몰 시각(하루 중 분, 0–1439)
 * 월출 ≈ 06:00 + 월령 × 48.8분, 남중 = 월출 + 6시간, 월몰 = 월출 + 12시간
 */
export function moonTimes(age) {
  const day = 24 * 60;
  const rise = (6 * 60 + wrapAge(age) * 48.8) % day;
  return {
    rise,
    transit: (rise + 6 * 60) % day,
    set: (rise + 12 * 60) % day,
  };
}

/** 하루 중 분 → "HH:MM" */
export function formatTime(minutes) {
  const m = Math.round(minutes) % (24 * 60);
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}
