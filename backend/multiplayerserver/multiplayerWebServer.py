import asyncio
import http
import os
import websockets

async def echo(websocket):
    """Handles persistent WebSocket connections."""
    async for message in websocket:
        await websocket.send(f"Server received: {message}")

def health_check_handler(connection, request):
    """Intercepts Render's HTTP requests to pass the health check."""
    # Check if the incoming request is a standard HTTP request, not a WebSocket upgrade
    if "upgrade" not in request.headers.get("Upgrade", "").lower():
        # Respond with a standard HTTP 200 OK success status
        response = connection.respond(http.HTTPStatus.OK, "OK\n")
        return response
    # If it is a WebSocket request, let it pass through to the echo handler
    return None

async def main():
    port = int(os.environ.get("PORT", 8080))
    # Pass the health_check_handler to the process_request configuration
    async with websockets.serve(echo, "0.0.0.0", port, process_request=health_check_handler):
        await asyncio.Future()  # Keep server running forever

if __name__ == "__main__":
    asyncio.run(main())