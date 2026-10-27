from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

opts = Options()
opts.add_argument('--headless=new')
opts.add_argument('--window-size=1280,900')
driver = webdriver.Chrome(options=opts)
try:
    driver.get('http://127.0.0.1:5500/contact.html')
    time.sleep(1)
    el = driver.find_element(By.ID, 'service')
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", el)
    time.sleep(1)
    driver.save_screenshot('service_dropdown_view.png')
    print('Screenshot saved: service_dropdown_view.png')
finally:
    driver.quit()
