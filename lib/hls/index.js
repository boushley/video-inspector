const http = require('http');
const request = require('request');
const fs = require('fs');

const Manifest = require('./manifest');
const Segment = require('./segment');

const {limitConcurrent, tryMkdir} = require('../util');

function getManifest(url, container) {
  if (!container) {
    container = new Manifest(url);
  }

  return rateLimitedGetData(url)
    .then(data => {
      container.setData(data)
      return container;
    });
}
module.exports.getManifest = getManifest;

function downloadItems(manifest, context) {
  tryMkdir(context.out);
  const outPath = context.out + manifest.getPath();
  fs.writeFileSync(`${outPath}.original`, manifest.data);
  fs.writeFileSync(outPath, manifest.getUpdatedFile());

  const itemPromises = manifest.items.map(item => {
    if (item.isManifest) {
      return getManifest(item.url, item)
        .then(m => {
          tryMkdir(context.out + m.getFolder());
          const outPath = context.out + m.getPath();
          fs.writeFileSync(`${outPath}.original`, m.data);
          fs.writeFileSync(outPath, m.getUpdatedFile());
          return downloadItems(m, context);
        });
    } else {
      return getSegment(item.url, context, item);
    }
  });

  return Promise.all(itemPromises).then(() => { return manifest; });
};
module.exports.downloadItems = downloadItems;

function getSegment(url, context, container) {
  if (!container) {
    container = new Segment(url);
  }

  const outPath = context.out + container.getFolder() + '/' + container.getFile();
  return rateLimitedStreamUrlData(url, outPath)
      .then(() => container);
};
module.exports.getSegment = getSegment;

function streamUrlData(url, output, retries=2) {
  return new Promise((resolve, reject) => {
    request
      .get(url)
      .on('error', function(err) {
        streamUrlData(url, output, retries - 1).then(resolve, reject);
      })
      .pipe(fs.createWriteStream(output))
      .on('finish', function (...args) {
        countDownload();
        resolve();
      });
  });
}
const rateLimitedStreamUrlData = limitConcurrent(streamUrlData, 7);

function getUrlData(url, retries=2) {
  return new Promise((resolve, reject) => {
    console.log(`Starting to download ${url}`);
    request(url, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        if (error) {
          console.log(`Failed request for ${url} error: ${error}`);
        } else {
          console.log(`Failed request for ${url} status: ${response.statusCode}`);
        }

        if (retries) {
          getUrlData(url, retries - 1).then(resolve, reject);
        } else {
          reject(`Retries exhausted for ${url}`);
          return;
        }
      }

      countDownload();

      resolve(body);
    });
  });
}

let downloadCount = 0;
function countDownload() {
  downloadCount += 1;
  if (downloadCount % 10 === 0) {
    console.log(`Successfully downloaded ${downloadCount} items`);
  }
}

const rateLimitedGetData = limitConcurrent(getUrlData, 3);
