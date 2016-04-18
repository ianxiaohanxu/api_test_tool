import re, time, copy,requests
import simplejson as json

class request_api():
    def __init__(self, host, api_data, api_name, resp_stack=None):
        self.host = host
        self.api = copy.deepcopy(api_data)
        self.api_name = api_name
        if resp_stack==None:
            resp_stack = {}
        self.resp_stack = resp_stack
    
    def get_parent_api(self):
        '''
        Return a set of all parent apis in self.api
        '''
        all_api = str(self.api)
        sub = re.compile(r'\{(\w+?)\[(\w+?)\]\}')
        result = sub.findall(all_api)
        result_set = set()
        for item in result:
            result_set.add(item[0])
        self.parent_api = result_set

    def create_parent_api_response(self):
        '''
        Request each parent api, and get the response
        '''
        for item in self.parent_api:
            if item not in self.resp_stack:
                self.api_request(item)


    def str_random(self, instr):
        '''
        Update '{random}' in a string to a random string
        '''
        sub=re.compile(r'\{random\}')
        if not sub.search(instr):
            return instr
        else:
            random_str = str(int(time.time()*1000000))
            return sub.sub(random_str, instr)

    def str_variable(self, instr, data=None):
        '''
        Update '{variable_name}' in a string with variable value
        '''
        if data==None:
            data = self.api[self.api_name]
        sub = re.compile(r'\{(\w+?)\}')
        if not sub.search(instr):
            return instr
        else:
            def _get_variable(match):
                index = match.group(1)
                return str(data['data'][index])
            new_str = sub.sub(_get_variable, instr)
            if sub.search(new_str):
                new_str = self.str_variable(new_str, data)
            return new_str

    def value_parent(self, instr):
        '''
        Update '{api_name[response_key]}' with the response value
        '''
        sub = re.compile(r'\{(\w+?)\[(\w+?)\]\}')
        match = sub.search(instr)
        if not match:
            return instr
        else:
            api_name = match.group(1)
            resp_key = match.group(2)
            if api_name in self.resp_stack:
                return self.resp_stack[api_name].json()[resp_key]
            else:
                resp = self.api_request(api_name)
                return resp.json()[resp_key]

    def data_update(self, transformer, data):
        '''
        Update specific strins with transformer
        '''
        if isinstance(data, list):
            for i in range(len(data)):
                if isinstance(data[i], (list, dict)):
                    self.data_update(transformer, data[i])
                elif isinstance(data[i], (str, unicode)):
                    data[i] = transformer(data[i])
        if isinstance(data, dict):
            for key in data:
                if isinstance(data[key], (list, dict)):
                    self.data_update(transformer, data[key])
                elif isinstance(data[key], (str, unicode)):
                    data[key] = transformer(data[key])

    def data_random(self, data=None):
        '''
        Updata all strings with '{random}' to a random string
        '''
        if data==None:
            data = self.api[self.api_name]
        self.data_update(self.str_random, data)

    def data_parent(self, data=None):
        '''
        Updata all strings with '{api_name[response_key]}'
        '''
        if data==None:
            data = self.api[self.api_name]
        self.data_update(self.value_parent, data)

    def data_variable(self, data=None):
        '''
        Update all strings with '{variable_name}' to varialbe value
        '''
        if data==None:
            data = self.api[self.api_name]
        self.data_update(lambda x: self.str_variable(x, data), data)

    def _verify_dict(self, dict1, dict2):
        '''
        Check if dict2 is part of dict1 according to specific logic
        '''
        for (k, i) in dict2.items():
            if isinstance(i, (str, unicode)):
                if (dict1[k] != i) and (i not in dict1[k]):
                    return False
            elif isinstance(i, (bool, int, float, list, tuple)):
                if dict1[k] != i:
                    return False
            elif i==None:
                if dict1[k] != i:
                    return False
            elif isinstance(i, dict):
                if not isinstance(dict1[k], dict):
                    return False
                else:
                    if not self._verify_dict(dict1[k], i):
                        return False
            else:
                raise(Exception("Unknown type for %s" %str(i)))
        return True

    def _verify_resp(self, response_dict, verification):
        '''
        Verify 'verification' in response_dict
        '''
        for item in verification:
            if isinstance(item, (str, unicode)):
                assert item in response_dict, "%s should be in response, but not." %str(item)
            elif isinstance(item, dict):
                assert self._verify_dict(response_dict, item), "%s should be in response, but not" %str(item)

    def api_request(self, api_name=None):
        '''
        Request self.api[api_name]
        '''
        if api_name==None:
            api_name = self.api_name
        # Update random strings in api info
        self.data_random(self.api[api_name])

        # Update api response strings in api info
        self.data_parent(self.api[api_name])

        # Update variable strings in api info
        self.data_variable(self.api[api_name])

        response = requests.request(self.api[api_name]['method'], self.host+self.api[api_name]['uri'], json=self.api[api_name]['data'], headers=self.api[api_name]['headers'], auth=tuple(self.api[api_name]['auth']))
        assert response.status_code==self.api[api_name]["status_code"], "Status code should be %d, but now it is %d." %(self.api[api_name]["status_code"], response.status_code)
        self._verify_resp(response.json(), self.api[api_name]["verification"])
        # Add to response stack if not included
        if api_name not in self.resp_stack:
            self.resp_stack[api_name] = response

        return response


with open('234.json') as fb:
    a = json.load(fb)
r_a = request_api("http://localhost:8000", a, 'demo')
'''
dict1 = {
    'id': 123,
    'name': 'alex',
    'data': {
            'id': 234,
            'name': 'gao',
            'data': {
                        'id': 345,
                        'name': 'meng'
            }
    }
}
dict2 = { 'id': 123 }
dict3 = { 'name': 'alex' }
dict4 = { 'id': 234 }
dict5 = { 'name': 'ff' }
dict6 = { 'id': 123, 'name': 'alu' }
dict7 = { 'id': 123, 'name': 'alex', 'data': {'id': 234, 'data':{ 'id': 345 }, 'name':'gao'} }


print r_a._verify_dict(dict1, dict2)
print r_a._verify_dict(dict1, dict3)
print r_a._verify_dict(dict1, dict4)
print r_a._verify_dict(dict1, dict5)
print r_a._verify_dict(dict1, dict6)
print r_a._verify_dict(dict1, dict7)
'''
#r_a.data_random()
#r_a.data_variable()
#print r_a.api[r_a.api_name]
#print a['demo']
r_a.get_parent_api()
r_a.create_parent_api_response()
#r_a.api_request('demo')
print r_a.resp_stack
print r_a.parent_api
'''
for i in range(5):
    time.sleep(1)
    print i
r_b = request_api("http://localhost:8000", a, 'patient', r_a.resp_stack)
reqs = r_b.api_request()
print r_b.resp_stack
print reqs.status_code
print reqs.json()
print reqs.url
'''
