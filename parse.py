import simplejson as json

_tab = "    "
def generate_var_file():
    with open("variable.py", "w") as fb:
        fb.write("import simplejson as json\n")
        fb.write("\n")
        fb.write("__all__ = ['api_dict']\n")
        fb.write("\n")
        fb.write("with open('api_info.json', 'r') as fb:\n")
        fb.write("%sapi_dict = json.load(fb)" %_tab)
        fb.flush()

def generate_test_case(api_name, api_info):
    test_case = []
    test_case.append("Test api %s\n" %api_name)
    if ("tags" in api_info) and (len(api_info["tags"])>0):
        tags = " | ".join(api_info["tags"])
        tags = " | "+tags+" |\n"
        test_case.append("|  | [tags]%s" %tags)
    test_case.append("|  | Test Api | ${host} | ${api_dict} | %s | ${resp_stack} |\n" %api_name)
    test_case.append("\n")
    return test_case

def generate_test_file(file_name):
    with open("api_info.json", "r") as fb:
        api_dict = json.load(fb)
    with open(file_name, "w") as fb:
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
generate_test_file("test_data.robot")

