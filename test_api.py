from robot.api.deco import keyword
import re, time, copy, requests

__all__ = ["prepare_parent_api", "test_api"]

class request_api():
    def __init__(self, host, api_data, api_name, resp_stack=None):
        self.host = host
        self.api = copy.deepcopy(api_data)
        self.api_name = api_name
        if resp_stack==None:
            resp_stack = {}
        self.resp_stack = resp_stack
    
    def _get_parent_api(self):
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
        self._get_parent_api()
        if len(self.parent_api)>0:
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
                assert item in response_dict, "%s should be in response, but not.\nResponse json is:\n%s" %(str(item), str(response_dict))
            elif isinstance(item, dict):
                assert self._verify_dict(response_dict, item), "%s should be in response, but not.\nResponse json is:\n%s" %(str(item), str(response_dict))

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

@keyword("PREPARE PARENT API")
def prepare_parent_api(host, api_dict, api_name=None):
    req = request_api(host, api_dict, api_name)
    req.create_parent_api_response()
    return req.resp_stack

@keyword("TEST API")
def test_api(host, api_dict, api_name, resp_stack=None):
    req = request_api(host, api_dict, api_name, resp_stack)
    resp = req.api_request()
    print "*INFO*Status code is: %s" %resp.status_code
    print "*INFO*Request URL is: %s" %resp.url
    print "*INFO*Request method is: %s" %resp.request.method
    print "*INFO*Responsed json is:\n%s " %resp.json()
    print "*INFO*Responsed headers is:\n%s" %resp.headers
    print "*INFO*Request headers is:\n%s" %resp.request.headers
    print "*INFO*Request body is:\n%s" %resp.request.body

