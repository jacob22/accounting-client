import atexit
import os
import socket
import subprocess
import time


class OpenIDProvider(object):

    def __init__(self, host=None, port=None):
        if host is None:
            host = socket.getfqdn()
        #if '.' not in host:
        #    host += '.openend.se'

        if port is None:
            s = socket.socket()
            s.bind(('', 0))
            s.listen(socket.SOMAXCONN)
            _, port = s.getsockname()
            s.close()

        self.host = host
        self.port = port
        self.url = 'http://%s:%d/' % (host, port)
        print self.url

    def start(self):
        script = os.path.join(os.path.dirname(__file__), 'openidprovider.py')
        self.provider = subprocess.Popen(
            [script, '--host', self.host, '--port', str(self.port)])
        for _ in xrange(5000):
            try:
                conn = socket.create_connection((self.host, self.port))
                conn.close()
            except socket.error:
                time.sleep(0.01)
            else:
                break
        else:
            raise RuntimeError
        atexit.register(self.stop)
        return self

    def stop(self):
        self.provider.terminate()

    # context manager interface

    __enter__ = start

    def __exit__(self, type, value, traceback):
        self.stop()
