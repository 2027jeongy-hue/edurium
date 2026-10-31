// 앱 초기화와 상태 관리
// 모든 패널은 하나의 상태값 moonAge(월령, 0–29.53일)를 공유한다.
import './styles.css';
import { moonAgeFromDate } from './astro.js';

export const state = {
  moonAge: moonAgeFromDate(new Date()),
};

// M2 이후: 각 패널(orbitView, moonView, skyView, controls)을 여기서 연결한다.
