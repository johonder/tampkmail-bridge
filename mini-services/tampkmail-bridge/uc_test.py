import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json, time, os

options = uc.ChromeOptions()
options.add_argument('--no-sandbox')
options.add_argument('--disable-setuid-sandbox')
options.add_argument('--window-size=1280,800')
if not os.environ.get('DISPLAY'):
    options.add_argument('--headless=new')

driver = uc.Chrome(options=options)
driver.get('https://smailpro.com/temporary-email')

wait = WebDriverWait(driver, 30)

try:
    email_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'input[readonly]'))
    )
    email = email_input.get_attribute('value')
    print(f"EMAIL: {email}")
except:
    print("Could not find email input via readonly")

time.sleep(5)

page_text = driver.find_element(By.TAG_NAME, 'body').text
print(f"Has @melbourne: {'@melbourne' in page_text}")
print(f"Has turnstile: {'turnstile' in page_text.lower()}")
print(f"Has challenge: {'challenge' in page_text.lower()}")

try:
    key = driver.execute_script("""
        const el = document.querySelector('[x-data]');
        if (el && el.__x) {
            const data = el.__x.$data;
            return JSON.stringify({email: data.email, domain: data.domain, key: data.key});
        }
        return 'no x-data found';
    """)
    print(f"X-DATA: {key}")
except Exception as e:
    print(f"X-DATA error: {e}")

try:
    all_xdata = driver.execute_script("""
        const results = {};
        document.querySelectorAll('[x-data]').forEach(el => {
            try {
                const data = el.__x.$data;
                if (data.email || data.key || data.address) {
                    results.email = data.email || null;
                    results.domain = data.domain || null;
                    results.key = data.key || null;
                    results.address = data.address || null;
                }
            } catch(e) {}
        });
        return JSON.stringify(results);
    """)
    print(f"ALL X-DATA: {all_xdata}")
except Exception as e:
    print(f"ALL X-DATA error: {e}")

time.sleep(5)
driver.save_screenshot('/tmp/uc_smailpro.png')

driver.quit()
