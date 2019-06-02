# see selenium.webdriver.support.expected_conditions
from selenium.webdriver.support.expected_conditions import (
    _element_if_visible, _find_element)
from selenium.webdriver.common.by import By

class ext_component(object):

    def __init__(self, locator):
        self.locator = locator

    def __call__(self, driver):
        js = """var components = Ext.ComponentQuery.query('%s')
                return components.length && components[0].id""" % (
            self.locator)
        print js
        id = driver.execute_script(js)
        locator = By.CSS_SELECTOR, '#%s' % id
        return _element_if_visible(_find_element(driver, locator))
