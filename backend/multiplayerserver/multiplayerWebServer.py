import asyncio
from websockets.asyncio.server import serve
import json
import uuid
import requests
from dotenv import load_dotenv
import os

load_dotenv()

LLM_KEY = os.getenv("llmkey")

MATCH_DELIMETER = ":"

clients = {}
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



async def handler(websocket):
    async for message in websocket:
        message = json.loads(message)
        
        if message["command"] == "REGISTER":
            player_id = message["data"]["_id"]

            print("REGISTER:", player_id)

            

            clients[player_id] = websocket
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
                

            



async def main():
    asyncio.create_task(matchmaker())

    async with serve(handler, "localhost", 8080):
        print("Server running on ws://localhost:8080")
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



