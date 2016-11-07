// ==UserScript==
// @name           BBC FishEye
// @namespace      http://otaqui.com/code/bbc-fisheye
// @description    Make BBC's Fisheye look more like it should
// @include        https://fisheye.dev.bbc.co.uk/*
// ==/UserScript==
var elems = document.evaluate(
    '//select[@name="wbauthor"]',
    document,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null
);
var i=0;
var sel;
while ( sel = elems.snapshotItem(i++) ) sel.style.width = '200px';

