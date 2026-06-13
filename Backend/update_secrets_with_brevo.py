import json

secrets = {
    "DB_USERNAME": "34CYnHYfoLKzGXQ.root",
    "DB_PASSWORD": "1HqoXHQaUdYHabXR",
    "JWT_SECRET": "alht7XYKujQPw1ourB0c4rIRg4x6RNrqewufShlZoug=",
    "GEMINI_API_KEY": "AQ.Ab8RN6L-1gHS6Ix7IyR3mnfr9nkHmJabNidug8XnLcC1DQn62Q ",
    "BREVO_API_KEY": "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"
}

# Write JSON without BOM
with open("temp_secret_nobom.json", "w", encoding="utf-8") as f:
    json.dump(secrets, f, separators=(',', ':'))

print("Generated temp_secret_nobom.json successfully with Brevo API key.")
