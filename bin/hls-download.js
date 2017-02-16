#!/usr/bin/env node
const hls = require('../lib/hls');
const {exit, promiseExit} = require('../lib/util');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const args = process.argv.slice(2);
if (args.length !== 2) {
  exit(1, 'Usage: hls-download <output/path> <url>');
  return;
}

hls.getManifest(args[1])
  .then(manifest => hls.downloadItems(manifest, {out: args[0]}))
  .then((manifest) => {
    exit(0, 'Everything has been downloaded');
  }).catch(promiseExit);
