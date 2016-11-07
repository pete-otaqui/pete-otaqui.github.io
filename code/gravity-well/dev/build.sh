#!/bin/bash

# setup names and directories
self=`dirname "$0"`
root=`dirname "$self"`
name="gravity-well"

jsfull="$root/js/$name.js"
jscomp="$root/js/$name.min.js"

csfull="$root/css/$name.css"
cscomp="$root/css/$name.min.css"

# generate full js file
: > $jsfull
cat "$root/src/lib/json_parse.js" >> $jsfull
cat "$root/src/lib/base2.js" >> $jsfull
cat "$root/src/lib/base2-dom.js" >> $jsfull
cat "$root/src/lib/raphael.js" >> $jsfull
cat "$root/src/js/AjaxRequest.js" >> $jsfull
cat "$root/src/js/AjaxResponse.js" >> $jsfull
cat "$root/src/js/StageItem.js" >> $jsfull
cat "$root/src/js/TextItem.js" >> $jsfull
cat "$root/src/js/ButtonItem.js" >> $jsfull
cat "$root/src/js/Screen.js" >> $jsfull
cat "$root/src/js/Arrow.js" >> $jsfull
cat "$root/src/js/Catapult.js" >> $jsfull
cat "$root/src/js/Cloner.js" >> $jsfull
cat "$root/src/js/EndScreen.js" >> $jsfull
cat "$root/src/js/Game.js" >> $jsfull
cat "$root/src/js/HelpScreen.js" >> $jsfull
cat "$root/src/js/Level.js" >> $jsfull
cat "$root/src/js/LevelTitle.js" >> $jsfull
cat "$root/src/js/Planet.js" >> $jsfull
cat "$root/src/js/Projectile.js" >> $jsfull
cat "$root/src/js/Score.js" >> $jsfull
cat "$root/src/js/Target.js" >> $jsfull
cat "$root/src/js/Trail.js" >> $jsfull
cat "$root/src/js/WelcomeScreen.js" >> $jsfull

java -jar ${root}/dev/yuicompressor-2.4.2.jar --line-break 800 --nomunge --preserve-semi -o $jscomp $jsfull

java -jar ${root}/dev/yuicompressor-2.4.2.jar --line-break 800 --type css -o $cscomp $csfull



