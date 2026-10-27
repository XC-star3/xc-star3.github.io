"""Serve the workspace locally with enough capacity for parallel browser checks."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys


class SiteServer(ThreadingHTTPServer):
    request_queue_size = 128
    daemon_threads = True


if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    handler = partial(SimpleHTTPRequestHandler, directory=str(root))
    with SiteServer(("127.0.0.1", port), handler) as server:
        server.serve_forever()
