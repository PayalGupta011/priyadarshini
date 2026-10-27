import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

sys.stdout.reconfigure(encoding='utf-8')

devices = [
    ("Galaxy S20 (360x800)", {"width": 360, "height": 800, "pixelRatio": 3.0}),
    ("iPhone SE (375x667)", {"width": 375, "height": 667, "pixelRatio": 2.0}),
    ("iPhone 12/14 (390x844)", {"width": 390, "height": 844, "pixelRatio": 3.0}),
    ("iPad Mini (768x1024)", {"width": 768, "height": 1024, "pixelRatio": 2.0}),
    ("iPad Pro (1024x1366)", {"width": 1024, "height": 1366, "pixelRatio": 2.0})
]

urls = [
    ('Index', 'http://127.0.0.1:5500/index.html'),
    ('Contact', 'http://127.0.0.1:5500/contact.html'),
    ('Services', 'http://127.0.0.1:5500/services.html')
]

for dev_name, metrics in devices:
    opts = Options()
    opts.add_argument('--headless=new')
    opts.add_experimental_option('mobileEmulation', {'deviceMetrics': metrics})
    driver = webdriver.Chrome(options=opts)
    try:
        print(f"\n==================== {dev_name} ====================")
        for page_name, url in urls:
            driver.get(url)
            script = """
            var docWidth = document.documentElement.clientWidth;
            var elements = document.querySelectorAll('*');
            var overflows = [];
            for (var i = 0; i < elements.length; i++) {
                var el = elements[i];
                var rect = el.getBoundingClientRect();
                if (rect.right > docWidth + 1.5) {
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
            return {
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: docWidth,
                overflowCount: overflows.length,
                overflows: overflows.slice(0, 5)
            };
            """
            res = driver.execute_script(script)
            has_overflow = res['scrollWidth'] > res['clientWidth']
            status = "FAIL (Overflow!)" if has_overflow else "PASS (Clean)"
            print(f"[{page_name}] clientWidth={res['clientWidth']}, scrollWidth={res['scrollWidth']} -> {status}")
            if res['overflows']:
                for o in res['overflows']:
                    print(f"     -> {o['selector']} (width: {o['width']}px, right: {o['right']}px vs clientWidth: {o['docWidth']}px)")
    finally:
        driver.quit()
