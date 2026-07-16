import asyncio
import os
import websockets

async def echo(websocket):
    """Echoes back any message received from the client."""
    async for message in websocket:
        await websocket.send(f"Server received: {message}")

async def main():
    # Bind to 0.0.0.0 so external cloud routers can forward traffic to it
    # Use the PORT environment variable provided by the cloud host, defaulting to 8080
    port = int(os.environ.get("PORT", 8080))
    async with websockets.serve(echo, "0.0.0.0", port):
        await asyncio.Future()  # Keep server running forever

if __name__ == "__main__":
    asyncio.run(main())