# AI Menu Parser

Python-based OCR and menu text extraction service for the Vishwakarma University Canteen App.

## Features

- 📸 Image preprocessing for better OCR accuracy
- 🔍 Tesseract OCR integration for text extraction
- 🧠 Intelligent menu item parsing
- 💰 Price extraction with currency symbol recognition
- 📝 Structured JSON output
- 🚀 REST API for integration with mobile app
- 🔧 Configurable parsing rules

## Requirements

- Python 3.9+
- Tesseract OCR
- OpenCV
- FastAPI
- PIL (Pillow)

## Installation

```bash
cd ai-menu-parser
pip install -r requirements.txt

# Install Tesseract OCR
# Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
# macOS: brew install tesseract
# Ubuntu: sudo apt-get install tesseract-ocr
```

## Usage

### Start the API server
```bash
python main.py
```

### Upload menu image
```bash
curl -X POST "http://localhost:8000/parse-menu" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@menu_image.jpg"
```

### Response format
```json
{
  "success": true,
  "items": [
    {
      "name": "Cold Coffee",
      "price": 50.0,
      "description": "",
      "category": "beverages"
    },
    {
      "name": "Masala Dosa",
      "price": 45.0,
      "description": "",
      "category": "south_indian"
    }
  ],
  "confidence": 0.85,
  "processing_time": 2.3
}
```

## Configuration

Edit `config.yaml` to customize:
- OCR settings
- Price patterns
- Category mapping
- Output format
