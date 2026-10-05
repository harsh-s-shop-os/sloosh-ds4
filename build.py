#!/usr/bin/env python3
"""Build the Sloosh V4 specimen into one self-contained file.

    python3 build.py

Reads  src/vendor/tokens.css, src/vendor/sloosh-ink.css, src/vendor/sloosh-ink.js  (copied unchanged from the V4 zip)
and    src/specimen.css, src/specimen.body.html, src/specimen.js                   (this page)
Writes index.html (open it in any browser).

To move to a newer design-system zip: replace the three files in src/vendor and run this again.
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'


def read(p):
    return (SRC / p).read_text(encoding='utf-8')


def parts():
    tokens, ink_css, engine = read('vendor/tokens.css'), read('vendor/sloosh-ink.css'), read('vendor/sloosh-ink.js')
    css, body, js = read('specimen.css'), read('specimen.body.html'), read('specimen.js')
    for name, s in (('engine', engine), ('specimen.js', js)):
        assert '</script' not in s.lower(), name + ' contains a closing script tag'
    head = ('<title>Sloosh V4 Design System</title>\n'
            '<meta name="description" content="Every piece of the Sloosh V4 design system on one page: type, colour, keycaps, ink, critters, the pointer, the logo, motion and components.">\n'
            '<style>\n' + tokens + '\n</style>\n<style>\n' + ink_css + '\n</style>\n<style>\n' + css + '\n</style>\n')
    tail = '<script>\n' + engine + '\n</script>\n<script>\n' + js + '\n</script>\n'
    return head, body, tail


def main():
    head, body, tail = parts()
    page = ('<!doctype html>\n<html lang="en" data-theme="dark">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            + head + '</head>\n<body>\n' + body + '\n' + tail + '</body>\n</html>\n')
    (ROOT / 'index.html').write_text(page, encoding='utf-8')
    print('wrote index.html', len(page.encode('utf-8')) // 1024, 'KB')


if __name__ == '__main__':
    main()
