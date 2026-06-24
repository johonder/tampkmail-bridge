#!/usr/bin/env python3
import sys, json, os, time, logging

sys.path.insert(0, os.path.expanduser("~/.local/lib/python3.12/site-packages"))
import undetected_chromedriver as uc

CHROME_BIN = os.environ.get("CHROME_BIN", "/tmp/chrome-linux64/chrome")
CHROMEDRIVER = os.environ.get("CHROMEDRIVER", "/tmp/chromedriver-linux64/chromedriver")
logging.basicConfig(level=logging.INFO, format="%(message)s")

class NullstoSession:
    def __init__(self):
        options = uc.ChromeOptions()
        options.binary_location = CHROME_BIN
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-gpu")
        options.add_argument("--disable-dev-shm-usage")
        self.driver = uc.Chrome(options=options, driver_executable_path=CHROMEDRIVER, version_main=150, use_subprocess=True)
        self.ready = False

    def ensure_ready(self):
        if not self.ready:
            self.driver.get("https://nullsto.edu.pl")
            time.sleep(10)
            self.ready = True

    def _get_email_info(self):
        return self.driver.execute_script("""
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node, email = null;
        while (node = walker.nextNode()) {
            if (node.textContent.includes('@nullsto')) {
                email = node.textContent.trim();
                break;
            }
        }
        const tokens = JSON.parse(localStorage.getItem('nullsto_email_tokens') || '{}');
        const cid = localStorage.getItem('nullsto_current_email_id');
        return { email: email, id: cid, token: tokens[cid] };
        """)

    def create(self):
        self.ensure_ready()
        info = self._get_email_info()
        if info.get("email") and info.get("id") and info.get("token"):
            return {"success": True, "address": info["email"], "id": info["id"], "secret": info["token"]}
        return {"success": False, "error": "Could not extract email info"}

    def new_email(self):
        self.ensure_ready()
        self.driver.execute_script("""
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('New'));
        if (btn) btn.click();
        """)
        time.sleep(5)
        info = self._get_email_info()
        if info.get("email") and info.get("id") and info.get("token"):
            return {"success": True, "address": info["email"], "id": info["id"], "secret": info["token"]}
        return {"success": False, "error": "Could not get new email"}

    def inbox(self, email_id, secret):
        self.ensure_ready()
        self.driver.execute_script(f"""
        const tokens = JSON.parse(localStorage.getItem('nullsto_email_tokens') || '{{}}');
        tokens['{email_id}'] = '{secret}';
        localStorage.setItem('nullsto_email_tokens', JSON.stringify(tokens));
        localStorage.setItem('nullsto_current_email_id', '{email_id}');
        """)
        self.driver.execute_script("""
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Fetch'));
        if (btn) btn.click();
        """)
        time.sleep(8)
        msgs = self.driver.execute_script("""
        const items = document.querySelectorAll('[class*="message"], [class*="email-item"], [class*="inbox-item"], [class*="EmailItem"], [class*="MessageItem"]');
        if (items.length > 0) {
            return Array.from(items).map(el => ({
                text: el.textContent.trim().substring(0, 500),
                html: el.innerHTML.substring(0, 500)
            }));
        }
        const allDivs = document.querySelectorAll('div');
        const emailDivs = Array.from(allDivs).filter(d => {
            const t = d.textContent.trim();
            return t.includes('@') && t.length > 10 && t.length < 300;
        });
        return emailDivs.map(d => d.textContent.trim()).slice(0, 20);
        """)
        return {"success": True, "messages": msgs, "count": len(msgs)}

    def close(self):
        try: self.driver.quit()
        except: pass

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    session = NullstoSession()
    try:
        if cmd == "create":
            r = session.create()
        elif cmd == "new":
            r = session.new_email()
        elif cmd == "inbox" and len(sys.argv) >= 4:
            r = session.inbox(sys.argv[2], sys.argv[3])
        else:
            r = {"success": False, "error": "Usage: create|new|inbox <id> <token>"}
    finally:
        session.close()
    json.dump(r, sys.stdout, default=str)
    sys.stdout.flush()
