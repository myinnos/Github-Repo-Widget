"use strict";

var Widgit = (function() {

  //ADD STYLES

  var style = document.currentScript.src;
  var styles = document.getElementsByTagName("script");
  var newPath = style.split("widgit.js")[0];
  newPath = newPath + "css/widgit.css"
  var head = document.querySelectorAll("head")[0];
  var link = create("link");
  attr(link, "rel", "stylesheet");
  attr(link, "href", newPath);
  var link2 = create("link");
  attr(link2, "rel", "stylesheet");
  attr(link2, "href", "https://cdnjs.cloudflare.com/ajax/libs/octicons/3.5.0/octicons.css");
  appendElement(head, link, link2);

  function reposWidget(selector, username, amount) {
    apiRequest(username, {
      "urlParam": "users",
      "targetParam": "repos"
    }, function(res) {
      var data = JSON.parse(res);
      if (amount != null)
        data = data.splice(0, amount);
      var key = ["name", "full_name", "language", "fork", "html_url"];
      var repoArr = [];
      for (var i in data) {
        repoArr.push({
          name: data[i].name,
          full_name: data[i].full_name,
          language: data[i].language,
          fork: data[i].fork,
          html_url: data[i].html_url,
          avatar_url: data[i].owner.avatar_url,
          owner_url: data[i].owner.html_url,
          username: data[i].owner.login
        });
      }
      createType("repos", repoArr, selector);
    });
  }

  function apiRequest(user, urlData, callback) {
    var urlParam = urlData.urlParam.replace("/", "");
    var url = "https://api.github.com/" + urlParam +
      "/" + user.replace("/", "");
    var target = urlData.targetParam.length === 0 ?
      "" :
      "/" + urlData.targetParam.replace("/", "") + "?sort=updated";
    url = url + target;
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function() {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(xobj.responseText);
      }
    };
    xobj.send(null);
  }

  function createType(widgetType, arr, selector) {
    var elem = document.querySelectorAll(selector)[0];
    if (typeof elem === "undefined") {
      return;
    } else {
      buildElem(arr, elem, selector);
    }
  }

  function buildElem(arr, elem, selector) {
    var prependStr = typeof arr[0] == "object" ? "repo__" : "o__";
    var el = create("div");
    attr(el, "class", prependStr + "view-wrap");
    addTitle(el, arr);
    el = createElem(el, "div", 1);
    var ul = create("ul");
    attr(ul, "class", prependStr + "ul");
    ul = typeof arr[0] == "object" ?
      createRepoElem(ul, "li", 3, arr, true) :
      createElem(ul, "li", 3, arr, true)
    appendElement(el, ul);
    elem.appendChild(el)
    var nxt = typeof arr[0] == "object" ?
      repo(arr, elem, selector) :
      overview(arr, elem, selector);
  }

  function repo(arr, elem, selector) {
    addAvatar(".repo__view-wrap", arr);
  }

  function overview(arr, elem, selector) {
    addData(selector, arr);
    addAvatar(".o__view-wrap", arr);
  }

  function addTitle(elem, arr) {
    var username;
    username = (typeof arr[8] !== "object") ? arr[8] : arr[0].username;
    if (typeof arr[8] !== "object") {

    }
    elem.innerHTML = "<span class=username>" + username + "</span>";
  }

  function addAvatar(element, data) {
    var avatar;
    var link;
    if (typeof data[0] != "object") {
      avatar = data[3];
      link = data[7];
    } else {
      avatar = data[0].avatar_url;
      link = data[0].owner_url;
    }

    var elem = document.querySelectorAll(element + " div")[0];
    elem.innerHTML = "<a href=" + link + " target=__blank><img class=avatar src=" + avatar + "></a>";
    attr(elem, "class", "header");
    var title = (typeof data[0] !== "object") ? attr(elem, "class", "header") : attr(elem, "class", "header-repo");
  }

  function addData(option, data) {
    if (typeof option === "string") {
      var strings = ["Repos", "Gists", "Followers"];
      var d = document.querySelectorAll(option + " li");
      for (var i = 0; i < d.length; i++) {
        d[i].innerHTML = "<span class=__" + i + ">" + strings[i] + "</span>" + data[i];
      }
    }
  }

  function createElem(baseEl, elem, index, data, event) {
    for (var i = 1; i <= index; i++) {
      var el = document.createElement(elem);
      if (event) {
        (function(j) {
          el.addEventListener("click", function() {
            action(j, data);
          });
        }(i))
      }
      baseEl.appendChild(el);
    }
    return baseEl;
  }

  function createRepoElem(baseEl, elem, index, data, event) {
    for (var i = 0; i < data.length; i++) {
      var el = document.createElement(elem);
      var a = document.createElement("a");
      attr(a, "href", data[i].html_url);
      attr(a, "target", "__blank");
      var icon = data[i].fork ? "<span class='octicon octicon-repo-forked icon'></span>" : "<span class='octicon octicon-repo icon'></span>";
      el.innerHTML = icon + "<span class=name>" + data[i].name + "</span><span class=lang>" + data[i].language + "</span>"
      a.appendChild(el);
      baseEl.appendChild(a);
    }
    return baseEl;
  }

  function action(index, data) {
    switch (index) {
      case 1:
        window.open(data[data.length - 1] + "?tab=repositories");
        break;
      case 2:
        window.open(data[data.length - 1].replace("//", "//gist."))
        break;
      case 3:
        window.open(data[data.length - 1] + "/followers");
        break;
    }
  }

  function createWrap(elem, obj) {
    var el = create("div");
    attr(el, obj, "o__view-wrap");
  }

  function appendElement(baseEl) {
    for (var i = 1; i < arguments.length; i++) {
      baseEl.appendChild(arguments[i]);
    }
  }

  function create(el, tx) {
    var el = document.createElement(el);
    if (typeof tx !== "undefined") {
      el.appendChild(document.createTextNode(tx));
    }
    return el;
  }

  function attr(elem, name, value) {
    if (!name || name.constructor != String) return '';
    name = {
      'for': 'htmlFor',
      'className': 'class'
    }[name] || name;
    if (typeof value != 'undefined') {
      elem[name] = value;
      if (elem.setAttribute)
        elem.setAttribute(name, value);
    }
    return elem[name] || elem.getAttribute(name) || '';
  }

  return {
    repos: reposWidget
  }

})();
    //  SIMPLY PROVIDE THE WIDGIT OBJECT WITH THE CLASS/ID AND YOUR GITHUB USERNAME
Widgit.repos(".reposWidgit", "myinnos");