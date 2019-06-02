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

_loadedPaths = {}
_injectScriptElement = Ext.Loader.injectScriptElement
Ext.Loader.injectScriptElement = function(url) {
    var path = url.split('?')[0]
    if (path in _loadedPaths) {
        throw path + " already loaded"
    }
    _loadedPaths[path] = true
    return _injectScriptElement.apply(Ext.Loader, arguments)
}

Ext.Loader.setConfig({
    enabled: true
})

Ext.require([
    'Ext.ModelManager',
    'Ext.direct.Manager',
    'Bokf.lib.BLMTypes',
    // Firefox can't find these on its own:
    'Ext.dom.Layer',
    'Ext.FocusManager'
])

Ext.require('Ext.ComponentQuery', function() {
    // Hack to avoid the problem that a Form will find *all* fields
    // within itself (includiing the ones in nested grids).
    // This will have two unwanted effects:
    //  - forms may be considered when they aren't supposed to be
    //  - fields in sub forms sharing names with fields in parent
    //    forms will affect the parent form's record!
    //
    // In order to avoid this, mark fields in superform with :dontignore
    // and put the following code in the super form's render listener:
    // this.getForm().monitor.selector = '[isFormField]:dontignore'
    Ext.ComponentQuery.pseudos.dontignore = function(items) {
        return items.filter(function(item) {
            return !item.initialConfig.ignore
        })
    }
})

Ext.require('Bokf.Application')
