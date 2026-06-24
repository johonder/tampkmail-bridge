"""Python Playwright - fresh approach to bypass smailpro captcha"""
import asyncio
from playwright.async_api import async_playwright
import json

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
            ]
        )
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            locale='en-US',
            viewport={'width': 1280, 'height': 800},
        )
        
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            window.chrome = { runtime: {} };
            // Override permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (p) => (
                p.name === 'notifications' ? Promise.resolve({ state: 'prompt' }) : originalQuery(p)
            );
        """)
        
        page = await context.new_page()
        
        # Intercept all requests to debug
        page.on("response", lambda resp: print(f"{resp.status} {resp.url[:100]}") if 'captcha' in resp.url.lower() or 'create' in resp.url.lower() else None)
        
        await page.goto('https://smailpro.com/temporary-email', wait_until='load')
        await page.wait_for_timeout(3000)
        
        print("\n=== Page state ===")
        text = await page.text_content('body')
        print(f"Has @melbourne: {'@melbourne' in (text or '')}")
        print(f"Has turnstile: {'turnstile' in (text or '').lower()}")
        
        # Look for the create button or email display
        buttons = await page.query_selector_all('button')
        print(f"\nButtons found: {len(buttons)}")
        for b in buttons:
            txt = await b.text_content()
            print(f"  Button: '{txt[:80]}'")
        
        # Check for the generate function
        has_generate = await page.evaluate("typeof generate !== 'undefined'")
        print(f"\nHas generate function: {has_generate}")
        
        if has_generate:
            print("\n=== Attempting to call generate() ===")
            try:
                result = await page.evaluate("""
                    async () => {
                        try {
                            const token = await turnstile.execute('0x4AAAAAAAGy16vxN3jRC-ec');
                            return token;
                        } catch(e) {
                            return 'turnstile error: ' + e.message;
                        }
                    }
                """)
                print(f"Turnstile result: {result[:100] if result else 'None'}")
            except Exception as e:
                print(f"Turnstile execute error: {e}")
        
        await page.wait_for_timeout(5000)
        await page.screenshot(path='/tmp/py_playwright.png')
        
        await browser.close()

asyncio.run(main())
