const urlParser = require('url').parse;
const dgram = require('dgram');
const crypto = require('crypto');

const parser = require('./parser');
const utils = require('./utils');

module.exports = {

    getPeers(torrent, callback) {

        /*  Creates a Socket */
        const socket = dgram.createSocket('udp4');

        /*  Send connect request  */
        sendMessageViaUDP(socket, buildConnectionRequest(), torrent.announce.toString('utf8'))

        /*  Listening to new messages   */
        socket.on('message', msg => {


            if (respType(msg) === "connect") {
                console.log(" ------  Connected ------");

                /*  Parse received message from tracker */
                const connResp = parseConnectionResponse(msg);

                /*  Use connectionId to prepare a announce request */
                const annouceReq = buildAnnounceRequest(connResp.connectionId);

                /*  Send announce request    */
                sendMessageViaUDP(socket, annouceReq, torrent.announce.toString('utf8'));
            }
            else if (respType(msg) === "announce") {
                console.log(" ------  List of peers received ------");

                /*  Parsing announce response   */
                const announceResp = parseAnnounceResponse(msg);

                /*  Pass peers to callback  */
                callback(announceResp.peers);
            }

        })

    }
}


function sendMessageViaUDP(socket, message, rawURL) {

    /*  Getting tracker url */
    const trackerURL = urlParser(rawURL);

    /*  Sending a message to tracker  */
    socket.send(message, 0, message.length, trackerURL.port, trackerURL.host, () => {
        console.log('Message sent!');
    })

}


function respType(response) {
    const action = response.readUInt32BE(0);
    if (action === 0) return 'connect';
    if (action === 1) return 'announce';
  }



/** 
 * A connection request contains 3 properties:
 *  -   a constant connection id (8 bytes)
 *  -   a constant value that represents a connection request (4 bytes)
 *  -   a random transaction id (4 bytes)
 */  
function buildConnectionRequest() {

    /* Request must have length of 16 bytes */
    const conReq = Buffer.alloc(16);

    /* Writes connection id. Should always be 0x41727101980 */
    conReq.writeUInt32BE(0x417, 0); 
    conReq.writeUInt32BE(0x27101980, 4);

    /* Value should always be 0 for connection request  */
    conReq.writeUInt32BE(0, 8);

    /* Generates a random transaction id  */
    crypto.randomBytes(4).copy(conReq, 12);

    return conReq;

}

/** 
 * A connection response contains 3 properties:
 *  -  the constant value that represents a connection request (4 bytes)
 *  -  the transaction id (4 bytes)
 *  -   the connection id (8 bytes)
*/
function parseConnectionResponse(response) {
    return {
        action: response.readUInt32BE(0),
        transactionId: response.readUInt32BE(4),
        connectionId: response.slice(8)   
    }
}

/*   Default port should be between 6881 and 6889
     according to the specs
*/
function buildAnnounceRequest(connectionId, torrent, port=6881) {

    /* Must have length of 98 bytes */
    const annouceReq = Buffer.allocUnsafe(98);
    /* Connection id */
    connectionId.copy(annouceReq, 0);
    /* Action  */
    annouceReq.writeUInt32BE(1, 8);
    /* Generate a transaction id */
    crypto.randomBytes(4).copy(annouceReq, 12);
    /* Hash of torrent file */
    parser.infoHash(torrent).copy(annouceReq, 16);
    /* My peer client id */
    utils.generateClientId().copy(annouceReq, 36);
    /* Downloaded */
    Buffer.alloc(8).copy(annouceReq, 56);
    /* Left */
    parser.size(torrent).copy(annouceReq, 64);
    /* Uploaded */
    Buffer.alloc(8).copy(annouceReq, 72);
    /* Event -> 0: none; 1: completed; 2: started */
    annouceReq.writeUInt32BE(0, 80);
    /* IP address -> 0: default */
    annouceReq.writeUInt32BE(0, 80);
    /* Key */
    crypto.randomBytes(4).copy(annouceReq, 88);
    /* Num want */
    annouceReq.writeInt32BE(-1, 92);
    /* Port */
    annouceReq.writeUInt16BE(port, 96);

    return annouceReq;
}

function parseAnnounceResponse(response) {

}