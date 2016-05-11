//Define global variable
var case_list ={}; 
var response_list ={};

//Set side bar width
$($(".side_bar").width(function(){
    var sidebar_ref = $("#sidebar_ref");
    var padding_left = parseInt(sidebar_ref.css("padding-left"));
    var padding_right = parseInt(sidebar_ref.css("padding-right"));
    // Need to study, why we have to add padding???
    return sidebar_ref.width()+padding_left+padding_right;
}
));

//Set side bar height
$($(".side_bar").height($(window).height()-50));

//Set button bar width
$($("#send_request").parent().width(parseInt($("form").children("div").first().css("width"))+20));
$($(".progress").parent().width(parseInt($("form").children("div").first().css("width"))+20));

//Set button bar fixed or not
$(window).scroll(function(){
    var offset_top_data_body = $("form>div").eq(2).offset()["top"];
    var height_data_body = parseInt($("form>div").eq(2).css("height")) + parseInt($("form>div").eq(2).css("margin-bottom"));
    var height_button_bar = parseInt($("form>div").eq(3).css("margin-top")) + parseInt($("form>div").eq(3).css("height"));
    var target_height = offset_top_data_body + height_data_body + height_button_bar - $(window).height();
    if (target_height <= $(document).scrollTop()) {
        $("form>div").eq(3).removeClass("fixed_box");
    }
    else {
        $("form>div").eq(3).addClass("fixed_box");
    }
    if (target_height <= $(document).scrollTop()) {
        $("form>div").eq(4).removeClass("fixed_box");
    }
    else {
        $("form>div").eq(4).addClass("fixed_box");
    }
});

//Set case box height
$(set_case_list_height());

//Set case list height
//$($(".case_list>div").first().height($(".case_list").height()));

//Resize case list height
//$(window).resize(function(){
    //$(".case_list>div").first().height($(".case_list").height());
//});

//Resize side bar width and height
$(window).resize(function(){
    var width = $("#sidebar_ref").width();
    $(".side_bar").width(width).height($(window).height()-50);
    set_case_list_height();
    $("#send_request").parent().width($("form").children("div").first().width());
    $(".progress").parent().width($("form").children("div").first().width());
    var offset_top_data_body = $("form>div").eq(2).offset()["top"];
    var height_data_body = parseInt($("form>div").eq(2).css("height")) + parseInt($("form>div").eq(2).css("margin-bottom"));
    var height_button_bar = parseInt($("form>div").eq(3).css("margin-top")) + parseInt($("form>div").eq(3).css("height"));
    var target_height = offset_top_data_body + height_data_body + height_button_bar - $(window).height();
    if (target_height <= $(document).scrollTop()) {
        $("form>div").eq(3).removeClass("fixed_box");
    }
    else {
        $("form>div").eq(3).addClass("fixed_box");
    }
    if (target_height <= $(document).scrollTop()) {
        $("form>div").eq(4).removeClass("fixed_box");
    }
    else {
        $("form>div").eq(4).addClass("fixed_box");
    }
});

//Attach event for "+" button
$($("[name='add']").click(function(){
    parent_row=$(this).parent().parent();
    parent_row_clone=parent_row.clone();
    parent_row_clone.find("input").prop("disabled", false);
    parent_row_clone.find("button").removeAttr("id").removeClass("btn-success").addClass("btn-danger").attr("name","remove").text("-");
    parent_row_clone.insertBefore(parent_row);
    //Attach event for "-" button
    parent_row_clone.find("[name='remove']").click(function(){
        $(this).parent().parent().remove();
    });
}));

//Attach event for "Reset" button
$($("[name='reset']").click(function(){
    closest_fieldset=$(this).closest("fieldset");
    closest_fieldset.find("input:enabled, textarea:enabled").val("");
    closest_fieldset.find("option").prop("selected", function(){
        return this.defaultSelected;
    });
    closest_fieldset.find("[name='remove']").parent().parent().remove();
}));

