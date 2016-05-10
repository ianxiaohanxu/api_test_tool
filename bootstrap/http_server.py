import SimpleHTTPServer, requests, os, time, shutil, commands, zipfile
import simplejson as json

__file_abspath__ = os.path.realpath(__file__)

class CustomHTTPRequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):

    _path_action = {
                "/": "_root_action",
                "/save_suite.json": "_save_suite",
    }
    
    def distribute_action(self):
        if not self.path in self._path_action.keys():
            return False
        else:
            return getattr(self, self._path_action[self.path])

    def _root_action(self):
        request_data = self.rfile.readline(int(self.headers["Content-Length"]))
        request_data = json.loads(request_data)
        if not request_data["auth"] is None:
            auth = tuple(request_data["auth"])
        else:
            auth = None
        resp = requests.request(request_data["method"], request_data["url"], headers=request_data["headers"], json=request_data["data"], auth=auth)
        try:
            resp_json = resp.json()
        except:
            resp_json = {}
        json_format_resq = {
                "response_status": resp.status_code,
                "response_headers": str(resp.headers),
                "response_json": json.dumps(resp_json),
                "response_text": resp.content,
                "request_body": resp.request.body,
                "request_headers": str(resp.request.headers),
        }
        json_format_resq = json.dumps(json_format_resq)
        self.send_response(200)
        self.send_header("Content-Type", "applicaiton/json")
        self.send_header("Content-Length", len(json_format_resq))
        self.send_header("Connection", "Close")
        self.end_headers()
        self.wfile.write(json_format_resq)

    def _prepare_case_suite_folder(self, suite_name):
        folder_name = suite_name + time.strftime("_%Y_%m_%d")
        if os.path.isdir("../suites/%s" %folder_name):
            os.remove("../suites/%s/%s.json" %(folder_name, suite_name))
            os.remove("../suites/%s/%s.robot" %(folder_name, suite_name))
            os.remove("../suites/%s/variable.py" %folder_name)
            os.remove("../suites/%s/%s.zip" %(folder_name, suite_name))
        else:
            shutil.copytree("../generator", "../suites/%s" %folder_name)

    def _save_suite(self):
        request_data = self.rfile.readline(int(self.headers["Content-Length"]))
        request_data = json.loads(request_data)
        suite_name = "_".join(request_data["suite_name"].split())
        folder_name = suite_name + time.strftime("_%Y_%m_%d")
        try:
            os.chdir(os.path.dirname(__file_abspath__))
            self._prepare_case_suite_folder(suite_name)
            with open("../suites/%s/%s.json" %(folder_name, suite_name), "w") as fb:
                json.dump(request_data["suite_data"], fb, indent=4) 
                fb.flush()
            os.chdir("../suites/%s" %folder_name)
            assert commands.getstatusoutput("python parse.py %s.json" %suite_name)[0]==0
            zipfb = zipfile.ZipFile("%s.zip" %suite_name, "w")
            zipfb.write("%s.json" %suite_name)
            zipfb.write("%s.robot" %suite_name)
            zipfb.write("variable.py")
            zipfb.write("test_api.py")
            zipfb.close()
            abspath = os.path.realpath(".")
            self.send_response(200)
            self.send_header("Content-Length", len(abspath))
            self.send_header("Connection", "Close")
            self.end_headers()
            self.wfile.write(abspath)
        except:
            self.send_error(500)

    def do_POST(self):
        action = self.distribute_action()
        if not action:
            self.send_error(404)
            return
        else:
            action()

if __name__=="__main__":
    SimpleHTTPServer.test(HandlerClass=CustomHTTPRequestHandler, ServerClass=SimpleHTTPServer.BaseHTTPServer.HTTPServer)
