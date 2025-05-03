import * as XLSX from 'xlsx';

interface ExcelCard {
  front: string;
  back: string;
  subject_id?: number;
  subject_name?: string;
}

/**
 * Excel 파일을 파싱하여 카드 데이터로 변환합니다.
 * 지원하는 형식:
 * - 두 개의 열: 첫 번째 열은 front(정답), 두 번째 열은 back(문제)
 * - 세 개의 열: 첫 번째 열은 front(정답), 두 번째 열은 back(문제), 세 번째 열은 subject_name(과목 이름)
 * - 첫 번째 행은 헤더로 간주되어 무시됩니다.
 */
export function parseExcelFile(file: File): Promise<{ cards: ExcelCard[], errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const cards: ExcelCard[] = [];
    const errors: string[] = [];

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 첫 번째 시트 사용
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // JSON으로 변환
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // 헤더 확인 (첫 행은 헤더로 간주)
        if (jsonData.length <= 1) {
          errors.push('엑셀 파일에 데이터가 충분하지 않습니다. 최소한 헤더 행과 데이터 행이 필요합니다.');
          resolve({ cards, errors });
          return;
        }
        
        // 헤더 무시하고 데이터 처리
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          
          // 빈 행 건너뛰기
          if (!row || row.length === 0) continue;
          
          // 최소 2개의 열(front, back)이 있는지 확인
          if (row.length < 2 || !row[0] || !row[1]) {
            errors.push(`${i+1}행: 정답(front)과 문제(back)가 모두 필요합니다.`);
            continue;
          }
          
          const card: ExcelCard = {
            front: String(row[0]).trim(),
            back: String(row[1]).trim()
          };
          
          // 과목 이름이 있으면 추가
          if (row.length >= 3 && row[2]) {
            card.subject_name = String(row[2]).trim();
            
            // 만약 과목 이름이 숫자로만 이루어져 있으면 과목 ID로 간주
            const possibleId = parseInt(card.subject_name);
            if (!isNaN(possibleId) && String(possibleId) === card.subject_name) {
              card.subject_id = possibleId;
            }
          }
          
          cards.push(card);
        }
        
        resolve({ cards, errors });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 허용되는 파일 확장자인지 확인합니다.
 */
export function isValidExcelFile(file: File): boolean {
  // 확장자 추출
  const extension = file.name.split('.').pop()?.toLowerCase();
  // 엑셀 파일 확장자 체크
  return extension === 'xlsx' || extension === 'xls' || extension === 'csv';
}

/**
 * 엑셀 파일 파싱 중 오류가 발생했을 때 사용자에게 보여줄 오류 메시지를 생성합니다.
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  return '파일 처리 중 오류가 발생했습니다. 파일 형식을 확인해주세요.';
} 