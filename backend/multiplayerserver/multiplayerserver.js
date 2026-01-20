import WebSocket from "ws";


const server = WebSocket.Server({port:8080});//Change to dotenv later.

//map of _id (from mongodb) -> websocket
const clients = {

};

//Will be used for matchmaking.
const clientIdQueue = [];



//"_id1+_id2" -> {user1Img, user2Img}
//Stuff will be added from the clientIdQueue
const matchMadeData = {

}

server.on('connection', (ws) => {




    //Use this for recieving messages from the client
    ws.on('message', (msg) => {
        if(msg.command == 'REGISTER'){
            //Add websocket to clients map
            clients[msg._id] = ws;
            //Add player id to queue for matchmaking.
            clientIdQueue.push(msg._id);
        }
    })
    
});



async function matchMake(){
    while(true){
        
    }
}

