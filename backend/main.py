import os
import uuid
import cv2
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from ultralytics import YOLO

app = FastAPI(title="Pose Estimation API")

# Complete CORS bypass for private network access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "/app/videos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static video serving
app.mount("/videos", StaticFiles(directory=UPLOAD_DIR), name="videos")

# Load pre-cached YOLO model
model = YOLO("yolo26n-pose.pt")

@app.post("/api/upload")
async def process_video(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, unique_filename)

    # Write uploaded file in chunks
    with open(filepath, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            buffer.write(chunk)

    # Read video metadata & frames
    cap = cv2.VideoCapture(filepath)
    if not cap.isOpened():
        raise HTTPException(status_code=500, detail="Could not read uploaded video")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    frames_data = []
    frame_idx = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Run pose inference without verbose terminal output
        results = model(frame, verbose=False, imgsz=480)
        keypoints_list = []

        if results and len(results) > 0 and results[0].keypoints is not None:
            keypoints_tensor = results[0].keypoints.data
            if len(keypoints_tensor) > 0:
                # Take the first detected person
                person_kps = keypoints_tensor[0].cpu().numpy()
                for pt in person_kps:
                    x, y, conf = pt
                    keypoints_list.append({
                        "x": float(x),
                        "y": float(y),
                        "conf": float(conf)
                    })

        frames_data.append({
            "frame": frame_idx,
            "timestamp": round(frame_idx / fps, 3),
            "keypoints": keypoints_list
        })
        frame_idx += 1

    cap.release()

    return JSONResponse({
        "video_url": f"/videos/{unique_filename}",
        "fps": fps,
        "width": width,
        "height": height,
        "total_frames": frame_idx,
        "frames": frames_data
    })
