from flask import Flask, request, jsonify
import os
from datetime import datetime
from PIL import Image
import pytesseract
from fastapi.middleware.cors import CORSMiddleware
from flask_cors import CORS

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

CORS(app)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    # OCR
    try:
        image = Image.open(file_path)
        ocr_text = pytesseract.image_to_string(image, lang='fra+eng')  # adapte la langue si besoin
    except Exception as e:
        return jsonify({'error': f"OCR failed: {str(e)}"}), 500
    return jsonify({'message': 'File uploaded successfully', 'filename': filename, 'ocr': ocr_text})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
