import socket
import time

def find_port():
    s = socket.socket()
    s.bind(('', 0))
    s.listen(socket.SOMAXCONN)
    _, port = s.getsockname()
    s.close()
    return port

def wait_for(func, timeout=10, step=0.5):
    start = time.time()
    while time.time() - start < timeout:
        try:
            return func()
        except AssertionError, exc:
            time.sleep(step)
    else:
        raise exc
