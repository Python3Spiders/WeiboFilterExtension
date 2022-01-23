
// 第一个请求拦截不到
// 两条同样的请求好像拦截不到？
// 命名空间
// 不取关也可以不看它的微博

// 修改代码重装//第一次安装；最好重启浏览器
let ajax_interceptor_buyixiao = {
  originalXHR: window.XMLHttpRequest,
  // 分别是全部关注、 最新微博、特别关注、好友圈，（特别关注和好友圈只是 list_id 不同，接口路径一样）, 热搜
  urls: ['/ajax/feed/unreadfriendstimeline', '/ajax/feed/friendstimeline', 'ajax/feed/groupstimeline', '/ajax/side/hotSearch'],
  settings: {
    keywords: [],
    usernames: [],
  },
  myXHR: function () {
    const modifyResponse = () => {
      let matchUrls = ajax_interceptor_buyixiao.urls.filter(url => xhr.responseURL.indexOf(url) > -1)
      let match = matchUrls.length > 0
      if (match) {
        // alert('match suc 111' + this.responseURL)
        let data;
        if (!xhr.responseType || xhr.responseType === "text") {
          data = xhr.responseText;
        } else if (xhr.responseType === "document") {
          data = xhr.responseXML;
        } else {
          data = xhr.response;
        }
        var overrideTxt = try_match_and_modify(data)
        this.responseText = overrideTxt;
        this.response = overrideTxt;
      }
    }

    const is_username_matched = (username) => {
      // 备注名是 remark，用户名是 screen_name
      // var usernames = ['新华社', '猫']
      var usernames = ajax_interceptor_buyixiao.settings.usernames
      for (var index = 0; index < usernames.length; index++) {
        if (username.indexOf(usernames[index]) > -1) {
          return true
        }
      }
      return false
    }

    const is_text_matched = (text) => {
      // var keywords = ['好久', '口红', '男', '2022', '杜华', '赵爽', 'cp']
      var keywords = ajax_interceptor_buyixiao.settings.keywords
      for (var index = 0; index < keywords.length; index++) {
        if (text.indexOf(keywords[index]) > -1) {
          return true
        }
      }
      return false
    }

    const is_pass_wrapper = (e) => {
      // 去掉广告
      if (e.promotion) {
        return false;
      }
      return !is_text_matched(e.text) && !is_username_matched(e.user.screen_name);
    }


    const try_match_and_modify = (responseText) => {
      var response_json = JSON.parse(responseText)
      if (response_json.statuses) {
        // feed 数据流
        console.log(response_json.statuses)
        // alert(responseText)
        var statuses = response_json.statuses.filter(function (e) { return is_pass_wrapper(e); });
        statuses.sort(function(a, b){return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()})
        response_json.statuses = statuses;
        console.log(response_json.statuses)
      } else if (response_json.data) {
        // 热搜数据流样式
        console.log(response_json.data)
        var data = response_json.data.realtime.filter(function (e) { return !is_text_matched(e.word); });
        response_json.data.realtime = data;
        console.log(response_json.data)
      }
      return JSON.stringify(response_json);
    }

    const xhr = new ajax_interceptor_buyixiao.originalXHR;
    for (let attr in xhr) {
      if (attr === 'onreadystatechange') {
        xhr.onreadystatechange = (...args) => {
          if (this.readyState == 4) {
            // 请求成功
            // 开启拦截
            modifyResponse();

          }
          this.onreadystatechange && this.onreadystatechange.apply(this, args);
        }
        continue;
      } else if (attr === 'onload') {
        xhr.onload = (...args) => {
          // 请求成功
          // 开启拦截
          modifyResponse();

          this.onload && this.onload.apply(this, args);
        }
        continue;
      }

      if (typeof xhr[attr] === 'function') {
        this[attr] = xhr[attr].bind(xhr);
      } else {
        // responseText和response不是writeable的，但拦截时需要修改它，所以修改就存储在this[`_${attr}`]上
        if (attr === 'responseText' || attr === 'response') {
          Object.defineProperty(this, attr, {
            get: () => this[`_${attr}`] == undefined ? xhr[attr] : this[`_${attr}`],
            set: (val) => this[`_${attr}`] = val,
            enumerable: true
          });
        } else {
          Object.defineProperty(this, attr, {
            get: () => xhr[attr],
            set: (val) => xhr[attr] = val,
            enumerable: true
          });
        }
      }
    }
  },

  originalFetch: window.fetch.bind(window),
  myFetch: function (...args) {
    return ajax_interceptor_buyixiao.originalFetch(...args).then((response) => {
      let txt = undefined;
      let matchUrls = ajax_interceptor_buyixiao.urls.filter(url => xhr.responseURL.indexOf(url) > -1)
      let match = matchUrls.length > 0
      // if (!match) {
      //   match = xhr.responseURL.indexOf(ajax_interceptor_buyixiao.urls[0]) > -1
      // }
      // alert(response.url)
      if (match) {
        // alert('match suc 222' + this.responseURL)

        var overrideTxt = try_match_and_modify(xhr.responseText)
        txt = overrideTxt;
        // alert(txt)
      }

      if (txt !== undefined) {
        const stream = new ReadableStream({
          start(controller) {
            // const bufView = new Uint8Array(new ArrayBuffer(txt.length));
            // for (var i = 0; i < txt.length; i++) {
            //   bufView[i] = txt.charCodeAt(i);
            // }
            controller.enqueue(new TextEncoder().encode(txt));
            controller.close();
          }
        });

        const newResponse = new Response(stream, {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        });
        const proxy = new Proxy(newResponse, {
          get: function (target, name) {
            switch (name) {
              case 'ok':
              case 'redirected':
              case 'type':
              case 'url':
              case 'useFinalURL':
              case 'body':
              case 'bodyUsed':
                return response[name];
            }
            return target[name];
          }
        });

        for (let key in proxy) {
          if (typeof proxy[key] === 'function') {
            proxy[key] = proxy[key].bind(newResponse);
          }
        }

        return proxy;
      } else {
        return response;
      }
    });
  },
}

window.XMLHttpRequest = ajax_interceptor_buyixiao.myXHR;
window.fetch = ajax_interceptor_buyixiao.myFetch;

window.addEventListener("message", function (event) {
  const data = event.data;

  if (data.type === 'ajaxInterceptor' && data.to === 'pageScript') {
    console.log("rev", data)
    ajax_interceptor_buyixiao.settings[data.key] = data.value;
  }

}, false);