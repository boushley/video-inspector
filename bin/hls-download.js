#!/usr/bin/env node
const hls = require('../lib/hls');
const {promiseExit} = require('../lib/util');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const args = process.argv.slice(2);
if (args.length !== 1) {
  exit(1, 'Usage: hls-download <url>');
  return;
}

hls.getManifest(args[0])
  .then(hls.downloadItems)
  .then((manifest) => {
    console.log('We got the manifest!', JSON.stringify(manifest, null, 4));
  }).catch(promiseExit);
