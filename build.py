"""Build a native portable app on the OS you are running."""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SEP = os.pathsep
DATA_FILES = [
    "index.html",
    "app.js",
    "styles.css",
    "logos.js",
    "finn.js",
    "recover.html",
]
HIDDEN = ["catalog", "finn", "paths"]
if sys.platform == "win32":
    HIDDEN.append("webview.platforms.edgechromium")
elif sys.platform == "darwin":
    HIDDEN.append("webview.platforms.cocoa")
else:
    HIDDEN.extend(["webview.platforms.gtk", "webview.platforms.qt"])


def main() -> None:
    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--noconfirm",
        "--clean",
        "--windowed",
        "--name",
        "VirtualShelf",
    ]
    for name in HIDDEN:
        cmd += ["--hidden-import", name]
    for name in DATA_FILES:
        cmd += ["--add-data", f"{name}{SEP}."]
    cmd += ["--add-data", f"logos{SEP}logos", str(ROOT / "desktop.py")]
    subprocess.check_call(cmd, cwd=ROOT)

    dest = ROOT / "dist" / "VirtualShelf"
    if sys.platform == "darwin":
        app = ROOT / "dist" / "VirtualShelf.app"
        if app.exists():
            dest = app / "Contents" / "MacOS"
    config = ROOT / "config.json"
    if config.exists() and dest.exists():
        shutil.copy2(config, dest / "config.json")

    print()
    if sys.platform == "win32":
        print("Portable app: dist\\VirtualShelf\\VirtualShelf.exe")
    elif sys.platform == "darwin":
        print("Portable app: dist/VirtualShelf.app")
    else:
        print("Portable app: dist/VirtualShelf/VirtualShelf")


if __name__ == "__main__":
    main()
