// function hideDom () {
//   if (document.querySelector('style[brisk]')) return
//   let style = document.createElement('style')
//   style.setAttribute('type', 'text/css')
//   style.setAttribute('brisk', true)
//   style.innerHTML = ".wbpro-side.woo-panel-main.woo-panel-top.woo-panel-right.woo-panel-bottom.woo-panel-left.Card_wrap_2ibWe.Card_bottomGap_2Xjqi:first-child { display:none }"
//   document.head.appendChild(style)
// }

// let mutationObserver = window.MutationObserver
// let observer = new MutationObserver(hideDom)
// observer.observe(document, { childList: true, subtree: true })



// 在页面上插入代码
const script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', chrome.extension.getURL('request_interceptor.js'));
document.documentElement.appendChild(script);

script.addEventListener('load', () => {

  chrome.storage.sync.get({
    keywords: '',
    usernames: ''
  }, (result) => {
    if (result.keywords) {
      postMessage({ type: 'ajaxInterceptor', to: 'pageScript', key: 'keywords', value: result.keywords.split(',') });
    }
    if (result.usernames) {
      postMessage({ type: 'ajaxInterceptor', to: 'pageScript', key: 'usernames', value: result.usernames.split(',') });
    }
  });

});
