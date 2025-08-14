"""
Mamouse Agent ElevenLabs Python Service Launcher
"""

import sys
import os
import logging

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from http_bridge import run_server

def main():
    """Main entry point"""
    try:
        print("🤖 Mamouse Agent - ElevenLabs Python Service")
        print("=" * 50)
        print("🎤 Starting ElevenLabs voice conversation service...")
        print("📡 HTTP Bridge will be available at http://localhost:8765")
        print("💡 Press Ctrl+C to stop the service")
        print("=" * 50)
        
        # Run the HTTP bridge server
        run_server()
        
    except KeyboardInterrupt:
        print("\n👋 Service stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Service failed to start: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
