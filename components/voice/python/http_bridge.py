"""
HTTP Bridge Server for Mamouse Agent ElevenLabs Integration
Provides REST API for Electron frontend to communicate with Python backend
"""

import json
import logging
import threading
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import HTTP_HOST, HTTP_PORT, SERVICE_NAME, SERVICE_VERSION, get_config_summary, validate_config
from elevenlabs_service import elevenlabs_service

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for Electron communication

# Store conversation messages for Electron to poll
conversation_messages = []
conversation_lock = threading.Lock()

def add_conversation_message(message_type, content, sender="system"):
    """Add message to conversation buffer"""
    with conversation_lock:
        message = {
            "type": message_type,
            "content": content,
            "sender": sender,
            "timestamp": int(time.time() * 1000)
        }
        conversation_messages.append(message)
        
        # Keep only last 100 messages
        if len(conversation_messages) > 100:
            conversation_messages.pop(0)
        
        logger.info(f"📨 Added message: {message_type} - {content[:50]}...")

# Setup ElevenLabs service callbacks
def setup_service_callbacks():
    """Setup callbacks for ElevenLabs service"""
    elevenlabs_service.set_callbacks({
        'on_agent_response': lambda response: add_conversation_message(
            "agent_response", response, "assistant"
        ),
        'on_user_transcript': lambda transcript: add_conversation_message(
            "user_transcript", transcript, "user"
        ),
        'on_error': lambda error: add_conversation_message(
            "error", str(error), "system"
        ),
        'on_status_change': lambda status: add_conversation_message(
            "status_change", json.dumps(status), "system"
        )
    })

# API Routes

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "config": get_config_summary()
    })

@app.route('/status', methods=['GET'])
def get_status():
    """Get ElevenLabs service status"""
    try:
        status = elevenlabs_service.get_status()
        return jsonify({
            "success": True,
            "status": status
        })
    except Exception as e:
        logger.error(f"❌ Error getting status: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/start-conversation', methods=['POST'])
def start_conversation():
    """Start ElevenLabs conversation"""
    try:
        logger.info("🎤 Received request to start conversation")
        
        # Initialize service if not already done
        if not elevenlabs_service.is_initialized:
            if not elevenlabs_service.initialize():
                return jsonify({
                    "success": False,
                    "error": "Failed to initialize ElevenLabs service"
                }), 500
        
        # Start conversation
        conversation_id = elevenlabs_service.start_conversation()
        
        if conversation_id:
            return jsonify({
                "success": True,
                "conversationId": conversation_id,
                "message": "Conversation started successfully"
            })
        else:
            return jsonify({
                "success": False,
                "error": "Failed to start conversation"
            }), 500
            
    except Exception as e:
        logger.error(f"❌ Error starting conversation: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/stop-conversation', methods=['POST'])
def stop_conversation():
    """Stop ElevenLabs conversation"""
    try:
        logger.info("🛑 Received request to stop conversation")
        
        success = elevenlabs_service.stop_conversation()
        
        if success:
            return jsonify({
                "success": True,
                "message": "Conversation stopped successfully"
            })
        else:
            return jsonify({
                "success": False,
                "error": "Failed to stop conversation"
            }), 500
            
    except Exception as e:
        logger.error(f"❌ Error stopping conversation: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/messages', methods=['GET'])
def get_messages():
    """Get conversation messages for Electron frontend"""
    try:
        with conversation_lock:
            # Get messages since last poll
            since = request.args.get('since', 0, type=int)
            filtered_messages = [
                msg for msg in conversation_messages 
                if msg['timestamp'] > since
            ]
            
            return jsonify({
                "success": True,
                "messages": filtered_messages,
                "total_messages": len(conversation_messages)
            })
            
    except Exception as e:
        logger.error(f"❌ Error getting messages: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/clear-messages', methods=['POST'])
def clear_messages():
    """Clear conversation messages"""
    try:
        with conversation_lock:
            conversation_messages.clear()
        
        return jsonify({
            "success": True,
            "message": "Messages cleared successfully"
        })
        
    except Exception as e:
        logger.error(f"❌ Error clearing messages: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500

def run_server():
    """Run the HTTP bridge server"""
    try:
        # Validate configuration
        validate_config()
        
        # Setup service callbacks
        setup_service_callbacks()
        
        logger.info(f"🚀 Starting {SERVICE_NAME} HTTP Bridge Server")
        logger.info(f"📡 Server will run on http://{HTTP_HOST}:{HTTP_PORT}")
        logger.info("💡 Use Ctrl+C to stop the server")
        
        # Run Flask app
        app.run(
            host=HTTP_HOST,
            port=HTTP_PORT,
            debug=False,
            threaded=True
        )
        
    except Exception as e:
        logger.error(f"❌ Failed to start HTTP bridge server: {e}")
        raise

if __name__ == "__main__":
    run_server()
