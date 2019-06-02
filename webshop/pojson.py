#!/usr/bin/env python
import argparse
import os
import polib
import json

def po2dict(po):
    """Convert po object to dictionary data structure (ready for JSON).
    """
    result = {}

    result[''] = po.metadata.copy()

    for entry in po:
        if entry.obsolete:
            continue

        if entry.msgctxt:
            key = u'{0}\x04{1}'.format(entry.msgctxt, entry.msgid)
        else:
            key = entry.msgid

        if entry.msgstr:
            result[key] = [None, entry.msgstr]
        elif entry.msgstr_plural:
            plural = [entry.msgid_plural]
            result[key] = plural
            ordered_plural = sorted(entry.msgstr_plural.items())
            for order, msgstr in ordered_plural:
                plural.append(msgstr)
    return result

def convert(po_file, encoding=None, pretty_print=False):
    if encoding is None:
        po = polib.pofile(po_file,
                          autodetect_encoding=True)
    else:
        po = polib.pofile(po_file,
                          autodetect_encoding=False,
                          encoding=encoding)

    data = po2dict(po)

    if not pretty_print:
        result = json.dumps(data, ensure_ascii=False, sort_keys=True)
    else:
        result = json.dumps(data, sort_keys=True, indent=4,
                            ensure_ascii=False)
    return result


def main():
    p = argparse.ArgumentParser(description='convert .po to .json')
    p.add_argument('po_file')
    p.add_argument('-e', '--encoding', help='encoding of po file')
    p.add_argument('-p', '--pretty-print', help='pretty-print JSON output',
                   action="store_true")
    args = p.parse_args()

    if not os.path.isfile(args.po_file):
        p.exit(u"not a file: %s" % args.po_file)
    if not args.po_file.endswith('.po'):
        p.exit(u"not a PO file: %s" % args.po_file)

    print(convert(
        args.po_file, encoding=args.encoding,
        pretty_print=args.pretty_print).encode('utf-8'))

if __name__ == '__main__':
    main()

