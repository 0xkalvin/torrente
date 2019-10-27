require('dotenv').config()
const path = require('path')
const fs = require('fs');
const bencode = require('bencode');

const tracker = require('./tracker');

/*  Loading and parsing torrent file    */
const torrent = bencode.decode(fs.readFileSync(path.resolve(__dirname, process.env.TORRENT_FILE)))



tracker.getPeers(torrent, peers => {
    console.log('Peers: ', peers);
})

