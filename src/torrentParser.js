
const fs = require('fs');
const bencode = require('bencode');
const crypto = require('crypto');
const bignum = require('bignum');

module.exports = {
    
    open(filePath){
        return bencode.decode(fs.readFileSync(filePath));
    },

    /* Bittorrent uses sha1 as its hashing function */
    infoHash(torrent){
        const info = bencode.encode(torrent.info);
        return crypto.createHash('sha1').update(info).digest();
    },

    /*  Left    */
    size(torrent){

        const size = torrent.info.files ? torrent.info.files.map(f => f.length).reduce((a, b) => a + b) : torrent.info.length
        /* Writing size to a buffer of size 8 bytes */
        return bignum.toBuffer(size, { size: 8}) 
    }
}