$($("#send_request").click(send_request));
$($("#get_request").click(get_request));
$($("#post_request").click(post_request));
$($("#put_request").click(put_request));
$($("#patch_request").click(patch_request));
$($("#delete_request").click(delete_request));
$($("#save_case").click(save_case));
$($("#response").find("a").click(show_resp));
$($("#save_suite").click(save_suite));

//Calculate full height for an element
function full_height(ele) {
    var margin_top = parseInt(ele.css("margin-top"));
    var margin_bottom = parseInt(ele.css("margin-bottom"));
    var height = parseInt(ele.css("height"));
    height += margin_top+margin_bottom;
    return height;
}

function set_case_list_height() {
    var case_list_height = $(".side_bar>div").height() - full_height($(".side_bar>div>div").children("div").eq(0)) - full_height($(".side_bar>div>div").children("div").eq(2)) - full_height($(".side_bar>div>div").children("div").eq(3)) - parseInt($(".side_bar>div>div").children("div").eq(1).css("margin-bottom"));
    $(".case_list").css("height", case_list_height+"px");
}

//Validation check for the given elements
function validation_check(){
    var result=true;
    var position=Number.MAX_VALUE;
    for (var i=0; i<validation_check.arguments.length; i++){
        validation_check.arguments[i].find(":required").each(function(){
            if ($(this).val()==""){
                $(this).addClass("error_border");
                $(this).next(".error_message").removeClass("hide");
                $(this).change(function(){
                    $(this).removeClass("error_border");
                    $(this).next(".error_message").addClass("hide");
                });
                element_top=$(this).closest("fieldset").offset()["top"];
                if (element_top<position){
                    position=element_top;
                };
                result=false;
            };
        });
    };
    if (result==false){
        $(document).scrollTop(position);
    };
    return result;  
}

function validation_check_without_scroll() {
    var result = true;
    for (var i=0; i<validation_check_without_scroll.arguments.length; i++){
        validation_check_without_scroll.arguments[i].find(":required").each(function(){
            if ($(this).val()==""){
                $(this).addClass("error_border");
                $(this).next(".error_message").removeClass("hide");
                $(this).change(function(){
                    $(this).removeClass("error_border");
                    $(this).next(".error_message").addClass("hide");
                });
                result = false;
            }
        });
    }
    return result;
}

//Small request data
function small_request_data(api_list, api_name) {
    var api = api_list[api_name];
    var url = $("#protocol").val()+"://"+$("#host").val()+api["uri"];
    var small_data = {
        "url": url,
        "method": api["method"],
        "auth": api["auth"],
        "headers": api["headers"],
        "data": api["data"]
    };
    return small_data;
}

//Update variable in request string
function update_variable(str) {
    var re = /\{(\w+)\}/g;
    str = str.replace(re, function(match, p1, offset, string) {
        if (JSON.parse(string)["data"][p1] == undefined) {
            alert("Should define one request data with name : "+p1);
            throw "Should define one request data with name : "+p1;
        }
        else{
            return JSON.parse(string)["data"][p1];
        }
    });
    if (str.search(re) > 0) {
        str = update_variable(str);
    }
    return str;
}

//Update request data
function data_update(request_data) {
    request_data = JSON.stringify(request_data);
    request_data = request_data.replace(/\{random\}/g, Date.now());
    var re = /\{(\w+)\[(\w+)\]\}/g;
    request_data = request_data.replace(re, function(match, p1, p2) {
        if (p1 in response_list) { return response_list[p1][p2]; }
        else if (p1 in case_list) {
            var small_data = small_request_data(case_list, p1);
            get_resp(small_data, p1);
            return response_list[p1][p2];
        }
        else {
            alert("Need to define parent API: "+p1+"\nAnd save it in case list.");
            throw "Need to define parent API: "+p1+"\nAnd save it in case list.";
        }
    });
    request_data = update_variable(request_data);
    return JSON.parse(request_data);
}

