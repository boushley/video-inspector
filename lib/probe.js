var spawn = require('child_process').spawn,
  path = require('path');

module.exports = function probe(file, options) {
  return new Promise((resolve, reject) => {
    var args = ['-loglevel', 'warning', '-print_format', 'json', '-pretty'];

    let whereToPutFrames = null
    if (options && options.framesArray) {
      whereToPutFrames = options.framesArray;
    }
    const framesArray = whereToPutFrames;

    if (options && options.getFrames) {
      args.push('-show_frames');
    }
    if (!options || options.getStreams !== false) {
      args.push('-show_streams');
    }
    if (!options || options.getFormat !== false) {
      args.push('-show_format');
    }

    args.push(file);

    var proc = spawn('ffprobe', args),
      probeData = [],
      errData = [],
      exitCode = null,
      start = Date.now();

    proc.stdout.setEncoding('utf8');
    proc.stderr.setEncoding('utf8');

    let oldData = '';
    proc.stdout.on('data', function(newData) {
      probeData.push(newData);
      if (framesArray) {
        data = (oldData + newData).trim();

        if (data.startsWith("{\n    \"frames\": [")) {
          data = data.substr(17).trim();
        }

        let frames = data.split(/},/);

        // TODO Be sure we catch the last frame at some point
        oldData = frames.pop();

        frames.forEach(frameString => {
          frameString = frameString + '}';
          try {
            framesArray.push(JSON.parse(frameString.trim()));
          } catch (e) {
            console.log('Parsing:', frameString);
            console.log(e);
            oldData = frameString + oldData;
          }
        });
      }
    });
    proc.stderr.on('data', function(data) { errData.push(data) });

    proc.on('exit', function(code) {
      exitCode = code;
    });
    proc.on('error', function(err) {
      reject(err);
    });
    proc.on('close', function() {

      if (exitCode) {
        var err_output = errData.join('');
        return reject(err_output);
      }

      var data = JSON.parse(probeData.join(''));

      resolve({
        filename: path.basename(file),
        filepath: path.dirname(file),
        fileext: path.extname(file),
        file: file,
        probe_time: Date.now() - start,
        streams: data.streams,
        format: data.format,
        frames: data.frames,
        metadata: data.metadata
      });
    });
  });
};
