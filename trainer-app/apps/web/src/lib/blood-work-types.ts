export interface BloodWorkMarkers {
  hemoglobin?: number;
  iron?: number;
  ferritin?: number;
  vitaminD?: number;
  vitaminB12?: number;
  totalCholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglycerides?: number;
  fastingGlucose?: number;
  hba1c?: number;
  testosterone?: number;
  cortisol?: number;
  crp?: number;
  tsh?: number;
}

export interface BloodWorkRecord {
  id: string;
  clientId: string;
  clientName: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  fileSize: number;
  dataUrl: string;
  uploadedAt: string;
  markers: BloodWorkMarkers;
}

// Simulate extracting markers from uploaded blood work
// In production this would use OCR / structured PDF parsing
export function simulateMarkerExtraction(): BloodWorkMarkers {
  const rand = (min: number, max: number, decimals = 1) =>
    Number((Math.random() * (max - min) + min).toFixed(decimals));

  // Deliberately skew some values to be flagged
  const lowVitD = Math.random() > 0.5;
  const highCRP = Math.random() > 0.6;
  const highLDL = Math.random() > 0.7;

  return {
    hemoglobin: rand(12.5, 17.5),
    iron: rand(40, 180, 0),
    ferritin: rand(15, 300, 0),
    vitaminD: lowVitD ? rand(12, 28) : rand(32, 65),
    vitaminB12: rand(200, 900, 0),
    totalCholesterol: highLDL ? rand(220, 280, 0) : rand(150, 200, 0),
    ldl: highLDL ? rand(140, 190, 0) : rand(70, 120, 0),
    hdl: rand(40, 80, 0),
    triglycerides: rand(60, 200, 0),
    fastingGlucose: rand(70, 110, 0),
    hba1c: rand(4.5, 6.2),
    testosterone: rand(300, 900, 0),
    cortisol: rand(5, 25),
    crp: highCRP ? rand(3.5, 8.0) : rand(0.2, 2.5),
    tsh: rand(0.5, 4.5),
  };
}
