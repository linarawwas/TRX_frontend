const { injectManifest } = require('workbox-build');

module.exports = {
  globDirectory: 'build',
  globPatterns: [
    '**/*.{html,js,css,json}'
  ],
  swDest: 'build/service-worker.js',
  swSrc: 'src/service-worker.js',
};

injectManifest(module.exports).then(({ count, size, warnings }) => {
  if (warnings.length > 0) {
    warnings.forEach(console.warn);
  }
  console.log(`${count} files will be precached, totaling ${size} bytes.`);
}).catch(console.error);
