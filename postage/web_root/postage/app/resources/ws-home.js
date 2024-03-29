/*global ml, GS, xtag, evt, ace, Range, newTab, clearPropertyList, getScriptForAce*/
'use strict';
var bolHomeLoaded = true
  , arrTargets = [], arrScripts = [], arrNames = []
  , arrVersions = [], arrToolbarAddons = [], homeEditor;


function loadHome() {
    // make home the current tab
    if (GS.getQueryString().indexOf('view=') === -1) {
        GS.replaceState({}, '', '?view=home');
    }
    if (GS.qryGetVal(GS.getQueryString(), 'view') === 'home') {
        openHome();
    }
    
    // fill home
    document.getElementById('home-frame').innerHTML = ml(function () {/*
        <div class="ace-container-position-container" style="height: 100%;">
            <div class="ace-container">
                <div id="sql-ace-area-home" class="ace-area"></div>
            </div>
            <div class="ace-toolbar">
                <gs-button id="button-home-open-to-new-tab" onclick="openToTab()" title="Open SQL to new tab" icononly></gs-button>
                <div id="toolbar-addon-container"></div>
            </div>
            <iframe id="iframe-news" src="https://news.workflowproducts.com/splash/postage.html?app=postage&version={{POSTAGE}}&postgres={{POSTGRES}}"></iframe>
        </div>
    */}).replace(/\{\{POSTAGE\}\}/g, contextData.postageVersion).replace(/\{\{POSTGRES\}\}/g, contextData.versionNumber);
    
    // create ace
    homeEditor = ace.edit('sql-ace-area-home');
    homeEditor.setTheme('ace/theme/eclipse');
    homeEditor.getSession().setMode('ace/mode/pgsql');
    homeEditor.setShowPrintMargin(false);
    homeEditor.setDisplayIndentGuides(true);
    homeEditor.setShowFoldWidgets(false);
    homeEditor.session.setUseWrapMode('free');
    homeEditor.setBehavioursEnabled(false);
    homeEditor.$blockScrolling = Infinity; // <== blocks a warning
    homeEditor.setReadOnly(true);
    document.getElementById('sql-ace-area-home').style.backgroundColor = '#EEEEEE';
    
    homeEditor.setOptions({
        'enableBasicAutocompletion': true,
        'enableSnippets'           : true,
        'enableLiveAutocompletion' : true
    });
    
    homeEditor.addEventListener('mousewheel', function () {
        currTab = ['home', homeEditor.getFirstVisibleRow()];
    });
    
    // if we're on a touch device: make the ace grow with it's content
    if (evt.touchDevice) {
        homeEditor.setOptions({
            maxLines: Infinity
        });
        document.getElementById('sql-ace-area-home').classList.add('childrenneedsclick');
        document.getElementById('sql-ace-area-home').style.borderBottom = '1px solid #AAAAAA';
        
    // else: full height
    } else {
        document.getElementById('sql-ace-area-home').style.height = '100%';
    }
}


function openHome() {
    var i, len, arrElements;
    
    // set a class for the tab bar so that the css can be specificly for home (and remove the class used by the tabs)
    document.getElementById('tab-bar-container').classList.add('home-mode');
    document.getElementById('tab-bar-container').classList.remove('tab-mode');
    
    // clear property list
    clearPropertyList();
    
    // clear current tab
    arrElements = xtag.query(document.getElementById('tab-bar'), '.current-tab');
    
    for (i = 0, len = arrElements.length; i < len; i += 1) {
        arrElements[i].classList.remove('current-tab');
        if (arrElements[i].relatedEditor && autocompleteGlobals.popupOpen) {
            autocompletePopupClose(arrElements[i].relatedEditor);
        }
    }
    
    // clear current frame
    arrElements = xtag.query(document.getElementById('tab-frames'), '.current-frame');
    for (i = 0, len = arrElements.length; i < len; i += 1) {
        arrElements[i].classList.remove('current-frame');
    }
    
    // make home the current tab
    document.getElementById('home-frame').classList.add('current-frame');
    
    // re-load the current script
    if (arrScripts.length > 0) {
        //GS.triggerEvent(arrScripts[arrScripts.length - 1], 'click');
        //console.log(arrToolbarAddons[arrToolbarAddons.length - 1]);
        getScript(arrNames[arrNames.length - 1], arrToolbarAddons[arrToolbarAddons.length - 1], arrScripts[arrScripts.length - 1], true);
        
        //getScriptForAce(arrTargets[arrTargets.length - 1],
        //                arrNames[arrNames.length - 1],
        //                arrScripts[arrScripts.length - 1],
        //                true,
        //                arrToolbarAddons[arrToolbarAddons.length - 1]);
    }
}

var strPreviousScript;
function setQSToHome() {
    'use strict';
    GS.pushQueryString('view=' + (strPreviousScript || 'home'));
}

function addHomeQuery(target, strName, strQuery, strToolbarAddons) {
    if (arrScripts[arrScripts.length - 1] !== strQuery) {
        arrTargets.push(target);
        arrNames.push(strName);
        arrScripts.push(strQuery);
        arrToolbarAddons.push(strToolbarAddons);
    }
    
    openHome();
}

function setHomeValue(strName, strText, strToolbarAddons) {
    if (document.getElementById('iframe-news')) {
        document.getElementById('iframe-news').parentNode.removeChild(document.getElementById('iframe-news'));
    }
    document.getElementById('toolbar-addon-container').innerHTML = strToolbarAddons || '';
    
    homeEditor.currentTabName = strName;
    homeEditor.setValue(strText);
    homeEditor.selection.setRange(new Range(0, 0, 0, 0));
}


function openToTab() {
    var editorSelectionRange = homeEditor.getSelectionRange()
      , strQuery = homeEditor.getValue() , intStart = 0
      , intEnd = 0, i, len, arrLines, newQuery, intCommentStart;
    
    if (editorSelectionRange.start.row !== editorSelectionRange.end.row ||
        editorSelectionRange.start.column !== editorSelectionRange.end.column) {
        arrLines = strQuery.split('\n');
        for (i = 0, len = arrLines.length; i < len; i += 1) {
            if (i < editorSelectionRange.start.row) {
                intStart += arrLines[i].length + 1;
            }
            if (i < editorSelectionRange.end.row) {
                intEnd += arrLines[i].length + 1;
            }
            
            if (i === editorSelectionRange.start.row) {
                intStart += editorSelectionRange.start.column;
            }
            if (i === editorSelectionRange.end.row) {
                intEnd += editorSelectionRange.end.column;
            }
            if (i > editorSelectionRange.end.row) {
                break;
            }
        }
        
        newQuery = strQuery.substring(intStart, intEnd);
        console.log(newQuery);
    /* If you're going to do this in the future you have to do this the right way
       
    
    } else if (strQuery.lastIndexOf('/*') > 0) {
        arrLines = strQuery.split('\n');
        intCommentStart = strQuery.lastIndexOf('/*');
        console.log(intCommentStart);
        
        newQuery = strQuery.substring(0, intCommentStart);*/
    } else {
        arrLines = strQuery.split('\n');
        newQuery = strQuery;
    }
    
    
    newTab('sql', (homeEditor.currentTabName || ''), {'strContent': (newQuery || '-- Nothing to open\n\n\n')});
}