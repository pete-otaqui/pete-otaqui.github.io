
init();

function init() {
  setFormValues(loadValues());
  document.querySelector('#xkp-form')
    .addEventListener('submit', function(ev) {
      ev.preventDefault();
      refresh();
    }, false);
  document.body.addEventListener('click', function(ev) {
    if ( !ev.target.classList.contains('xkp-pass') ) return;
    copyTextToClipboard(ev.target.textContent);
  }, false);
  refresh();
}

function refresh() {
  var options = getFormValues();
  saveValues(options);
  var maxLength = getMaxLength(options);
  var html = '';
  var password;
  var padding;
  var fullPassword;
  for ( var i=0; i<20; i++ ) {
    password = xkpasswd.generate(options);
    padding = getPadding(maxLength - password.length);
    html += '<li class="xkp-item"><div class="xkp-pass">' + password + '</div>' + padding + '</li>';
  };
  document.querySelector('.xkp-list').innerHTML = html;
}

function getMaxLength(options) {
  // make the minimum as big as the maximum
  var tempOptions = JSON.parse(JSON.stringify(options));
  tempOptions.minWordLength = tempOptions.maxWordLength;
  var password = xkpasswd.generate(tempOptions);
  return password.length;
}

function getPadding(num) {
  console.log('padding', num);
  var str = '';
  var cur = 0;
  while (cur < num) {
    str += '&nbsp;';
    cur += 1;
  }
  return str;
}

function getFormValues() {
  var values = {};
  var possibles = [
    'separators[]',
    'numberOfWords',
    'minWordLength',
    'maxWordLength',
    'capitalisationStyle',
    'capitalisationStyle',
    'prefixDigits',
    'suffixDigits',
    'punctuationPadding'
  ];
  possibles.forEach(function(name) {
    var value = getFormValue(name);
    if ( value !== undefined ) {
      values[name] = value;
    }
  });
  return values;
}

function getFormValue(name) {
  var element, value;
  var elements = document.querySelectorAll('*[name="'+name+'"]');
  if ( elements.length === 1 ) {
    element = elements[0];
    switch(element.nodeName.toLowerCase()) {
      case 'select':
        value = element.options[element.selectedIndex].value;
        break;
      default:
        switch (element.type) {
          case 'number':
            value = parseInt(element.value, 10);
            break;
          default:
            value = element.value;
        }
    }
  } else {
    value = [];
    [].slice.call(elements).forEach(function(element) {
      if ( element.checked ) value.push(element.value);
    });
  }
  return value;
}

function setFormValues(values) {
  Object.keys(values).forEach(function(key) {
    setFormValue(key, values[key]);
  });
}

function setFormValue(name, value) {
  var element, value, index;
  var elements = document.querySelectorAll('*[name="'+name+'"]');
  if ( elements.length === 1 ) {
    element = elements[0];
    switch(element.nodeName.toLowerCase()) {
      case 'select':
        console.log('element', element.options);
        [].slice.call(element.options).forEach(function(option, index) {
          if ( option.value === value ) {
            element.selectedIndex = index;
          }
        });
        break;
      default:
          element.value = value;
    }
  } else {
    var values = value;
    [].slice.call(elements).forEach(function(el) {
      const thisVal = el.value;
      if (values.indexOf(thisVal) !== -1) {
        el.checked = true;
      } else {
        el.checked = false;
      }
    });
  }
}

function saveValues(values) {
  if (!'localStorage' in window) return;
  const valueString = JSON.stringify(values);
  localStorage.setItem('xkp', valueString);
}
function loadValues() {
  if (!'localStorage' in window) return {};
  const valueString = localStorage.getItem('xkp');
  return JSON.parse(valueString) || {};
}

