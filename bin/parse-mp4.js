#!/usr/bin/env node
const parser = require('../lib/mp4/parser')

const args = process.argv.slice(2);
if (args.length !== 1) {
  exit(1, 'Usage: parse-mp4 <path/to/file>');
  return;
}

const filePath = args[0];
parser.open(filePath)
  .then((p) => {
    console.log('Top Level Boxes:', JSON.stringify(p.boxes, undefined, '    '))
  }, (err) => {
    console.error('File parsing failed:', err)
  })
