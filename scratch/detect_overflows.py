import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

sys.stdout.reconfigure(encoding='utf-8')

def find_overflows(url, widths):
    for w in widths:
        opts = Options()
        opts.add_argument('--headless=new')
        opts.add_argument(f'--window-size={w},800')
        driver = webdriver.Chrome(options=opts)
        try:
            driver.get(url)
            script = """
            var docWidth = document.documentElement.clientWidth;
            var elements = document.querySelectorAll('*');
            var overflows = [];
            for (var i = 0; i < elements.length; i++) {
                var el = elements[i];
                var rect = el.getBoundingClientRect();
                if (rect.right > docWidth + 2) {
                    var cls = el.getAttribute('class') || '';
                    var idOrClass = el.id ? ('#' + el.id) : (cls ? ('.' + cls.trim().split(/\\s+/).join('.')) : el.tagName);
                    overflows.push({
                        selector: idOrClass,
                        tag: el.tagName,
                        right: Math.round(rect.right),
                        width: Math.round(rect.width),
                        docWidth: Math.round(docWidth)
                    });
                }
            }
            return overflows.slice(0, 10);
            """
            res = driver.execute_script(script)
            print(f"\n--- URL: {url} at width {w}px ---")
            if not res:
                print("  NO OVERFLOWS DETECTED! Perfect fit.")
            else:
                for item in res:
                    print(f"  OVERFLOW: {item['selector']} (tag: {item['tag']}, width: {item['width']}, right: {item['right']}, docWidth: {item['docWidth']})")
        finally:
            driver.quit()

print("Checking Index Page:")
find_overflows('http://127.0.0.1:5500/index.html', [320, 360, 375, 414, 768, 1024])

print("\nChecking Contact Page:")
find_overflows('http://127.0.0.1:5500/contact.html', [320, 360, 375, 414, 768, 1024])
