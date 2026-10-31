import { describe, it, expect } from 'vitest';
import {
  SYNODIC_MONTH,
  REFERENCE_NEW_MOON,
  moonAgeFromDate,
  phaseAngle,
  illuminatedFraction,
  phaseName,
  moonTimes,
  formatTime,
} from '../src/astro.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const afterRef = (days) => new Date(REFERENCE_NEW_MOON + days * DAY_MS);

describe('M1 수용 기준', () => {
  it('2000-01-06 18:14 UTC → 월령 ≈ 0', () => {
    const age = moonAgeFromDate(new Date(Date.UTC(2000, 0, 6, 18, 14)));
    expect(age).toBeCloseTo(0, 6);
  });

  it('14.77일 뒤 → k ≈ 1.0 (보름)', () => {
    const age = moonAgeFromDate(afterRef(14.77));
    expect(illuminatedFraction(age)).toBeCloseTo(1.0, 3);
  });

  it('7.38일 뒤 → k ≈ 0.5 (상현)', () => {
    const age = moonAgeFromDate(afterRef(7.38));
    expect(illuminatedFraction(age)).toBeCloseTo(0.5, 2);
  });
});

describe('월령 계산', () => {
  it('한 삭망월 뒤 다시 월령 ≈ 0', () => {
    const age = moonAgeFromDate(afterRef(SYNODIC_MONTH * 10));
    expect(Math.min(age, SYNODIC_MONTH - age)).toBeLessThan(1e-6);
  });

  it('기준 삭 이전 날짜도 0–P 범위', () => {
    const age = moonAgeFromDate(afterRef(-3));
    expect(age).toBeCloseTo(SYNODIC_MONTH - 3, 6);
  });
});

describe('위상각', () => {
  it('0일 → 0°, 반 주기 → 180°', () => {
    expect(phaseAngle(0)).toBe(0);
    expect(phaseAngle(SYNODIC_MONTH / 2)).toBeCloseTo(180, 6);
  });
});

describe('위상 이름', () => {
  it.each([
    [0.5, '삭'],
    [3, '초승달'],
    [7.4, '상현달'],
    [11, '상현과 보름 사이(볼록달)'],
    [14.8, '보름달(망)'],
    [18, '보름과 하현 사이(볼록달)'],
    [22.1, '하현달'],
    [26, '그믐달'],
    [29, '삭'],
  ])('월령 %f → %s', (age, name) => {
    expect(phaseName(age)).toBe(name);
  });
});

describe('관측 시각', () => {
  it('삭: 06:00 월출, 12:00 남중, 18:00 월몰', () => {
    const t = moonTimes(0);
    expect(formatTime(t.rise)).toBe('06:00');
    expect(formatTime(t.transit)).toBe('12:00');
    expect(formatTime(t.set)).toBe('18:00');
  });

  it('상현(7.38일): 정오쯤 뜬다', () => {
    const { rise } = moonTimes(7.38);
    expect(rise).toBeGreaterThan(11.5 * 60);
    expect(rise).toBeLessThan(12.5 * 60);
  });

  it('보름(14.77일): 저녁 6시쯤 뜬다', () => {
    const { rise } = moonTimes(14.77);
    expect(Math.abs(rise - 18 * 60)).toBeLessThan(30);
  });
});
