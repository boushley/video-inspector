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

  parseManifest() {
    const lines = this.data.split('\n');

    const hlsTag = lines.shift().trim();
    if (hlsTag !== '#EXTM3U') {
      throw new Error(`Invalid HLS manifest format, missing header. Found <${hlsTag}>`);
    }

    const metadata = {tags:[]};
    const items = []

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
          items.push(itemToAdd);
          buildingItem = {
            comments: [],
            tags: [],
            url: null
          };
        }
      } else {
        if (l.startsWith('#EXTINF')) {
          metadata.isMaster = false;
          foundItem = true;
          buildingItem.tags.push(l);
        } else if (l.startsWith('#EXT-X-STREAM-INF')) {
          itemConstructor = Manifest;
          metadata.isMaster = true;
          foundItem = true;
          buildingItem.tags.push(l);
        } else {
          metadata.tags.push(l);
        }
      }
    });

    this.metadata = metadata;
    this.items = items;
  }
}

module.exports = Manifest;
