from flask import Flask, jsonify, request
from datetime import datetime
import cv2
import pytesseract
import re

app = Flask(__name__)

def extract_amount(text):
    # strategy 1: look for TOTAL
    total_match = re.search(
        r"(?im)^\s*TOTAL\s*[:\-]?\s*\$?(\d+\s*\.\s*\d{2})",
        text,
        re.IGNORECASE
    )

    if total_match:
        amount = total_match.group(1)
        return amount.replace(" ", "")
    
    # strategy 2: look for payment info
    payment_match = re.search(
        r"(?:VISA|MASTERCARD|AMEX|DISCOVER)[^0-9]*\s?(\d+\s*\.\s*\d{2})",
        text,
        re.IGNORECASE
    )

    if payment_match:
        amount = payment_match.group(1)
        return amount.replace(" ", "")
    
    # strategy 3: look for amount after "Items"
    payment_section = re.search(
        r"Items:.*?(\$?\d+\s*\.\s*\d{2})",
        text,
        re.IGNORECASE | re.DOTALL
    )

    if payment_section:
        amount = payment_section.group(1)
        return amount.replace(" ", "")

    return ""

def extract_date(text):
    date_match = re.search(
        r"\b(\d{2}/\d{2}/\d{4}\b)",
        text
    )

    if date_match:
        date = datetime.strptime(
            date_match.group(0),
            "%m/%d/%Y"
        )
        return date.strftime("%Y-%m-%d")
    
    return ""

def extract_merchant(text):
    text = text.lower()
    
    if ("whole" in text and "foods" in text) or "oods." in text:
        return "Whole Foods Market"
    
    if "target" in text:
        return "Target"
    
    if "walmart" in text:
        return  "Walmart"
    
    if "trader joe" in text:
        return "Trader Joe's"
        
    return ""

@app.route("/ocr", methods=["POST"])
def ocr():
    import time
    start = time.time()
    print("========== OCR STARTED ==========", flush=True)


    file = request.files["receipt"]
    file.save("uploaded-receipt.jpg")

    image = cv2.imread("uploaded-receipt.jpg")
    print("ORIGINAL SIZE:", image.shape, flush=True)
    
    height, width = image.shape[:2]

    if width > 2000:
        resized_image = cv2.resize(
            image,
            (width // 2, height // 2)
        )
    else:
        resized_image = image
        
    print("OCR SIZE:", resized_image.shape, flush=True)

    gray_image = cv2.cvtColor(
        resized_image,
        cv2.COLOR_BGR2GRAY
    )

    threshold_image = cv2.threshold(
        gray_image,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    text = pytesseract.image_to_string(
        threshold_image,
        config="--psm 6"
    )

    print("========== TESSERACT FINISHED:", time.time() - start, "==========", flush=True)

    amount = extract_amount(text)
    date = extract_date(text)
    merchant = extract_merchant(text)

    receipt_data = {
        "merchant": merchant,
        "amount": amount,
        "date": date
    }

    print("========== OCR TOTAL TIME:", time.time() - start, "==========", flush=True)
    return jsonify(receipt_data)


@app.route("/")
def home():
    image = cv2.imread("receipt-wholefoods.jpg")
    height, width = image.shape[:2]

    new_width = width * 2
    new_height = height * 2

    resized_image = cv2.resize(
        image,
        (new_width, new_height)
    )

    gray_image = cv2.cvtColor(
        resized_image,
        cv2.COLOR_BGR2GRAY
    )

    threshold_image = cv2.threshold(
        gray_image,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    text = pytesseract.image_to_string(
        threshold_image,
        config="--psm 6"
    )

    amount = extract_amount(text)
    date = extract_date(text)
    merchant = extract_merchant(text)

    receipt_data = {
        "merchant": merchant,
        "amount": amount,
        "date": date
    }

    return jsonify(receipt_data)

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)