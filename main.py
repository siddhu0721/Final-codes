from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
import base64
import os

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class IdentifyPayload(BaseModel):
    probe: str
    gallery: list[dict]

faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def decode_image(b64_str):
    try:
        # Split header if present
        header, encoded = b64_str.split(",", 1) if "," in b64_str else (None, b64_str)
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None: return None
        return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    except:
        return None

@app.post("/identify-face/")
async def identify_face(payload: IdentifyPayload):
    try:
        probe_gray = decode_image(payload.probe)
        if probe_gray is None:
            return {"status": "error", "message": "Invalid probe image"}

        # Detect face in probe
        probe_faces = faceCascade.detectMultiScale(probe_gray, 1.3, 5)
        if len(probe_faces) == 0:
            return {"status": "noface", "message": "No face detected in webcam."}
        
        (x, y, w, h) = probe_faces[0]
        probe_roi = probe_gray[y:y+h, x:x+w]

        # Prepare Gallery for dynamic training
        faces_data = []
        labels = []
        id_map = {}
        
        counter = 0
        for item in payload.gallery:
            gallery_gray = decode_image(item['image'])
            if gallery_gray is None: continue
            
            g_faces = faceCascade.detectMultiScale(gallery_gray, 1.3, 5)
            for (gx, gy, gw, gh) in g_faces:
                # Resize all training images to a consistent size for better LBPH performance
                # Though LBPH is scale invariant, consistent ROI helps
                roi = gallery_gray[gy:gy+gh, gx:gx+gw]
                faces_data.append(roi)
                labels.append(counter)
                id_map[counter] = item['id'] # RollNo
                counter += 1
                break # Only one face per gallery image
        
        if not faces_data:
            return {"status": "error", "message": "No valid faces found in database gallery."}

        # Dynamic Training (Extremely fast for small N)
        recognizer = cv2.face.LBPHFaceRecognizer_create()
        recognizer.train(faces_data, np.array(labels))

        # Prediction
        label_idx, confidence = recognizer.predict(probe_roi)
        
        # Confidence threshold (LBPH: lower is more confident)
        # 60-80 is a typical good range.
        if confidence < 75:
            return {
                "status": "success", 
                "matchId": id_map[label_idx],
                "confidence": float(confidence)
            }
        else:
            return {"status": "unknown", "message": "Face not recognized."}

    except Exception as e:
        return {"status": "error", "message": f"AI Error: {str(e)}"}

# Legacy endpoints for backward compatibility / preventing backend crashes
@app.post("/recognize-face/")
async def deprecated_recognize():
    return {"status": "error", "message": "Please use /identify-face/ instead."}

@app.post("/train-new-face/{user_id}")
async def deprecated_train(user_id: int):
    return {"status": "error", "message": "Face training is now dynamic via profile upload."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)