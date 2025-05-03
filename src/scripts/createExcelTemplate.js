#!/usr/bin/env node

const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// 새 워크북 생성
const workbook = xlsx.utils.book_new();

// 샘플 데이터 생성
const sampleData = [
  ['정답 (front)', '문제 (back)', '과목 이름 (선택사항)'],
  ['apple', '사과는 영어로?', '영어'],
  ['book', '책은 영어로?', '영어'],
  ['computer', '컴퓨터는 영어로?', '컴퓨터 과학'],
  ['sky', '하늘은 영어로?', '영어'],
  ['happy', '행복한은 영어로?', '영어'],
  ['mitochondria', '미토콘드리아는 세포의 무엇인가?', '생물학'],
  ['', '', ''],
  ['여기서부터 입력하세요', '두 번째 열에 문제 입력', ''],
];

// 워크시트 생성
const worksheet = xlsx.utils.aoa_to_sheet(sampleData);

// 열 너비 설정
const colWidths = [
  { wch: 20 }, // A열
  { wch: 30 }, // B열
  { wch: 20 }, // C열
];
worksheet['!cols'] = colWidths;

// 포맷 및 스타일 설정 (머리글 굵게, 배경색 등은 Excel 파일에서 직접 설정 가능)
worksheet['A1'].s = { font: { bold: true } };
worksheet['B1'].s = { font: { bold: true } };
worksheet['C1'].s = { font: { bold: true } };

// 워크북에 워크시트 추가
xlsx.utils.book_append_sheet(workbook, worksheet, '카드 데이터');

// 저장 경로 설정
const outputDir = path.join(process.cwd(), 'public', 'templates');
const outputPath = path.join(outputDir, 'flashcards_template.xlsx');

// 디렉토리가 없으면 생성
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 엑셀 파일로 저장
xlsx.writeFile(workbook, outputPath);

console.log(`템플릿 파일이 생성되었습니다: ${outputPath}`); 