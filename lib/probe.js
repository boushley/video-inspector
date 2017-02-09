var spawn = require('child_process').spawn,
	path = require('path');

module.exports = function probe(file, options) {
	return new Promise((resolve, reject) => {
	var args = ['-loglevel', 'warning', '-print_format', 'json', '-pretty'];

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

	proc.stdout.on('data', function(data) { probeData.push(data) });
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
