
init();

function init() {

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
  var html = '';
  var password;
  for ( var i=0; i<20; i++ ) {
    var password = xkpasswd.generate(options);
    html += '<li class="xkp-item"><div class="xkp-pass">' + password + '</div></li>';
  };
  document.querySelector('.xkp-list').innerHTML = html;
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
        element.options.forEach(function(option, index) {
          if ( option.value === value ) {
            element.selectedIndex = index;
          }
        });
        break;
      default:
          element.value = value;
    }
  }
}
