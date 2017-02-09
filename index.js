const readline = require('readline');
const probe = require('./lib/probe');
const {exit, promiseExit} = require('./lib/util');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const args = process.argv.slice(2);
if (args.length !== 1) {
  exit(1, 'Usage: node index.js <path/to/file>');
  return;
}


let framesAllCollected = false;
let framesArray = []

let metadataPromise = probe(args[0]);
let framesPromise = probe(args[0], {getStreams: false, getFormat: false, getFrames: true, framesArray});

metadataPromise.then(null, promiseExit);
framesPromise.then(function(data) {
  framesAllCollected = true;
  framesArray = data.frames;
}).then(null, promiseExit);

metadataPromise.then(function(data) {
  let trackQuestion = 'Which track do you want to see info about?';

  let index = 0;
  data.streams.forEach(s => {
    trackQuestion += `\n\t[${index}] ${s.codec_type} - ${s.codec_name} - ${s.bit_rate}`;
    if (s.codec_type === 'video') {
      trackQuestion += ` (${s.width}x${s.height})`;
    } else if (s.code_type === 'audio') {
      trackQuestion += ` (${s.channel_layout})`;
    }
    index++;
  });

  trackQuestion += `\n\t[${index}] All (default)\n`;

  rl.question(trackQuestion, (answer) => {
    if (!answer.trim() || answer === index) {
      console.log('Sounds good, we\'ll look at all the data');
      showPtsData(data.streams.map(s => s.index));
    } else {
      console.log(`Great, lets get some info on track: ${answer}`);
      showPtsData([data.streams[parseInt(answer)].index]);
    }
  });
}).then(null, promiseExit);

const DEFAULT_TO_SHOW = 20;
const PATIENCE_TIME = 5000;
function showPtsData(tracks) {
  rl.question(`Alright, lets look at some of those PTS values. How many at a time? [${DEFAULT_TO_SHOW}]`, (answer) => {
    let framesToShow = parseInt(answer) || DEFAULT_TO_SHOW;
    printFrames(tracks, framesArray, 0, framesToShow);
  });
}

function printFrames(tracks, frames, nextFrame, framesToShow) {
  let collected = [];

  while (nextFrame < frames.length && collected.length < framesToShow) {
    let frame = frames[nextFrame];
    nextFrame += 1;
    if (tracks.includes(frame.stream_index)) {
      collected.push(frame);
    }
  }

  collected.forEach(frame => {
    let frameMessage = '';
    if (tracks.length > 1) {
      frameMessage = `Stream: Type <${frame.media_type}> Index <${frame.stream_index}> `;
    }

    frameMessage += `PTS: <${frame.pkt_pts}>[${frame.pkt_pts_time}] Duration: <${frame.pkt_duration}>[${frame.pkt_duration_time}] Pos: <${frame.pkt_pos}>`;

    if (frame.media_type === 'video') {
      frameMessage += ` Frame Type: <${frame.pict_type}>`;
    }

    console.log(frameMessage);
  });

  let prompt = '';
  if (framesAllCollected) {
    prompt += `Found all ${framesArray.length} frames. `
  } else {
    prompt += `Found ${framesArray.length} frames so far. `
  }

  prompt += `[q] to quit. [gg] go back to start. [G] go to end. [n] see the next ${framesToShow} (default)`;

  rl.question(prompt, (answer) => {
    answer = answer.trim();

    if (answer === 'q') {
      exit(0, 'Hope that helped!');
      return;
    }

    if (answer === 'gg') {
      nextFrame = 0;
    }

    if (answer === 'G') {
      nextFrame = frames.length - framesToShow;
    }

    printFrames(tracks, frames, nextFrame, framesToShow);
  });
}

