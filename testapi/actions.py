import urlparse
import time
from selenium.webdriver.support.ui import WebDriverWait
from .conditions import ext_component
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from testapi.utils import wait_for


def create_profile(driver, server, openid, identity=None):
    from pytransact.context import ReadonlyContext
    import blm.accounting

    if identity is None:
        identity = 'TestUser'
    driver.get('http://localhost:%d/' % server.port)
    WebDriverWait(driver, 10).until(EC.title_contains("Eutaxia"))

    inputElement = driver.find_element_by_name("openid")
    openidurl = urlparse.urljoin(openid.url, '/id/' + identity)
    inputElement.send_keys(openidurl)
    inputElement.submit()

    WebDriverWait(driver, 10).until(EC.title_contains("OpenID"))

    inputElement = driver.find_element_by_name("yes")
    inputElement.click()

    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(('name', 'create-profile')))
    name = driver.find_element_by_name("name")
    name.send_keys(identity)
    email = driver.find_element_by_name("email")
    email.send_keys("test@test")
    agree = driver.find_element_by_name("agree")
    agree.click()
    create = driver.find_element_by_id("submit")
    create.click()

    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(('class name', 'addOrg')))

    def checkuser():
        with ReadonlyContext(server.database):
            assert blm.accounting.User._query(openid=openidurl).run()

    wait_for(checkuser)


def create_org(browser, name='The Organisation'):
    el = browser.findAndShow(value='.addOrg')
    el.click()

    WebDriverWait(browser.driver, 10).until(
        ext_component('orgedit textfield[name=name]'))

    namefield = browser.findAndShow(value='.orgedit input[name=name]')
    namefield.send_keys(name)

    orgnum = browser.findAndShow(value='.orgedit input[name=orgnum]')
    orgnum.send_keys('1234567890')

    email = browser.findAndShow(value='.orgedit input[name=email]')
    email.send_keys('test@test.test')

    address = browser.findAndShow(value='.orgedit textarea[name=address]')
    address.send_keys('some address')

    phone = browser.findAndShow(value='.orgedit input[name=phone]')
    phone.send_keys('555 - 666 666')

    cb = browser.findAndShow(value='.orgedit .x-form-checkbox')
    cb.click()

    button = browser.componentQuery('orgedit button[action=save]')
    browser.ensureVisible(button)
    button.click()

    class get_org_id(object):
        def __call__(self, driver):
            return driver.execute_script("""
               var list = Ext.ComponentQuery.query('orglist')[0]
               var selModel = list.getSelectionModel()
               var selection = selModel.getSelection()
               if (selection.length) {
                   var id = selection[0].get('id')
                   if (id) {
                       return id
                   }
               }
            """)

    orgid = WebDriverWait(browser.driver, 10).until(get_org_id())
    return orgid

def create_accounting(browser, orgid):
    element = browser.find(value='[data-recordid="%s"] .x-tree-expander' %orgid)
    browser.ensureVisible(element)
    element.click()

    time.sleep(1) # wait for animation :(
    WebDriverWait(browser.driver, 10).until(EC.visibility_of_element_located(
            (By.CSS_SELECTOR, '.addAccounting')))
    browser.find(value='.addAccounting').click()

    radio = WebDriverWait(browser.driver, 10).until(
        ext_component('accounting-fromtemplate radio'))
    radio.click()

    button = browser.componentQuery('accounting-fromtemplate button')
    button.click()

    WebDriverWait(browser.driver, 10).until(ext_component('accountingedit'))
    accid = browser.driver.execute_script("""
        var form = Ext.ComponentQuery.query('accountingedit')[0]
        var record = form.getRecord()
        return record.get('id')""")
    return accid

def create_account(database, browser, accountingid,
                   number='1000', name='An account'):
    from pytransact.context import ReadonlyContext
    import blm.accounting

    with ReadonlyContext(database):
        existing = blm.accounting.Account._query().run()
        print existing

    element = browser.find(value='[data-recordid="%s"]' % accountingid)
    element.click()

    grid = browser.componentQuery('accountingedit grid[name=accounts]')
    cells = grid.find_elements_by_css_selector('div.x-grid-cell-inner')

    numbercell = cells[0]
    browser.ensureVisible(numbercell)
    numbercell.click()
    numberfield = WebDriverWait(browser.driver, 10).until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, '.account-number input')))
    numberfield.send_keys(number, Keys.RETURN)

    type = WebDriverWait(browser.driver, 10).until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, '.accounttype-combo input')))
    time.sleep(1)
    type.send_keys(Keys.ARROW_DOWN)
    type.send_keys(Keys.ARROW_DOWN)
    type.send_keys(Keys.RETURN)
    time.sleep(1)
    type.send_keys(Keys.RETURN)

    namefield = browser.locate('.accounts .name input')
    namefield.send_keys(name, Keys.RETURN)

    vat = browser.locate('.vatcode-combo input')
    vat.send_keys(Keys.ARROW_DOWN, Keys.ARROW_DOWN, Keys.RETURN)
    time.sleep(1)
    vat.send_keys(Keys.RETURN)

    budget = browser.locate('.currency-editor input')
    budget.send_keys('1000.00', Keys.RETURN)

    #balance = browser.locate('.currency-editor input')
    #assert budget is not balance
    #balance.send_keys('2000.00', Keys.RETURN)

    button = browser.componentQuery('accountingedit button[action=save]')
    button.click()

    def checkaccount():
        with ReadonlyContext(database):
            accounts = blm.accounting.Account._query().run()
            assert len(accounts) == len(existing) + 1

    wait_for(checkaccount)

