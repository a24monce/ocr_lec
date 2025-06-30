from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.crud import FactureGlobale, BLResult, documents, workspace
from app.utils.file_handlers import extract_bl_numbers_from_facture, extract_text_from_pdf
from PIL import Image
import pytesseract
import os
from datetime import datetime   

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    UPLOAD_FOLDER = 'uploads'
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    # OCR
    try:
        image = Image.open(file_path)
        ocr_text = pytesseract.image_to_string(image, lang='fra+eng')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")
    return {"message": "File uploaded successfully", "filename": filename, "ocr": ocr_text} 