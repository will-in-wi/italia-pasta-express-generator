(function(){
  'use strict';

  // http://stackoverflow.com/a/2450976/3042016
  Array.prototype.shuffle = function() {
    var newArr = this;
    var currentIndex = newArr.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = newArr[currentIndex];
      newArr[currentIndex] = newArr[randomIndex];
      newArr[randomIndex] = temporaryValue;
    }

    return newArr;
  }

  // Functions for Dom manipulation.
  var Dom = {
    appendChildren: function(parent, children) {
      for (var i = 0; i < children.length; i++) {
        parent.appendChild(children[i]);
      }
    },
    buildLink: function(innerHTML, clickCallback) {
      var domLink = document.createElement('a');
      domLink.innerHTML = innerHTML;
      domLink.href = '#';
      domLink.onclick = clickCallback;

      return domLink;
    },
    clear: function(domElement) {
      domElement.innerHTML = '';
    },
    hide: function(domElement) {
      domElement.classList.add('hidden');
    },
    show: function(domElement) {
      domElement.classList.remove('hidden');
    }
  };

  function createGroupHeader(title) {
    var domHeader = document.createElement('th');
    domHeader.innerHTML = title;
    return domHeader;
  }

  function createChosenList(body) {
    var domChoices = document.createElement('td');
    domChoices.innerHTML = body;
    return domChoices;
  }

  function createChosenGroup(title, body) {
    var domRow = document.createElement('tr');
    Dom.appendChildren(domRow, [
      createGroupHeader(title),
      createChosenList(body)
    ]);

    return [domRow];
  }

  function getChoiceString(choices, n) {
    return choices.shuffle().slice(0, n).join(', ');
  }

  function createChosenGroups(ingredients, meal) {
    var output = [];
    for (var ingredient in meal) {
      var choices = ingredients[ingredient];
      var count = meal[ingredient];
      output = output.concat(createChosenGroup(ingredient, getChoiceString(choices, count)));
    }
    return output;
  }

  function menuItemCallback(data, meal_name) {
    return function(e) {
      e.preventDefault();

      var domOutput = document.getElementById('output');
      Dom.clear(domOutput);
      Dom.appendChildren(domOutput, createChosenGroups(data['ingredients'], data['meals'][meal_name]));
      Dom.show(document.getElementById('step2'));
      Dom.hide(document.getElementById('step1'));
    };
  }

  function createMenuChoice(data, meal_name) {
    var menuChoice = document.createElement('li')
    menuChoice.appendChild(Dom.buildLink(meal_name, menuItemCallback(data, meal_name)));
    return menuChoice;
  }

  function create_links(data) {
    var choices = [];
    for (var meal_name in data['meals']) {
      choices = choices.concat(createMenuChoice(data, meal_name));
    }
    Dom.appendChildren(document.getElementById('meal-choices'), choices);
  }

  function init_restart() {
    var domRestart = document.getElementById('restart');
    domRestart.onclick = function(e) {
      Dom.show(document.getElementById('step1'));
      Dom.hide(document.getElementById('step2'));
    };
  }

  // Kick off this whole thing…
  (function(){
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function(){
      if (httpRequest.readyState !== XMLHttpRequest.DONE) { return; }
      if (httpRequest.status === 200) {
        create_links(JSON.parse(httpRequest.responseText));
        init_restart();
      } else {
        // console.log('Could not fetch data.');
      }
    };
    httpRequest.open('GET', '/menu.json');
    httpRequest.send();
  }());
})();
