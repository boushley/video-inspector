const url = require('url');
const Segment = require('./segment');

class Manifest {
  constructor (url) {
    this.url = url;
    this.isManifest = true;
  }

  setData (data) {
    this.data = data.trim();
    this.parseManifest();
  }

  getFolder () {
    let result = '';
    if (this.index || this.index === 0) {
      result += `/variant-${this.index}`;
    }
    return result;
  }

  getPath () {
    return this.getFolder() + '/playlist.m3u8';
  }

  getUpdatedFile () {
    let result = '';

    this.tags.forEach(t => {
      result += t + "\n";
    });

    this.items.forEach(i => {
      i.tags.forEach(t => {
        result += t + "\n";
      });

      // Add relative path instead of url
      if (i.isManifest) {
        result += i.getPath().substr(1) + "\n\n";
      } else {
        result += i.getFile() + "\n\n";
      }
    });

    return result;
  }

  parseManifest() {
    const lines = this.data.split('\n');

    const hlsTag = lines.shift().trim();
    if (hlsTag !== '#EXTM3U') {
      throw new Error(`Invalid HLS manifest format, missing header. Found <${hlsTag}>`);
    }

    this.tags = [hlsTag];
    this.items = []

    let itemConstructor = Segment;
    let foundItem = false;
    let buildingItem = {
      comments: [],
      tags: [],
      url: null
    };

    lines.forEach(l => {
      l = l.trim();
      if (!l) {
        return;
      }

      if (foundItem) {
        if (l.startsWith('#EXT')) {
          buildingItem.tags.push(l);
        } else if (l.startsWith('#')) {
          buildingItem.comments.push(l);
        } else {
          const itemToAdd = new itemConstructor(url.resolve(this.url, l));
          itemToAdd.comments = buildingItem.comments;
          itemToAdd.tags = buildingItem.tags;
          itemToAdd.index = this.items.length;
          itemToAdd.container = this;
          this.items.push(itemToAdd);
          buildingItem = {
            comments: [],
            tags: [],
            url: null
          };
        }
      } else {
        if (l.startsWith('#EXTINF')) {
          this.isMaster = false;
          foundItem = true;
          buildingItem.tags.push(l);
        } else if (l.startsWith('#EXT-X-STREAM-INF')) {
          itemConstructor = Manifest;
          this.isMaster = true;
          foundItem = true;
          buildingItem.tags.push(l);
        } else {
          this.tags.push(l);
        }
      }
    });
  }
}

module.exports = Manifest;
