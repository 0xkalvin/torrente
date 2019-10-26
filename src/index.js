require('dotenv').config()
const path = require('path')
const fs = require('fs');
const bencode = require('bencode');

const torrent = bencode.decode(fs.readFileSync(path.resolve(__dirname, process.env.TORRENT_FILE)), 'utf8')

console.log(torrent);
// console.log(torrent.announce.toString('utf8'));