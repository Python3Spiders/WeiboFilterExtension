window.addEventListener('injectScript', (event) => {
  console.log(event.detail)
  chrome.runtime.sendMessage({
    type: 'demo',
    data: event.detail.data
  }, (response) => {
    console.log('demo response:', response)
  })
})

function onKeywordMenuClick(keyword) {
  if (keyword.length > 10) {
    confirm("选中的关键词长度超过 10 无法添加")
    return
  }
  chrome.storage.sync.get({
    keywords: '',
  }, (result) => {
    if (result.keywords) {
      var keywords = result.keywords.split(',')
      if (keywords.indexOf(keyword) > -1) {
        confirm('【' + keyword + '】已存在，不能重复添加')
        return
      }
    } else {
      var keywords = []
    }
    keywords.push(keyword)
    chrome.storage.sync.set({
      keywords: keywords.join(',')
    }, function () {
      console.log("keyword change suc ");
      confirm("关键词黑名单添加成功")
    });

  });
}

function onUserMenuClick(username) {
  if (username.length > 10) {
    confirm("选中的用户名长度超过 10 无法添加")
    return
  }
  chrome.storage.sync.get({
    usernames: '',
  }, (result) => {
    if (result.usernames) {
      var usernames = result.usernames.split(',')
      if (usernames.indexOf(username) > -1) {
        confirm('【' + username + '】已存在，不能重复添加')
        return
      }
    } else {
      var usernames = []
    }
    usernames.push(username)
    chrome.storage.sync.set({
      usernames: usernames.join(',')
    }, function () {
      console.log("username change suc ");
      confirm("用户黑名单添加成功")
    });

  });
}

chrome.contextMenus.create({
  "title": "添加到微博关键词黑名单",
  "contexts": ['selection'], // 只有当选中文字时才会出现此右键菜单
  "onclick": function (params) { onKeywordMenuClick(params.selectionText) }
});

chrome.contextMenus.create({
  "title": "添加到微博用户黑名单",
  "contexts": ['selection'], // 只有当选中文字时才会出现此右键菜单
  "onclick": function (params) { onUserMenuClick(params.selectionText) }
});
