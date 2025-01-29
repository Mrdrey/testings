from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import easyocr
import os
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)
# Setup EasyOCR reader
reader = easyocr.Reader(['en'])

# Folder for uploaded files
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Max file size 16MB

# Function to check if file extension is allowed
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/test_connection', methods=['GET'])
def test_connection():
    return jsonify({"message": "Connection successful!"})

@app.route('/extract_text', methods=['POST'])
def extract_text():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    # If the user does not select a file, the browser submits an empty part without a filename
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Extract text from the image using EasyOCR
        result = reader.readtext(filepath)

        # Extracted text as a list of words
        extracted_text = ' '.join([text[1] for text in result])

        return jsonify({"extracted_text": extracted_text})
    else:
        return jsonify({"error": "Invalid file format"}), 400

if __name__ == '__main__':
    # Ensure the upload folder exists
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(host='0.0.0.0', port=5000)
