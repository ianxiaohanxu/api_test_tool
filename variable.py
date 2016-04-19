import simplejson as json

__all__ = ['api_dict']

with open('gather.json', 'r') as fb:
    api_dict = json.load(fb)