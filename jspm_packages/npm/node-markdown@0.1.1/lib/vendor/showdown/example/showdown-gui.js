/* */ 
(function(process) {
  window.onload = startGui;
  var converter;
  var convertTextTimer,
      processingTime;
  var lastText,
      lastOutput,
      lastRoomLeft;
  var convertTextSetting,
      convertTextButton,
      paneSetting;
  var inputPane,
      previewPane,
      outputPane,
      syntaxPane;
  var maxDelay = 3000;
  function startGui() {
    convertTextSetting = document.getElementById("convertTextSetting");
    convertTextButton = document.getElementById("convertTextButton");
    paneSetting = document.getElementById("paneSetting");
    inputPane = document.getElementById("inputPane");
    previewPane = document.getElementById("previewPane");
    outputPane = document.getElementById("outputPane");
    syntaxPane = document.getElementById("syntaxPane");
    convertTextSetting.onchange = onConvertTextSettingChanged;
    convertTextButton.onclick = onConvertTextButtonClicked;
    paneSetting.onchange = onPaneSettingChanged;
    window.onresize = setPaneHeights;
    window.onkeyup = inputPane.onkeyup = onInput;
    var pollingFallback = window.setInterval(function() {
      if (inputPane.value != lastText)
        onInput();
    }, 1000);
    inputPane.onpaste = function() {
      if (pollingFallback != undefined) {
        window.clearInterval(pollingFallback);
        pollingFallback = undefined;
      }
      onInput();
    };
    if (inputPane.addEventListener) {
      inputPane.addEventListener("input", inputPane.onpaste, false);
    }
    window.setInterval(setPaneHeights, 250);
    if (top.document.location.href.match(/\?blank=1$/))
      inputPane.value = "";
    onPaneSettingChanged();
    converter = new Showdown.converter();
    convertText();
    inputPane.focus();
    previewPane.scrollTop = 0;
    outputPane.scrollTop = 0;
  }
  function convertText() {
    var text = inputPane.value;
    if (text && text == lastText) {
      return;
    } else {
      lastText = text;
    }
    var startTime = new Date().getTime();
    text = converter.makeHtml(text);
    var endTime = new Date().getTime();
    processingTime = endTime - startTime;
    document.getElementById("processingTime").innerHTML = processingTime + " ms";
    saveScrollPositions();
    if (paneSetting.value == "outputPane") {
      outputPane.value = text;
    } else if (paneSetting.value == "previewPane") {
      previewPane.innerHTML = text;
    }
    lastOutput = text;
    restoreScrollPositions();
  }
  ;
  function onConvertTextSettingChanged() {
    onInput();
  }
  function onConvertTextButtonClicked() {
    lastText = "";
    convertText();
    inputPane.focus();
  }
  function onPaneSettingChanged() {
    previewPane.style.display = "none";
    outputPane.style.display = "none";
    syntaxPane.style.display = "none";
    top[paneSetting.value].style.display = "block";
    lastRoomLeft = 0;
    setPaneHeights();
    if (paneSetting.value == "outputPane") {
      outputPane.value = lastOutput;
    } else if (paneSetting.value == "previewPane") {
      previewPane.innerHTML = lastOutput;
    }
  }
  function onInput() {
    if (convertTextTimer) {
      window.clearTimeout(convertTextTimer);
      convertTextTimer = undefined;
    }
    if (convertTextSetting.value != "manual") {
      var timeUntilConvertText = 0;
      if (convertTextSetting.value == "delayed") {
        timeUntilConvertText = processingTime;
      }
      if (timeUntilConvertText > maxDelay)
        timeUntilConvertText = maxDelay;
      convertTextTimer = window.setTimeout(convertText, timeUntilConvertText);
    }
  }
  var previewScrollPos;
  var outputScrollPos;
  function getScrollPos(element) {
    if (element.scrollHeight <= element.clientHeight)
      return 1.0;
    return element.scrollTop / (element.scrollHeight - element.clientHeight);
  }
  function setScrollPos(element, pos) {
    element.scrollTop = (element.scrollHeight - element.clientHeight) * pos;
  }
  function saveScrollPositions() {
    previewScrollPos = getScrollPos(previewPane);
    outputScrollPos = getScrollPos(outputPane);
  }
  function restoreScrollPositions() {
    previewPane.scrollTop = previewPane.scrollTop;
    setScrollPos(previewPane, previewScrollPos);
    setScrollPos(outputPane, outputScrollPos);
  }
  function getTop(element) {
    var sum = element.offsetTop;
    while (element = element.offsetParent)
      sum += element.offsetTop;
    return sum;
  }
  function getElementHeight(element) {
    var height = element.clientHeight;
    if (!height)
      height = element.scrollHeight;
    return height;
  }
  function getWindowHeight(element) {
    if (window.innerHeight)
      return window.innerHeight;
    else if (document.documentElement && document.documentElement.clientHeight)
      return document.documentElement.clientHeight;
    else if (document.body)
      return document.body.clientHeight;
  }
  function setPaneHeights() {
    var textarea = inputPane;
    var footer = document.getElementById("footer");
    var windowHeight = getWindowHeight();
    var footerHeight = getElementHeight(footer);
    var textareaTop = getTop(textarea);
    var roomLeft = windowHeight - footerHeight - textareaTop;
    if (roomLeft < 0)
      roomLeft = 0;
    if (roomLeft == lastRoomLeft) {
      return;
    }
    lastRoomLeft = roomLeft;
    inputPane.style.height = roomLeft + "px";
    previewPane.style.height = roomLeft + "px";
    outputPane.style.height = roomLeft + "px";
    syntaxPane.style.height = roomLeft + "px";
  }
})(require('process'));
