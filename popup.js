function onKeywordChange() {
    chrome.storage.sync.set({
        keywords: $('.keyword').val()
    }, function () {
        console.log("keyword change suc ");
    });
}

function onUsernameChange() {
    chrome.storage.sync.set({
        usernames: $('.username').val()
    }, function () {
        console.log("username change suc ");
    });
}

$('.keyword').tagsInput({
    'height': '78px',
    'width': '300px',
    'interactive': true,
    'defaultText': 'add keyword...',
    'removeWithBackspace': true,
    'minChars': 0,
    'maxChars': 10, // if not provided there is no limit
    'placeholderColor': '#666666',
    'onAddTag': onKeywordChange,
    'onRemoveTag': onKeywordChange
});

$('.username').tagsInput({
    'height': '78px',
    'width': '300px',
    'interactive': true,
    'defaultText': 'add user...',
    'removeWithBackspace': true,
    'minChars': 0,
    'maxChars': 10, // if not provided there is no limit
    'placeholderColor': '#666666',
    'onAddTag': onUsernameChange,
    'onRemoveTag': onUsernameChange
});


chrome.storage.sync.get({
    keywords: '',
    usernames: ''
}, (result) => {
    $('.keyword').importTags(result.keywords);
    $('.username').importTags(result.usernames);
});
