import asyncio
from websockets.asyncio.server import serve
import json
import uuid
import requests
from dotenv import load_dotenv
import os
import time
from websockets.protocol import State

load_dotenv()

LLM_KEY = os.getenv("llmkey")

MATCH_DELIMETER = ":"

clients = {}
client_heartbeat = {}
matchMadeData = {}

# Async queue for matchmaking
match_queue = asyncio.Queue()


async def matchmaker():
    while True:
        # Wait until two players are available
        player1 = await match_queue.get()
        player2 = await match_queue.get()

        room_id = str(uuid.uuid4())

        print(f"MATCH MADE in room: {room_id} player1:{player1} player2:{player2}")


        matchMadeData[room_id] = {
            player1: None,
            player2: None
        }

        

        player1Word = "example1" #TODO replace with random word
        player2Word = "example2" #TODO replace with random word

        await clients[player1].send(json.dumps({
            "command": "OTHER_PLAYER PICT_WORD ROOM_ID",
            "data": {
                "my_id": player1,
                "other_id": player2,
                "pict_word": player1Word,#goes with permission PICT_WORD
                "opponent_word":player2Word,#goes with permission PICT_WORD
                "room_id":room_id,
                "judge" : False
                }
        }))

        await clients[player2].send(json.dumps({
            "command": "OTHER_PLAYER PICT_WORD ROOM_ID",
            "data": {
                "my_id": player2,
                "other_id": player1,
                "pict_word": player2Word,#goes with permission PICT_WORD
                "opponent_word": player1Word,#goes with permission PICT_WORD
                "room_id":room_id,
                "judge": True
                }
        }))

        



#Handle game ending (done)
#Handle rooms when player reloads page (need to test)
#Implement heartbeat system

def findPlayerRoom(player_id):
    for room in matchMadeData.keys():
        if player_id in matchMadeData[room].keys():
            return room
    return -1


async def handler(websocket):
    async for message in websocket:
        message = json.loads(message)
        
        if message["command"] == "REGISTER":
            player_id = message["data"]["_id"]

            print("REGISTER:", player_id)
            
            if(player_id in clients.keys()):
                print("PLAYER ACTUALLY REFRESHED PAGE!")
                room_id = findPlayerRoom(player_id)
                
                if room_id != -1:
                    print("Found the room id: " + str(room_id))
                    id_keys = matchMadeData[room_id].keys()
                    del matchMadeData[room_id]

                    #Send a message to the opponent saying that they have to end the game
                    for id_key in id_keys:
                        if id_key != player_id:

                            opponent_payload = {
                                "command":"END_GAME",
                                "data": {
                                    "reason_id":2
                                }
                            }

                            if(clients[id_key].state == State.OPEN):
                                print(type(clients[id_key]))
                                await clients[id_key].send(json.dumps(opponent_payload))
                            
                            del clients[id_key]
                            del client_heartbeat[id_key]
            

            clients[player_id] = websocket
            client_heartbeat[player_id] = time.time()
            
            await match_queue.put(player_id)
            print(match_queue)
        if message["command"] == "RESET_OPPONENT_WORD":
            
            opponent_websocket = clients[message["data"]["opponent_id"]]
            reset_pict_word = message["data"]["pict_word"]
            opponent_message = {
                "command":"RESET_PICTWORD",
                "data": {
                    "pict_word": reset_pict_word
                }
            }
            await opponent_websocket.send(json.dumps(opponent_message))
        
        if message["command"] == "RESET_BOARD":
            opponent_websocket = clients[message["data"]["opponent_id"]]
            reset_pict_word = message["data"]["pict_word"]
            opponent_message = {
                "command":"RESET_BOARD",
                "data": {
                    "pict_word": reset_pict_word
                }
            }
            await opponent_websocket.send(json.dumps(opponent_message))

        if message["command"] == "SEND_PROMPT":
            opponent_websocket = clients[message["data"]["opponent_id"]]
            prompt = message["data"]["prompt"]

            opponent_message = {
                "command": "SEND_PROMPT",
                "data": {
                    "prompt": prompt
                }
            }

            await opponent_websocket.send(json.dumps(opponent_message))
        
        if message["command"] == "UPLOAD_IMAGE":
            opponent_id = message["data"]["opponent_id"]
            current_id = message["data"]["my_id"]
            base64ImgUrl = message["data"]["img_url_64"]
            room_id = message["data"]["room_id"]
            prompt = message["data"]["prompt"]
            matchMadeData[room_id][current_id] = base64ImgUrl
            print("Image recieved by: " + current_id)
            

            if matchMadeData[room_id][opponent_id] != None:
                #send a message to both clients, marking one of them as llm judgment to start llm judgement on client side
                #actually, just do the judgement here
                scores = await callJudgementLLM(current_id, opponent_id, room_id, prompt)
                print(scores)
                for playerId in scores.keys():
                    socket = clients[playerId]
                    payload = {
                        "command":"RECIEVE_SCORES",
                        "data":{
                            "scores":scores
                        }
                    }

                    await socket.send(json.dumps(payload))
                    print("sent!!!")

        if message["command"] == 'END_GAME':
            print("GOT HERE IN THE END GAME")

            opponent_id = message["data"]["opponent_id"]
            current_id = message["data"]["current_id"]
            room_id = message["data"]["room_id"]
            #reason id = 1 means the game ended
            # reason id = 2 means a user left the game in the middle of the game
            reason_id = int(message["data"]["reason_id"])

            if reason_id == 2:
                opponent_payload = {
                    "command":"END_GAME",
                    "data": {
                        "reason_id":reason_id
                    }
                }

                clients[opponent_id].send(json.dumps(opponent_payload))
        

            
            del matchMadeData[room_id]
            del clients[current_id]
            del clients[opponent_id]
            del client_heartbeat[current_id]
            del client_heartbeat[opponent_id]
            print(len(matchMadeData))
            print(len(clients))
        
        if message["command"] == "HEART_BEAT":
            current_id = message["data"]["current_id"]
            client_heartbeat[current_id] = time.time()

    
                
