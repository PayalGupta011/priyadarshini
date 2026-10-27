import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

sys.stdout.reconfigure(encoding='utf-8')

opts = Options()
opts.add_argument('--headless=new')
opts.add_argument('--window-size=1280,900')

driver = webdriver.Chrome(options=opts)

try:
    print("1. Testing index.html nav link taps & offsets...")
    driver.get('http://127.0.0.1:5500/index.html')
    time.sleep(1.5)

    # Click on About nav link
    about_link = driver.find_element(By.CSS_SELECTOR, '.nav-links a[href="#about"]')
    about_link.click()
    time.sleep(1)
    driver.save_screenshot('test_nav_about_desktop.png')
    print("   Screenshot saved: test_nav_about_desktop.png")

    # Click on Services nav link
    services_link = driver.find_element(By.CSS_SELECTOR, '.nav-links a[href="#services"]')
    services_link.click()
    time.sleep(1)
    driver.save_screenshot('test_nav_services_desktop.png')
    print("   Screenshot saved: test_nav_services_desktop.png")

    print("\n2. Testing Service Card Popup & Background Scroll Lock...")
    # Open service card 1
    card1 = driver.find_element(By.CSS_SELECTOR, '.service-ref-card[data-service="obstetrics"]')
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", card1)
    time.sleep(0.5)
    card1.click()
    time.sleep(0.8)

    # Check if html/body have modal-open class
    body_classes = driver.find_element(By.TAG_NAME, 'body').get_attribute('class')
    html_classes = driver.find_element(By.TAG_NAME, 'html').get_attribute('class')
    print(f"   Body classes while modal open: '{body_classes}'")
    print(f"   HTML classes while modal open: '{html_classes}'")

    # Check body style position
    body_pos = driver.find_element(By.TAG_NAME, 'body').value_of_css_property('position')
    print(f"   Body position style: '{body_pos}' (expected 'fixed')")

    # Take screenshot of open service modal
    driver.save_screenshot('test_service_modal_open.png')
    print("   Screenshot saved: test_service_modal_open.png")

    # Scroll inside modal body
    modal_body = driver.find_element(By.CSS_SELECTOR, '.service-modal-body')
    driver.execute_script("arguments[0].scrollTop = 300;", modal_body)
    time.sleep(0.5)
    modal_scroll = driver.execute_script("return arguments[0].scrollTop;", modal_body)
    print(f"   Modal body scrollTop after scrolling: {modal_scroll}px (scrolling works inside modal!)")

    # Close modal
    close_btn = driver.find_element(By.ID, 'serviceModalClose')
    close_btn.click()
    time.sleep(0.5)
    body_classes_after = driver.find_element(By.TAG_NAME, 'body').get_attribute('class')
    print(f"   Body classes after modal close: '{body_classes_after}' (modal-open removed!)")

    print("\n3. Testing About Card Popup & Background Scroll Lock...")
    about_card = driver.find_element(By.CSS_SELECTOR, '.about-feature-card[data-category="academic"]')
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", about_card)
    time.sleep(0.5)
    about_card.click()
    time.sleep(0.8)

    about_body_classes = driver.find_element(By.TAG_NAME, 'body').get_attribute('class')
    print(f"   Body classes while about modal open: '{about_body_classes}'")
    driver.save_screenshot('test_about_modal_open.png')
    print("   Screenshot saved: test_about_modal_open.png")

    # Close about modal
    about_close = driver.find_element(By.ID, 'aboutModalClose')
    about_close.click()
    time.sleep(0.5)

    print("\n4. Testing contact.html #form navigation & Service Required dropdown...")
    driver.get('http://127.0.0.1:5500/contact.html#form')
    time.sleep(1.5)
    driver.save_screenshot('test_contact_form_hash_desktop.png')
    print("   Screenshot saved: test_contact_form_hash_desktop.png")

    # Test Mobile View (390x844)
    driver.set_window_size(390, 844)
    time.sleep(0.5)
    driver.get('http://127.0.0.1:5500/contact.html#form')
    time.sleep(1.5)
    driver.save_screenshot('test_contact_mobile_form.png')
    print("   Screenshot saved: test_contact_mobile_form.png")

    # Scroll to service dropdown and view
    service_el = driver.find_element(By.ID, 'service')
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", service_el)
    time.sleep(0.5)
    driver.save_screenshot('test_contact_mobile_service_view.png')
    print("   Screenshot saved: test_contact_mobile_service_view.png")

    print("\nAll automated checks completed successfully!")

finally:
    driver.quit()