//Get response
function get_resp(request_data, api_name) {
    console.log(request_data);
    request_data = data_update(request_data);
    console.log(request_data);
    var content_length = JSON.stringify(request_data).length;
    var resp = $.ajax("/", {
        "contentType": "application/json; charset=UTF-8",
        "method": "POST",
        "async": false,
        "data": JSON.stringify(request_data),
        "success": function(data){
            if ((data["response_status"] < 300) && (api_name != undefined) && !(api_name in response_list)) {
                response_list[api_name] = JSON.parse(data["response_json"]);
            }
            else if (data["response_status"] >= 300) {
                alert("Request fail for parent api: " + api_name);
                throw "Request fail for parent api: "+api_name;
            }
        }
    });
    return resp;
}

function send_request(){
    if (validation_check($("#request_target"))){
        try {
            $("form>div").eq(3).addClass("hide");
            $("form>div").eq(4).removeClass("hide");
            var request_body = get_data();
            request_body = data_update(request_body);
            var resp = $.ajax("/", {
                "contentType": "application/json; charset=UTF-8",
                "method": "POST",
                "data": JSON.stringify(request_body)
            });
            resp.done(function(data){
                var status_code = "Status Code: ";
                status_code = "<b>"+status_code+data["response_status"].toString()+"</b>";
                var headers = status_code+"<br/>"+data["response_headers"];
                headers = headers.replace(/[\{\}\[\],]/g, function(match){
                    if (match=="}" || match=="]") {
                        return "<br/>"+match+"<br/>";
                    }
                    else {
                        return match+"<br/>";
                    }
                });
                $("#responseheaders").html(headers);
                if (data["response_json"]=="{}") {
                    $("#responsejson").text(null);
                }
                else {
                    var json = data["response_json"].replace(/[\{\}\[\],]/g, function(match){
                        if (match=="}" || match=="]") {
                            return "<br/>"+match+"<br/>";
                        }
                        else {
                            return match+"<br/>";
                        }
                    });
                    $("#responsejson").html(json);
                }
                $("#responsetext").text(data["response_text"]);
                if (data["request_body"]==null) {
                    $("#requestbody").text("null");
                }
                else {
                    $("#requestbody").html(data["request_body"].replace(/[\{\}\[\],]/g, function(match){
                        if (match=="}" || match=="]") {
                            return "<br/>"+match+"<br/>";
                        }
                        else {
                            return match+"<br/>";
                        }
                    }));
                }
                $("#requestheaders").html(data["request_headers"].replace(/[\{\}\[\],]/g, function(match){
                    if (match=="}" || match=="]") {
                        return "<br/>"+match+"<br/>";
                    }
                    else {
                        return match+"<br/>";
                    }
                }));
                $("#response").children("div").eq(1).find("li").attr("class", "hide");
                $("#responseheaders").parent().removeClass("hide");
                $("#response a").removeClass("color_a");
                $("#resp_headers_link").addClass("color_a");
                $(document).scrollTop($("#response").parent().prev().offset()["top"]);
            });
            resp.always(function(){
                $("form>div").eq(4).addClass("hide");
                $("form>div").eq(3).removeClass("hide");
            });
        }
        catch (err) {
            $("form>div").eq(4).addClass("hide");
            $("form>div").eq(3).removeClass("hide");
        };
    };
}

function get_request(){
    $("#method").val("GET");
    send_request();
}

function post_request(){
    $("#method").val("POST");
    send_request();
}

function put_request(){
    $("#method").val("PUT");
    send_request();
}

function patch_request(){
    $("#method").val("PATCH");
    send_request();
}

function delete_request(){
    $("#method").val("DELETE");
    send_request();
}

