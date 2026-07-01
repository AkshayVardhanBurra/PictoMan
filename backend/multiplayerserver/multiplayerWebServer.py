import asyncio
from websockets.asyncio.server import serve
import json
import uuid

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

            matchMadeData[room_id][current_id] = base64ImgUrl
            print("Image recieved by: " + current_id)
            

            if matchMadeData[room_id][opponent_id] != None:
                #send a message to both clients, marking one of them as llm judgment to start llm judgement on client side
                #actually, just do the judgement here
                await asyncio.sleep(20)
                print("CALLING API")
                pass

            



async def main():
    asyncio.create_task(matchmaker())

    async with serve(handler, "localhost", 8080):
        print("Server running on ws://localhost:8080")
        await asyncio.Future()  # run forever


# Returns a dictionary in format of player_key:score. there will be two dictionary entries since there are two players
async def callJudgementLLM(player1Key, player2Key):
    pass

if __name__ == "__main__":
    asyncio.run(main())



