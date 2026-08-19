# Nutriqueue - Dev UI & Services

This README explains how to run the local dev services and the simple static UI.

Requirements
- Node.js (v16+ recommended)
- Python 3 (for ML Flask service)
- `npm` and `pip` (or pipx)

Start services
1. Backend (from project root):

```bash
cd nutriqueue-backend
npm install
npm start
```

This serves API endpoints on port 3000 and the static dev UI (if present).

2. ML service:

```bash
cd ml-service
python3 -m pip install -r requirements.txt  # if you create one
python3 app.py
```

This serves ML routes on port 5001.

Dev UI
Open http://localhost:3000/ in your browser to access a small UI that hits the endpoints.

Integration test
Run the provided script:

```bash
./scripts/integration-test.sh
```

Notes
- For local testing, Firebase Admin is mocked if `serviceAccountKey.json` is missing.
- Replace the mock with your service account JSON in the project root for real Firestore usage.
