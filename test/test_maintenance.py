import os
import re
import subprocess
import tempfile

here = os.path.dirname(__file__)
root = os.path.dirname(here)

class TestMakeTargets(object):

    def setup_method(self, method):
        self.files = []

    def teardown_method(self, method):
        for fname in self.files:
            path = os.path.join(root, fname)
            if os.path.exists(path):
                os.unlink(path)

    def make(self, target, *args):
        senchaopts = '--nologo --quiet --plain'
        command = ['make', target, 'senchaopts=%s' % senchaopts]
        if args:
            command.extend(args)
        output = subprocess.check_output(command)

        assert not re.search('^C1000', output, re.MULTILINE) # C1000 = trailing comma
        return output

    def test_bootstrap_js(self):
        self.files.append('testbootstrap.js')
        self.make('bootstrap', 'bootstrap.js=testbootstrap.js')

        cmpcmd = 'cmp bootstrap.js testbootstrap.js'.split()
        subprocess.check_call(cmpcmd, cwd=root)

    def test_compile(self):
        self.files.append('testcompiled.html')
        self.make('compile', 'compiled.html=testcompiled.html')