//FFMPEG Video Frame Format
//{
//  media_type: 'video',
//  stream_index: 0,
//  key_frame: 1,
//  pkt_pts: 0,
//  pkt_pts_time: '0:00:00.000000',
//  pkt_dts: 0,
//  pkt_dts_time: '0:00:00.000000',
//  best_effort_timestamp: 0,
//  best_effort_timestamp_time: '0:00:00.000000',
//  pkt_duration: 512,
//  pkt_duration_time: '0:00:00.041667',
//  pkt_pos: '48',
//  pkt_size: '5.140625 Kibyte',
//  width: 1920,
//  height: 800,
//  pix_fmt: 'yuv420p',
//  sample_aspect_ratio: '1:1',
//  pict_type: 'I',
//  coded_picture_number: 0,
//  display_picture_number: 0,
//  interlaced_frame: 0,
//  top_field_first: 0,
//  repeat_pict: 0
//}

//FFMPEG Audio Frame Format
//{
//  "media_type": "audio",
//    "stream_index": 1,
//    "key_frame": 1,
//    "pkt_pts": 353280,
//    "pkt_pts_time": "0:00:08.010884",
//    "pkt_dts": 353280,
//    "pkt_dts_time": "0:00:08.010884",
//    "best_effort_timestamp": 353280,
//    "best_effort_timestamp_time": "0:00:08.010884",
//    "pkt_duration": 1024,
//    "pkt_duration_time": "0:00:00.023220",
//    "pkt_pos": "346522",
//    "pkt_size": "546 byte",
//    "sample_fmt": "fltp",
//    "nb_samples": 1024,
//    "channels": 2,
//    "channel_layout": "stereo"
//}

// FFMPEG Streams Format
//[
//  {
//    index: 0,
//    codec_name: 'h264',
//    codec_long_name: 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10',
//    profile: 'High',
//    codec_type: 'video',
//    codec_time_base: '1/48',
//    codec_tag_string: 'avc1',
//    codec_tag: '0x31637661',
//    width: 1920,
//    height: 800,
//    coded_width: 1920,
//    coded_height: 800,
//    has_b_frames: 2,
//    sample_aspect_ratio: '1:1',
//    display_aspect_ratio: '12:5',
//    pix_fmt: 'yuv420p',
//    level: 40,
//    chroma_location: 'left',
//    refs: 1,
//    is_avc: 'true',
//    nal_length_size: '4',
//    r_frame_rate: '24/1',
//    avg_frame_rate: '24/1',
//    time_base: '1/12288',
//    start_pts: 0,
//    start_time: '0:00:00.000000',
//    duration_ts: 9021444,
//    duration: '0:12:14.166992',
//    bit_rate: '7.862427 Mbit/s',
//    bits_per_raw_sample: '8',
//    nb_frames: '17620',
//    disposition: [Object],
//    tags: [Object]
//  },
//  {
//    index: 1,
//    codec_name: 'aac',
//    codec_long_name: 'AAC (Advanced Audio Coding)',
//    profile: 'LC',
//    codec_type: 'audio',
//    codec_time_base: '1/44100',
//    codec_tag_string: 'mp4a',
//    codec_tag: '0x6134706d',
//    sample_fmt: 'fltp',
//    sample_rate: '44.100000 KHz',
//    channels: 2,
//    channel_layout: 'stereo',
//    bits_per_sample: 0,
//    r_frame_rate: '0/0',
//    avg_frame_rate: '0/0',
//    time_base: '1/44100',
//    start_pts: 0,
//    start_time: '0:00:00.000000',
//    duration_ts: 32374824,
//    duration: '0:12:14.122993',
//    bit_rate: '182.815000 Kbit/s',
//    max_bit_rate: '182.815000 Kbit/s',
//    nb_frames: '31616',
//    disposition: [Object],
//    tags: [Object] }
//]

// FFMPEG Format Format
//{
//  filename: '/Users/boushley/projects/assets/tears-of-steel/tears-of-steel.mp4',
//  nb_streams: 2,
//  nb_programs: 0,
//  format_name: 'mov,mp4,m4a,3gp,3g2,mj2',
//  format_long_name: 'QuickTime / MOV',
//  start_time: '0:00:00.000000',
//  duration: '0:12:14.167000',
//  size: '704.647316 Mibyte',
//  bit_rate: '8.051315 Mbit/s',
//  probe_score: 100,
//  tags:
//  {
//    major_brand: 'isom',
//    minor_version: '512',
//    compatible_brands: 'isomiso2avc1mp41',
//    encoder: 'Lavf57.25.100'
//  }
//}