function save_case(){
    if (validation_check($("#request_target"), $("#verification"),  $("#archive"))){
        var case_data = getCaseData();
        if (case_list[case_data[0]]!=undefined){
            var result = confirm("Case with the same name already in the list, do you really want to replace it?");
            if (result==false) { return; }
            else {
                $("#store_path").text("");
                var original_case = case_list[case_data[0]];
                case_list[case_data[0]] = case_data[1];
                if (original_case["tags"].sort().toString()!=case_data[1]["tags"].sort().toString()) {
                    $("[name='"+case_data[0]+"']").children().first().children("span").remove();
                    for (var tag of case_data[1]["tags"].sort()) {
                        $("[name='"+case_data[0]+"']").children().first().append($("<span class='tags small'>"+tag+"</span>"));
                    }
                }
                $(".case_line").removeClass("active");
                $("[name='"+case_data[0]+"']").addClass("active");
                $(".case_list>div").scrollTop($("[name='"+case_data[0]+"']").position().top+$(".case_list>div").scrollTop());
            }
        }
        else {
            $("#store_path").text("");
            case_list[case_data[0]] = case_data[1];
            var new_case = $("[name='case_reference']").clone();
            new_case.attr("name", case_data[0]);
            new_case.find("strong").text(case_data[0]);
            new_case.removeClass("hide");
            new_case.addClass("active");
            for (var tag of case_data[1]["tags"].sort()) {
                new_case.children().first().append($("<span class='tags small'>"+tag+"</span>"));
            }
            $(".case_line").removeClass("active");
            new_case.appendTo($("[name='case_reference']").parent());
            new_case.find("button").click(function(){
                $(this).parent().parent().remove();
                var delete_name = $(this).parent().parent().attr("name");
                delete case_list[delete_name];
                delete response_list[delete_name];
            });
            new_case.children('div').first().click(function(){
                if (! $(this).parent().hasClass("active")){
                    $(".case_line.active").removeClass("active");
                    $(this).parent().addClass("active");
                    //Fill form with selected case data
                    var case_data = {};
                    $.extend(true, case_data, case_list[$(this).parent().attr("name")]);
                    $("#uri").val(case_data.uri);
                    $("#method").val(case_data.method);
                    if (case_data.auth.length==0) {
                        $("#username").val("");
                        $("#password").val("");
                    }
                    else {
                        $("#username").val(case_data.auth[0]);
                        $("#password").val(case_data.auth[1]);
                    }
                    $("#request_custom_headers input[name='key']:enabled").parent().parent().remove();
                    if (case_data.headers["Content-Type"]==undefined) {
                        $("#content_type").val("");
                    }
                    else {
                        $("#content_type").val(case_data.headers["Content-Type"]);
                        delete case_data.headers["Content-Type"];
                    }
                    if (case_data.headers["Content-MD5"]==undefined) {
                        $("#content_md5").val("");
                    }
                    else {
                        $("#content_md5").val(case_data.headers["Content-MD5"]);
                        delete case_data.headers["Content-MD5"];
                    }
                    for (var i in case_data.headers){
                        var parent_row=$("#request_custom_headers input[name='key']:disabled").parent().parent();
                        var parent_row_clone=parent_row.clone();
                        parent_row_clone.find("input").prop("disabled", false);
                        parent_row_clone.find("button").removeAttr("id").removeClass("btn-success").addClass("btn-danger").attr("name","remove").text("-");
                        parent_row_clone.find("input[name='key']").val(i);
                        parent_row_clone.find("input[name='value']").val(case_data.headers[i]);
                        parent_row_clone.insertBefore(parent_row);
                        //Attach event for "-" button
                        parent_row_clone.find("[name='remove']").click(function(){
                            $(this).parent().parent().remove();
                        });
                    }
                    $("#request_data input[name='key']:enabled").parent().parent().remove();
                    $("#raw_body").val("");
                    if (! isEmptyObject(case_data.data)) {
                        $("#raw_body").val(JSON.stringify(case_data.data));
                    }
                    $("#response pre").text("");
                    $("#status_code").val(case_data.status_code);
                    $("#verification_data input[name='value']:enabled").parent().parent().remove();
                    if (case_data.verification.length!=0) {
                        for (var item of case_data.verification) {
                            var item_string;
                            if (typeof(item)=="string") {
                                item_string = item;
                            }
                            else if (typeof(item)=="object") {
                                item_string = JSON.stringify(item);
                            }
                            var parent_row=$("#verification_data input[name='value']:disabled").parent().parent();
                            var parent_row_clone=parent_row.clone();
                            parent_row_clone.find("input").prop("disabled", false);
                            parent_row_clone.find("button").removeAttr("id").removeClass("btn-success").addClass("btn-danger").attr("name","remove").text("-");
                            parent_row_clone.find("input[name='value']").val(item_string);
                            parent_row_clone.insertBefore(parent_row);
                            //Attach event for "-" button
                            parent_row_clone.find("[name='remove']").click(function(){
                                $(this).parent().parent().remove();
                            });
                        }
                    }
                    $("#case_name").val($(this).parent().attr("name"));
                    $("#archive input[name='value']:enabled").parent().parent().remove();
                    if (case_data.tags.length!=0) {
                        for (var item of case_data.tags) {
                            var parent_row=$("#archive input[name='value']:disabled").parent().parent();
                            var parent_row_clone=parent_row.clone();
                            parent_row_clone.find("input").prop("disabled", false);
                            parent_row_clone.find("button").removeAttr("id").removeClass("btn-success").addClass("btn-danger").attr("name","remove").text("-");
                            parent_row_clone.find("input[name='value']").val(item);
                            parent_row_clone.insertBefore(parent_row);
                            //Attach event for "-" button
                            parent_row_clone.find("[name='remove']").click(function(){
                                $(this).parent().parent().remove();
                            });
                        }
                    }
                }
            });
            $(".case_list>div").scrollTop(new_case.position().top+$(".case_list>div").scrollTop());
        }

    };
}

