import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGO_URL") or "mongodb://localhost:27017"

logger.info(f"Connecting to MongoDB: {MONGO_URI[:20]}...")

client = AsyncIOMotorClient(MONGO_URI)
db = client["Retogen"]