from moviepy.audio.io.AudioFileClip import AudioFileClip
from moviepy.video.VideoClip import ImageClip
import os
from datetime import datetime
import argparse  # Add argparse for command-line arguments

def combine_mp3_to_video(audio_filepath, image_filepath, output_dir="combined_videos", output_filename="combined_radio.mp4"):
    """
    Combines a single MP3 file into a video with a static image.

    Args:
        audio_filepath (str): Path to the MP3 audio file.
        image_filepath (str): Path to the static image file (e.g., JPG, PNG).
        output_dir (str): Directory to save the output video file.
        output_filename (str): Name of the output video file.
    """
    os.makedirs(output_dir, exist_ok=True)
    output_filepath = os.path.join(output_dir, output_filename)

    if not os.path.exists(audio_filepath):
        print(f"Error: Audio file not found at '{audio_filepath}'.")
        return

    try:
        audio_clip = AudioFileClip(audio_filepath)
        audio_duration = audio_clip.duration

        image_clip = ImageClip(image_filepath, duration=audio_duration)
        image_clip.audio = audio_clip
        video_clip = image_clip

        video_clip.write_videofile(output_filepath, codec="libx264", audio_codec="aac", fps=24)

        audio_clip.close()
        image_clip.close()
        video_clip.close()

        print(f"Successfully created video: {output_filepath}")

    except Exception as e:
        print(f"Error processing audio file: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Combine an MP3 file into a video with a static image.")
    parser.add_argument("--audio_filepath", type=str, required=True, help="Path to the MP3 file.")
    parser.add_argument("--static_image", type=str, required=True, help="Path to the static image file.")
    parser.add_argument("--output_video_directory", type=str, default="combined_videos", help="Directory to save the output video.")
    parser.add_argument("--output_video_name", type=str, default=f"combined_radio_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4", help="Name of the output video file.")

    args = parser.parse_args()

    if not os.path.exists(args.static_image):
        print(f"Error: Static image not found at '{args.static_image}'. Please provide a valid image file.")
    elif not os.path.exists(args.audio_filepath):
        print(f"Error: Audio file not found at '{args.audio_filepath}'. Please provide a valid MP3 file.")
    else:
        combine_mp3_to_video(args.audio_filepath, args.static_image, args.output_video_directory, args.output_video_name)