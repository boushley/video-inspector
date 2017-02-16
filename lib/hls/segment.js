const path = require('path');

class Segment {
  constructor (url) {
    this.url = url;
  }

  setData(data) {
    this.data = data;
  }

  getFolder() {
    return this.container.getFolder();
  }

  getFile() {
    const extension = path.extname(this.url) || '.ts';
    return `segment-${this.index}${extension}`;
  }
}

module.exports = Segment;
