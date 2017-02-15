const path = require('path');

class Segment {
  constructor (url) {
    this.url = url;
  }

  setData(data) {
    this.data = data;
  }

  getPath(basePath) {
    let result;
    if (this.container) {
      result = this.container.getFolder(basePath);
    } else {
      result = basePath;
    }

    const extension = path.extname(basePath) || 'ts';

    result += `/segment-${this.index}.${extension}`;
    return result;
  }
}

module.exports = Segment;
