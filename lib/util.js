function exit(code, msg) {
	process.nextTick(function() { process.exit(code) });

	if (code === 0) {
		console.log(msg);
	} else {
		console.error(msg);
	}
}

function promiseExit(msg) {
	exit(1, msg);
}

module.exports = {exit, promiseExit};
