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

        player1Word = "example1"
        player2Word = "example2"

        await clients[player1].send(json.dumps({
            "command": "OTHER_PLAYER PICT_WORD ROOM_ID",
            "data": {
                "other_id": player2,
                "pict_word": player1Word,#goes with permission PICT_WORD
                "opponent_word":player2Word,#goes with permission PICT_WORD
                "room_id":room_id
                }
        }))

        await clients[player2].send(json.dumps({
            "command": "OTHER_PLAYER PICT_WORD ROOM_ID",
            "data": {
                "other_id": player1,
                "pict_word": player2Word,#goes with permission PICT_WORD
                "opponent_word": player1Word,#goes with permission PICT_WORD
                "room_id":room_id
                }
        }))



async def handler(websocket):
    async for message in websocket:
        message = json.loads(message)
        print(message)
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
            


async def main():
    asyncio.create_task(matchmaker())

    async with serve(handler, "localhost", 8080):
        print("Server running on ws://localhost:8080")
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())



