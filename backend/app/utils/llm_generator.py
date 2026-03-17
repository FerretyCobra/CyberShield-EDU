import os
import json
from google import genai
from google.genai import types
from typing import List, Dict
import traceback

# A global client instance
gemini_client = None

def initialize_gemini(api_key: str):
    """Initialize the Google Gemini API directly with the new SDK."""
    global gemini_client
    if api_key:
        gemini_client = genai.Client(api_key=api_key)

def generate_quiz_questions(limit: int = 5) -> List[Dict]:
    """
    Prompts the new Gemini SDK to generate a batch of unique
    cybersecurity phishing or scam questions.
    Returns a list of dictionaries matching the QuizItem schema.
    """
    if not gemini_client:
        print("Gemini client not initialized.")
        return []
        
    prompt = f"""
    You are an expert cybersecurity educator creating a quiz about identifying scams and phishing.
    I need you to generate exactly {limit} unique, realistic scenarios.
    For each scenario, generate a completely fake email snippet, SMS message, or social media DM.
    Some should be highly deceptive scams (is_scam: true) and some should be safe, regular messages (is_scam: false).
    
    Return the response ONLY as a raw JSON array of objects. Do not include markdown code blocks or backticks.
    
    Expected JSON Object Schema:
    [
      {{
        "content": "The actual snippet of the message (e.g. URGENT: Your account was suspended...)",
        "content_type": "text",
        "is_scam": true,
        "explanation": "Why this is a scam, pointing out urgent language or suspicious links.",
        "difficulty": "medium"
      }}
    ]
    """
    
    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        text_response = response.text.strip()
        questions = json.loads(text_response)
        return questions
        
    except Exception as e:
        print(f"Error generating dynamic questions with new Gemini SDK: {e}")
        traceback.print_exc()
        return []
