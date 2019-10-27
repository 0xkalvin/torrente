const urlParser = require('url').parse;
const dgram = require('dgram');

module.exports = {

    getPeers(torrent, callback) {

        /*  Creates a Socket */
        const socket = dgram.createSocket('udp4');

        /*  Send connect request  */
        sendMessageViaUDP(socket, buildConnectionRequest() , torrent.announce.toString('utf8'))

        /*  Listening to new messages   */
        socket.on('message', msg => {


            if(respType(msg) === "connect"){
                console.log(" ------  Connected ------");
                
                /*  Parse received message from tracker */
                const connResp = parseConnectionResponse(msg);

                /*  Use connectionId to prepare a announce request */
                const annouceReq = buildAnnounceRequest(connResp.connectionId);

                /*  Send announce request    */
                sendMessageViaUDP(socket, annouceReq, torrent.announce.toString('utf8'));
            }
            else if(respType(msg) === "announce"){
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


function respType(response){

}


function parseConnectionResponse(response){

}

function parseAnnounceResponse(response){

}


function buildConnectionRequest(){

}

function buildAnnounceRequest(connectionId){
    
}