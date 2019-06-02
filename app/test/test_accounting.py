# Copyright 2019 Open End AB
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import pytest
try:
    import selenium
except ImportError:
    pytest.skip()

from testapi import actions

@pytest.mark.usefixtures('server', 'browser')
class TestAccounting(object):

    def test_create_accounting(self, server, browser):
        pytest.skip('fix me')
        orgid = actions.create_org(browser, 'TestAccounting')
        accid = actions.create_accounting(browser, orgid)
        actions.create_account(server.database, browser, accid)