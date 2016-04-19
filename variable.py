import simplejson as json

__all__ = ['api_dict']

with open('api_info.json', 'r') as fb:
    api_dict = json.load(fb)