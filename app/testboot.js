/*
Copyright 2019 Open End AB

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

for (name in Ext.Loader.config.paths) {
    Ext.Loader.config.paths[name] = '/' + Ext.Loader.config.paths[name]
}

Ext.namespace('Bokf')

blm = {
    accounting: {
        Account: {},
        Transaction: {},
        Verification: {}
    }
}


// xxx reuse some of the code between fakeProxies and fakeProxy

function fakeProxies(/* proxy aliases */) {
    var proxies = {}
    for (var i=0; i < arguments.length; i++) {
        var name = arguments[i]
        var alias = name.toLowerCase()
        var capitalized = name.charAt(0).toUpperCase() + name.slice(1)
        var className = 'Test.proxy.' + capitalized
        var proxy = Ext.define(className, {
            extend: 'Ext.data.proxy.Memory',
            data: []
        })
        Ext.ClassManager.setAlias(className, 'proxy.' + alias)
        proxies[alias] = proxy
    }
    return proxies
}

function fakeProxy(config) {
    var alias = config.alias
    if (!config.extend) {
        config.extend = 'Ext.data.proxy.Memory'
    }
    var name = alias.split('.', 2)[1]
    var capitalized = name.charAt(0).toUpperCase() + name.slice(1)
    var className = 'Test.proxy.' + capitalized
    //debugger
    Ext.define(className, config)
    Ext.ClassManager.setAlias(className, alias)
}

Ext.define('TestViewport', {
    override: 'Ext.container.Viewport',
    initComponent : function() {
        var me = this,
            html = document.body.parentNode,
        el = me.el = Ext.get('test');

        // Get the DOM disruption over with before the Viewport renders and begins a layout
        Ext.getScrollbarSize();

        // Clear any dimensions, we will size later on
        me.width = me.height = undefined;

        me.callSuper(arguments);
        // Ext.fly(html).addCls(Ext.baseCSSPrefix + 'viewport');
        // if (me.autoScroll) {
        //     Ext.fly(html).setStyle(me.getOverflowStyle());
        //     delete me.autoScroll;
        // }
        el.setHeight = el.setWidth = Ext.emptyFn;
        el.dom.scroll = 'no';
        me.allowDomMove = false;
        me.renderTo = me.el;
    }
})
