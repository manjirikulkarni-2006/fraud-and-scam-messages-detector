# Multilingual AI-Based Scam & Phishing Message Detection

## Overview
This project is an AI-powered multilingual scam and phishing message detection system that identifies fraudulent SMS messages using **Natural Language Processing (NLP)** and the **XLM-RoBERTa** transformer model. It supports **English, Hindi, Marathi, and Hinglish** while detecting phishing links and various scam categories.

## Features
- Detects scam and phishing SMS messages
- Supports English, Hindi, Marathi, and Hinglish
- Identifies phishing URLs and malicious links
- Classifies scam types (OTP, Banking, UPI, Lottery, Job, Loan, etc.)
- Provides confidence score and contextual explanation
- Mobile application built with React Native
- FastAPI/Flask backend for AI inference

## Tech Stack
- Python
- PyTorch
- Hugging Face Transformers
- XLM-RoBERTa
- React Native
- Flask / FastAPI
- spaCy (NLP)

## Workflow
1. User submits an SMS message.
2. Backend preprocesses the text using NLP.
3. XLM-RoBERTa classifies the message as **Ham** or **Spam**.
4. Spam messages are categorized into specific scam types.
5. Results, confidence score, and explanation are displayed in the app.

## Future Enhancements
- Support more regional languages
- Email and voice scam detection
- On-device AI inference
- Continuous model retraining with new scam datasets