function get_data(){
    var protocol=$("#protocol").val();
    var host=$("#host").val();
    var uri=$("#uri").val();
    var url=protocol+"://"+host+uri;
    var method=$("#method").val();
    var username=$("#username").val();
    var password=$("#password").val();
    var auth=null;
    if (username){
        auth=[username, password];
    };
    var headers={};
    var content_type=$("#content_type").val();
    if (content_type!=""){
        headers["Content-Type"]=content_type;
    };
    //var encoding=$("#encoding").val();
    //if (encoding!=""){
        //headers["Accept-Encoding"]=encoding;
    //};
    var content_md5=$("#content_md5").val();
    if (content_md5!=""){
        headers["Content-MD5"]=content_md5;
    };
    $("#request_custom_headers").find("input[name='key']:enabled").each(function(){
        if ($(this).val()!=""){
            headers[$(this).val()]=$(this).parent().next().children("input").val();
        };
    });
    var data={};
    if ($("#raw_body").val()!=""){
        data=JSON.parse($("#raw_body").val());
    }
    else{
        $("#request_data").find("input[name='key']:enabled").each(function(){
            if ($(this).val()!=""){
                data[$(this).val()]=$(this).parent().next().children("input").val();
            };
        });
    };
    if (isEmptyObject(data)){
        data=null;
    };
    var full_data={
        "url": url,
        "method": method,
        "auth": auth,
        "headers": headers,
        "data": data
    };
    return full_data;
}

function getCaseData(){
    var uri=$("#uri").val();
    var method=$("#method").val();
    var tags=[];
    $("#archive [name='value']:enabled").each(function(index, element){
            if ($(element).val()!=""){
                tags.push($(element).val());
            }
        });
    var auth=[];
    if ($("#username").val()!=""){
        auth.push($("#username").val());
        auth.push($("#password").val());
    }
    var headers={};
    var content_type=$("#content_type").val();
    if (content_type!=""){
        headers["Content-Type"]=content_type;
    };
    var content_md5=$("#content_md5").val();
    if (content_md5!=""){
        headers["Content-MD5"]=content_md5;
    };
    $("#request_custom_headers").find("input[name='key']:enabled").each(function(){
        if ($(this).val()!=""){
            headers[$(this).val()]=$(this).parent().next().children("input").val();
        };
    });
    var data={};
    if ($("#raw_body").val()!=""){
        data=JSON.parse($("#raw_body").val());
    }
    else{
        $("#request_data").find("input[name='key']:enabled").each(function(){
            if ($(this).val()!=""){
                data[$(this).val()]=$(this).parent().next().children("input").val();
            };
        });
    };
    var status_code = parseInt($("#status_code").val());
    var verification = [];
    $("#verification_data [name='value']:enabled").each(function(index, element){
        if ($(element).val()!=""){
            try{
                verification.push(JSON.parse($(element).val()));    
            }
            catch(err){
                verification.push($(element).val());
            }
        }
    });
    var case_info = {
        "uri": uri,
        "method": method,
        "tags": tags,
        "auth": auth,
        "headers": headers,
        "data": data,
        "status_code": status_code,
        "verification": verification
    };
    var case_name = $("#case_name").val();
    return [case_name, case_info];
}

