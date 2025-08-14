"""
Configuration for ElevenLabs Python Backend Service
Based on working Jarvis tutorial implementation
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# DDR CLEANUP: ElevenLabs configuration moved to components/voice/voice-config.js (SSOT)
# Python scripts now get config from JavaScript via process arguments or environment
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "sk_9131261681c86fe4479ae577c64df46fddb4efaecad98a26")
ELEVENLABS_AGENT_ID = os.getenv("ELEVENLABS_AGENT_ID", "agent_01k0e81qeref59p5h71h1zdbh7")

# HTTP Server Configuration
HTTP_HOST = "localhost"
HTTP_PORT = 8765

# Logging Configuration
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Service Configuration
SERVICE_NAME = "Mamouse ElevenLabs Backend"
SERVICE_VERSION = "1.0.0"

# Validate configuration
def validate_config():
    """Validate that required configuration is present"""
    if not ELEVENLABS_API_KEY or ELEVENLABS_API_KEY == "your_api_key_here":
        raise ValueError("ELEVENLABS_API_KEY is required")
    
    if not ELEVENLABS_AGENT_ID or ELEVENLABS_AGENT_ID == "your_agent_id_here":
        raise ValueError("ELEVENLABS_AGENT_ID is required")
    
    return True

# Configuration summary
def get_config_summary():
    """Get configuration summary for logging"""
    return {
        "service_name": SERVICE_NAME,
        "service_version": SERVICE_VERSION,
        "http_host": HTTP_HOST,
        "http_port": HTTP_PORT,
        "api_key_present": bool(ELEVENLABS_API_KEY and len(ELEVENLABS_API_KEY) > 10),
        "agent_id_present": bool(ELEVENLABS_AGENT_ID and len(ELEVENLABS_AGENT_ID) > 10),
        "log_level": LOG_LEVEL
    }
