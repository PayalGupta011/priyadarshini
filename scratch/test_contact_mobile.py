from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

opts = Options()
opts.add_argument('--headless=new')
opts.add_argument('--window-size=390,844')
driver = webdriver.Chrome(options=opts)
try:
    driver.get('http://127.0.0.1:5500/contact.html#form')
    time.sleep(1)
    driver.save_screenshot('mobile_contact_hash_form.png')
    print('Screenshot saved: mobile_contact_hash_form.png')
finally:
    driver.quit()
