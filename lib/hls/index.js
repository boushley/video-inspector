const http = require('http');

const Manifest = require('./manifest');
const Segment = require('./segment');

function getManifest(url, container) {
  if (!container) {
    container = new Manifest(url);
  }

  return getUrlData(url)
    .then(data => {
      container.setData(data)
      return container;
    });
}
module.exports.getManifest = getManifest;

function downloadItems(manifest) {
  const itemPromises = manifest.items.map(item => {
    if (item.isManifest) {
      return getManifest(item.url, item).then(module.exports.downloadItems);
    } else {
      return getSegment(item.url);
    }
  });

  return Promise.all(itemPromises).then(() => { return manifest; });
};
module.exports.downloadItems = downloadItems;

function getSegment(url, container) {
  if (!container) {
    container = new Segment(url);
  }
  return getUrlData(url)
    .then(data =>  {
      container.setData(data)
      return container;
    });
};
module.exports.getSegment = getSegment;

// TODO Need to rate limit this so we don't get kicked off servers
function getUrlData(url) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Making request for ${url}`);
      http.get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(`Unexpected status code: ${res.statusCode} for ${url}`);
          return;
        }

        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
          resolve(rawData);
        });
      })
    } catch (e) {
      reject(`Unexpected error: ${e} for ${url}`);
    }
  });
}
