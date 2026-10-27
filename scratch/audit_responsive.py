import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

sys.stdout.reconfigure(encoding='utf-8')

opts = Options()
opts.add_argument('--headless=new')

def test_screen(width, height, name):
    opts_custom = Options()
    opts_custom.add_argument('--headless=new')
    opts_custom.add_argument(f'--window-size={width},{height}')
    driver = webdriver.Chrome(options=opts_custom)
    try:
        # 1. Index Page
        driver.get('http://127.0.0.1:5500/index.html')
        time.sleep(1)
        # Check horizontal overflow
        scroll_width = driver.execute_script("return document.documentElement.scrollWidth;")
        client_width = driver.execute_script("return document.documentElement.clientWidth;")
        has_h_overflow = scroll_width > client_width
        print(f"[{name}] Index HTML: clientWidth={client_width}, scrollWidth={scroll_width}, Overflow={has_h_overflow}")
        driver.save_screenshot(f'scratch/resp_{name}_index_hero.png')

        # Scroll to about
        driver.execute_script("window.scrollTo(0, 1100);")
        time.sleep(0.5)
        driver.save_screenshot(f'scratch/resp_{name}_index_about.png')

        # Scroll to services
        driver.execute_script("window.scrollTo(0, 2400);")
        time.sleep(0.5)
        driver.save_screenshot(f'scratch/resp_{name}_index_services.png')

        # Scroll to stories
        driver.execute_script("window.scrollTo(0, 3600);")
        time.sleep(0.5)
        driver.save_screenshot(f'scratch/resp_{name}_index_stories.png')

        # Scroll to footer
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(0.5)
        driver.save_screenshot(f'scratch/resp_{name}_index_footer.png')

        # 2. Contact Page
        driver.get('http://127.0.0.1:5500/contact.html')
        time.sleep(1)
        c_scroll_width = driver.execute_script("return document.documentElement.scrollWidth;")
        c_client_width = driver.execute_script("return document.documentElement.clientWidth;")
        c_overflow = c_scroll_width > c_client_width
        print(f"[{name}] Contact HTML: clientWidth={c_client_width}, scrollWidth={c_scroll_width}, Overflow={c_overflow}")
        driver.save_screenshot(f'scratch/resp_{name}_contact.png')

        # Scroll to contact form
        driver.execute_script("window.scrollTo(0, 600);")
        time.sleep(0.5)
        driver.save_screenshot(f'scratch/resp_{name}_contact_form.png')

    finally:
        driver.quit()

print("Testing 360x800 (Mobile)...")
test_screen(360, 800, '360')

print("\nTesting 768x1024 (Tablet Portrait)...")
test_screen(768, 1024, '768')

print("\nTesting 1024x768 (Tablet Landscape)...")
test_screen(1024, 768, '1024')
