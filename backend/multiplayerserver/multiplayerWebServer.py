import asyncio
from websockets.asyncio.server import serve
from websockets.exceptions import ConnectionClosedOK
import json

print("Ran file")

clients = dict()

clientIdQueue = []

matchMadeData = dict()

async def handler(websocket):
    async for message in websocket:
        print(message)


async def main():
    async with serve(handler, "localhost", 8080) as server:
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())