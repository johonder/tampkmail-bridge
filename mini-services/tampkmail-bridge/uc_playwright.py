"""UC with Playwright's Chromium"""
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time, os

CHROME_PATH = os.path.expanduser("~/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome")

options = uc.ChromeOptions()
options.binary_location = CHROME_PATH
options.add_argument('--no-sandbox')
options.add_argument('--disable-setuid-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--window-size=1280,800')
options.headless = True

driver = uc.Chrome(options=options, version_main=148)
driver.get('https://smailpro.com/temporary-email')

wait = WebDriverWait(driver, 30)
time.sleep(8)

text = driver.find_element(By.TAG_NAME, 'body').text
print(f"Has @melbourne: {'@melbourne' in text}")
print(f"Has turnstile: {'turnstile' in text.lower()}")

# Try to find/create email
try:
    create_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Create')]")
    print(f"Create button found: {create_btn.text[:50]}")
except:
    print("No create button found")

# Check Alpine data
try:
    data = driver.execute_script("""
        const el = document.querySelector('[x-data*="email"]');
        return el ? el.__x?.$data?.email || 'no email' : 'no x-data element';
    """)
    print(f"Alpine data: {data}")
except Exception as e:
    print(f"Alpine error: {e}")

driver.save_screenshot('/tmp/uc_test.png')
driver.quit()
