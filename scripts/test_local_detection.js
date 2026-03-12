const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { detectDisease } = require('../server/controllers/cottonDiseaseController');

// Helper to call controller with mock req/res
const callDetect = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const req = {
    user: { mongo_id: '000000000000000000000000', email: 'tester@example.com', firebase_uid: 'testuid' },
    file: {
      buffer,
      originalname: path.basename(filePath),
      size: buffer.length,
      mimetype: 'image/jpeg'
    }
  };

  const res = {
    status(code) { this._status = code; return this; },
    json(obj) { this._body = obj; console.log('Response status:', this._status || 200); console.dir(obj, { depth: 4 }); return obj; }
  };

  try {
    await detectDisease(req, res);
  } catch (err) {
    console.error('Error calling detectDisease:', err);
  }
};

const datasetPath = path.resolve(__dirname, '..', 'cotton_leaf_dataset', 'cotton');
const sampleFiles = [];
['healthy','bacterial_blight','curl_virus','fussarium_wilt'].forEach(cls => {
  const dir = path.join(datasetPath, cls);
  if (fs.existsSync(dir)){
    const files = fs.readdirSync(dir).filter(f=>/\.(jpe?g|png|webp|tiff?)$/i.test(f));
    if(files.length) sampleFiles.push(path.join(dir, files[0]));
  }
});

const main = async () => {
  for (const f of sampleFiles) {
    console.log('\n=== Testing', f, '===');
    await callDetect(f);
  }
};

main().catch(err=>console.error(err));
