import pymongo
import os
import socket
import subprocess
import tempfile
import textwrap
import time

from . import utils

pytransact_dir = os.environ.get('PYTRANSACT_DIR', '/src/pytransact')
server_dir = os.environ.get('ACCOUNTING_DIR', '/src/accounting')

class Server(object):

    _connection = None

    def __init__(self):
        self.port = utils.find_port()
        self.dbname = 'accounting_test_%d' % os.getpid()

    @property
    def connection(self):
        if not self._connection:
            import accounting.config
            import pytransact.mongo
            self._connection = pytransact.mongo.connect(
                accounting.config.config.get('accounting', 'mongodb_uri'))
        return self._connection

    @property
    def database(self):
        return self.connection[self.dbname]

    def setup_conf(self):
        fh, self.cfg = tempfile.mkstemp()
        params = {'dbname': self.dbname,
                  'port': self.port,
                  'clientdir': os.path.dirname(os.path.dirname(__file__))}

        os.write(fh, textwrap.dedent('''\
            [accounting]
            mongodb_dbname = %(dbname)s
            client_dir = %(clientdir)s

            [standalone]
            port = %(port)d
            threaded = false
            reloader = false
            ''' % params))
        os.close(fh)

    def start(self):
        env = {'PATH': os.environ['PATH'],
               'ACCOUNTING_CONFIG': self.cfg,
               'PYTHONPATH': os.pathsep.join([pytransact_dir, server_dir])}

        upgrade = os.path.join(server_dir, 'bin', 'upgrade.py')
        subprocess.check_call(upgrade, env=env)

        coa = os.path.join(server_dir, 'accounting', 'bas_import.py')
        subprocess.check_call([coa, 'Tom kontoplan', '/dev/null', 'replace'],
                              env=env)

        wsgi = os.path.join(server_dir, 'bin', 'wsgi.py')
        self.wsgi = subprocess.Popen([wsgi], env=env)
        while not self.is_up():
            time.sleep(0.1)

    def stop(self):
        self.wsgi.terminate()
        self.cleanup()

    def is_up(self):
        s = socket.socket()
        try:
            s.connect(('127.0.0.1', self.port))
        except socket.error:
            return False
        finally:
            s.close()
        return True

    def cleanup(self):
        os.unlink(self.cfg)
        self.connection.drop_database(self.dbname)
        self.connection.disconnect()
