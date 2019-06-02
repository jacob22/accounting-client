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

jQuery(document).ready(function($) {
    function poll() {
        var request = $.ajax('/seqrPoll/' + providerId + '/' + purchaseId + '/' + invoiceRef)
        request.done(function(data) {
            if (data.resultCode == 0) {
                if (data.status == 'PAID' || data.status == 'CANCELED') {
                    window.location = invoiceUrl
                    return
                }
            }
            console.log(data)
            window.setTimeout(poll, 1000)
        })
        request.fail(function() {
            window.setTimeout(poll, 1000)
        })
    }

    function set_qrcode(text) {
        var qr = qrcode(-1, 'L')
        qr.addData(text)
        qr.make()

        var cellSize = Math.floor(220 / qr.getModuleCount())
        return qr.createImgTag(cellSize, cellSize)
    }

    $('.seqr-base-img').html(set_qrcode(seqrQR))
    var mobile = typeof window.orientation != 'undefined'
    $('#seqr-container').addClass(mobile ? 'seqr-mobile' : 'seqr-desktop')
    poll()
})
