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


