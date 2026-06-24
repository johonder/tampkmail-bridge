"""Try Firefox - different browser for Turnstile bypass"""
import asyncio
from playwright.async_api import async_playwright
import json

async def main():
    async with async_playwright() as p:
        browser = await p.firefox.launch(
            headless=False,
            args=[]
        )
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
            locale='en-US',
            viewport={'width': 1280, 'height': 800},
        )
        
        await context.add_init_script("""
            // Firefox specific stealth
        """)
        
        page = await context.new_page()
        await page.goto('https://smailpro.com/temporary-email', wait_until='load')
        await page.wait_for_timeout(5000)
        
        text = await page.text_content('body') or ''
        print(f"Has @melbourne: {'@melbourne' in text}")
        print(f"Has turnstile: {'turnstile' in text.lower()}")
        print(f"Has challenge: {'challenge' in text.lower()}")
        
        # Check if turnstile is available
        ts = await page.evaluate("typeof turnstile")
        print(f"Turnstile type: {ts}")
        
        if ts != 'undefined':
            try:
                token = await page.evaluate("""
                    async () => {
                        try {
                            const t = await turnstile.execute('0x4AAAAAAAGy16vxN3jRC-ec');
                            return t;
                        } catch(e) {
                            return 'error: ' + e.message;
                        }
                    }
                """)
                print(f"Token: {str(token)[:80]}")
            except Exception as e:
                print(f"Execute error: {e}")
        
        await page.screenshot(path='/tmp/firefox_test.png')
        await browser.close()

asyncio.run(main())
