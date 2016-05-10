import simplejson as json
import sys

if len(sys.argv)>2:
    raise(Exception("Script only accepts 0 or 1 argument."))

json_file = 'api_info.json'
if len(sys.argv)==2:
    json_file = sys.argv[1]

test_file = json_file[:-5]+".robot"

_tab = "    "

def generate_var_file():
    with open("variable.py", "w") as fb:
        fb.write("import simplejson as json\n")
        fb.write("\n")
        fb.write("__all__ = ['api_dict']\n")
        fb.write("\n")
        fb.write("with open('%s', 'r') as fb:\n" %json_file)
        fb.write("%sapi_dict = json.load(fb)" %_tab)
        fb.flush()

def generate_test_case(api_name, api_info):
    test_case = []
    test_case.append("Test api %s\n" %api_name)
    _uri = r"*uri*: %s\n\n" %api_info["uri"]
    _method = r"*method*: %s\n\n" %api_info["method"]
    _tags = r"*tags*: %s\n\n" %str(api_info["tags"])
    _auth = r"*auth*: %s\n\n" %str(api_info["auth"])
    _headers = r"*headers*:\n\n%s\n\n" %str(api_info["headers"])
    _data = r"*data*:\n\n%s\n\n" %str(api_info["data"])
    _status_code = r"*status code*: %s\n\n" %str(api_info["status_code"])
    _verification = r"*verification*: %s\n\n" %str(api_info["verification"])
    documentation = _uri+_method+_tags+_auth+_headers+_data+_status_code+_verification
    test_case.append("|  | [Documentation] | %s |\n" %documentation)
    if ("tags" in api_info) and (len(api_info["tags"])>0):
        tags = " | ".join(api_info["tags"])
        tags = " | "+tags+" |\n"
        test_case.append("|  | [tags]%s" %tags)
    test_case.append("|  | Test Api | ${host} | ${api_dict} | %s | ${resp_stack} |\n" %api_name)
    test_case.append("\n")
    return test_case

def generate_test_file():
    with open("%s" %json_file, "r") as fb:
        api_dict = json.load(fb)
    with open(test_file, "w") as fb:
        fb.write("***Settings***\n")
        fb.write("| Library | test_api.py |\n")
        fb.write("| Variables | variable.py |\n")
        fb.write("| Suite Setup | Suite_setup | ${host} | ${api_dict} |\n")
        fb.write("\n")
        fb.write("***Variables***\n")
        fb.write("| ${host} | http://localhost:8000 |\n")
        fb.write("\n")
        fb.write("***Keywords***\n")
        fb.write("Suite_setup\n")
        fb.write("|  | [Arguments] | ${host} | ${api_dict} |\n")
        fb.write("|  | ${resp_stack}= | Prepare parent api | ${host} | ${api_dict} |\n")
        fb.write("|  | Set Suite Variable | ${resp_stack} |\n")
        fb.write("\n")
        fb.write("***Test Cases***\n")
        test_cases = [ generate_test_case(key, value) for (key,value) in api_dict.items() ]
        for item in test_cases:
            fb.writelines(item)
        fb.flush()

generate_var_file()
generate_test_file()

