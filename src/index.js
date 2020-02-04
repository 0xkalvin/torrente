require('dotenv').config()
const path = require('path')

const parser = require("./torrentParser");
const tracker = require('./tracker');

/*  Loading and parsing torrent file    */
const torrent = parser.open(path.resolve(process.env.TORRENT_FILE))


tracker.getPeers(torrent, peers => {
    console.log('Peers: ', peers);
})

