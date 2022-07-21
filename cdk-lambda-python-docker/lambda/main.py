#!/usr/bin/env python3

import wikipedia

def handler(event, context):
    print("{}".format(event))
    if event:
        result = wikipedia.page(event.get('wiki', 'los angeles'))
        return "{}".format(result.summary)
    else:
        return "You didn't tell me to look anything up, much sad."