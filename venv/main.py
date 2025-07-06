from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from deepface import DeepFace
import shutil
import uuid
import os

app = FastAPI()

@app.post("/verify")
async def verify(face1: UploadFile = File(...), face2: UploadFile = File(...)):
    # Guardar temporalmente las imágenes
    temp_dir = os.path.join("src", "temp")

    if not os.path.exists(temp_dir):
        return JSONResponse(content={"error": "La carpeta src/temp no existe"}, status_code=500)

    f1_path = os.path.join(temp_dir, f"{uuid.uuid4()}.jpg")
    f2_path = os.path.join(temp_dir, f"{uuid.uuid4()}.jpg")

    with open(f1_path, "wb") as f1:
        shutil.copyfileobj(face1.file, f1)
    with open(f2_path, "wb") as f2:
        shutil.copyfileobj(face2.file, f2)

    try:
        result = DeepFace.verify(
            img1_path=f1_path,
            img2_path=f2_path,
            model_name="SFace",
            enforce_detection=False
        )
        match = result["verified"]
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    finally:
        os.remove(f1_path)
        os.remove(f2_path)

    return {"match": match}
