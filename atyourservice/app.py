import smtplib
import ssl
import os
from email.message import EmailMessage
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from the local HTML file / dev server

# ── SMTP Configuration ────────────────────────────────────────────────────────
SMTP_HOST   = "webmail.atyourservice.ind.in"
SMTP_PORT   = 465
SENDER      = "leads@atyourservice.ind.in"
RECEIVER    = "info@atyourservice.ind.in"

# Set SMTP_PASSWORD as an environment variable before running:
#   export SMTP_PASSWORD="your_email_password"
SMTP_PASS   = os.environ.get("SMTP_PASSWORD", "")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/send-email", methods=["POST"])
def send_email():
    """Accept JSON form data and send an enquiry email via SMTP SSL."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "Invalid request body."}), 400

    name    = (data.get("name")    or "").strip()
    email   = (data.get("email")   or "").strip()
    phone   = (data.get("phone")   or "").strip()
    message = (data.get("message") or "").strip()

    # ── Validation ────────────────────────────────────────────────────────────
    if not name or not email or not message:
        return jsonify({"success": False, "error": "Name, email and message are required."}), 400

    # ── Build email ───────────────────────────────────────────────────────────
    msg = EmailMessage()
    msg["Subject"] = "New Enquiry from AtYourService Website"
    msg["From"]    = f"AtYourService <{SENDER}>"
    msg["To"]      = RECEIVER
    msg["Reply-To"] = email   # Reply goes to the visitor, not the sender account

    body = (
        f"Name:    {name}\n"
        f"Email:   {email}\n"
        f"Phone:   {phone if phone else 'Not provided'}\n"
        f"Message:\n{message}"
    )
    msg.set_content(body)

    # ── Send via SSL ──────────────────────────────────────────────────────────
    try:
        context = ssl._create_unverified_context()
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=context) as server:
            server.login(SENDER, SMTP_PASS)
            server.send_message(msg)

        return jsonify({"success": True}), 200

    except smtplib.SMTPAuthenticationError:
        app.logger.error("SMTP authentication failed. Check SMTP_PASSWORD.")
        return jsonify({"success": False, "error": "Email authentication failed."}), 500

    except smtplib.SMTPException as exc:
        app.logger.error("SMTP error: %s", exc)
        return jsonify({"success": False, "error": "Failed to send email. Please try again."}), 500

    except Exception as exc:
        app.logger.error("Unexpected error: %s", exc)
        return jsonify({"success": False, "error": "An unexpected error occurred."}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)
