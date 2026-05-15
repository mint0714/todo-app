from pathlib import Path
import re

import pytest
from playwright.sync_api import Page


def safe_filename(value: str) -> str:
    """
    pytestのnodeidをファイル名として使える形に変換する。
    例:
    tests/e2e/test_todo_flow.py::test_add_task
    -> tests_e2e_test_todo_flow_py__test_add_task
    """
    return re.sub(r"[^a-zA-Z0-9_.-]+", "_", value)


@pytest.fixture(autouse=True)
def record_annotated_video(page: Page, request):
    """
    各E2Eテストの実行動画を保存し、
    動画上にクリック・入力などの操作注釈を表示する。

    Playwright v1.59以降が前提。
    """
    output_dir = Path("test-results") / "annotated-videos"
    output_dir.mkdir(parents=True, exist_ok=True)

    test_name = safe_filename(request.node.nodeid)
    video_path = output_dir / f"{test_name}.webm"

    page.screencast.start(path=str(video_path))
    page.screencast.show_actions(
        duration=800,
        position="top-right",
        font_size=18,
    )

    yield

    page.screencast.stop()