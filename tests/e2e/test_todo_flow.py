from uuid import uuid4
 
from playwright.sync_api import Page, expect
 
 
BASE_URL = "http://127.0.0.1:5000"
 
 
def unique_name(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8]}"


def test_add_category(page: Page):
    category_name = unique_name("E2Eカテゴリ")
 
    page.goto(f"{BASE_URL}/categories")
    page.get_by_placeholder("カテゴリ名を入力").fill(category_name)
    page.get_by_role("button", name="追加").click()

    expect(page.get_by_text(category_name)).to_be_visible()
