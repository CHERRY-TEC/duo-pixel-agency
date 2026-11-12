"""Live rendered-page check: admin must be invisible on the public site,
while /admin still loads when typed directly. Exits non-zero on failure."""
import sys
from playwright.sync_api import sync_playwright

BASE = "https://duo-pixel-agency.vercel.app"
errors = []


def ok(cond, msg):
    if not cond:
        errors.append(msg)
        print("FAIL:", msg)
    else:
        print("ok  :", msg)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800})

    # --- homepage: rendered DOM must have zero admin traces
    page.goto(BASE, wait_until="networkidle")
    ok(page.locator("a[href*='/admin']").count() == 0, "live home: no /admin link")
    ok("admin@" not in page.content().lower(), "live home: no admin email")
    ok("Admin — all orders" not in page.content(), "live home: no admin label")
    ok(page.locator("a[href*='/login']").count() > 0, "live home: normal login link present")

    # --- login page: no admin credentials advertised
    page.goto(f"{BASE}/login", wait_until="networkidle")
    ok("admin@duopixel.agency" not in page.content(), "live login: admin creds hidden")
    ok("markanti@duopixel.agency" in page.content(), "live login: designer creds still shown")

    # --- typed /admin URL: portal must load (anonymous -> login, not 404)
    page.goto(f"{BASE}/admin", wait_until="networkidle")
    page.wait_for_timeout(600)
    ok("404" not in page.title() and "not found" not in page.content().lower(),
       f"live /admin loads portal (title={page.title()})")
    ok("/admin" in page.url or "/login" in page.url,
       f"live /admin reachable by direct URL (url={page.url})")

    # --- site still intact (Get quote lives on /pricing, where cards render)
    page.goto(f"{BASE}/pricing", wait_until="networkidle")
    ok("Get quote" in page.content(), "live pricing: Get quote CTA")
    ok("\u20b9" not in page.content(), "live pricing: no rupee prices")
    page.goto(BASE, wait_until="networkidle")
    ok("8328627605" in page.content().replace(" ", ""), "live home: WhatsApp number")

    browser.close()

print(f"\n{len(errors)} failure(s)")
sys.exit(1 if errors else 0)
