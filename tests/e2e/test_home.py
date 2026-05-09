from playwright.sync_api import Page, expect
 
 
BASE_URL = "http://127.0.0.1:5000"
 
 
def test_home_page_shows_todo_list(page: Page):
    page.goto(BASE_URL)
 
    expect(page.get_by_role("heading", name="ToDoリスト")).to_be_visible()
    expect(page.get_by_placeholder("タスクを入力")).to_be_visible()
    expect(page.get_by_role("button", name="追加")).to_be_visible()
    page.wait_for_timeout(3000)

#教材外のテストケース。カテゴリ一覧画面への遷移確認テスト
# def test_category_management_link_navigates_to_categories_page(page: Page):
#     page.goto(BASE_URL)
#     page.wait_for_timeout(3000)
#     page.get_by_role("link", name="カテゴリ管理").click()

#     expect(page).to_have_url(f"{BASE_URL}/categories")
#     expect(page.get_by_role("heading", name="カテゴリ管理")).to_be_visible()
#     page.wait_for_timeout(3000)
    