# xxx two different worlds right now: oejskit or selenium
try:
    import sys
    import selenium.webdriver
    import py
    import testapi.actions
    import testapi.browser
    import testapi.server
    import testapi.OpenID

    @py.test.fixture(scope='session')
    def server(request):
        server = testapi.server.Server()
        server.setup_conf()
        server.start()
        request.addfinalizer(server.stop)

        sys.path.append(testapi.server.pytransact_dir)
        sys.path.append(testapi.server.server_dir)

        import accounting, members
        import blm.accounting, blm.members

        return server

    @py.test.fixture(scope='session')
    def openid(request):
        provider = testapi.OpenID.OpenIDProvider()
        provider.start()
        request.addfinalizer(provider.stop)
        return provider

    @py.test.fixture(scope='session')
    def browser(request, server, openid):
        driver = selenium.webdriver.Firefox()
        testapi.actions.create_profile(driver, server, openid)
        request.addfinalizer(driver.quit)
        browser = testapi.browser.Browser(driver)
        return browser

except ImportError:
    import os

    class jstests_setup:
        staticDirs = {
            '/ext': os.path.join(os.path.dirname(__file__), 'ext'),
            '/app': os.path.join(os.path.dirname(__file__), 'app'),
            # oejskit gets really confused by having / as a resource
            '/bootstrap': os.path.dirname(__file__)
            }

        jsRepos = ['/ext', '/app']
        jsScripts = [
            '/ext/ext-all-dev.js',
            '/bootstrap/bootstrap.js',
            '/app/testboot.js'
            ]


    jstests_browser_specs = {
                             'nogui': ['phantomtest'],
                             }

    #from oejskit import browser
    #browser.browsers['chromium'] = 'chromium --user-data-dir=/tmp/chromium-pytest'

    import oejskit.wsgi
    _WSGIServer = oejskit.wsgi.WSGIServer

    class WSGIServer(_WSGIServer):

        def get_request(self):
            req_sock, addr = _WSGIServer.get_request(self)
            req_sock.settimeout(10)
            return req_sock, addr

    oejskit.wsgi.WSGIServer = WSGIServer
