"""
ElevenLabs Service for Mamouse Agent
Based on working Jarvis tutorial implementation
"""

import os
import signal
import threading
import logging
import time
from elevenlabs.client import ElevenLabs
from elevenlabs.conversational_ai.conversation import Conversation
from elevenlabs.conversational_ai.default_audio_interface import DefaultAudioInterface
from config import ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ElevenLabsService:
    def __init__(self):
        self.client = None
        self.conversation = None
        self.conversation_id = None
        self.is_active = False
        self.is_initialized = False
        
        # Callbacks for communication with HTTP bridge
        self.on_agent_response = None
        self.on_user_transcript = None
        self.on_error = None
        self.on_status_change = None
        
        logger.info("🤖 ElevenLabs Service initialized")
    
    def initialize(self):
        """Initialize ElevenLabs client and service"""
        try:
            if self.is_initialized:
                logger.warning("Service already initialized")
                return True
            
            logger.info("🔧 Initializing ElevenLabs client...")
            logger.info(f"🔑 API Key: {ELEVENLABS_API_KEY[:10]}...")
            logger.info(f"🤖 Agent ID: {ELEVENLABS_AGENT_ID}")
            
            # Initialize ElevenLabs client
            self.client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
            
            self.is_initialized = True
            logger.info("✅ ElevenLabs service initialized successfully")
            
            if self.on_status_change:
                self.on_status_change({
                    "status": "initialized",
                    "message": "ElevenLabs service ready"
                })
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize ElevenLabs service: {e}")
            if self.on_error:
                self.on_error(f"Initialization failed: {e}")
            return False
    
    def start_conversation(self):
        """Start ElevenLabs conversation session"""
        try:
            if not self.is_initialized:
                raise Exception("Service not initialized")
            
            if self.is_active:
                logger.warning("Conversation already active")
                return self.conversation_id
            
            logger.info("🎤 Starting ElevenLabs conversation...")
            
            # Create conversation using Jarvis tutorial approach
            self.conversation = Conversation(
                # API client and agent ID
                self.client,
                ELEVENLABS_AGENT_ID,
                
                # No client tools for simple implementation
                client_tools=None,
                
                # Require auth
                requires_auth=True,
                
                # Use default audio interface
                audio_interface=DefaultAudioInterface(),
                
                # Callbacks
                callback_agent_response=self._handle_agent_response,
                callback_agent_response_correction=self._handle_agent_correction,
                callback_user_transcript=self._handle_user_transcript,
                
                # Optional: latency measurement
                callback_latency_measurement=self._handle_latency
            )
            
            # Start the session in a separate thread
            self.conversation_thread = threading.Thread(
                target=self._run_conversation,
                daemon=True
            )
            self.conversation_thread.start()
            
            self.conversation_id = f"mamouse-conversation-{int(time.time())}"
            self.is_active = True
            
            logger.info(f"✅ Conversation started with ID: {self.conversation_id}")
            
            if self.on_status_change:
                self.on_status_change({
                    "status": "active",
                    "conversation_id": self.conversation_id,
                    "message": "Voice conversation active"
                })
            
            return self.conversation_id
            
        except Exception as e:
            logger.error(f"❌ Failed to start conversation: {e}")
            if self.on_error:
                self.on_error(f"Failed to start conversation: {e}")
            return None
    
    def stop_conversation(self):
        """Stop ElevenLabs conversation session"""
        try:
            if not self.is_active:
                logger.warning("No active conversation to stop")
                return True
            
            logger.info("🛑 Stopping ElevenLabs conversation...")
            
            # End the conversation session
            if self.conversation:
                self.conversation.end_session()
            
            self.is_active = False
            self.conversation = None
            self.conversation_id = None
            
            logger.info("✅ Conversation stopped successfully")
            
            if self.on_status_change:
                self.on_status_change({
                    "status": "stopped",
                    "message": "Voice conversation ended"
                })
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to stop conversation: {e}")
            if self.on_error:
                self.on_error(f"Failed to stop conversation: {e}")
            return False
    
    def get_status(self):
        """Get current service status"""
        return {
            "initialized": self.is_initialized,
            "active": self.is_active,
            "conversation_id": self.conversation_id,
            "api_key_present": bool(ELEVENLABS_API_KEY),
            "agent_id_present": bool(ELEVENLABS_AGENT_ID)
        }
    
    def _run_conversation(self):
        """Run conversation in separate thread"""
        try:
            logger.info("🎯 Starting conversation session...")
            
            # Start the conversation session
            self.conversation.start_session()
            
            # Setup signal handler for graceful exit
            def signal_handler(sig, frame):
                logger.info("📡 Received stop signal, ending conversation...")
                self.conversation.end_session()
            
            signal.signal(signal.SIGINT, signal_handler)
            
            # Wait for session to end
            conversation_id = self.conversation.wait_for_session_end()
            logger.info(f"✅ Conversation session ended: {conversation_id}")
            
        except Exception as e:
            logger.error(f"❌ Conversation thread error: {e}")
            if self.on_error:
                self.on_error(f"Conversation error: {e}")
        finally:
            self.is_active = False
    
    def _handle_agent_response(self, response):
        """Handle agent response"""
        logger.info(f"🤖 Agent: {response}")
        if self.on_agent_response:
            self.on_agent_response(response)
    
    def _handle_agent_correction(self, original, corrected):
        """Handle agent response correction"""
        logger.info(f"🔄 Agent correction: {original} -> {corrected}")
        if self.on_agent_response:
            self.on_agent_response(corrected)
    
    def _handle_user_transcript(self, transcript):
        """Handle user transcript"""
        logger.info(f"👤 User: {transcript}")
        if self.on_user_transcript:
            self.on_user_transcript(transcript)
    
    def _handle_latency(self, latency):
        """Handle latency measurement"""
        logger.debug(f"⚡ Latency: {latency}ms")
    
    def set_callbacks(self, callbacks):
        """Set callbacks for communication with HTTP bridge"""
        self.on_agent_response = callbacks.get('on_agent_response')
        self.on_user_transcript = callbacks.get('on_user_transcript')
        self.on_error = callbacks.get('on_error')
        self.on_status_change = callbacks.get('on_status_change')

# Global service instance
elevenlabs_service = ElevenLabsService()