function isEmptyObject(obj){
    for (var i in obj) { return false; };
    return true;
}

function show_resp(){
    event.preventDefault();
    $(this).closest("ul").find("a").removeClass("color_a");
    $(this).addClass("color_a");
    $("#response").children("div").eq(1).find("li").not(".hide").addClass("hide");
    $($(this).attr("href")).parent().removeClass("hide");
    $(document).scrollTop($("#response").parent().prev().offset()["top"]);
}

function check_all_parent_api_included(){
    var case_list_string = JSON.stringify(case_list);
    var re = /\{(\w+)\[(\w+)\]\}/g;
    var parent_api=[];
    var match;
    var miss_api=[];
    while ((match=re.exec(case_list_string))!=null) {
        if (parent_api.indexOf(match[1])==-1) {
            parent_api.push(match[1]);
        }
    }
    for (var item of parent_api) {
        if (case_list[item]==undefined) { miss_api.push(item); };
    }
    if (miss_api.toString()=="") { return true; }
    else {
        alert("Some parent APIs not defined: "+miss_api.toString());
        return false;
    }
}

function find_parent_api(api_name) {
    var case_string = JSON.stringify(case_list[api_name]);
    var re = /\{(\w+)\[(\w+)\]\}/g;
    var parent_api=[];
    var match;
    while ((match=re.exec(case_string))!=null) {
        if (parent_api.indexOf(match[1])==-1) {
            parent_api.push(match[1]);
        }
    }
    return parent_api;
}

function check_circle_call(){
    var circle_call_items = [];
    function _go_through(api_name, stack) {
        stack.push(api_name);
        var stack_set = new Set(stack);
        if (stack_set.size < stack.length) {
            circle_call_items.push(stack);
        }
        else {
            var parent_api;
            parent_api = find_parent_api(api_name);
            if (parent_api.toString()!="") {
                for ( var item of parent_api ) {
                    var stack_copy = stack.concat();
                    _go_through(item, stack_copy);
                }
            }
        }
    }
    for ( var key in case_list ) {
        _go_through(key, []);
    }
    if (circle_call_items.toString()=="") { return true; }
    else {
        function compare_sort(a, b) {
            return a.length-b.length;
        }
        circle_call_items.sort(compare_sort);
        for ( var i=0; i<circle_call_items.length; i++ ) {
            if (circle_call_items[i] != undefined) {
                var i_string = circle_call_items[i].toString();
                for ( var j=i+1; j<circle_call_items.length; j++ ) {
                    if (circle_call_items[j] != undefined) {
                        var j_string = circle_call_items[j].toString();
                        if (j_string.indexOf(i_string) != -1) {
                            delete circle_call_items[j];
                        }
                    }
                }
            }
        }
    }
    var filter_circle_call_items = circle_call_items.filter(function(value) {
        return (value != undefined);
    });
    var alert_string = "";
    for ( var item of filter_circle_call_items ) {
        alert_string += (item.toString() + "\n");
    }
    alert("Loop call warning: \n"+alert_string);
    return false;
}

function save_suite(){
    if (validation_check_without_scroll($(".side_bar"))) {
        if (check_all_parent_api_included()) {
            if (check_circle_call()) {
                var suite_name = $("#suite_name").val();
                var request_body = {
                    "suite_name": suite_name,
                    "suite_data": case_list
                };
                $.ajax("/save_suite.json", {
                    "contentType": "application/json; charset=UTF-8",
                    "method": "POST",
                    "data": JSON.stringify(request_body)
                }).done(function(data) {
                    $("#store_path").text(data);
                });
            }
        }
    }
}
