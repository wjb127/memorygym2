const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// CSV 파일 읽기
const csvFile = path.join(process.cwd(), 'temp', 'biology_flashcards.csv');
const csvData = fs.readFileSync(csvFile, 'utf8');

// CSV를 워크북으로 변환
const workbook = xlsx.read(csvData, { type: 'string' });

// 워크시트 스타일 설정
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// 열 너비 설정
worksheet['!cols'] = [
  { wch: 20 }, // A열 (정답)
  { wch: 50 }, // B열 (문제)
  { wch: 15 }, // C열 (과목 이름)
];

// 엑셀 파일로 저장
const outputPath = path.join(process.cwd(), 'temp', 'biology_flashcards.xlsx');
xlsx.writeFile(workbook, outputPath);

console.log('생물학 플래시카드 엑셀 파일이 생성되었습니다: ' + outputPath); 