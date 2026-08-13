const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 💡 public 폴더 안의 HTML, CSS, JS 정적 파일 연결
app.use(express.static(path.join(__dirname, 'public')));

// 데이터 저장 파일 경로 (emr-backend/data.json)
const DATA_FILE = path.join(__dirname, 'data.json');

// 초기 기본 데이터 정의
const defaultData = {
  departments: ['내과', '외과', '정형외과', '소아청소년과'],
  doctors: [
    { id: 1, name: '박지은', dept: '내과' },
    { id: 2, name: '김철수', dept: '외과' }
  ],
  diagnoses: [
    { id: 1, code: 'K35.8', name_ko: '급성 충수염', name_en: 'Acute appendicitis', category: '외과' }
  ],
  drugs: [
    { id: 1, code: 'M001', name: '아세트아미노펜', dose: '500mg', route: 'PO' }
  ],
  patients: []
};

// 파일에서 데이터 불러오기 함수
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    saveData(defaultData);
    return defaultData;
  }
  try {
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('데이터 파일 읽기 오류, 기본값 사용:', err);
    return defaultData;
  }
}

// 파일에 데이터 저장하기 함수
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('데이터 파일 저장 오류:', err);
  }
}

// 데이터 초기 로드
let db = loadData();

// 로그인 API
app.post('/api/login', (req, res) => {
  const { uid, upw } = req.body;
  if (uid === 'admin' && upw === '1234') {
    res.json({ message: '로그인 성공' });
  } else {
    res.status(401).json({ message: '아이디 또는 비밀번호가 틀렸습니다.' });
  }
});

// 진료과 API
app.get('/api/departments', (req, res) => res.json(db.departments));
app.post('/api/departments', (req, res) => {
  db.departments.push(req.body.name);
  saveData(db);
  res.status(201).json(db.departments);
});
app.put('/api/departments/:name', (req, res) => {
  const idx = db.departments.indexOf(req.params.name);
  if (idx !== -1) db.departments[idx] = req.body.name;
  saveData(db);
  res.json(db.departments);
});
app.delete('/api/departments/:name', (req, res) => {
  db.departments = db.departments.filter(d => d !== req.params.name);
  saveData(db);
  res.json(db.departments);
});

// 주치의 API
app.get('/api/doctors', (req, res) => res.json(db.doctors));
app.post('/api/doctors', (req, res) => {
  const newDoc = { id: Date.now(), ...req.body };
  db.doctors.push(newDoc);
  saveData(db);
  res.status(201).json(newDoc);
});
app.put('/api/doctors/:id', (req, res) => {
  const idx = db.doctors.findIndex(d => d.id == req.params.id);
  if (idx !== -1) db.doctors[idx] = { id: Number(req.params.id), ...req.body };
  saveData(db);
  res.json(db.doctors[idx]);
});
app.delete('/api/doctors/:id', (req, res) => {
  db.doctors = db.doctors.filter(d => d.id != req.params.id);
  saveData(db);
  res.json({ success: true });
});

// 진단명 API
app.get('/api/diagnoses', (req, res) => res.json(db.diagnoses));
app.post('/api/diagnoses', (req, res) => {
  const newDiag = { id: Date.now(), ...req.body };
  db.diagnoses.push(newDiag);
  saveData(db);
  res.status(201).json(newDiag);
});
app.put('/api/diagnoses/:id', (req, res) => {
  const idx = db.diagnoses.findIndex(d => d.id == req.params.id);
  if (idx !== -1) db.diagnoses[idx] = { id: Number(req.params.id), ...req.body };
  saveData(db);
  res.json(db.diagnoses[idx]);
});
app.delete('/api/diagnoses/:id', (req, res) => {
  db.diagnoses = db.diagnoses.filter(d => d.id != req.params.id);
  saveData(db);
  res.json({ success: true });
});

// 약물 API
app.get('/api/drugs', (req, res) => res.json(db.drugs));
app.post('/api/drugs', (req, res) => {
  const newDrug = { id: Date.now(), ...req.body };
  db.drugs.push(newDrug);
  saveData(db);
  res.status(201).json(newDrug);
});
app.put('/api/drugs/:id', (req, res) => {
  const idx = db.drugs.findIndex(d => d.id == req.params.id);
  if (idx !== -1) db.drugs[idx] = { id: Number(req.params.id), ...req.body };
  saveData(db);
  res.json(db.drugs[idx]);
});
app.delete('/api/drugs/:id', (req, res) => {
  db.drugs = db.drugs.filter(d => d.id != req.params.id);
  saveData(db);
  res.json({ success: true });
});

// 환자 데이터 API
app.get('/api/patients', (req, res) => res.json(db.patients));
app.post('/api/patients', (req, res) => {
  const pData = req.body;
  const idx = db.patients.findIndex(p => p.chartNo === pData.chartNo);
  if (idx !== -1) {
    db.patients[idx] = pData;
  } else {
    db.patients.push(pData);
  }
  saveData(db);
  res.status(201).json(pData);
});
app.put('/api/patients/:chartNo', (req, res) => {
  const idx = db.patients.findIndex(p => p.chartNo === req.params.chartNo);
  if (idx !== -1) {
    db.patients[idx] = req.body;
    saveData(db);
    res.json(db.patients[idx]);
  } else {
    res.status(404).json({ message: '환자를 찾을 수 없습니다.' });
  }
});
app.delete('/api/patients/:chartNo', (req, res) => {
  db.patients = db.patients.filter(p => p.chartNo !== req.params.chartNo);
  saveData(db);
  res.json({ success: true });
});

// 💡 1. 잘못된 API 경로 요청 시 404 JSON 에러 반환
app.use('/api', (req, res) => {
  res.status(404).json({ message: '존재하지 않는 API 경로입니다.' });
});

// 💡 2. 그 외 모든 브라우저 접속 요청 시 index.html 파일 출력
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 💡 3. 서버 실행 (이 코드가 있어야 서버가 계속 대기 상태를 유지합니다)
app.listen(PORT, () => {
  console.log(`EMR 서버가 정상 실행 중입니다: http://localhost:${PORT}`);
});