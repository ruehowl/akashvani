import vlc
import time
from datetime import datetime, timedelta
import os
import logging

# Streaming URL for AIR Kochi 102.3 FM
STREAM_URL = "https://air.pc.cdn.bitgravity.com/air/live/pbaudio045/playlist.m3u8"

# Directory to save recordings
OUTPUT_DIR = "radio_recordings"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Interval duration for scheduling recordings (in minutes)
INTERVAL_DURATION = 3

# Recording chunk duration (in seconds)
CHUNK_DURATION = (INTERVAL_DURATION + 2) * 60  # Interval duration + 2 minutes buffer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("stream_recorder.log"),
        logging.StreamHandler()  # Add this to log to the console
    ]
)

# Create VLC instance
instance = vlc.Instance()

def record_chunk():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = os.path.join(OUTPUT_DIR, f"recording_{timestamp}.mp3")
    logging.info(f"Starting new recording: {output_file}")

    try:
        record_options = f":sout=#transcode{{acodec=mp3,ab=128}}:file{{dst='{output_file}'}}"
        record_media = instance.media_new(STREAM_URL, record_options)
        record_player = instance.media_player_new()
        record_player.set_media(record_media)
        record_player.play()

        time.sleep(CHUNK_DURATION)
        record_player.stop()
        record_player.release()
        logging.info(f"Recording finished successfully: {output_file}")
    except Exception as e:
        logging.error(f"Failed during recording: {e}")
        raise

if __name__ == "__main__":
    # Align to the next interval minus 1 minute
    now = datetime.now()
    next_chunk_time = (now + timedelta(minutes=INTERVAL_DURATION - now.minute % INTERVAL_DURATION)).replace(second=0, microsecond=0) - timedelta(minutes=1)

    try:
        logging.info("Stream recorder started.")
        while True:
            now = datetime.now()
            if now >= next_chunk_time:
                logging.info(f"Starting recording process at {now}.")
                record_chunk()
                logging.info("Recording process completed.")
                # Schedule the next chunk
                next_chunk_time += timedelta(minutes=INTERVAL_DURATION)
            else:
                logging.info(f"Waiting for the next recording interval at {next_chunk_time}. Current time: {now}.")
            
            # Sleep for a short duration to avoid busy-waiting
            time.sleep(10)
    except KeyboardInterrupt:
        logging.warning("Interrupted by user. Stopping recording...")
        instance.release()
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        instance.release()
