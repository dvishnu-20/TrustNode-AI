import asyncio
import websockets
import json
import time

async def test_ws():
    async with websockets.connect("ws://localhost:8000/ws/dashboard") as dashboard_ws:
        # Get initial state
        initial = await dashboard_ws.recv()
        print("Initial state from dashboard:", initial)
        
        # Connect to checkout and send telemetry
        async with websockets.connect("ws://localhost:8000/ws/checkout/TEST-SESSION") as checkout_ws:
            event = {
                "session_id": "TEST-SESSION",
                "event_type": "keydown",
                "field": "card_number",
                "timestamp": time.time() * 1000,
                "duration": 50
            }
            await checkout_ws.send(json.dumps(event))
            
            # Wait for risk update on dashboard
            update = await dashboard_ws.recv()
            print("Update from dashboard:", update)
            
            # Send another event
            event["timestamp"] = time.time() * 1000
            await checkout_ws.send(json.dumps(event))
            
            update2 = await dashboard_ws.recv()
            print("Update 2 from dashboard:", update2)

asyncio.run(test_ws())
