from flask import Flask, request, jsonify
from flask_cors import CORS

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
)

import torch

app = Flask(__name__)
CORS(app)

MODEL_PATH = "model/multilingual_spam_xlmr_model"

print("Loading model...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_PATH
)

print("Model loaded successfully!")

labels = ["HAM", "SPAM"]


# ======================================================
# SCAM TYPE DETECTION USING KEYWORDS
# ======================================================

def detect_spam_type(message):

    msg = message.lower()

    # ---------------- PHISHING ----------------
    if any(word in msg for word in [
        "otp",
        "verify",
        "verification",
        "login",
        "password",
        "account blocked",
        "kyc",
        "secure account",
        "bank update",
    ]):

        return {
            "type": "Phishing Scam",
            "explanation":
                "This message attempts to steal sensitive information such as OTPs, passwords, or banking credentials. "
                "It uses urgency or fear tactics to make the user act quickly. "
                "Avoid clicking suspicious links or sharing personal details."
        }

    # ---------------- LOTTERY ----------------
    elif any(word in msg for word in [
        "won",
        "winner",
        "lottery",
        "prize",
        "jackpot",
        "reward",
        "selected",
        "congratulations",
    ]):

        return {
            "type": "Lottery Scam",
            "explanation":
                "This message falsely claims that you have won money, prizes, or rewards. "
                "Scammers use excitement and urgency to trick users into clicking links or sharing details. "
                "Legitimate lotteries never ask for sensitive information through messages."
        }

    # ---------------- UPI / PAYMENT SCAM ----------------
    elif any(word in msg for word in [
        "upi",
        "receive payment",
        "accept payment",
        "google pay",
        "phonepe",
        "paytm",
        "scan qr",
        "payment request",
    ]):

        return {
            "type": "UPI Payment Scam",
            "explanation":
                "This message may be attempting to trick you into approving a fraudulent payment request. "
                "Scammers often send fake UPI collect requests or QR codes. "
                "Never approve unexpected payment requests from unknown users."
        }

    # ---------------- LOAN SCAM ----------------
    elif any(word in msg for word in [
        "loan",
        "instant loan",
        "credit",
        "no documents",
        "low interest",
        "fast approval",
    ]):

        return {
            "type": "Loan Scam",
            "explanation":
                "This message promotes suspicious instant loan offers with unrealistic promises. "
                "Scammers may ask for advance fees or personal information. "
                "Always verify financial services through trusted official sources."
        }

    # ---------------- JOB SCAM ----------------
    elif any(word in msg for word in [
        "job",
        "work from home",
        "earn daily",
        "salary",
        "vacancy",
        "part time",
        "income",
    ]):

        return {
            "type": "Job Scam",
            "explanation":
                "This message advertises unrealistic job opportunities or quick earning schemes. "
                "Scammers often ask for registration fees or sensitive details. "
                "Verify job offers through trusted companies before responding."
        }

    # ---------------- OFFER / DISCOUNT SCAM ----------------
    elif any(word in msg for word in [
        "offer",
        "discount",
        "cashback",
        "bonus",
        "free recharge",
        "limited offer",
        "coupon",
    ]):

        return {
            "type": "Offer Scam",
            "explanation":
                "This message promotes fake discounts, cashback, or limited-time offers. "
                "Scammers create urgency to force quick decisions. "
                "Avoid clicking unknown promotional links or entering payment details."
        }

    # ---------------- URL SCAM ----------------
    elif any(word in msg for word in [
        "http://",
        "https://",
        ".xyz",
        ".click",
        ".net",
    ]):

        return {
            "type": "Suspicious URL Scam",
            "explanation":
                "This message contains suspicious or untrusted URLs that may redirect to phishing websites. "
                "These links may attempt to steal credentials or install malware. "
                "Always verify website authenticity before opening links."
        }

    # ---------------- DEFAULT ----------------
    else:

        return {
            "type": "General Scam",
            "explanation":
                "This message contains suspicious patterns commonly seen in scam communications. "
                "Be cautious while interacting with unknown senders or clicking external links. "
                "Avoid sharing personal, banking, or OTP-related information."
        }


@app.route("/")
def home():
    return "Backend running"


@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        message = data.get("message", "")

        inputs = tokenizer(
            message,
            return_tensors="pt",
            truncation=True,
            padding=True,
        )

        with torch.no_grad():

            outputs = model(**inputs)

        probs = torch.softmax(
            outputs.logits,
            dim=1
        )

        pred = torch.argmax(
            probs,
            dim=1
        ).item()

        confidence = probs[0][pred].item()

        prediction = labels[pred]

        # ==========================================
        # Detect category + explanation dynamically
        # ==========================================

        scam_info = detect_spam_type(message)

        # ==========================================
        # SAFE MESSAGE
        # ==========================================

        if prediction == "HAM":

            return jsonify({
                "prediction": prediction,
                "confidence": round(confidence, 4),
                "spam_type": "Safe Message",
                "explanation":
                    "This message appears legitimate and does not contain strong scam indicators. "
                    "It resembles a normal informational or transactional message. "
                    "Still remain cautious when sharing sensitive information online."
            })

        # ==========================================
        # SPAM MESSAGE
        # ==========================================

        return jsonify({
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "spam_type": scam_info["type"],
            "explanation": scam_info["explanation"],
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000
    )