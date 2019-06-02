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

Ext.define('Bokf.locale.sv_SE.controller.Accounting', {
    override: 'Bokf.controller.Accounting',
    l10n: {
        loadMask: 'Hämtar räkenskapsår',
        initAccounts: {
            msgbox: {
                title: 'Hämta kontoinformation',
                msg: '\
Detta kommer att hämta kontoinformation från föregående \
räkenskapsår. Alla kontons ingående balans kommer att sättas till \
kontots utgående balans från förra året. Konton som saknas i årets \
kontoplan men som fanns i förra årets kommer att återskapas',
                buttonText: {
                    cancel: 'Avbryt',
                    ok: 'Hämta kontoinformation'
                }
            },
            loadMask: 'Uppdaterar konton',
            error: {
                title: 'Ingen kontoinformation hittad.',
                msg: '\
Det finns inget tidigare räkenskapsår, därför har ingen \
kontoinformation hämtats.'
            }
        },

        saveAccounting: {
            failure: {
                title: 'Fel när räkenskapsår sparades',
                msg: 'Ett fel uppstod när räkenskapsåret sparades'
            }
        },

        removeAccounting: {
            msgbox: {
                title: 'Ta bort räkenskapsår',
                msg: '\
Detta kommer att radera hela räkenskapsåret, inklusive alla konton, alla \
verifikat och dess tillhörande transaktioner. \
Denna handling är permanent och kan inte göras ogjord. Datan blir permanent \
borttagen.',
                buttonText: {
                    cancel: 'Avbryt',
                    ok: 'Ta bort räkenskapsår permanent'
                }
            },
            loadMask: 'Tar bort räkenskapsår'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.controller.Org', {
    override: 'Bokf.controller.Org',
    l10n: {
        accountingImport: {
            waitMsg: 'Importerar fil. Detta kan ta flera minuter.',
            success: {
                title: 'Import färdig',
                msg: 'Filen har importerats.'
            },
            failure: {
                title: 'Import misslyckades.',
                msg: 'Ett fel uppstod vid import av fil.'
            }
        },
        copyAccountingYear: {
            loadMask: 'Skapar räkenskapsår baserat på föregående år.'
        },
        createFromTemplate: {
            loadMask: 'Skapar räkenskapsår från kontoplan.'
        },
        deleteMember: {
            title: 'Ta bort medlem',
            msg: 'Du håller på att ta bort {0} ur {1}.',
            buttonText: {
                cancel: 'Avbryt',
                ok: 'Ta bort'
            },
            failure: {
                title: 'Kunde inte ta bort medlem',
                msg: 'Ett fel uppstod när medlemmen skulle tas bort.'
            }
        },
        saveMembers: {
            loadMask: 'Sparar nya roller...',
            failure: {
                title: 'Kunde inte ändra roller',
                msg: 'Ett fel uppstod när rollerna skulle ändras.'
            }
        },
        invite: {
            waitMsg: 'Skickar inbjudan...',
            success: {
                title: 'Inbjudan skickad',
                msg: 'Du har bjudit in {0}.'
            },
            failure: {
                title: 'Inbjudan kunde inte skickas.',
                msg: 'Ett fel uppstod när inbjudan skulle skickas.'
            }
        },
        orgselected: {
            loadMask: 'Hämtar {0}...'
        },
        accountingselected: {
            loadMask: 'Hämtar räkenskapsår...'
        },
        save: {
            loadMask: 'Sparar...'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.controller.Reports', {
    override: 'Bokf.controller.Reports',
    l10n: {
        loadMask: 'Skapar rapport...'
    }
})

Ext.define('Bokf.locale.sv_SE.controller.Subscription', {
    override: 'Bokf.controller.Subscription',
    l10n: {
        subscriber: {
            title: 'Uppgradera till Standardorganisation',
            msg: '\
Det här uppgraderar din organisation till en Standardorganisation. \
En faktura kommer att skickas till e-postadressen {email}.',
            buttonText: {
                cancel: 'Avbryt',
                ok: 'Uppgradera'
            },
            loadMask: 'Uppgraderar...'
        },
        pg: {
            title: 'Beställ OCR-inläsning',
            msg: '\
Det här kommer att beställa OCR-inläsning till plusgirokontot {pg}. \
En faktura kommer att skickas till e-postadressen {email}.',
            buttonText: {
                cancel: 'Avbryt',
                ok: 'Beställ OCR-inläsning'
            },
            loadMask: 'Lägger beställning...'
        },
        deleteProvider: {
            title: 'Ta bort betalningsförmedlare',
            msg: 'Vill du ta bort förmedlaren? Betalningar kommer inte längre kunna tas emot den här vägen och ännu ej bokförda betalningar måste hanteras manuellt.',
            buttonText: {
                ok: 'Ta bort',
                cancel: 'Avbryt'
            },
            loadMask: 'Tar bort...'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.controller.Verifications', {
    override: 'Bokf.controller.Verifications',
    l10n: {
        save: {
            loadMask: 'Sparar',
            error: {
                title: 'Fel',
                msg: 'Ett fel uppstod när verifikatet skulle sparas.'
            },
            unexpectedVerificationNumber: {
                title: 'Oväntat verifikatnummer',
                msg: ('Verifikatnummret blev annat än det väntade på verifkatet '+
                      'du just sparade. Det väntade numret var {0}, men '+
                      '<b>{1}</b> användes istället. Detta beror sannolikt på att '+
                      'någon annan sparade ett verifikat medan du arbetade på '+
                      'detta.')
            },
            saveFailed: {
                title: 'Kunde inte spara verifikatet',
                msg: ('Det gick inte att spara verifikatet. Kanske har någon annan '+
                      'ändrat på det. Pröva att ladda det igen och spara sedan.')
            }
        },
        load: {
            loadMask: 'Hämtar verifikat...'
        },
        'new': {
            loadMask: 'Förbereder nytt verifikat...'
        },
        print: {
            title: 'Skriv ut verifikat',
            msg: 'Verifikatet är inte sparat. Vill du spara det innan du skriver ut?',
            msgInvalid: 'Verifikatet kan inte sparas. Skriv ut ändå?'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.controller.members.Payments', {
    override: 'Bokf.controller.members.Payments',
    l10n: {
        approve: {
            failure: {
                title: 'Ett fel uppstod',
                msg: 'Kunde inte godkänna verifikat.'
            },
            success: {
                title: 'Verifikat godkänt',
                msg: 'Det föreslagna verifikatet har godkänts.'
            },
            loadMask: 'Godkänner verifikat...'
        },
        approveAll: {
            failure: {
                title: 'Ett fel uppstod',
                msg: 'Kunde inte godkänna verifikat.'
            },
            success: {
                title: 'Verifikat godkända',
                msg: 'Alla matchande föreslagna verifikat har godkänts.'
            },
            partial: {
                title: 'Verifikat godkända',
                msg: '{0} av {1} verifikat godkändes. '+
                     'Kvarvarande kräver manuell hantering.'
            },
            loadMask: 'Godkänner verifikat...'
        },
        payment: {
            loadMask: 'Hämtar betalningsinformation...'
        },
        payments: {
            loadMask: 'Hämtar inbetalningar...'
        },
        unknownPayer: 'Okänd avsändare'
    }
})

Ext.define('Bokf.locale.sv_SE.controller.members.Products', {
    override: 'Bokf.controller.members.Products',
    l10n: {
        loadMask: 'Hämtar produkter...',
        expand: {
            loadMask: 'Öppnar produkt...'
        },
        optionFieldDefaults: {
            personnummer: {
                label: 'Personnummer',
                optdescr: 'Fyll i personnummer'
            }
        },
        newProductDefaults: {
            name: 'Ny produkt'
        },
        copyProduct: {
            loadMask: 'Kopierar produkt...'
        },
        remove: {
            failure: {
                title: 'Produkten kan inte tas bort',
                msg: 'Den här produkten kan inte tas bort. Detta beror troligen på att den redan har sålts.'
            }
        }
    }
})

Ext.define('Bokf.locale.sv_SE.controller.members.PurchaseBase', {
    override: 'Bokf.controller.members.PurchaseBase',
    l10n: {
        loadMask: 'Filtrerar',
        refund: {
            loadMask: 'Försöker genomföra återbetalning...',
            failure: {
                title: 'Fel',
                msg: 'Återbetalningen misslyckades.'
            }
        },
        remind: {
            loadMask: 'Skickar e-post med påminnelse...',
            verify: {
                title: 'Skicka påminnelse?',
                msg: ('Vill du skicka ett e-postmeddelande till {0} med en '+
                      'påminnelse om att betalning inte är genomförd?'),
                ok: 'Skicka påminnelse',
                cancel: 'Avbryt'
            },
            failure: {
                title: 'Ett fel uppstod',
                msg: 'Påminnelsen kunde inte skickas.'
            }
        }
    }
})

Ext.define('Bokf.locale.sv_SE.controller.members.SalesReports', {
    override: 'Bokf.controller.members.SalesReports',
    l10n: {
        loadMask: 'Skapar rapport...'
    }
})

Ext.define('Bokf.locale.sv_SE.lib.DateRange', {
    override: 'Bokf.lib.DateRange',
    l10n: {
        captions: {
            startLabel: 'Från:',
            endLabel: 'Till:'
        },
        buttons: {
            resetdate: 'Återställ'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.lib.NumberRange', {
    override: 'Bokf.lib.NumberRange',
    l10n: {
        buttons: {
            reset: 'Återställ'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.lib.TagsEditor', {
    override: 'Bokf.lib.TagsEditor',
    l10n: {
        emptyText: 'lägg till ny etikett',
        label: 'Nuvarande etiketter:'
    }
})

Ext.define('Bokf.locale.sv_SE.store.AccountTypes', {
    override: 'Bokf.store.AccountTypes',

    data: [
        {id: undefined, name: null},
        {id: 'T', name: 'Tillgång'},
        {id: 'S', name: 'Skuld'},
        {id: 'K', name: 'Kostnad'},
        {id: 'I', name: 'Intäkt'}
    ]
})

Ext.define('Bokf.locale.sv_SE.store.members.OptionFieldType', {
    override: 'Bokf.store.members.OptionFieldType',

    data : [
        {id: 'text', name: 'Textfält'},
        {id: 'textarea', name: 'Textarea'},
        {id: 'personnummer', name: 'Personnummer'},
        {id: 'select', name: 'Flerval'}
     ]
})

Ext.define('Bokf.locale.sv_SE.store.members.PaymentFilters', {
    override: 'Bokf.store.members.PaymentFilters',

    data: [
        {id: 'approved', text: 'Bokförda'},
        {id: 'unapproved', text: 'Ej bokförda'}
    ]
})

Ext.define('Bokf.locale.sv_SE.store.members.ProductFilters', {
    override: 'Bokf.store.members.ProductFilters',

    data: [
        {id: 'unarchived', text: 'Alla oarkiverade'},
        {id: 'published', text: 'Publicerade'},
        {id: 'unpublished', text: 'Opublicerade'},
        {id: 'archived', text: 'Arkiverade'}
    ]
})

Ext.define('Bokf.locale.sv_SE.store.members.PurchaseFilters', {
    override: 'Bokf.store.members.PurchaseFilters',

    data: [
        {id: 'unpaid', text: 'Obetalda'},
        {id: 'paid', text: 'Betalda'},
        {id: 'credited', text: 'Krediterade'},
        {id: 'cancelled', text: 'Makulerade'}
        //{id: 'archived', text: 'Arkiverade'}
    ]
})

Ext.define('Bokf.locale.sv_SE.store.Reports', {
    override: 'Bokf.store.Reports',
    l10n: {
        reportNames: {
            '/kontoplan': 'Kontoplan',
            '/huvudbok': 'Huvudbok',
            '/verifikationslista': 'Verifikationslista',
            '/verifikationslista_andrade': 'Ändrade verifikat',
            '/balansrakning': 'Balansrapport',
            '/resultatrakning': 'Resultaträkning',
            '/arsrapport': 'Årsrapport',
            '/periodrapport': 'Periodrapport',	   
            '/vatreport': 'Momsrapport',
            '/graph': 'Kumulativ graf',
	    '/accountspayable_report': 'Leverantörsreskontrarapport',
	    '/accountspayable_paymentjournal': 'Betalningsjournal för leverantörsreskontra'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.store.Roles', {
    override: 'Bokf.store.Roles',
    data: [
        {id: 'admin', name: 'Administratör'},
        {id: 'accountant', name: 'Bokförare'},
        {id: 'storekeeper', name: 'Butiksadministratör'},
        {id: 'member', name: 'Användare'},
        {id: 'ticketchecker', name: 'Biljettrivare'}
    ]
})

Ext.define('Bokf.locale.sv_SE.view.Main', {
    override: 'Bokf.view.Main',
    l10n: {
        tabNames: {
            admin: 'Administration',
            accounting: 'Bokföring',
            reports: 'Rapporter',
            products: 'Butik',
            payments: 'Inbetalningar',
            purchases: 'Beställningar',
            invoices: 'Fakturor',
            expenses: 'Utlägg',
	    'import': 'Import',
            salesreports: 'Försäljningsrapporter',
            accountspayable: 'Leverantörsreskontra'
        },
        logout: 'Logga ut'
    }
})

Ext.define('Bokf.locale.sv_SE.proxy.OrgsTree', {
    override: 'Bokf.proxy.OrgsTree',
    l10n: {
        newOrg: 'Skapa ny organisation',
        newAccounting: 'Skapa nytt räkenskapsår'
    }
})

Ext.define('Bokf.locale.sv_SE.view.accounting.CopyPreviousYear', {
    override: 'Bokf.view.accounting.CopyPreviousYear',
    l10n: {
        title: 'Kopiera föregående år',
        html: '\
Detta kommer skapa ett nytt räkenskapsår baserat på det senaste. \
Alla konton kommer kopieras, och utgående balans för varje konto kommer \
att bli ingående balans i det nya räkenskapsåret.',
        buttonText: 'Kopiera'
    }
})

Ext.define('Bokf.locale.sv_SE.view.accounting.Create', {
    override: 'Bokf.view.accounting.Create',
    title: 'Skapa nytt räkenskapsår'
})

Ext.define('Bokf.locale.sv_SE.view.accounting.Edit', {
    override: 'Bokf.view.accounting.Edit',
    l10n: {
        fieldLabels: {
            taxation_year: 'Taxeringsår',
            start: 'Startdatum',
            end: 'Slutdatum'
        },
        verificationSeries: {
            title: 'Serier',
            columnHeaders: {
                name: 'Namn',
                description: 'Beskrivning'
            },
            buttons: {
                addseries: 'Skapa ny serie',
                deleteseries: 'Ta bort serie'
            }
        },
        accounts: {
            title: 'Konton',
            columnHeaders: {
                number: 'Kontonummer',
                type: 'Typ',
                name: 'Namn',
                vatCode: 'Momskod',
                budget: 'Budget',
                opening_balance: 'Ingående balans'
            },
            buttons: {
                addaccount: 'Skapa nytt konto',
                deleteaccount: 'Ta bort konto',
                initaccounts: 'Hämta ingångsdata från föregående räkenskapsår'
            }
        },
        buttons: {
            'export': 'Exportera',
            removeaccounting: 'Ta bort',
            save: 'Spara',
            cancel: 'Återställ'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.accounting.FromTemplate', {
    override: 'Bokf.view.accounting.FromTemplate',
    l10n: {
        title: 'Skapa från kontoplan',
        buttons: {
            submit: 'Skapa'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.accounting.Upload', {
    override: 'Bokf.view.accounting.Upload',
    l10n: {
        title: 'Importera SIE-fil',
        fieldLabel: 'SIE-fil',
        fieldButtonText: 'Välj fil...',
        button: 'Importera'
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.PaymentReceived', {
    override: 'Bokf.view.members.PaymentReceived',
    l10n: {
        title: 'Betalning mottagen'
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.Payments', {
    override: 'Bokf.view.members.Payments',
    l10n: {
        fieldLabels: {
            filter: 'Visa endast'
        },
        buttons: {
            approveall: 'Godkänn alla föreslagna verifikat',
            search: 'Sök'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.Payment', {
    override: 'Bokf.view.members.Payment',
    l10n: {
        header: {
            buttons: {
                approve: 'Godkänn verifikat'
            }
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.PaymentDetails', {
    override: 'Bokf.view.members.PaymentDetails',
    l10n: {
        fieldLabels: {
            amount: 'Belopp',
            buyerdescr: 'Köpare',
            transaction_date: 'Transaktionsdatum'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.PaysonPaymentDetails', {
    override: 'Bokf.view.members.PaysonPaymentDetails',
    l10n: {
        fieldLabels: {
            amount: 'Belopp',
            buyerdescr: 'Köpare',
            transaction_date: 'Transaktionsdatum'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.SeqrPaymentDetails', {
    override: 'Bokf.view.members.SeqrPaymentDetails',
    l10n: {
	fieldLabels: {
	    amount: 'Belopp',
            buyerdescr: 'Köpare',
            transaction_date: 'Transaktionsdatum'
	}
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.StripePaymentDetails', {
    override: 'Bokf.view.members.StripePaymentDetails',
    l10n: {
	fieldLabels: {
	    amount: 'Belopp',
            buyerdescr: 'Köpare',
            transaction_date: 'Transaktionsdatum'
	}
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.IzettlePaymentDetails', {
    override: 'Bokf.view.members.IzettlePaymentDetails',
    l10n: {
	fieldLabels: {
	    amount: 'Belopp',
            buyerdescr: 'Köpare',
            transaction_date: 'Transaktionsdatum'
	}
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.PGPaymentDetails', {
    override: 'Bokf.view.members.PGPaymentDetails',
    l10n: {
        titles: {
            paymentDetails: 'Betalningsinformation',
            payerDetails: 'Betalningsavsändare',
            payingAccountDetails: 'Avsändande konto'
        },
        fieldLabels: {
            amount: 'Belopp',
            messages: 'Meddelanden',
            ocr: 'OCR-nummer',
            refs: 'Referensnummer',
            payingAccount: 'Kontonummer',
            payingOrgno: 'Organisations\u00adnummer', // soft hyphen
            transaction_date: 'Transaktionsdatum'
        }
    }
})


Ext.define('Bokf.locale.sv_SE.view.members.PGAddress', {
    override: 'Bokf.view.members.PGAddress',
    l10n: {
        fieldLabels: {
            name0: 'Namn',
            address0: 'Adress',
            postalCode: 'Postnummer',
            city: 'Stad',
            country: 'Landskod'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.Products', {
    override: 'Bokf.view.members.Products',
    l10n: {
        buttons: {
            addproduct: 'Lägg till produkt'
        },
        fieldLabels: {
            filter: 'Visa endast'
        },
        invoice: 'Skicka faktura',
        webshop: 'Gå till webbutiken'
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.ProductView', {
    override: 'Bokf.view.members.ProductView',
    l10n: {
        productForm: {
            captions: {
                tagsdescr: 'Etiketter används för att lägga produkten i en produktkategori i webbutiken. Om produkten har flera etiketter kommer den sorteras in under flera kategorier. Saknar den etiketter dyker den upp på toppnivån.'
            },
            fieldLabels: {
                name: 'Namn',
                archived: 'Arkiverad',
                available: 'Publicerad',
                availableFrom: 'Tillgänglig från',
                availableTo: 'Tillgänglig till',
                description: 'Produktbeskrivning (visas för köpare)',
                makeTicket: 'Generera biljetter',
                notes: 'Administrativa anteckningar (visas ej för köpare)',
                price: 'Totalt pris',
                tags: 'Etiketter',
                vatAccount: 'Moms-konto'
            },
            emptyTexts: {
                availableFrom: 'inget startdatum',
                availableTo: 'inget slutdatum'
            },
            buttons: {
                clearvat: 'Inget moms-konto',
                removeproduct: 'Ta bort produkt',
                copyproduct: 'Skapa kopia',
                saveproduct: 'Spara'
            }
        },
        rules: {
            title: 'Bokföringsregler',
            summary: 'Pris (exkl. moms):',
            columnTitles: {
                accountNumber: 'Konto',
                amount: 'Belopp'
            }
        },
        imageform: {
            add: 'Lägg till bild',
            change: 'Ändra bild',
            'delete': 'Ta bort bild'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.ProductStock', {
    override: 'Bokf.view.members.ProductStock',
    l10n: {
        fieldLabels: {
            limited: 'Lagersaldo',
            totalStock: 'Urspr. antal',
            quantitySold: 'Sålda',
            currentStock: 'I lager'
        }
    }
})

Ext.define("Bokf.locale.sv_SE.view.members.OptionFields", {
    override: "Bokf.view.members.OptionFields",
    l10n: {
        title: 'Tillval',
        caption: '\
Om kunden skall kunna välja någon egenskap hos produkten (t.ex. namn på innehavaren av ett medlemsskap eller färg på tröja) kan du ange de olika egenskaperna här.',
        buttons: {
            addoption: 'Nytt tillval'
        }
    }
})

Ext.define("Bokf.locale.sv_SE.view.members.OptionField", {
    override: "Bokf.view.members.OptionField",
    l10n: {
        fieldLabels: {
            label: 'Namn',
            optdescr: 'Beskrivning'
        },
        mandatory: 'Obligatoriskt'
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.SelectOptionGrid', {
    override: 'Bokf.view.members.SelectOptionGrid',
    l10n: {
        title: 'Alternativ',
        dragdropTooltip: 'Dra för att ändra ordning'
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.BasePurchase', {
    override: 'Bokf.view.members.BasePurchase',
    l10n: {
        fieldLabels: {
            buyerName: 'Beställare',
            buyerAddress: 'Adress',
            buyerPhone: 'Telefonnummer',
            buyerEmail: 'E-postadress'
        },
        buttons: {
            pay: 'Betalning mottagen',
            refund: 'Återbetala',
            paidout: 'Utbetald',
            credit: 'Kreditera',
            cancel: 'Makulera',
            reactivate: 'Ångra makulering',
            remind: 'Skicka påminnelse'
        },
        state: {
            paid: 'Betald',
            partial: 'Delvis betald',
            unpaid: 'Obetald',
            credited: 'Krediterad',
            cancelled: 'Makulerad'
        },
        reminderEmails: {
            empty: 'Inga påminnelser har skickats',
            single: 'Tidpunkt då påminnelse skickades: {0}',
            multi: 'Tidpunkter då påminnelser har skickats:<br>{0}'
        },
        invoiceLink: 'Gå till beställning'
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.PurchaseItems', {
    override: 'Bokf.view.members.PurchaseItems',
    l10n: {
        columnHeaders: {
            name: 'Vara',
            quantity: 'Antal',
            price: 'Pris',
            total: 'Belopp'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.BasePurchases', {
    override: 'Bokf.view.members.BasePurchases',
    l10n: {
        fieldLabels: {
            filter: 'Visa endast'
        },
        buttons: {
            search: 'Sök'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.SalesReports', {
    override: 'Bokf.view.members.SalesReports',
    l10n: {
        selector: {
            emptyText: 'Ej vald',
            label: 'Produkt:'
        },
        actions: {
            generate: 'Generera rapport',
            print: 'Skriv ut rapport',
            save: 'Spara rapport',
            newwin: 'Öppna rapport i nytt fönster'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.VerificationSuggestion', {
    override: 'Bokf.view.members.VerificationSuggestion',
    l10n: {
        fieldLabels: {
            series: 'Serie',
            transaction_date: 'Datum'
        },
        buttons: {
            approve: 'Godkänn',
            revert: 'Återställ'
        },
        addressTitles: {
            payer: 'Betalningsavsändare',
            payingAccountData: 'Avsändande konto'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.members.WarningLabel', {
    override: 'Bokf.view.members.WarningLabel',
    l10n: {
        missingAccounts: (
            'Ett eller flera konton som behövs för det här verifikatet '+
                'saknas från nuvarande räkenskapsår. Det är konton som antingen '+
                'är angivna som kontot på vilket inkommande betalningar skall '+
                'bokföras (under fliken Administration) eller så är de '+
                'associerade med någon av de specifika produkter som sålts. '+
                'De saknade kontona är: {0}.'),
        noPaymentProvider: 'Betalningsförmedlaren associerad med den här '+
            'betalningen har tagits bort. Du måste ange debetkonto manuellt.'
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.APIUser', {
    override: 'Bokf.view.org.APIUser',
    l10n: {
        emptyTexts: {
            apikey: 'API-nyckel saknas.'
        },
        fieldLabels: {
            apikey: 'API-nyckel'
        },
        texts: {
            help: '<a href="{url}" target="_blank">Vad är det här?</a>'
        },
        buttons: {
            generatekey: 'Skapa API-nyckel'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.Edit', {
    override: 'Bokf.view.org.Edit',
    l10n: {
        fieldLabels: {
            name: 'Namn',
            orgnum: 'Organisationsnummer',
            phone: 'Telefonnummer',
            address: 'Adress',
            email: 'E-postadress',
            url: 'Hemsida',
            seat: 'Styrelsens säte',
	    vatnum: 'Momsregnum',
	    currency: 'Valuta',
            fskatt: 'F-skattesedel'
        },
        titles: {
            phantom: 'Skapa ny organisation'
        },
        logoButton: {
            add: 'Lägg till logotyp',
            change: 'Ändra logotyp',
            'delete': 'Ta bort logotyp'
        },
        buttons: {
            save: {
                phantom: 'Skapa',
                real: 'Spara'
            },
            cancel: {
                phantom: 'Rensa',
                real: 'Återställ'
            }
        },
        tos: {
            title: 'Användarvillkor',
            text: 'För att fortsätta måste du godkänna '+
                '<a target="_new" href="http://www.eutaxia.se/#tab_agreement">användarvillkoren<a> '+
                'å organisationens vägnar.',
            label: 'Jag godkänner användarvillkoren'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.Invite', {
    override: 'Bokf.view.org.Invite',
    l10n: {
        title: 'Bjud in ny användare',
        fieldLabels: {
            email: 'E-postadress',
            roles: 'Roller'
        },
        buttons: {
            invite: 'Bjud in'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.List' , {
    override: 'Bokf.view.org.List',
        l10n: {
        title: 'Organisationer',
        columnHeaders: {
            name: 'Namn',
            orgnum: 'Organisationsnummer'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.Subscription', {
    override: 'Bokf.view.org.Subscription',
    l10n: {
        title: 'Organisationsnivå',
        texts: {
            nonSubscriberText: '\
Det här är en gratis Övningsorganisation. \
Den kan omvandlas till en Standardorganisation med årsavgift enligt <a target="_blank" href="{url}">prislista</a>. \
Övningsorganisationer raderas efter sex månader. <br /> \
För att koppla ett plusgirokonto till OCR-inläsning och automatisk avläsning behöver du ha en Standardorganisation. <br /> \
Välj "Uppgradera" för att göra om organisationen till en Standardorganisation.',
            subscriberText: '\
Det här är en Standardorganisation (uppgraderad från Övningsorganisation).'
        },
        buttons: {
            subscribe: 'Uppgradera'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.PaymentProviders', {
    override: 'Bokf.view.org.PaymentProviders',
    l10n: {
        title: 'Betalningsförmedlare'
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.PaymentProviderCreator', {
    override: 'Bokf.view.org.PaymentProviderCreator',
    l10n: {
        texts: {
            creatorText: 'Eutaxia Admin kan ta emot betalningar via flera olika betalningsförmedlare. Du kan lägga till förmedlare nedan.'
        },
        fieldLabels: {
            provider: 'Välj förmedlare'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.PGOrder', {
    override: 'Bokf.view.org.PGOrder',
    l10n: {
        texts: {
            pgOrderText: '\
Du kan ansluta OCR-inläsning till ett plusgirokonto som hör till den här organisationen. \
Om du gör det kommer Eutaxia att automatiskt kunna skapa verifikat från inkommande betalningar. \
För att göra en beställning fyll i alla fält nedan och tryck på "Beställ". \
Open End kommer då att för er räkning beställa en OCR-koppling hos Nordea. Ett avtal som låter Open End göra automatisk avläsning av inbetalningar kommer att skickas till er och skall skrivas under och returneras till Nordea.'
        },
        fieldLabels: {
                pgnum: 'Plusgiro som skall kopplas till OCR-konto',
                contact: 'Kontaktperson',
                contactPhone: 'Telefon',
                contactEmail: 'E-postadress',
                pgaccount: 'Bokföringskonto för OCR-konto',
                pgseries: 'Bokföringsserie OCR-konto'
        },
        buttons: {
            connectpg: 'Beställ',
            cancel: 'Avbryt'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.PaymentSimulator', {
    override: 'Bokf.view.org.PaymentSimulator',
    l10n: {
        title: 'Betalningssimulator',
        createTexts: {
            simulatorText: '\
Du kan testa hanteringen av inkommande betalningar genom att simulera inbetalningar från webbutiken. Innan det kan göras måste du ange bokföringskonto och serie som de simulerade betalningarna skall bokföras på. Möjligheten att simulera en betalning från webbutiken kommer bara finnas för de användare som är inloggade i Eutaxia Admin.'
        },
        editTexts: {
            simulatorText: 'Simulatorn låter dig simulera inkommande betalningar från webbutiken. Välj bokföringskonto och verifikationsserie för de simulerade betalningarna nedan. Möjligheten att simulera en betalning från webbutiken kommer bara finnas för de användare som är inloggade i Eutaxia Admin.'
        },
        fieldLabels: {
            account: 'Bokföringskonto',
            series: 'Bokföringsserie'
        },
        buttons: {
            create: {
                save: 'Skapa',
                cancel: 'Avbryt'
            },
            edit: {
                'delete': 'Ta bort',
                save: 'Spara',
                cancel: 'Återställ'
            }
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.PaysonProvider', {
    override: 'Bokf.view.org.PaysonProvider',
    l10n: {
        createTexts: {
            paysonText: 'Du kan ansluta ett Payson-konto till webbutiken. Om du gör det kommer Eutaxia att automatiskt kunna skapa verifikat från inkommande betalningar. <a href="http://clk.tradedoubler.com/click?p=194865&a=2359572&g=19014578&url=/account/create" target="_blank">Skapa konto hos Payson</a>'
        },
        editTexts: {
            paysonText: 'Ert Payson-konto enligt nedan är anslutet till webbutiken. Inkommande betalningar kommer att bokföras på det bokföringskonto och i den serie som angivits.'
        },
        fieldLabels: {
            account: 'Bokföringskonto',
            series: 'Bokföringsserie',
            apiUserId: 'Agent ID',
            apiPassword: 'MD5-nyckel',
            receiverEmail: 'E-postadress'
        },
        buttons: {
            create: {
                save: 'Skapa',
                cancel: 'Avbryt'
            },
            edit: {
                'delete': 'Ta bort',
                save: 'Spara',
                cancel: 'Återställ'
            }
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.SeqrProvider', {
    override: 'Bokf.view.org.SeqrProvider',
    l10n: {
	createTexts: {
	    seqrText: 'Du kan ansluta ett SEQR-konto till webbutiken. Om du gör det kommer Eutaxia att automatiskt kunna skapa verifikat från inkommande betalningar. <a href="https://www.seqr.com/" target="_blank">Läs mer om SEQR</a>.'
	},
	editTexts: {
	    seqrText: 'Ert SEQR-konto enligt nedan är anslutet till webbutiken. Inkommande betalningar kommer att bokföras på det bokföringskonto och i den serie som angivits.'
	},
	fieldLabels: {
	    account: 'Bokföringskonto',
	    series: 'Bokföringsserie',
	    soapUrl: 'SOAP-URL',
	    principalId: 'Terminal-ID',
	    password: 'Terminallösenord'
	},
	buttons: {
	    create: {
		save: 'Skapa',
		cancel: 'Avbryt'
	    },
	    edit: {
		'delete': 'Ta bort',
		save: 'Spara',
		cancel: 'Återställ'
	    }
	}
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.StripeProvider', {
    override: 'Bokf.view.org.StripeProvider',
    l10n: {
	createTexts: {
	    stripeText: 'Du kan ansluta ett Stripe-konto till webbutiken. Om du gör det kommer Eutaxia att automatiskt kunna skapa verifikat från inkommande betalningar. <a href="https://stripe.com/" target="_blank">Läs mer om Stripe</a>.'
	},
	editTexts: {
	    stripeText: 'Ert Stripe-konto enligt nedan är anslutet till webbutiken. Inkommande betalningar kommer att bokföras på det bokföringskonto och i den serie som angivits.'
	},
	fieldLabels: {
	    display_name: 'Stripekonto',
	    stripe_email: 'E-postadress',
	    account: 'Bokföringskonto',
	    series: 'Bokföringsserie'
	},
	buttons: {
	    create: {
		save: 'Skapa',
		cancel: 'Avbryt'
	    },
	    edit: {
		'delete': 'Ta bort',
		save: 'Spara',
		cancel: 'Återställ'
	    }
	}
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.SwishProvider', {
    override: 'Bokf.view.org.SwishProvider',
    l10n: {
        createTexts: {
            intro: 'Du kan ansluta ett Swishkonto till webbutiken. Om du gör det kommer dina medlemmar att kunna betala via Swish, och Eutaxia kan automatiskt skapa verifikat från Swish-betalningar. <a href="https://www.getswish.se/" target="_blank">Läs mer om Swish</a>.'
        },
        editTexts: {
            'cert-missing': 'Du har inte skapat ett certifikat. Detta måste göras innan du kan använda Swish i din webbutik. Öppna sektionen Certifikathantering nedan och följ instruktionerna där för att skapa ett certificat.',
            intro: 'Ert Swish-konto enligt nedan är anslutet till webbutiken. Inkommande betalningar kommer att bokföras på det bokföringskonto och i den serie som angivits.',
            certinfo: '<p>För att kunna använda Swish måste du skapa ett certifikat som skall användas för säker kommunikation mellan Eutaxia och Swish.</p> Detta gör du med hjälp av verktyget <i>Swish Certificate Management</i>, som du kan logga in på på <a href="https://comcert.getswish.net/">https://comcert.getswish.net/</a>. När du loggat in skall du ange organisationsnummer och Swish-nummer. Välj sedan fliken <i>"New certificate"</i>, och klistra in informationen från fältet <i>"Certificate signing request"</i> nedan. Ange att formatet är <i>PEM</i>. <br>När verktyget har genererat ett certifikat, så behöver du kopiera det, och klistra in i fältet nedan som heter <i>"Certifikat"</i>.'
        },
        certTexts: {
            title: 'Certifikathantering'
        },
        fieldLabels: {
            swish_id: 'Swish-nummer',
            account: 'Bokföringskonto',
            series: 'Bokföringsserie',
            csr: 'Certificate signing request',
            cert: 'Certifikat',
            cert_expires: 'Certifikat giltigt till'

        },
        buttons: {
            create: {
                save: 'Skapa',
                cancel: 'Avbryt'
            },
            edit: {
                'delete': 'Ta bort',
                save: 'Spara',
                cancel: 'Återställ'
            }
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.IzettleProvider', {
    override: 'Bokf.view.org.IzettleProvider',
    l10n: {
	createTexts: {
	    izettleText: 'Du kan importera transaktioner från iZettle. Systemet hjälper dig att automatiskt skapa verifikat. Specificera serie och konto för försäljningarna.'
	},
	editTexts: {
	    izettleText: 'Du har aktiverat iZettle. Inkommande betalningar kommer att bokföras på det bokföringskonto och i den serie som angivits.'
	},
	fieldLabels: {
	    account: 'Bokföringskonto kortköp',
	    fee_account: 'Bokföringskonto kortköpsavgift',
	    cash_account: 'Bokföringskonto kontantköp',
	    series: 'Bokföringsserie'
	},
	buttons: {
	    create: {
		save: 'Skapa',
		cancel: 'Avbryt'
	    },
	    edit: {
		'delete': 'Ta bort',
		save: 'Spara',
		cancel: 'Återställ'
	    }
	}
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.PGForm', {
    override: 'Bokf.view.org.PGForm',
    l10n: {
        texts: {
            pgProcessing: '\
Du har beställt koppling av plusgiro till OCR-inläsning. Din beställning är under behandling. Om du ännu inte har fått ett avtal skickat till dig så bör det komma inom några dagar. \
Beställningen är inte komplett innan ni har undertecknat avtalet och skickat in det till Nordea.',
            pgProcessed: '\
Ert plusgirokonto enligt nedan är kopplat till OCR-inläsning och automatisk avläsning av inkommande betalningar.',
            pgText: '\
Inkommande betalningar kommer att bokföras på det bokföringskonto och i den \
serie som anges nedan.'
        },
        fieldLabels: {
            pgnum_real: 'Plusgirokonto som kopplas till OCR-konto',
            pgnum: 'OCR-konto med automatisk avläsning',
            account: 'Bokföringskonto',
            series: 'Bokföringsserie'
        },
        buttons: {
            save: 'Spara',
            cancel: 'Återställ'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.org.View', {
    override: 'Bokf.view.org.View',
    l10n: {
        members: {
            title: 'Användare',
            buttons: {
                save: 'Spara',
                cancel: 'Återställ'
            }
        },
        invitations: {
            title: 'Inbjudna'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.Reports', {
    override: 'Bokf.view.Reports',
    l10n: {
        actions: {
            generate: 'Generera rapport',
            print: 'Skriv ut rapport',
            save: 'Spara rapport',
            newwin: 'Öppna rapport i nytt fönster'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.ReportFilterAccounts', {
    override: 'Bokf.view.ReportFilterAccounts',
    l10n: {
        captions: {
            caption: 'Urval'
        },
        range: {
            captions: {
                label: 'Ta med följande konton:',
                example: 'exempel: 1000-1999, 3001, 3003'
            }
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.ReportFilterPeriod', {
    override: 'Bokf.view.ReportFilterPeriod',
    l10n: {
        captions: {
            caption: 'Urval'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.ReportFilterVerifications', {
    override: 'Bokf.view.ReportFilterVerifications',
    l10n: {
        captions: {
            caption: 'Urval',
            seriesLabel: 'Serier:'
        },
        emptySeriesText: 'alla serier',
        range: {
            emptyText: 'alla verifikat',
            captions: {
                label: 'Verifikatnummer:',
                example: 'exempel: 1-10, 25, 40-50'
            }
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.Transactions', {
    override: 'Bokf.view.Transactions',
    l10n: {
        columnHeaders: {
            account: 'Konto',
            text: 'Text',
            debit: 'Debet',
            credit: 'Kredit',
            balance: 'Saldo'
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.Verification', {
    override: 'Bokf.view.Verification',
    l10n: {
        noSeriesCaption: ('<span>Du måste välja ett räkenskapsår med minst en '+
                          'serie för att kunna skapa ett nytt verifikat.</span>'),
        buttons: {
            texts: {
                revert: 'Återställ',
                save: 'Spara',
                print: 'Skriv ut'
            },
            tooltips: {
                save: 'Keypad\xa0+'
            }
        }
    }
})

Ext.define('Bokf.locale.sv_SE.view.VerificationFormPanel', {
    override: 'Bokf.view.VerificationFormPanel',
    l10n: {
        fieldLabels: {
            series: 'Serie',
            number: 'Nummer',
            transaction_date: 'Datum'
        }
    }
})
