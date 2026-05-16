import re
from uuid import uuid4
 
from playwright.sync_api import Page, expect
 
 
BASE_URL = "http://127.0.0.1:5000"
 
 
def unique_name(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8]}"


#カテゴリ追加
def test_add_category(page: Page):
    category_name = unique_name("E2Eカテゴリ")
 
    page.goto(f"{BASE_URL}/categories")
    page.get_by_placeholder("カテゴリ名を入力").fill(category_name)
    page.get_by_role("button", name="追加").click()

    expect(page.get_by_text(category_name)).to_be_visible()

#タスク追加
def test_add_task(page:Page):
    task_name = unique_name("E2Eタスク")
 
    page.goto(BASE_URL)
    page.get_by_placeholder("タスクを入力").fill(task_name)
    page.get_by_role("button", name="追加").click()

    expect(page.get_by_text(task_name)).to_be_visible()

#カテゴリ追加からタスク追加の流れ
def test_add_task_to_category(page:Page):
    category_name = unique_name("E2Eカテゴリ")
    task_title = unique_name("E2Eタスク")
    
    ##カテゴリ追加
    page.goto(f"{BASE_URL}/categories")
    page.get_by_placeholder("カテゴリ名を入力").fill(category_name)
    page.get_by_role("button", name="追加").click()
    expect(page.get_by_text(category_name)).to_be_visible()

    ##タスク追加
    page.goto(BASE_URL)
    page.get_by_placeholder("タスクを入力").fill(task_title)
    page.locator("select[name='category_id']").select_option(label=category_name)
    page.get_by_role("button", name="追加").click()
    #.task-item クラスの中から、task_title という文字を含む要素を探すための問い合わせ条件 を task_row に入れています。
    task_row = page.locator(".task-item").filter(has_text=task_title)
    expect(task_row).to_contain_text(category_name)

 #タスク詳細ページ遷移テスト
def test_open_task_detail_page(page:Page):
    task_title = unique_name("E2E詳細遷移テスト")
    
    page.goto(BASE_URL)
    page.get_by_placeholder("タスクを入力").fill(task_title)
    page.get_by_role("button", name="追加").click()
    task_row = page.locator(".task-item").filter(has_text=task_title)
    task_row.get_by_role("link", name="詳細").click()
    expect(page.get_by_role("heading", name=task_title)).to_be_visible()
    expect(page.get_by_text("状態：未完了")).to_be_visible()

 #コメント追加テスト
def test_add_comment_to_task(page:Page):
    task_title = unique_name("E2Eコメント追加テスト")
    comment_content = unique_name("E2Eコメント追加")
    
    page.goto(BASE_URL)
    page.get_by_placeholder("タスクを入力").fill(task_title)
    page.get_by_role("button", name="追加").click()
    task_row = page.locator(".task-item").filter(has_text=task_title)
    task_row.get_by_role("link", name="詳細").click()
    page.get_by_placeholder("コメントを入力").fill(comment_content)
    page.get_by_role("button", name="追加").click()
    comment_row = page.locator(".task-item").filter(has_text=comment_content)
    expect(comment_row).to_be_visible()

def test_toggle_task_complete(page: Page):
    task_title = unique_name("E2E完了切替テスト")

    page.goto(BASE_URL)
    page.get_by_placeholder("タスクを入力").fill(task_title)
    page.get_by_role("button", name="追加").click()

    task_row = page.locator(".task-item").filter(has_text=task_title)
    expect(task_row.get_by_role("button", name="完了", exact=True)).to_be_visible()

    task_row.get_by_role("button", name="完了", exact=True).click()

    expect(task_row.get_by_role("button", name="未完了", exact=True)).to_be_visible()
    expect(task_row).to_have_class(re.compile(r"\bcompleted\b"))

def test_delete_task(page: Page):
    task_title = unique_name("E2E削除タスク")
 
    page.goto(BASE_URL)
    page.get_by_placeholder("タスクを入力").fill(task_title)
    page.get_by_role("button", name="追加").click()
    expect(page.get_by_text(task_title)).to_be_visible()
 
    task_row = page.locator(".task-item").filter(has_text=task_title)
    task_row.get_by_role("button", name="削除").click()
 
    expect(task_row).not_to_be_visible()