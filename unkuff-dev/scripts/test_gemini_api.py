#!/usr/bin/env python3
"""
Test script for Google Gemini API connectivity.
Run: python scripts/test_gemini_api.py
"""

import os
import sys

# Try to load from .env file
def load_dotenv():
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
    if not os.path.exists(env_path):
        env_path = os.path.join(os.path.dirname(__file__), '..', '.env')

    if os.path.exists(env_path):
        print(f"Loading environment from: {env_path}")
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    # Remove quotes if present
                    value = value.strip().strip('"').strip("'")
                    os.environ[key] = value
    else:
        print("No .env.local or .env file found")

load_dotenv()

# Check for API key
API_KEY = os.environ.get('GOOGLE_GENERATIVE_AI_API_KEY')

if not API_KEY:
    print("\n" + "="*60)
    print("ERROR: GOOGLE_GENERATIVE_AI_API_KEY not found!")
    print("="*60)
    print("\nPlease set it in your .env.local file:")
    print("  GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here")
    print("\nOr export it:")
    print("  export GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here")
    print("\nGet your API key at: https://makersuite.google.com/app/apikey")
    sys.exit(1)

print(f"\nAPI Key found: {API_KEY[:8]}...{API_KEY[-4:]}")
print(f"API Key length: {len(API_KEY)} characters")

# Try to import google-generativeai
try:
    import google.generativeai as genai
except ImportError:
    print("\nInstalling google-generativeai package...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "google-generativeai"])
    import google.generativeai as genai

print("\n" + "="*60)
print("Testing Gemini API Connection")
print("="*60)

# Configure the API
genai.configure(api_key=API_KEY)

# Test 1: List available models
print("\n[Test 1] Listing available models...")
try:
    models = list(genai.list_models())
    gemini_models = [m.name for m in models if 'gemini' in m.name.lower()]
    print(f"  Found {len(gemini_models)} Gemini models:")
    for model in gemini_models[:5]:  # Show first 5
        print(f"    - {model}")
    if len(gemini_models) > 5:
        print(f"    ... and {len(gemini_models) - 5} more")
    print("  [PASS] Model listing works!")
except Exception as e:
    print(f"  [FAIL] Error listing models: {e}")
    print("\n  This usually means:")
    print("    - Invalid API key")
    print("    - API key doesn't have access to Gemini")
    print("    - Network/firewall issues")

# Test 2: Simple text generation
print("\n[Test 2] Testing text generation with gemini-2.0-flash (used by resume parser)...")
try:
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content("Say 'Hello, the API is working!' in exactly those words.")
    print(f"  Response: {response.text.strip()}")
    print("  [PASS] Text generation works!")
except Exception as e:
    print(f"  [FAIL] Error generating text: {e}")

# Test 3: Structured output (similar to resume parsing)
print("\n[Test 3] Testing structured JSON output (like resume parsing)...")
try:
    model = genai.GenerativeModel('gemini-2.0-flash')

    prompt = """Extract information from this text and return as JSON:

Text: "John Smith is a Software Engineer at Google since 2020. He has a BS in Computer Science from MIT."

Return JSON with these fields:
- name (string)
- title (string)
- company (string)
- education (object with degree and school)

Return ONLY valid JSON, no markdown."""

    response = model.generate_content(prompt)
    print(f"  Response:\n{response.text.strip()}")

    # Try to parse as JSON
    import json
    try:
        parsed = json.loads(response.text.strip().replace('```json', '').replace('```', '').strip())
        print(f"  Parsed name: {parsed.get('name', 'N/A')}")
        print("  [PASS] Structured output works!")
    except json.JSONDecodeError as je:
        print(f"  [WARN] Response not valid JSON: {je}")
        print("  (This is okay - the API works, just formatting issues)")

except Exception as e:
    print(f"  [FAIL] Error with structured output: {e}")

# Test 4: Check rate limits / quota
print("\n[Test 4] Checking for rate limit issues...")
try:
    model = genai.GenerativeModel('gemini-2.0-flash')
    for i in range(3):
        response = model.generate_content(f"Count to {i+1}")
        print(f"  Request {i+1}: OK")
    print("  [PASS] No immediate rate limiting detected!")
except Exception as e:
    if 'quota' in str(e).lower() or 'rate' in str(e).lower():
        print(f"  [FAIL] Rate limit or quota issue: {e}")
    else:
        print(f"  [FAIL] Error: {e}")

print("\n" + "="*60)
print("Test Summary")
print("="*60)
print("""
If all tests pass, the Gemini API is working correctly.

If tests fail, common issues:
1. Invalid API key - regenerate at https://makersuite.google.com/app/apikey
2. Quota exceeded - check your usage at https://console.cloud.google.com
3. API not enabled - enable Generative AI API in Google Cloud Console
4. Region restrictions - Gemini may not be available in all regions
""")