MAX_SECONDS = 10


#Ends the match for a specific room_id
async def end_match(room_id, faulty_player):
    
    opponent_payload = {
        "command":"END_GAME",
        "data": {
            "reason_id":2
        }
    }

    id_key = ""
    for id in matchMadeData[room_id].keys():
        if id != faulty_player:
            id_key = id

    if clients[id_key].state == State.OPEN:
        await clients[id_key].send(json.dumps(opponent_payload))
    
    del clients[id_key]
    del clients[faulty_player]
    del client_heartbeat[id_key]
    del client_heartbeat[faulty_player]


            
async def heart_beat():
    #Go through every room and check the player's last heart beat
    #If a player's heart beat was more than 

    while True:
        rooms_to_remove = []
        for room in matchMadeData.keys():
            for player in matchMadeData[room].keys():
                if player in client_heartbeat and time.time() - client_heartbeat[player] > MAX_SECONDS:
                    # perform removal process
                    await end_match(room, player)
                    rooms_to_remove.append(room)
        
        for room in rooms_to_remove:
            del matchMadeData[room]
        
        await asyncio.sleep(1)







async def main():
    asyncio.create_task(matchmaker())
    asyncio.create_task(heart_beat())
    port = int(os.environ.get("PORT", 8080))
    async with serve(handler, "0.0.0.0", port):
        print("Server running on port " + str(port))
        await asyncio.Future()  # run forever


# Returns a dictionary in format of player_key:score. there will be two dictionary entries since there are two players
async def callJudgementLLM(player1Key, player2Key, room_id, prompt):
    prompts = [
                    {
                        'role':'user',
                        'content': [
                            {
                                "type":"text",
                                "text": f"Here is player1's id({player1Key})'s image"
                            },
                            {
                                "type":"image_url",
                                "image_url":matchMadeData[room_id][player1Key]
                            },
                            {
                                "type":"text",
                                "text": f"Here is player2's id({player2Key})'s image"
                            },
                            {
                                "type":"image_url",
                                "image_url":matchMadeData[room_id][player2Key]
                            },
                            {
                                "type":"text",
                                "text": f"Return a number out of 10 for both outputs. Judge both players against this prompt: {prompt}. Whoever has a better, more artistic drawing that matches the prompt accurately should get the higher score. Avoid draws. Just return an output that look like this: 5 7. First number is player 1's score and second number is player 2's score. Do not say 5/10 or 7/10. I just need the two numbers with a space between them."
                            }
                        ]
                     }
                ]
    

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {LLM_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        "messages":prompts,
        "reasoning":{
            "enabled":True
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    print(response.json())
    scores = response.json()["choices"][0]["message"]["content"].split(" ")
    return {
        player1Key:scores[0],
        player2Key:scores[1]
    }
    

if __name__ == "__main__":
    asyncio.run(main())



