"""Tampkmail Bridge v3 - Python + mail.tm API
Completely free, no captcha, works for receiving emails.
"""
import os, json, random, string, time
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

MAILTM = "https://api.mail.tm"
ACCOUNTS = {}

def get_domains():
    r = requests.get(f"{MAILTM}/domains", timeout=10)
    if r.ok:
        data = r.json()
        if isinstance(data, dict):
            return [d["domain"] for d in data.get("hydra:member", []) if "domain" in d]
        if isinstance(data, list):
            return [d["domain"] for d in data if "domain" in d]
    return ["web-library.net"]

DOMAINS = get_domains()

def pick_domain(domain=None):
    if domain and domain in DOMAINS:
        return domain
    return DOMAINS[0] if DOMAINS else "web-library.net"

def make_acct(address, password):
    r = requests.post(f"{MAILTM}/accounts", json={"address": address, "password": password}, timeout=10)
    if r.status_code == 201:
        return {"ok": True}
    body = r.text[:300]
    return {"ok": False, "error": f"HTTP {r.status_code}: {body}"}

def get_tok(address, password):
    r = requests.post(f"{MAILTM}/token", json={"address": address, "password": password}, timeout=10)
    if r.ok:
        return {"ok": True, "token": r.json().get("token", "")}
    return {"ok": False, "error": r.text[:200]}

def get_msgs(token):
    r = requests.get(f"{MAILTM}/messages", headers={"Authorization": f"Bearer {token}"}, timeout=10)
    if r.ok:
        data = r.json()
        return data.get("hydra:member", []) if isinstance(data, dict) else (data if isinstance(data, list) else [])
    return []

def get_msg(token, mid):
    r = requests.get(f"{MAILTM}/messages/{mid}", headers={"Authorization": f"Bearer {token}"}, timeout=10)
    if r.ok:
        return r.json()
    return None

@app.route("/")
def root():
    return jsonify({
        "name": "Tampkmail Bridge v3 (Python)",
        "version": "3.0.0",
        "domains": DOMAINS,
        "accounts": len(ACCOUNTS),
        "endpoints": ["GET /", "GET /health", "POST /create-email", "POST /check-inbox"]
    })

@app.route("/health")
def health():
    return jsonify({"status": "ok", "domains": len(DOMAINS), "accounts": len(ACCOUNTS)})

@app.route("/create-email", methods=["POST"])
def create_email():
    domain = pick_domain((request.json or {}).get("domain"))
    rand = ''.join(random.choices(string.ascii_lowercase + string.digits, k=12))
    address = f"{rand}@{domain}"
    password = ''.join(random.choices(string.ascii_letters + string.digits, k=20))
    
    ac = make_acct(address, password)
    if not ac["ok"]:
        return jsonify({"success": False, "error": ac["error"]}), 500
    
    tk = get_tok(address, password)
    if not tk["ok"]:
        return jsonify({"success": False, "error": tk["error"]}), 500
    
    ACCOUNTS[address] = {"password": password, "token": tk["token"], "created": time.time()}
    
    return jsonify({
        "success": True,
        "address": address,
        "message": "Ready to receive emails."
    })

@app.route("/check-inbox", methods=["POST"])
def check_inbox():
    if not request.is_json:
        return jsonify({"success": False, "error": "JSON body required"}), 400
    address = (request.json or {}).get("address", "")
    if not address:
        return jsonify({"success": False, "error": "address required"}), 400
    if address not in ACCOUNTS:
        return jsonify({"success": False, "error": "Create account first via /create-email"}), 404
    
    acct = ACCOUNTS[address]
    raw = get_msgs(acct["token"])
    msgs = []
    for m in raw[:50]:
        mid = m.get("id", "")
        d = get_msg(acct["token"], mid) if mid else None
        msgs.append({
            "mid": mid,
            "from": (d or {}).get("from", {}).get("address", "") if d else "",
            "subject": m.get("subject", ""),
            "body": (d or {}).get("textBody", (d or {}).get("htmlBody", "")) if d else "",
            "html": (d or {}).get("htmlBody", "") if d else "",
            "date": m.get("createdAt", ""),
            "intro": m.get("intro", ""),
        })
    
    return jsonify({"success": True, "address": address, "messages": msgs, "count": len(msgs)})

PORT = int(os.environ.get("PORT", 4000))
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False)
