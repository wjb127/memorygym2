const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// CSV 파일 읽기
const csvFile = path.join(process.cwd(), 'temp', 'advanced_english_flashcards.csv');
const csvData = fs.readFileSync(csvFile, 'utf8');

// CSV를 워크북으로 변환
const workbook = xlsx.read(csvData, { type: 'string' });

// 워크시트 스타일 설정
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// 열 너비 설정
worksheet['!cols'] = [
  { wch: 20 }, // A열 (영단어)
  { wch: 40 }, // B열 (한국어 의미)
  { wch: 15 }, // C열 (과목 이름)
];

// 첫 번째 행 스타일 설정 (제목 행)
const range = xlsx.utils.decode_range(worksheet['!ref']);
for (let C = range.s.c; C <= range.e.c; ++C) {
  const address = xlsx.utils.encode_cell({ r: 0, c: C });
  if (!worksheet[address]) continue;
  
  worksheet[address].s = {
    font: { bold: true },
    fill: { fgColor: { rgb: "EEEEEE" } }
  };
}

// 엑셀 파일로 저장
const outputPath = path.join(process.cwd(), 'temp', 'advanced_english_flashcards.xlsx');
xlsx.writeFile(workbook, outputPath);

console.log('고급 영단어 플래시카드 엑셀 파일이 생성되었습니다: ' + outputPath); 