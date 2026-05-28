"""
websocket_server.py — WebSocket bridge between Python backend and React UI.

Runs in a background daemon thread so it doesn't block the main loop.
Any thread can call broadcast_sync() to push a JSON message to all
connected browser clients.

Port: 8765 (ws://localhost:8765)

Message schema:
  {"event": "mode_cycle"}          — GPIO 27 button pressed, cycle display mode
  {"event": "frame", "data": ...}  — inference frame (future: real pipeline)
"""

import asyncio
import json
import threading

import websockets
from websockets.server import WebSocketServerProtocol

WS_HOST = "0.0.0.0"
WS_PORT = 8765

_loop: asyncio.AbstractEventLoop | None = None
_clients: set[WebSocketServerProtocol] = set()


async def _handler(ws: WebSocketServerProtocol) -> None:
    _clients.add(ws)
    try:
        async for _ in ws:
            pass  # no inbound messages needed yet
    finally:
        _clients.discard(ws)


async def _broadcast(msg: dict) -> None:
    if not _clients:
        return
    data = json.dumps(msg)
    await asyncio.gather(
        *[c.send(data) for c in _clients.copy()],
        return_exceptions=True,
    )


def broadcast_sync(msg: dict) -> None:
    """Thread-safe: call from any thread to push msg to all UI clients."""
    if _loop and _loop.is_running():
        asyncio.run_coroutine_threadsafe(_broadcast(msg), _loop)


def start() -> None:
    """Start the WebSocket server in a background daemon thread."""

    def _run() -> None:
        global _loop
        _loop = asyncio.new_event_loop()
        asyncio.set_event_loop(_loop)

        async def _serve() -> None:
            async with websockets.serve(_handler, WS_HOST, WS_PORT):
                await asyncio.Future()

        _loop.run_until_complete(_serve())

    t = threading.Thread(target=_run, daemon=True, name="ws-server")
    t.start()
