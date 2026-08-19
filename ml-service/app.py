from flask import Flask, request, jsonify  # type: ignore[import]
from flask_cors import CORS  # type: ignore[import]
import numpy as np  # type: ignore[import]
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
# Allow cross-origin requests so the UI served from the backend (port 3000)
# can call the ML service directly (port 5001) from a phone on the LAN.
CORS(app)

INGREDIENT_FEATURES = {
    "Pork Adobo": np.array([1.0, 0.8, 0.0, 0.0, 0.0], dtype=float),
    "Kare-Kare": np.array([0.6, 0.4, 1.0, 0.0, 0.0], dtype=float),
    "Fresh Lumpia": np.array([0.1, 0.1, 0.0, 0.0, 0.0], dtype=float),
}


def calculate_cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """Return cosine similarity as a Python float.

    Result is in the range 0.0-1.0.
    """
    try:
        dot_product = float(np.dot(vec_a, vec_b))
        norm_a = float(np.linalg.norm(vec_a))
        norm_b = float(np.linalg.norm(vec_b))
    except Exception:
        return 0.0
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/predict-risk", methods=["POST"])
def predict_risk():
    if not request.is_json:
        return jsonify({"error": "Expected JSON body"}), 400

    data = request.get_json()
    dish_name = data.get("dishName")
    user_vector = data.get("userVector", [0, 0, 0, 0, 0])

    # Validate and coerce user vector
    try:
        user_vec = np.array(user_vector, dtype=float)
    except Exception:
        return jsonify({"error": "userVector must be a numeric array"}), 400

    # Ensure length matches expected features.
    # Pad with zeros if shorter, or truncate if longer.
    if user_vec.size < 5:
        pad = np.zeros(5 - user_vec.size, dtype=float)
        user_vec = np.concatenate([user_vec, pad])
    elif user_vec.size > 5:
        user_vec = user_vec[:5]

    dish_vec = INGREDIENT_FEATURES.get(dish_name, np.zeros(5, dtype=float))

    risk_score = calculate_cosine_similarity(user_vec, dish_vec)
    has_warning = bool(risk_score > 0.3)

    # Build response with native Python types only
    badge_text = "HIGH RISK: SODIUM/ALLERGEN" if has_warning else "HEALTH SAFE"

    response = {
        "dishName": None if dish_name is None else str(dish_name),
        "riskScore": float(risk_score),
        "warningAlert": bool(has_warning),
        "badgeText": badge_text,
    }

    return jsonify(response), 200


if __name__ == "__main__":
    # Run on all interfaces for local testing. Use a WSGI server in prod.
    app.run(host="0.0.0.0", port=5001, debug=True)
