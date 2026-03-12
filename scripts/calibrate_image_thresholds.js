const fs = require('fs');
const path = require('path');
const { analyzeBuffer } = require('../server/utils/localImageAnalysis');

const datasetPath = path.resolve(__dirname, '..', 'cotton_leaf_dataset', 'cotton');

const walk = (dir) => fs.readdirSync(dir).flatMap(f => {
  const p = path.join(dir, f);
  return fs.statSync(p).isDirectory() ? walk(p) : p;
});

const main = async () => {
  const classes = fs.readdirSync(datasetPath).filter(d => fs.statSync(path.join(datasetPath, d)).isDirectory());
  const results = {};
  for (const cls of classes) {
    const dir = path.join(datasetPath, cls);
    const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp|tiff?)$/i.test(f));
    let sumConf = 0, count = 0;
    for (const file of files.slice(0, 200)) { // limit samples
      const buf = fs.readFileSync(path.join(dir, file));
      // reuse localImageAnalysis directly
      const res = await analyzeBuffer(buf);
      sumConf += res.confidence;
      count++;
    }
    results[cls] = { avgConfidence: (sumConf / Math.max(1, count)).toFixed(2), samples: count };
  }

  console.log('Calibration results:');
  console.table(results);
  console.log('\nSuggested threshold: If mean healthy confidence > 60, keep current heuristic.');
};

main().catch(err => { console.error(err); process.exit(1); });
