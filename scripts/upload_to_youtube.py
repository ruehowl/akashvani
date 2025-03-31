import os
import argparse
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import pickle

# Define the scopes required for YouTube Data API
SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]

def authenticate_youtube():
    """Authenticate the user using a pre-generated token.pickle file."""
    credentials = None

    # Check if the token.pickle file exists
    if os.path.exists("token.pickle"):
        with open("token.pickle", "rb") as token:
            credentials = pickle.load(token)

    # Refresh the token if it's expired
    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
        else:
            raise Exception("Invalid or expired credentials. Please re-authenticate and generate a new token.pickle.")

    return build("youtube", "v3", credentials=credentials)

def upload_video(youtube, video_file, title, description, category_id, tags):
    """Upload a video to YouTube."""
    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags,
            "categoryId": category_id,
        },
        "status": {
            "privacyStatus": "unlisted",  # Change to "private" or "unlisted" if needed
        },
    }
    media = MediaFileUpload(video_file, chunksize=-1, resumable=True)
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"Upload progress: {int(status.progress() * 100)}%")
    print(f"Video uploaded successfully: https://www.youtube.com/watch?v={response['id']}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload a video to YouTube.")
    parser.add_argument("--video_file", required=True, help="Path to the video file.")
    parser.add_argument("--title", required=True, help="Title of the video.")
    parser.add_argument("--description", required=True, help="Description of the video.")
    parser.add_argument("--category_id", default="22", help="Category ID of the video (default: 22 for People & Blogs).")
    parser.add_argument("--tags", nargs="*", help="Tags for the video.")
    args = parser.parse_args()

    youtube = authenticate_youtube()
    upload_video(
        youtube,
        video_file=args.video_file,
        title=args.title,
        description=args.description,
        category_id=args.category_id,
        tags=args.tags,
    )
