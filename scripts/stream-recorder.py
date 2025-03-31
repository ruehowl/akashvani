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
INTERVAL_DURATION = 30

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

# Create VLC instance with no audio output
instance = vlc.Instance("--no-audio")  # Add "--no-audio" to disable audio output

def record_chunk():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = os.path.join(OUTPUT_DIR, f"recording_{timestamp}.mp3")
    logging.info(f"Starting new recording: {output_file}")

    retries = 3  # Number of retries in case of failure
    for attempt in range(1, retries + 1):
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
            break  # Exit the retry loop if successful
        except Exception as e:
            logging.error(f"Attempt {attempt} failed during recording: {e}")
            if attempt == retries:
                logging.error("Max retries reached. Skipping this recording.")
                raise
            else:
                logging.info("Retrying...")
                time.sleep(5)  # Wait before retrying

if __name__ == "__main__":
    # Align to the next interval minus 1 minute
    now = datetime.now()
    next_chunk_time = (now + timedelta(minutes=INTERVAL_DURATION - now.minute % INTERVAL_DURATION)).replace(second=0, microsecond=0) - timedelta(minutes=1)

    try:
        logging.info("Stream recorder started.")
        logging.info(f"Waiting for the next recording interval at {next_chunk_time}. Current time: {now}.")
        
        # Wait until the next recording interval
        while datetime.now() < next_chunk_time:
            time.sleep(10)  # Sleep for a short duration to avoid busy-waiting

        logging.info(f"Starting recording process at {datetime.now()}.")
        record_chunk()
        logging.info("Recording process completed. Exiting.")
    except KeyboardInterrupt:
        logging.warning("Interrupted by user. Stopping recording...")
        instance.release()
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        instance.release()
