from flask import Flask, request, jsonify
import os
import easyocr
from flask_cors import CORS
from werkzeug.utils import secure_filename
import io
from PIL import Image
import logging

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configure allowed extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Initialize EasyOCR reader
try:
    ocr_reader = easyocr.Reader(['en', 'es', 'fr'])
except Exception as e:
    logger.error(f"Failed to initialize OCR reader: {e}")
    raise

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/test', methods=['GET'])
def test_connection():
    return jsonify({'status': 'Server is running'}), 200

@app.route("/ocr", methods=["POST"])
def ocr():
    try:
        logger.debug("Received OCR request")
        logger.debug(f"Files in request: {request.files}")
        logger.debug(f"Form data: {request.form}")

        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files['image']
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400

        # Create a bytes IO object from the file
        img_bytes = io.BytesIO(file.read())
        
        # Open and verify the image
        try:
            img = Image.open(img_bytes)
            img.verify()  # Verify it's actually an image
            img_bytes.seek(0)  # Reset buffer position
            img = Image.open(img_bytes)  # Reopen after verify
        except Exception as e:
            logger.error(f"Invalid image file: {e}")
            return jsonify({"error": "Invalid image file"}), 400

        # Save the image file temporarily
        filename = secure_filename(file.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        img.save(image_path)
        
        logger.debug(f"Image saved to: {image_path}")

        # Use EasyOCR to extract text from the image
        extracted_text = extract_text_from_image(image_path)
        logger.debug(f"Extracted text: {extracted_text}")

        if not extracted_text:
            return jsonify({"error": "No text found in the image"}), 400

        # Clean up - remove temporary file
        try:
            os.remove(image_path)
        except Exception as e:
            logger.warning(f"Failed to remove temporary file: {e}")

        return jsonify({
            "extracted_text": extracted_text
        })

    except Exception as e:
        logger.error(f"OCR error: {str(e)}")
        return jsonify({"error": str(e)}), 500

def extract_text_from_image(image_path):
    try:
        results = ocr_reader.readtext(image_path)
        text = " ".join([result[1] for result in results])
        return text.strip()
    except Exception as e:
        logger.error(f"OCR error: {str(e)}")
        raise

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
