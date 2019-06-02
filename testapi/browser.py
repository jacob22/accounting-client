import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from . import OpenID

class Browser(object):

    def __init__(self, driver):
        self.driver = driver

    def __getattr__(self, attr):
        return getattr(self.driver, attr)

    def find(self, by=By.CSS_SELECTOR, **kw):
        return self.driver.find_element(by=by, **kw)

    def findAndShow(self, by=By.CSS_SELECTOR, **kw):
        element = self.find(by=by, **kw)
        self.ensureVisible(element)
        return element

    def componentQuery(self, query):
        return self.driver.execute_script(
            "return Ext.ComponentQuery.query('%s')[0].getEl().dom" % query)

    def ensureVisible(self, element):
        for n in xrange(10):
            if element.is_displayed():
                break
            self.driver.execute_script('arguments[0].scrollIntoView(true)',
                                       element)
            if n:
                time.sleep(0.1)

    def locate(self, locator, by=By.CSS_SELECTOR,
               how=EC.visibility_of_element_located,
               timeout=10):
        return WebDriverWait(self.driver, timeout).until(how((by, locator)))
