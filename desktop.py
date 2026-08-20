import sys
import threading

from paths import portable_dir
from server import PORT, create_server

try:
    import webview
except ImportError:
    webview = None


def alert(message: str) -> None:
    if sys.platform == "win32":
        try:
            import ctypes

            ctypes.windll.user32.MessageBoxW(0, message, "Virtual shelf", 0x40)
            return
        except Exception:
            pass
    try:
        import tkinter as tk
        from tkinter import messagebox

        root = tk.Tk()
        root.withdraw()
        messagebox.showinfo("Virtual shelf", message)
        root.destroy()
    except Exception:
        print(message, file=sys.stderr)


def pip_hint() -> str:
    if sys.platform == "win32":
        return "py -3 -m pip install pywebview"
    return "python3 -m pip install pywebview"


def run() -> None:
    if webview is None:
        extra = ""
        if sys.platform.startswith("linux"):
            extra = (
                "\n\nOn Linux also install a webview backend, for example:\n"
                "sudo apt install python3-gi gir1.2-gtk-3.0 gir1.2-webkit2-4.1"
            )
        alert(f"Missing the window library. From this folder run:\n{pip_hint()}{extra}")
        raise SystemExit(1)

    try:
        server = create_server("127.0.0.1", PORT)
    except OSError:
        alert(
            "Port 5173 is already in use.\n\n"
            "Close the other Virtual shelf or the old browser server, then try again."
        )
        raise SystemExit(1)

    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    storage = portable_dir() / "userdata"
    storage.mkdir(exist_ok=True)

    webview.create_window(
        "Virtual shelf",
        f"http://127.0.0.1:{PORT}/",
        width=1280,
        height=840,
        min_size=(880, 600),
    )
    # Let pywebview pick Edge on Windows, Cocoa on macOS, GTK/Qt on Linux.
    webview.start(private_mode=False, storage_path=str(storage))
    server.shutdown()
    server.server_close()


if __name__ == "__main__":
    run()
