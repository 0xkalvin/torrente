const crypto = require('crypto');


let id = undefined;

module.exports = {

    /*  The identifier of this client. It can be any 
        random 20-bytes string. There's also a convention of how
        creating one, combining a name and its version  */
    generateClientId(){
        if(!id){
            id = crypto.randomBytes(20);
            Buffer.from(process.env.CLIENT_NAME).copy(id, 0);
        }
        return id;
    }


}