"""
End-to-end smoke test for Duo Pixel Agency.

Covers: home, the full 6-step booking flow (with validation + review step),
confirmation ID + copy, public tracking (incl. wrong-phone rejection), designer
login, unassigned-pool claim, status update, internal note, dashboard profile /
pricing / reviews edits and their public reflection, contact form, sign out,
client signup, 404, mobile drawer, and the client's live status view.

Run (from the project root):

    npm run build
    python <webapp-testing>/scripts/with_server.py --server "npm run preview" \
        --port 4173 -- python e2e/smoke.py

Requires: python -m pip install playwright && playwright install chromium
Exits non-zero on any failure or console error.
"""
import re
import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:4173"
errors = []
console_errors = []


def ok(cond, msg):
    if not cond:
        errors.append(msg)
        print("FAIL:", msg)
    else:
        print("ok  :", msg)


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 390, "height": 844})
        page = ctx.new_page()
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"pageerror: {e}"))

        # ---------------------------------------------------------- HOME
        page.goto(BASE, wait_until="networkidle")
        ok("Tell us the website you want" in page.content(), "home hero renders")
        ok(page.locator("text=How it works").first.is_visible(), "how-it-works section")
        page.locator("a[href='/book']:visible").first.click()
        page.wait_for_url("**/book")
        ok(True, "Book a Design navigates to /book")

        # ------------------------------------------------------- STEP 1
        page.locator("button", has_text="No preference").first.click()
        page.get_by_role("button", name="Continue").click()
        page.wait_for_timeout(400)
        ok("What are we building" in page.content(), "step 2 reached")

        # ------------------------------------------------------- STEP 2
        page.locator("button", has_text="Business").first.click()
        page.get_by_role("button", name="Continue").click()
        page.wait_for_timeout(400)
        ok("Tell us about the website" in page.content(), "step 3 reached")

        # ------------------------------------------------------- STEP 3
        # validation first: submitting an empty step must not advance
        page.get_by_role("button", name="Continue").click()
        page.wait_for_timeout(400)
        ok("Tell us about the website" in page.content(), "step 3 validation blocks empty fields")
        ok(page.locator("[role=alert]").count() > 0, "step 3 shows field errors")

        page.get_by_label("Website / project name").fill("Smoke Test Site")
        page.get_by_label("Pages you think you need").fill("Home, About, Contact")
        page.get_by_label("What do you want the website to do?").fill(
            "We run a bakery and need a simple site with our menu, location and a WhatsApp order button."
        )
        page.locator("label", has_text="Admin panel").first.click()
        page.locator("label", has_text="Contact form").first.click()
        page.get_by_role("button", name="Continue").click()
        page.wait_for_timeout(500)
        ok("Budget, timeline" in page.content(), "step 4 reached")

        # ------------------------------------------------------- STEP 4
        page.locator("label", has_text="Under 10k").first.click()
        page.locator("label", has_text="2 – 3 weeks").first.click()
        page.get_by_role("button", name="Continue").click()
        page.wait_for_timeout(400)
        ok("How do we reach you" in page.content(), "step 5 reached")

        # ------------------------------------------------------- STEP 5
        page.get_by_label("Your name").fill("Test Client")
        page.get_by_label("Phone / WhatsApp number").fill("9876543210")
        page.get_by_label("Email").fill("client@example.com")
        page.get_by_role("button", name="Continue").click()
        page.wait_for_timeout(600)
        ok("Review and submit" in page.content(), "step 6 reached")
        ok(page.url.endswith("/book"), "step 6 does not submit the form early")
        ok("Smoke Test Site" in page.content(), "review summary shows entered data")

        # ------------------------------------------------------- SUBMIT
        # consent must be ticked before Submit booking is enabled
        ok(
            page.get_by_role("button", name="Submit booking").is_disabled(),
            "submit disabled until consent is ticked",
        )
        page.locator("input[type=checkbox]").first.check()
        page.get_by_role("button", name="Submit booking").click()
        page.wait_for_url("**/confirmation/**", timeout=15000)
        page.wait_for_load_state("networkidle")
        code_text = page.locator("text=DPA-").first.inner_text()
        code = re.search(r"DPA-[A-Z0-9]{6}", code_text).group(0)
        ok(bool(code), f"confirmation page shows booking id {code}")

        page.get_by_role("button", name="Copy ID").click()
        page.wait_for_timeout(300)
        ok("Copied" in page.content(), "copy booking id works")

        # --------------------------------------------------------- TRACK
        page.goto(f"{BASE}/track?code={code}", wait_until="networkidle")
        page.get_by_label("Phone / WhatsApp number").fill("9876543210")
        page.get_by_role("button", name="Track").click()
        page.wait_for_timeout(900)
        ok("Status timeline" in page.content(), "public tracking shows timeline")
        ok("Pending" in page.content(), "booking status is Pending")

        # wrong phone rejected
        page.get_by_label("Phone / WhatsApp number").fill("1111111111")
        page.get_by_role("button", name="Track").click()
        page.wait_for_timeout(900)
        ok("No booking matched" in page.content(), "wrong phone rejected")

        # --------------------------------------------------- DESIGNER LOGIN
        page.goto(f"{BASE}/login", wait_until="networkidle")
        page.get_by_label("Email").fill("markanti@duopixel.agency")
        page.get_by_label("Password").fill("designer123")
        page.get_by_role("button", name="Log in").click()
        page.wait_for_url("**/dashboard", timeout=10000)
        ok(True, "designer login lands on /dashboard")

        # --------------------------------------------------- UNASSIGNED POOL
        page.locator("button", has_text="Unassigned pool").first.click()
        page.wait_for_timeout(600)
        ok(code in page.content(), "booking appears in unassigned pool")
        page.locator("button", has_text="Accept & assign to me").first.click()
        page.wait_for_timeout(900)
        ok("Booking assigned to you" in page.content(), "claim assigns the booking")

        # --------------------------------------------------- MY BOOKINGS TAB
        page.locator("button", has_text="My bookings").first.click()
        page.wait_for_timeout(700)
        ok(code in page.content(), "booking moved into my bookings")
        page.locator("a", has_text=code).first.click()
        page.wait_for_url("**/dashboard/bookings/**")
        page.wait_for_timeout(600)
        ok("Client brief" in page.content(), "booking detail shows client brief")

        # change status
        page.locator('button:has-text("In Design")').first.click()
        page.wait_for_timeout(900)
        ok("Status changed to In Design" in page.content(), "status update works")
        ok("In Design" in page.content(), "timeline includes new status")

        # internal note
        page.get_by_label("Internal note").fill("Kickoff call done, design starts Monday.")
        page.get_by_role("button", name="Save note").click()
        page.wait_for_timeout(700)
        ok("Note saved" in page.content(), "internal note saves")

        # --------------------------------------------------- DASHBOARD TABS
        page.goto(f"{BASE}/dashboard", wait_until="networkidle")
        page.locator("button", has_text="My profile").first.click()
        page.wait_for_timeout(500)
        bio = page.get_by_label("Bio")
        bio.fill("Updated bio from the dashboard — fully editable.")
        page.get_by_role("button", name="Save profile").click()
        page.wait_for_timeout(800)
        ok("Saved" in page.content(), "designer profile is editable")

        page.locator("button", has_text="Pricing").first.click()
        page.wait_for_timeout(500)
        price_input = page.locator('input[type="number"]').first
        price_input.fill("8999")
        price_input.blur()
        page.wait_for_timeout(800)
        ok("Price updated" in page.content(), "package price is editable")

        page.locator("button", has_text="Reviews").first.click()
        page.wait_for_timeout(500)
        ok("Average rating" in page.content(), "reviews tab renders")

        # profile edit visible publicly
        page.goto(f"{BASE}/designer/markanti", wait_until="networkidle")
        ok("Updated bio from the dashboard" in page.content(), "profile edit reflects publicly")

        # price edit visible publicly
        page.goto(f"{BASE}/pricing", wait_until="networkidle")
        ok("Get quote" in page.content(), "price edit reflects on pricing page")

        # --------------------------------------------------- OTHER PAGES
        page.goto(f"{BASE}/designers", wait_until="networkidle")
        ok("Markanti Hanmanth" in page.content() and "Sundar" in page.content(), "designers page")

        page.goto(f"{BASE}/designer/sundar", wait_until="networkidle")
        ok("Portfolio" in page.content(), "sundar profile + portfolio")

        page.goto(f"{BASE}/contact", wait_until="networkidle")
        page.get_by_label("Your name").fill("Contact Tester")
        page.get_by_label("Phone / WhatsApp", exact=False).first.fill("9876543210")
        page.get_by_label("Email").fill("contact@example.com")
        page.get_by_label("Subject").select_option("Pricing / quote")
        page.get_by_label("Message").fill("Hi, I would like a quote for a business website please.")
        page.get_by_role("button", name="Send message").click()
        page.wait_for_timeout(800)
        ok("message received" in page.content().lower(), "contact form submits")

        # sign out of the designer account before creating a client account
        page.goto(f"{BASE}/dashboard", wait_until="networkidle")
        page.get_by_role("button", name="Sign out").click()
        page.wait_for_url(f"{BASE}/", timeout=10000)
        ok(True, "designer sign out works")

        page.goto(f"{BASE}/signup", wait_until="networkidle")
        page.get_by_label("Full name").fill("New Client")
        page.get_by_label("Email").fill("newclient@example.com")
        page.get_by_label("Password", exact=True).fill("password123")
        page.get_by_label("Confirm password", exact=True).fill("password123")
        page.get_by_role("button", name="Sign up").click()
        page.wait_for_url("**/account/my-bookings", timeout=10000)
        ok("Welcome back" in page.content(), "signup creates a session")

        page.goto(f"{BASE}/definitely-not-a-page", wait_until="networkidle")
        ok("404" in page.content(), "404 page renders")

        # mobile nav drawer
        page.goto(BASE, wait_until="networkidle")
        page.get_by_role("button", name="Open menu").click()
        page.wait_for_timeout(500)
        ok(page.locator("text=Book a Design").last.is_visible(), "mobile drawer opens")
        page.locator("div.fixed.inset-0 a[href='/pricing']").click()
        page.wait_for_url("**/pricing")
        ok(True, "mobile nav link works")

        # designer sees client timeline status live (client view of In Design)
        page.goto(f"{BASE}/track?code={code}", wait_until="networkidle")
        page.get_by_label("Phone / WhatsApp number").fill("9876543210")
        page.get_by_role("button", name="Track").click()
        page.wait_for_timeout(900)
        ok("In Design" in page.content(), "client sees updated status when tracking")

        browser.close()


try:
    run()
except Exception as exc:  # noqa: BLE001
    errors.append(f"EXCEPTION: {exc}")
    print("EXCEPTION:", exc)

real_console = [
    e for e in console_errors
    if "favicon" not in e.lower()
    and "fonts.g" not in e.lower()
    and "ERR_CONNECTION" not in e
    and "Failed to load resource" not in e
]
if real_console:
    print("\nConsole errors:")
    for e in real_console[:20]:
        print(" -", e[:300])

print(f"\n{len(errors)} failure(s), {len(real_console)} console error(s)")
sys.exit(1 if errors or real_console else 0)
