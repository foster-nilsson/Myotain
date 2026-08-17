from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from ultralytics import YOLO
import os
import shutil

app = FastAPI()

# Load model
model = YOLO('/tmp/yolov8n-pose.pt')

@app.post("/process")
async def process_video(file: UploadFile = File(...)):
    UPLOAD_DIR = "/app/uploads"
    OUTPUT_DIR = "/app/outputs"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    input_path = os.path.join(UPLOAD_DIR, file.filename)
    
    # Save file
    print(f"DEBUG: YOLO service: opening {input_path}")
    with open(input_path, "wb") as buffer:
        print(f"DEBUG: YOLO service: starting to copyfileobj")
        shutil.copyfileobj(file.file, buffer)
        print(f"DEBUG: YOLO service: copyfileobj done")
        buffer.flush()
        os.fsync(buffer.fileno())
    
    # Verify file existence and size
    file_size = os.path.getsize(input_path)
    print(f"DEBUG: YOLO service received {file.filename}, saved size: {file_size}")
    
    if file_size == 0:
        return {"success": False, "message": f"File is empty. Size: {file_size}"}
        
    try:
        # Run YOLO prediction
        model.predict(
            input_path, 
            save=True, 
            project=OUTPUT_DIR, 
            name="processed", 
            exist_ok=True
        )
        
        return {
            "success": True,
            "message": "Processing complete"
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }
