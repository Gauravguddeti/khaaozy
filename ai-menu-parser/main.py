from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import cv2
import numpy as np
from PIL import Image
import pytesseract
import re
import json
import time
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI Menu Parser",
    description="OCR-based menu text extraction and parsing service",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Tesseract path (adjust for your system)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Windows
# pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'  # Linux
# pytesseract.pytesseract.tesseract_cmd = '/opt/homebrew/bin/tesseract'  # macOS

class MenuParser:
    def __init__(self):
        # Price patterns for different currencies
        self.price_patterns = [
            r'₹\s*(\d+(?:\.\d{2})?)',  # Indian Rupee
            r'Rs\.?\s*(\d+(?:\.\d{2})?)',  # Rs format
            r'(\d+(?:\.\d{2})?)\s*₹',  # Price before symbol
            r'(\d+(?:\.\d{2})?)\s*/-',  # With /- suffix
        ]
        
        # Food categories mapping
        self.category_keywords = {
            'beverages': ['coffee', 'tea', 'juice', 'drink', 'shake', 'lassi', 'soda'],
            'breakfast': ['dosa', 'idli', 'upma', 'poha', 'paratha', 'bread'],
            'lunch': ['rice', 'dal', 'curry', 'sabzi', 'thali', 'meal'],
            'snacks': ['samosa', 'pakoda', 'bhel', 'chaat', 'sandwich', 'burger'],
            'desserts': ['ice cream', 'kulfi', 'sweet', 'halwa', 'kheer'],
            'south_indian': ['dosa', 'idli', 'vada', 'uttapam', 'sambhar'],
            'north_indian': ['roti', 'naan', 'curry', 'paneer', 'dal'],
            'chinese': ['noodles', 'fried rice', 'manchurian', 'chowmein'],
            'fast_food': ['burger', 'pizza', 'sandwich', 'wrap', 'fries']
        }
    
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for better OCR accuracy"""
        # Convert to grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Enhance contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(gray)
        
        # Noise reduction
        denoised = cv2.medianBlur(enhanced, 3)
        
        # Threshold to binary
        _, binary = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return binary
    
    def extract_text(self, image: np.ndarray) -> str:
        """Extract text from image using Tesseract OCR"""
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image)
            
            # OCR configuration
            config = '--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789₹./-() '
            
            # Extract text
            text = pytesseract.image_to_string(processed_image, config=config)
            
            return text.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OCR extraction failed: {str(e)}")
    
    def parse_menu_items(self, text: str) -> List[Dict[str, Any]]:
        """Parse extracted text into structured menu items"""
        lines = text.split('\n')
        menu_items = []
        
        for line in lines:
            line = line.strip()
            if not line or len(line) < 3:
                continue
            
            # Skip common non-menu text
            skip_patterns = [
                r'^(menu|price|rate|list|today|special|offer)$',
                r'^(thank you|welcome|address|phone|contact)$',
                r'^\d+\s*$',  # Just numbers
                r'^[^\w]*$',  # Just symbols
            ]
            
            if any(re.match(pattern, line.lower()) for pattern in skip_patterns):
                continue
            
            # Extract price from line
            price = self.extract_price(line)
            if price is None:
                continue
            
            # Extract item name (text before price)
            name = self.extract_item_name(line)
            if not name:
                continue
            
            # Determine category
            category = self.categorize_item(name)
            
            menu_items.append({
                'name': name.title(),
                'price': price,
                'description': '',
                'category': category
            })
        
        return menu_items
    
    def extract_price(self, line: str) -> float:
        """Extract price from text line"""
        for pattern in self.price_patterns:
            match = re.search(pattern, line)
            if match:
                try:
                    return float(match.group(1))
                except (ValueError, IndexError):
                    continue
        return None
    
    def extract_item_name(self, line: str) -> str:
        """Extract item name from text line"""
        # Remove price and common separators
        cleaned_line = line
        
        # Remove price patterns
        for pattern in self.price_patterns:
            cleaned_line = re.sub(pattern, '', cleaned_line)
        
        # Remove common separators
        cleaned_line = re.sub(r'[.]{3,}', '', cleaned_line)  # Multiple dots
        cleaned_line = re.sub(r'[-]{2,}', '', cleaned_line)  # Multiple dashes
        cleaned_line = re.sub(r'[_]{2,}', '', cleaned_line)  # Multiple underscores
        
        # Clean and return
        name = cleaned_line.strip()
        name = re.sub(r'\s+', ' ', name)  # Multiple spaces to single
        
        return name if len(name) > 2 else None
    
    def categorize_item(self, item_name: str) -> str:
        """Categorize food item based on name"""
        item_lower = item_name.lower()
        
        for category, keywords in self.category_keywords.items():
            if any(keyword in item_lower for keyword in keywords):
                return category
        
        return 'miscellaneous'
    
    def calculate_confidence(self, items: List[Dict]) -> float:
        """Calculate parsing confidence based on extracted items"""
        if not items:
            return 0.0
        
        # Factors that indicate good parsing
        factors = []
        
        # Number of items found
        factors.append(min(len(items) / 10.0, 1.0))
        
        # Valid prices
        valid_prices = sum(1 for item in items if 0 < item['price'] < 1000)
        factors.append(valid_prices / len(items) if items else 0)
        
        # Valid names (not too short/long)
        valid_names = sum(1 for item in items if 3 <= len(item['name']) <= 50)
        factors.append(valid_names / len(items) if items else 0)
        
        return sum(factors) / len(factors) if factors else 0.0

# Initialize parser
parser = MenuParser()

@app.get("/")
async def root():
    return {
        "message": "AI Menu Parser API",
        "version": "1.0.0",
        "endpoints": {
            "parse_menu": "/parse-menu",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}

@app.post("/parse-menu")
async def parse_menu(image: UploadFile = File(...)):
    """
    Parse menu items from uploaded image
    """
    start_time = time.time()
    
    try:
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image
        image_bytes = await image.read()
        image_array = np.frombuffer(image_bytes, np.uint8)
        cv_image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        if cv_image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Extract text using OCR
        extracted_text = parser.extract_text(cv_image)
        
        if not extracted_text.strip():
            return {
                "success": False,
                "message": "No text found in image",
                "items": [],
                "confidence": 0.0,
                "processing_time": time.time() - start_time
            }
        
        # Parse menu items
        menu_items = parser.parse_menu_items(extracted_text)
        
        # Calculate confidence
        confidence = parser.calculate_confidence(menu_items)
        
        processing_time = time.time() - start_time
        
        return {
            "success": True,
            "items": menu_items,
            "confidence": confidence,
            "processing_time": processing_time,
            "extracted_text": extracted_text,  # For debugging
            "total_items": len(menu_items)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.post("/parse-text")
async def parse_text_only(text: str):
    """
    Parse menu items from raw text (for testing)
    """
    start_time = time.time()
    
    try:
        menu_items = parser.parse_menu_items(text)
        confidence = parser.calculate_confidence(menu_items)
        
        return {
            "success": True,
            "items": menu_items,
            "confidence": confidence,
            "processing_time": time.time() - start_time,
            "total_items": len(menu_items)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
