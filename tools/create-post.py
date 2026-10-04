#! /usr/bin/env python
# -*- coding: utf-8 -*-

# *************************************************************
#     Filename @  create_post.py
#       Author @  Huoty
#  Create date @  2016-07-29 22:46:48
#  Description @  Create an empty post for the blog
#                 （原为 Jekyll 写，2026-09 迁移到 Astro 后 front matter 已对齐）
# *************************************************************

import os
import datetime
from argparse import ArgumentParser

def create_post_file(name, title, target):
    name = str(datetime.date.today()) + "-" + name + ".md"
    path = os.path.join(os.path.abspath(target), name)
    with open(path, "w") as f:
        f.write('---\n')
        f.write('title: "%s"\n' % title)
        f.write('keywords:\n')
        f.write('description:\n')
        f.write('category:\n')
        f.write('tags:\n')
        f.write('---\n\n')


# Script starts from here

if __name__ == "__main__":
    parser = ArgumentParser(prog="create-post",
                            description="Create an empty post for the blog")
    parser.add_argument("name", type=str, help="name of the post file")
    parser.add_argument("title", type=str, help="title of the post")
    parser.add_argument("-t", "--target", type=str, default=".", help="save to target")

    opetions = parser.parse_args()

    create_post_file(opetions.name, opetions.title, opetions.target)
