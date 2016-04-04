
/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2012-2015 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* jshint strict: false */

var mvelo = mvelo || {};
// chrome extension
mvelo.crx = typeof chrome !== 'undefined';
// firefox addon
mvelo.ffa = mvelo.ffa || typeof self !== 'undefined' && self.port || !mvelo.crx;
// for fixfox, mvelo.extension is exposed from a content script

/* constants */

// min height for large frame
mvelo.LARGE_FRAME = 600;
// frame constants
mvelo.FRAME_STATUS = 'stat';
// frame status
mvelo.FRAME_ATTACHED = 'att';
mvelo.FRAME_DETACHED = 'det';
// key for reference to frame object
mvelo.FRAME_OBJ = 'fra';
// marker for dynamically created iframes
mvelo.DYN_IFRAME = 'dyn';
mvelo.IFRAME_OBJ = 'obj';
// armor header type
mvelo.PGP_MESSAGE = 'msg';
mvelo.PGP_SIGNATURE = 'sig';
mvelo.PGP_PUBLIC_KEY = 'pub';
mvelo.PGP_PRIVATE_KEY = 'priv';
// display decrypted message
mvelo.DISPLAY_INLINE = 'inline';
mvelo.DISPLAY_POPUP = 'popup';
// editor type
mvelo.PLAIN_TEXT = 'plain';
mvelo.RICH_TEXT = 'rich';
// keyring
mvelo.KEYRING_DELIMITER = '|#|';
mvelo.LOCAL_KEYRING_ID = 'localhost' + mvelo.KEYRING_DELIMITER + 'mailvelope';
// colors for secure background
mvelo.SECURE_COLORS = ['#e9e9e9', '#c0c0c0', '#808080', '#ffce1e', '#ff0000', '#85154a', '#6f2b8b', '#b3d1e3', '#315bab', '#1c449b', '#4c759c', '#1e8e9f', '#93b536'];

mvelo.appendTpl = function($element, path) {
  if (mvelo.ffa && !/^resource/.test(document.location.protocol)) {
    return new Promise(function(resolve, reject) {
      mvelo.data.load(path, function(result) {
        $element.append($.parseHTML(result));
        resolve($element);
      });
    });
  } else {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('GET', path);
      req.responseType = 'text';
      req.onload = function() {
        if (req.status == 200) {
          $element.append($.parseHTML(req.response));
          resolve($element);
        } else {
          reject(new Error(req.statusText));
        }
      };
      req.onerror = function() {
        reject(new Error('Network Error'));
      };
      req.send();
    });
  }
};

mvelo.extension = mvelo.extension || mvelo.crx && chrome.runtime;
// extension.connect shim for Firefox
if (mvelo.ffa && mvelo.extension) {
  mvelo.extension.connect = function(obj) {
    mvelo.extension._connect(obj);
    obj.events = {};
    var port = {
      postMessage: mvelo.extension.port.postMessage,
      disconnect: mvelo.extension.port.disconnect.bind(null, obj),
      onMessage: {
        addListener: mvelo.extension.port.addListener.bind(null, obj)
      },
      onDisconnect: {
        addListener: mvelo.extension.port.addDisconnectListener.bind(null)
      }
    };
    // page unload triggers port disconnect
    window.addEventListener('unload', port.disconnect);
    return port;
  };
}

// for fixfox, mvelo.l10n is exposed from a content script
mvelo.l10n = mvelo.l10n || mvelo.crx && {
  getMessages: function(ids, callback) {
    var result = {};
    ids.forEach(function(id) {
      result[id] = chrome.i18n.getMessage(id);
    });
    callback(result);
  },
  localizeHTML: function(l10n) {
    $('[data-l10n-id]').each(function() {
      var jqElement = $(this);
      var id = jqElement.data('l10n-id');
      var text = l10n ? l10n[id] : chrome.i18n.getMessage(id) || id ;
      jqElement.text(text);
    });
    $('[data-l10n-title-id]').each(function() {
      var jqElement = $(this);
      var id = jqElement.data('l10n-title-id');
      var text = l10n ? l10n[id] : chrome.i18n.getMessage(id) || id ;
      jqElement.attr('title', text);
    });
  }
};

mvelo.util = {};

mvelo.util.sortAndDeDup = function(unordered, compFn) {
  var result = [];
  var prev = -1;
  unordered.sort(compFn).forEach(function(item) {
    var equal = (compFn !== undefined && prev !== undefined) ? compFn(prev, item) === 0 : prev === item;
    if (!equal) {
      result.push(item);
      prev = item;
    }
  });
  return result;
};

// random hash generator
mvelo.util.getHash = function() {
  var result = '';
  var buf = new Uint16Array(6);
  if (typeof window !== 'undefined') {
    window.crypto.getRandomValues(buf);
  } else {
    mvelo.util.getDOMWindow().crypto.getRandomValues(buf);
  }
  for (var i = 0; i < buf.length; i++) {
    result += buf[i].toString(16);
  }
  return result;
};

mvelo.util.encodeHTML = function(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\//g, "&#x2F;");
};

mvelo.util.decodeHTML = function(html) {
  return String(html)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "\'")
    .replace(/&#x2F;/g, "\/");
};

mvelo.util.decodeQuotedPrint = function(armored) {
  return armored
    .replace(/=3D=3D\s*$/m, "==")
    .replace(/=3D\s*$/m, "=")
    .replace(/=3D(\S{4})\s*$/m, "=$1");
};

mvelo.util.text2html = function(text) {
  return this.encodeHTML(text).replace(/\n/g, '<br>');
};

mvelo.util.html2text = function(html) {
  html = html.replace(/\n/g, ' '); // replace new line with space
  html = html.replace(/(<br>)/g, '\n'); // replace <br> with new line
  html = html.replace(/<\/(blockquote|div|dl|dt|dd|form|h1|h2|h3|h4|h5|h6|hr|ol|p|pre|table|tr|td|ul|li|section|header|footer)>/g, '\n'); // replace block closing tags </..> with new line
  html = html.replace(/<(.+?)>/g, ''); // remove tags
  html = html.replace(/&nbsp;/g, ' '); // replace non-breaking space with whitespace
  html = html.replace(/\n{3,}/g, '\n\n'); // compress new line
  return mvelo.util.decodeHTML(html);
};

/**
 * This function will return the byte size of any UTF-8 string you pass to it.
 * @param {string} str
 * @returns {number}
 */
mvelo.util.byteCount = function(str) {
  return encodeURI(str).split(/%..|./).length - 1;
};

mvelo.util.ab2str = function(buf) {
  var str = '';
  var ab = new Uint8Array(buf);
  var CHUNK_SIZE = Math.pow(2, 16);
  var offset, len, subab;
  for (offset = 0; offset < ab.length; offset += CHUNK_SIZE) {
    len = Math.min(CHUNK_SIZE, ab.length - offset);
    subab = ab.subarray(offset, offset + len);
    str += String.fromCharCode.apply(null, subab);
  }
  return str;
};

mvelo.util.str2ab = function(str) {
  var bufView = new Uint8Array(str.length);
  for (var i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return bufView.buffer;
};

mvelo.util.getExtensionClass = function(fileExt) {
  var extClass = '';
  if (fileExt !== undefined) {
    extClass = 'ext-color-' + fileExt;
  }
  return extClass;
};

mvelo.util.extractFileNameWithoutExt = function(fileName) {
  var indexOfDot = fileName.lastIndexOf('.');
  if (indexOfDot > 0) { // case: regular
    return fileName.substring(0, indexOfDot);
  } else if (indexOfDot === 0) { // case '.txt'
    return '';
  } else {
    return fileName;
  }
};

mvelo.util.extractFileExtension = function(fileName) {
  var lastindexDot = fileName.lastIndexOf('.');
  if (lastindexDot < 0) { // no extension
    return '';
  } else {
    return fileName.substring(lastindexDot + 1, fileName.length).toLowerCase().trim();
  }
};

// Attribution: http://www.2ality.com/2012/08/underscore-extend.html
mvelo.util.extend = function(target) {
  var sources = [].slice.call(arguments, 1);
  sources.forEach(function(source) {
    Object.getOwnPropertyNames(source).forEach(function(propName) {
      Object.defineProperty(target, propName,
          Object.getOwnPropertyDescriptor(source, propName));
    });
  });
  return target;
};

mvelo.util.showLoadingAnimation = function() {
  $('.m-spinner').show();
};

mvelo.util.hideLoadingAnimation = function() {
  $('.m-spinner').hide();
};

mvelo.util.generateSecurityBackground = function(angle, scaling, coloring) {
  var security = mvelo.util.secBgnd,
    iconWidth = security.width * security.scaling,
    iconHeight = security.height * security.scaling,
    iconAngle = security.angle,
    iconColor = mvelo.SECURE_COLORS[security.colorId];

  if (angle || angle === 0) {
    iconAngle = angle;
  }
  if (scaling) {
    iconWidth = security.width * scaling;
    iconHeight = security.height * scaling;
  }
  if (coloring) {
    iconColor = mvelo.SECURE_COLORS[coloring];
  }

  return '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" id="secBgnd" version="1.1" width="' + iconWidth + 'px" height="' + iconHeight + 'px" viewBox="0 0 27 27"><path transform="rotate(' + iconAngle + ' 14 14)" style="fill: ' + iconColor + ';" d="m 13.963649,25.901754 c -4.6900005,0 -8.5000005,-3.78 -8.5000005,-8.44 0,-1.64 0.47,-3.17 1.29,-4.47 V 9.0417546 c 0,-3.9399992 3.23,-7.1499992 7.2000005,-7.1499992 3.97,0 7.2,3.21 7.2,7.1499992 v 3.9499994 c 0.82,1.3 1.3,2.83 1.3,4.48 0,4.65 -3.8,8.43 -8.49,8.43 z m -1.35,-7.99 v 3.33 h 0 c 0,0.02 0,0.03 0,0.05 0,0.74 0.61,1.34 1.35,1.34 0.75,0 1.35,-0.6 1.35,-1.34 0,-0.02 0,-0.03 0,-0.05 h 0 v -3.33 c 0.63,-0.43 1.04,-1.15 1.04,-1.97 0,-1.32 -1.07,-2.38 -2.4,-2.38 -1.32,0 -2.4,1.07 -2.4,2.38 0.01,0.82 0.43,1.54 1.06,1.97 z m 6.29,-8.8699994 c 0,-2.7099992 -2.22,-4.9099992 -4.95,-4.9099992 -2.73,0 -4.9500005,2.2 -4.9500005,4.9099992 V 10.611754 C 10.393649,9.6217544 12.103649,9.0317546 13.953649,9.0317546 c 1.85,0 3.55,0.5899998 4.94,1.5799994 l 0.01,-1.5699994 z" /></svg>';
};

mvelo.util.showSecurityBackground = function(isEmbedded) {
  if (isEmbedded) {
    $('.secureBgndSettingsBtn').on('mouseenter', function() {
      $('.secureBgndSettingsBtn').removeClass('btn-link').addClass('btn-default');
    });

    $('.secureBgndSettingsBtn').on('mouseleave', function() {
      $('.secureBgndSettingsBtn').removeClass('btn-default').addClass('btn-link');
    });
  }

  mvelo.extension.sendMessage({event: "get-security-background"}, function(background) {
    mvelo.util.secBgnd = background;

    var secBgndIcon = mvelo.util.generateSecurityBackground(),
      secureStyle = '.secureBackground {' +
        'background-color: ' + mvelo.util.secBgnd.color + ';' +
        'background-position: -20px -20px;' +
        'background-image: url(data:image/svg+xml;base64,' + btoa(secBgndIcon) + ');' +
        '}';

    var color = mvelo.util.secBgnd.color,
      lockIcon = mvelo.util.generateSecurityBackground(0, null, 2),
      lockButton = '.lockBtnIcon, .lockBtnIcon:active {' +
        'margin: 0px;' +
        'width: 28px; height: 28px;' +
        'background-size: 100% 100%;' +
        'background-repeat: no-repeat;' +
        'background-image: url(data:image/svg+xml;base64,' + btoa(lockIcon) + ');' +
        '}';

    var secBgndStyle = document.getElementById('secBgndCss');
    if (secBgndStyle) {
      secBgndStyle.parentNode.removeChild(secBgndStyle);
    }
    $('head').append($('<style>').attr('id', 'secBgndCss').text(secureStyle + lockButton));
  });
};

mvelo.util.matchPattern2RegEx = function(matchPattern) {
  return new RegExp(
    '^' + matchPattern.replace(/\./g, '\\.')
                      .replace(/\*\\\./, '(\\w+(-\\w+)*\\.)*') + '$'
  );
};

if (typeof exports !== 'undefined') {
  exports.mvelo = mvelo;
}

/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2012-2015 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var mvelo = mvelo || {};

mvelo.main = {};

mvelo.main.interval = 2500; // ms
mvelo.main.intervalID = 0;
mvelo.main.regex = /END\sPGP/;
mvelo.main.minEditHeight = 84;
mvelo.main.contextTarget = null;
mvelo.main.prefs = null;
mvelo.main.name = 'mainCS-' + mvelo.util.getHash();
mvelo.main.port = null;

mvelo.main.connect = function() {
  if (document.mveloControl) {
    return;
  }
  mvelo.main.port = mvelo.extension.connect({name: mvelo.main.name});
  mvelo.main.addMessageListener();
  mvelo.main.port.postMessage({event: 'get-prefs', sender: mvelo.main.name});
  //mvelo.main.initContextMenu();
  document.mveloControl = true;
};

$(document).ready(mvelo.main.connect);

mvelo.main.init = function(prefs, watchList) {
  mvelo.main.prefs = prefs;
  mvelo.main.watchList = watchList;
  mvelo.domAPI.init();
  if (mvelo.main.prefs.main_active && !mvelo.domAPI.active) {
    mvelo.main.on();
  } else {
    mvelo.main.off();
  }
};

mvelo.main.on = function() {
  //console.log('inside cs: ', document.location.host);
  if (mvelo.main.intervalID === 0) {
    mvelo.main.scanLoop();
    mvelo.main.intervalID = window.setInterval(function() {
      mvelo.main.scanLoop();
    }, mvelo.main.interval);
  }
};

mvelo.main.off = function() {
  if (mvelo.main.intervalID !== 0) {
    window.clearInterval(mvelo.main.intervalID);
    mvelo.main.intervalID = 0;
  }
};

mvelo.main.scanLoop = function() {
  // find armored PGP text
  var pgpTag = mvelo.main.findPGPTag(mvelo.main.regex);
  if (pgpTag.length !== 0) {
    mvelo.main.attachExtractFrame(pgpTag);
  }
  // find editable content
  var editable = mvelo.main.findEditable();
  if (editable.length !== 0) {
    mvelo.main.attachEncryptFrame(editable);
  }
};

/**
 * find text nodes in DOM that match certain pattern
 * @param {Regex} regex
 * @return $([nodes])
 */
mvelo.main.findPGPTag = function(regex) {
  var treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node) {
      if (node.parentNode.tagName !== 'SCRIPT' && mvelo.main.regex.test(node.textContent)) {
        return NodeFilter.FILTER_ACCEPT;
      } else {
        return NodeFilter.FILTER_REJECT;
      }
    }
  }, false);

  var nodeList = [];

  while (treeWalker.nextNode()) {
    nodeList.push(treeWalker.currentNode);
  }

  // filter out hidden elements
  nodeList = $(nodeList).filter(function() {
    var element = $(this);
    // visibility check does not work on text nodes
    return element.parent().is(':visible') &&
      // no elements within editable elements
      element.parents('[contenteditable], textarea').length === 0 &&
      this.ownerDocument.designMode !== 'on';
  });

  return nodeList;
};

mvelo.main.findEditable = function() {
  // find textareas and elements with contenteditable attribute, filter out <body>
  var editable = $('[contenteditable], textarea').filter(':visible').not('body');
  var iframes = $('iframe').filter(':visible');
  // find dynamically created iframes where src is not set
  var dynFrames = iframes.filter(function() {
    var src = $(this).attr('src');
    return src === undefined ||
           src === '' ||
           /^javascript.*/.test(src) ||
           /^about.*/.test(src);
  });
  // find editable elements inside dynamic iframe (content script is not injected here)
  dynFrames.each(function() {
    var content = $(this).contents();
    // set event handler for contextmenu
    content.find('body')//.off("contextmenu").on("contextmenu", mvelo.main.onContextMenu)
    // mark body as 'inside iframe'
                        .data(mvelo.DYN_IFRAME, true)
    // add iframe element
                        .data(mvelo.IFRAME_OBJ, $(this));
    // document of iframe in design mode or contenteditable set on the body
    if (content.attr('designMode') === 'on' || content.find('body[contenteditable]').length !== 0) {
      // add iframe to editable elements
      editable = editable.add($(this));
    } else {
      // editable elements inside iframe
      var editblElem = content.find('[contenteditable], textarea').filter(':visible');
      editable = editable.add(editblElem);
    }
  });
  // find iframes from same origin with a contenteditable body (content script is injected, but encrypt frame needs to be attached to outer iframe)
  var anchor = $('<a/>');
  var editableBody = iframes.not(dynFrames).filter(function() {
    var frame = $(this);
    // only for iframes from same host
    if (anchor.attr('href', frame.attr('src')).prop('hostname') === document.location.hostname) {
      try {
        var content = frame.contents();
        if (content.attr('designMode') === 'on' || content.find('body[contenteditable]').length !== 0) {
          // set event handler for contextmenu
          //content.find('body').off("contextmenu").on("contextmenu", mvelo.main.onContextMenu);
          // mark body as 'inside iframe'
          content.find('body').data(mvelo.IFRAME_OBJ, frame);
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
  });
  editable = editable.add(editableBody);
  // filter out elements below a certain height limit
  editable = editable.filter(function() {
    return $(this).height() > mvelo.main.minEditHeight;
  });
  return editable;
};

mvelo.main.getMessageType = function(armored) {
  if (/END\sPGP\sMESSAGE/.test(armored)) {
    return mvelo.PGP_MESSAGE;
  } else if (/END\sPGP\sSIGNATURE/.test(armored)) {
    return mvelo.PGP_SIGNATURE;
  } else if (/END\sPGP\sPUBLIC\sKEY\sBLOCK/.test(armored)) {
    return mvelo.PGP_PUBLIC_KEY;
  } else if (/END\sPGP\sPRIVATE\sKEY\sBLOCK/.test(armored)) {
    return mvelo.PGP_PRIVATE_KEY;
  }
};

mvelo.main.attachExtractFrame = function(element) {
  // check status of PGP tags
  var newObj = element.filter(function() {
    return !mvelo.ExtractFrame.isAttached($(this).parent());
  });
  // create new decrypt frames for new discovered PGP tags
  newObj.each(function(index, element) {
    try {
      // parent element of text node
      var pgpEnd = $(element).parent();
      switch (mvelo.main.getMessageType(pgpEnd.text())) {
        case mvelo.PGP_MESSAGE:
          var dFrame = new mvelo.DecryptFrame(mvelo.main.prefs);
          dFrame.attachTo(pgpEnd);
          break;
        case mvelo.PGP_SIGNATURE:
          var vFrame = new mvelo.VerifyFrame(mvelo.main.prefs);
          vFrame.attachTo(pgpEnd);
          break;
        case mvelo.PGP_PUBLIC_KEY:
          var imFrame = new mvelo.ImportFrame(mvelo.main.prefs);
          imFrame.attachTo(pgpEnd);
          break;
      }
    } catch (e) {}
  });
};

/**
 * attach encrypt frame to element
 * @param  {$} element
 * @param  {boolean} expanded state of frame
 */
mvelo.main.attachEncryptFrame = function(element, expanded) {
  // check status of elements
  var newObj = element.filter(function() {
    if (expanded) {
      // filter out only attached frames
      if (element.data(mvelo.FRAME_STATUS) === mvelo.FRAME_ATTACHED) {
        // trigger expand state of attached frames
        element.data(mvelo.FRAME_OBJ).showEncryptDialog();
        return false;
      } else {
        return true;
      }
    } else {
      // filter out attached and detached frames
      return !mvelo.EncryptFrame.isAttached($(this));
    }
  });
  // create new encrypt frames for new discovered editable fields
  newObj.each(function(index, element) {
    var eFrame = new mvelo.EncryptFrame(mvelo.main.prefs);
    eFrame.attachTo($(element), {expanded: expanded});
  });
};

mvelo.main.addMessageListener = function() {
  mvelo.main.port.onMessage.addListener(
    function(request) {
      //console.log('contentscript: %s onRequest: %o', document.location.toString(), request);
      if (request.event === undefined) {
        return;
      }
      switch (request.event) {
        case 'on':
          mvelo.main.on();
          break;
        case 'off':
          mvelo.main.off();
          break;
        case 'destroy':
          mvelo.main.off();
          mvelo.main.port.disconnect();
          break;
        case 'context-encrypt':
          if (mvelo.main.contextTarget !== null) {
            mvelo.main.attachEncryptFrame(mvelo.main.contextTarget, true);
            mvelo.main.contextTarget = null;
          }
          break;
        case 'set-prefs':
          mvelo.main.init(request.prefs, request.watchList);
          break;
        default:
          console.log('unknown event');
      }
    }
  );
  mvelo.main.port.onDisconnect.addListener(function() {
    mvelo.main.off();
  });
};

mvelo.main.initContextMenu = function() {
  // set handler
  $("body").on("contextmenu", mvelo.main.onContextMenu);
};

mvelo.main.onContextMenu = function(e) {
  //console.log(e.target);
  var target = $(e.target);
  // find editable descendants or ascendants
  var element = target.find('[contenteditable], textarea');
  if (element.length === 0) {
    element = target.closest('[contenteditable], textarea');
  }
  if (element.length !== 0 && !element.is('body')) {
    if (element.height() > mvelo.main.minEditHeight) {
      mvelo.main.contextTarget = element;
    } else {
      mvelo.main.contextTarget = null;
    }
    return;
  }
  // inside dynamic iframe or iframes from same origin with a contenteditable body
  element = target.closest('body');
  // get outer iframe
  var iframeObj = element.data(mvelo.IFRAME_OBJ);
  if (iframeObj !== undefined) {
    // target set to outer iframe
    mvelo.main.contextTarget = iframeObj;
    return;
  }
  // no suitable element found
  mvelo.main.contextTarget = null;
};

/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2013-2015 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var mvelo = mvelo || {};

mvelo.ExtractFrame = function(prefs) {
  if (!prefs) {
    throw {
      message: 'mvelo.ExtractFrame constructor: prefs not provided.'
    };
  }
  this.id = mvelo.util.getHash();
  // element with Armor Tail Line '-----END PGP...'
  this._pgpEnd = null;
  // element that contains complete ASCII Armored Message
  this._pgpElement = null;
  this._pgpElementAttr = {};
  this._eFrame = null;
  this._port = null;
  this._refreshPosIntervalID = null;
  this._pgpStartRegex = /BEGIN\sPGP/;
};

mvelo.ExtractFrame.prototype.attachTo = function(pgpEnd) {
  this._init(pgpEnd);
  this._establishConnection();
  this._renderFrame();
  this._registerEventListener();
};

mvelo.ExtractFrame.prototype._init = function(pgpEnd) {
  this._pgpEnd = pgpEnd;
  // find element with complete armored text and width > 0
  this._pgpElement = pgpEnd;
  var maxNesting = 8;
  var beginFound = false;
  for (var i = 0; i < maxNesting; i++) {
    if (this._pgpStartRegex.test(this._pgpElement.text()) &&
        this._pgpElement.width() > 0) {
      beginFound = true;
      break;
    }
    this._pgpElement = this._pgpElement.parent();
    if (this._pgpElement.get(0).nodeName === 'HTML') {
      break;
    }
  }
  // set status to attached
  this._pgpEnd.data(mvelo.FRAME_STATUS, mvelo.FRAME_ATTACHED);
  // store frame obj in pgpText tag
  this._pgpEnd.data(mvelo.FRAME_OBJ, this);

  if (!beginFound) {
    throw new Error('Missing BEGIN PGP header.');
  }

  this._pgpElementAttr.marginTop = parseInt(this._pgpElement.css('margin-top'), 10);
  this._pgpElementAttr.paddingTop = parseInt(this._pgpElement.css('padding-top'), 10);
};

mvelo.ExtractFrame.prototype._renderFrame = function() {
  var that = this;
  this._eFrame = $('<div/>', {
    id: 'eFrame-' + this.id,
    'class': 'm-extract-frame m-cursor',
    html: '<a class="m-frame-close">×</a>'
  });

  this._setFrameDim();

  this._eFrame.insertAfter(this._pgpElement);
  if (this._pgpElement.height() > mvelo.LARGE_FRAME) {
    this._eFrame.addClass('m-large');
  }
  this._eFrame.fadeIn('slow');

  this._eFrame.on('click', this._clickHandler.bind(this));
  this._eFrame.find('.m-frame-close').on('click', this._closeFrame.bind(this));

  $(window).resize(this._setFrameDim.bind(this));
  this._refreshPosIntervalID = window.setInterval(function() {
    that._setFrameDim();
  }, 1000);
};

mvelo.ExtractFrame.prototype._clickHandler = function(callback) {
  this._eFrame.off('click');
  this._toggleIcon(callback);
  this._eFrame.removeClass('m-cursor');
  return false;
};

mvelo.ExtractFrame.prototype._closeFrame = function(finalClose) {
  this._eFrame.fadeOut(function() {
    window.clearInterval(this._refreshPosIntervalID);
    $(window).off('resize');
    this._eFrame.remove();
    if (finalClose === true) {
      this._port.disconnect();
      this._pgpEnd.data(mvelo.FRAME_STATUS, null);
    } else {
      this._pgpEnd.data(mvelo.FRAME_STATUS, mvelo.FRAME_DETACHED);
    }
    this._pgpEnd.data(mvelo.FRAME_OBJ, null);
  }.bind(this));
  return false;
};

mvelo.ExtractFrame.prototype._toggleIcon = function(callback) {
  this._eFrame.one('transitionend', callback);
  this._eFrame.toggleClass('m-open');
};

mvelo.ExtractFrame.prototype._setFrameDim = function() {
  var pgpElementPos = this._pgpElement.position();
  this._eFrame.width(this._pgpElement.width() - 2);
  this._eFrame.height(this._pgpEnd.position().top + this._pgpEnd.height() - pgpElementPos.top - 2);
  this._eFrame.css('top', pgpElementPos.top + this._pgpElementAttr.marginTop + this._pgpElementAttr.paddingTop);
};

mvelo.ExtractFrame.prototype._establishConnection = function() {
  this._port = mvelo.extension.connect({name: this._ctrlName});
  //console.log('Port connected: %o', this._port);
};

mvelo.ExtractFrame.prototype._getArmoredMessage = function() {
  var msg;
  if (this._pgpElement.is('pre')) {
    msg = this._pgpElement.clone();
    msg.find('br').replaceWith('\n');
    msg = msg.text();
  } else {
    msg = this._pgpElement.html();
    msg = msg.replace(/\n/g, ' '); // replace new line with space
    msg = msg.replace(/(<br>)/g, '\n'); // replace <br> with new line
    msg = msg.replace(/<\/(blockquote|div|dl|dt|dd|form|h1|h2|h3|h4|h5|h6|hr|ol|p|pre|table|tr|td|ul|li|section|header|footer)>/g, '\n'); // replace block closing tags </..> with new line
    msg = msg.replace(/<(.+?)>/g, ''); // remove tags
    msg = msg.replace(/&nbsp;/g, ' '); // replace non-breaking space with whitespace
    msg = mvelo.util.decodeHTML(msg);
  }
  msg = msg.replace(/\n\s+/g, '\n'); // compress sequence of whitespace and new line characters to one new line
  msg = msg.match(this._typeRegex)[0];
  msg = msg.replace(/^(\s?>)+/gm, ''); // remove quotation
  msg = msg.replace(/^\s+/gm, ''); // remove leading whitespace
  msg = msg.replace(/:.*\n(?!.*:)/, '$&\n');  // insert new line after last armor header
  msg = msg.replace(/-----\n(?!.*:)/, '$&\n'); // insert new line if no header
  msg = mvelo.util.decodeQuotedPrint(msg);
  return msg;
};

mvelo.ExtractFrame.prototype._registerEventListener = function() {
  var that = this;
  this._port.onMessage.addListener(function(msg) {
    switch (msg.event) {
      case 'destroy':
        that._closeFrame(true);
        break;
    }
  });
  this._port.onDisconnect.addListener(function(msg) {
    that._closeFrame(false);
  });
};

mvelo.ExtractFrame.isAttached = function(pgpEnd) {
  var status = pgpEnd.data(mvelo.FRAME_STATUS);
  switch (status) {
    case mvelo.FRAME_ATTACHED:
    case mvelo.FRAME_DETACHED:
      return true;
    default:
      return false;
  }
};

/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2012-2015 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var mvelo = mvelo || {};

mvelo.DecryptFrame = function(prefs) {
  mvelo.ExtractFrame.call(this, prefs);
  this._displayMode = prefs.security.display_decrypted;
  this._dDialog = null;
  // decrypt popup active
  this._dPopup = false;
  this._ctrlName = 'dFrame-' + this.id;
  this._typeRegex = /-----BEGIN PGP MESSAGE-----[\s\S]+?-----END PGP MESSAGE-----/;
};

mvelo.DecryptFrame.prototype = Object.create(mvelo.ExtractFrame.prototype);
mvelo.DecryptFrame.prototype.parent = mvelo.ExtractFrame.prototype;

mvelo.DecryptFrame.prototype._renderFrame = function() {
  this.parent._renderFrame.call(this);
  this._eFrame.addClass('m-decrypt');
};

mvelo.DecryptFrame.prototype._clickHandler = function() {
  this.parent._clickHandler.call(this);
  if (this._displayMode == mvelo.DISPLAY_INLINE) {
    this._inlineDialog();
  } else if (this._displayMode == mvelo.DISPLAY_POPUP) {
    this._popupDialog();
  }
  return false;
};

mvelo.DecryptFrame.prototype._inlineDialog = function() {
  this._dDialog = $('<iframe/>', {
    id: 'dDialog-' + this.id,
    'class': 'm-frame-dialog',
    frameBorder: 0,
    scrolling: 'no'
  });
  var url;
  if (mvelo.crx) {
    url = mvelo.extension.getURL('common/ui/inline/dialogs/decryptInline.html?id=' + this.id);
  } else if (mvelo.ffa) {
    url = 'about:blank?mvelo=decryptInline&id=' + this.id;
  }
  this._dDialog.attr('src', url);
  this._eFrame.append(this._dDialog);
  this._setFrameDim();
  this._dDialog.fadeIn();
};

mvelo.DecryptFrame.prototype._popupDialog = function() {
  this._port.postMessage({
    event: 'dframe-display-popup',
    sender: this._ctrlName
  });
  this._dPopup = true;
};

mvelo.DecryptFrame.prototype._removeDialog = function() {
  // check if dialog is active
  if (!this._dDialog && !this._dPopup) {
    return;
  }
  if (this._displayMode === mvelo.DISPLAY_INLINE) {
    this._dDialog.fadeOut();
    // removal triggers disconnect event
    this._dDialog.remove();
    this._dDialog = null;
  } else {
    this._dPopup = false;
  }
  this._eFrame.addClass('m-cursor');
  this._toggleIcon();
  this._eFrame.on('click', this._clickHandler.bind(this));
};

mvelo.DecryptFrame.prototype._registerEventListener = function() {
  this.parent._registerEventListener.call(this);
  var that = this;
  this._port.onMessage.addListener(function(msg) {
    //console.log('dFrame-%s event %s received', that.id, msg.event);
    switch (msg.event) {
      case 'remove-dialog':
      case 'dialog-cancel':
        that._removeDialog();
        break;
      case 'get-armored':
        that._port.postMessage({
          event: 'set-armored',
          data: that._getArmoredMessage(),
          sender: that._ctrlName
        });
        break;
    }
  });
};

/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2015 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var mvelo = mvelo || {};

mvelo.VerifyFrame = function(prefs) {
  mvelo.ExtractFrame.call(this, prefs);
  this._displayMode = prefs.security.display_decrypted;
  this._vDialog = null;
  // verify popup active
  this._vPopup = false;
  this._ctrlName = 'vFrame-' + this.id;
  this._typeRegex = /-----BEGIN PGP SIGNED MESSAGE-----[\s\S]+?-----END PGP SIGNATURE-----/;
  this._pgpStartRegex = /BEGIN\sPGP\sSIGNED/;
  this._sigHeight = 128;
};

mvelo.VerifyFrame.prototype = Object.create(mvelo.ExtractFrame.prototype);
mvelo.VerifyFrame.prototype.parent = mvelo.ExtractFrame.prototype;

mvelo.VerifyFrame.prototype._init = function(pgpEnd) {
  this.parent._init.call(this, pgpEnd);
  this._calcSignatureHeight();
};

mvelo.VerifyFrame.prototype._renderFrame = function() {
  this.parent._renderFrame.call(this);
  this._eFrame.addClass('m-verify');
  this._eFrame.removeClass('m-large');
};

mvelo.VerifyFrame.prototype._calcSignatureHeight = function() {
  var msg = this._getArmoredMessage();
  msg = msg.split('\n');
  for (var i = 0; i < msg.length; i++) {
    if (/-----BEGIN\sPGP\sSIGNATURE-----/.test(msg[i])) {
      var height = this._pgpEnd.position().top + this._pgpEnd.height() - this._pgpElement.position().top - 2;
      this._sigHeight = parseInt(height / msg.length * (msg.length - i), 10);
      break;
    }
  }
};

mvelo.VerifyFrame.prototype._clickHandler = function() {
  this.parent._clickHandler.call(this);
  if (this._displayMode == mvelo.DISPLAY_INLINE) {
    this._inlineDialog();
  } else if (this._displayMode == mvelo.DISPLAY_POPUP) {
    this._popupDialog();
  }
  return false;
};

mvelo.VerifyFrame.prototype._inlineDialog = function() {
  this._vDialog = $('<iframe/>', {
    id: 'vDialog-' + this.id,
    'class': 'm-frame-dialog',
    frameBorder: 0,
    scrolling: 'no'
  });
  var url;
  if (mvelo.crx) {
    url = mvelo.extension.getURL('common/ui/inline/dialogs/verifyInline.html?id=' + this.id);
  } else if (mvelo.ffa) {
    url = 'about:blank?mvelo=verifyInline&id=' + this.id;
  }
  this._vDialog.attr('src', url);
  this._eFrame.append(this._vDialog);
  this._setFrameDim();
  this._vDialog.fadeIn();
};

mvelo.VerifyFrame.prototype._popupDialog = function() {
  this._port.postMessage({
    event: 'vframe-display-popup',
    sender: this._ctrlName
  });
  this._vPopup = true;
};

mvelo.VerifyFrame.prototype._removeDialog = function() {
  // check if dialog is active
  if (!this._vDialog && !this._vPopup) {
    return;
  }
  if (this._displayMode === mvelo.DISPLAY_INLINE) {
    this._vDialog.fadeOut();
    // removal triggers disconnect event
    this._vDialog.remove();
    this._vDialog = null;
  } else {
    this._vPopup = false;
  }
  this._eFrame.addClass('m-cursor');
  this._eFrame.removeClass('m-open');
  this._eFrame.on('click', this._clickHandler.bind(this));
};

mvelo.VerifyFrame.prototype._getArmoredMessage = function() {
  var msg;
  // selection method does not work in Firefox if pre element without linebreaks with <br>
  if (this._pgpElement.is('pre') && !this._pgpElement.find('br').length) {
    msg = this._pgpElement.text();
  } else {
    var sel = document.defaultView.getSelection();
    sel.selectAllChildren(this._pgpElement.get(0));
    msg = sel.toString();
    sel.removeAllRanges();
  }
  return msg;
};

mvelo.VerifyFrame.prototype._setFrameDim = function() {
  var pgpElementPos = this._pgpElement.position();
  this._eFrame.width(this._pgpElement.width() - 2);
  var height = this._pgpEnd.position().top + this._pgpEnd.height() - pgpElementPos.top - 2;
  var top = pgpElementPos.top + this._pgpElementAttr.marginTop + this._pgpElementAttr.paddingTop;
  if (this._vDialog) {
    this._eFrame.height(height);
    this._eFrame.css('top', top);
  } else {
    this._eFrame.height(this._sigHeight);
    this._eFrame.css('top', top + height - this._sigHeight);
  }
},

mvelo.VerifyFrame.prototype._registerEventListener = function() {
  this.parent._registerEventListener.call(this);
  var that = this;
  this._port.onMessage.addListener(function(msg) {
    //console.log('dFrame-%s event %s received', that.id, msg.event);
    switch (msg.event) {
      case 'remove-dialog':
        that._removeDialog();
        break;
      case 'armored-message':
        that._port.postMessage({
          event: 'vframe-armored-message',
          data: that._getArmoredMessage(),
          sender: that._ctrlName
        });
        break;
    }
  });
};

/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2013-2015 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var mvelo = mvelo || {};

mvelo.ImportFrame = function(prefs) {
  mvelo.ExtractFrame.call(this, prefs);
  this._ctrlName = 'imFrame-' + this.id;
  this._typeRegex = /-----BEGIN PGP PUBLIC KEY BLOCK-----[\s\S]+?-----END PGP PUBLIC KEY BLOCK-----/;
};

mvelo.ImportFrame.prototype = Object.create(mvelo.ExtractFrame.prototype);
mvelo.ImportFrame.prototype.parent = mvelo.ExtractFrame.prototype;

mvelo.ImportFrame.prototype._renderFrame = function() {
  this.parent._renderFrame.call(this);
  this._eFrame.addClass('m-import');
};

mvelo.ImportFrame.prototype._clickHandler = function() {
  var that = this;
  this.parent._clickHandler.call(this, function() {
    that._port.postMessage({
      event: 'imframe-armored-key',
      data: that._getArmoredMessage(),
      sender: that._ctrlName
    });
  });
  return false;
};

mvelo.ImportFrame.prototype._registerEventListener = function() {
  this.parent._registerEventListener.call(this);
  var that = this;
  this._port.onMessage.addListener(function(msg) {
    switch (msg.event) {
      case 'import-result':
        if (msg.resultType.error) {
          that._eFrame.addClass('m-error');
        } else if (msg.resultType.warning) {
          that._eFrame.addClass('m-warning');
        } else if (msg.resultType.success) {
          that._eFrame.addClass('m-ok');
        }
        break;
    }
  });
};

/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2012-2015 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var mvelo = mvelo || {};

mvelo.EncryptFrame = function(prefs) {
  this.id = mvelo.util.getHash();
  this._editElement = null;
  this._eFrame = null;
  this._port = null;
  this._refreshPosIntervalID = 0;
  this._emailTextElement = null;
  this._emailUndoText = null;
  // type of external editor
  this._editorType = mvelo.PLAIN_TEXT; //prefs.general.editor_type;
  this._options = {closeBtn: true};
  this._keyCounter = 0;
};

mvelo.EncryptFrame.prototype.attachTo = function(element, options) {
  $.extend(this._options, options);
  this._init(element);
  this._establishConnection();
  this._renderFrame();
  this._registerEventListener();
  // set status to attached
  this._editElement.data(mvelo.FRAME_STATUS, mvelo.FRAME_ATTACHED);
  // store frame obj in element tag
  this._editElement.data(mvelo.FRAME_OBJ, this);
};

mvelo.EncryptFrame.prototype.getID = function() {
  return this.id;
};

mvelo.EncryptFrame.prototype._init = function(element) {
  this._editElement = element;
  this._emailTextElement = this._editElement.is('iframe') ? this._editElement.contents().find('body') : this._editElement;
  // inject style if we have a non-body editable element inside a dynamic iframe
  if (!this._editElement.is('body') && this._editElement.closest('body').data(mvelo.DYN_IFRAME)) {
    var html = this._editElement.closest('html');
    if (!html.data('M-STYLE')) {
      var style = $('<link/>', {
        rel: 'stylesheet',
        href: mvelo.extension.getURL('common/ui/inline/framestyles.css')
      });
      // add style
      html.find('head').append(style);
      // set marker
      html.data('M-STYLE', true);
    }
  }
};

mvelo.EncryptFrame.prototype._renderFrame = function() {
  var that = this;
  // create frame
  var toolbar = '';
  if (this._options.closeBtn) {
    toolbar = toolbar + '<a class="m-frame-close">×</a>';
  } else {
    toolbar = toolbar + '<span class="m-frame-fill-right"></span>';
  }
  /* jshint multistr: true */
  toolbar = toolbar + '\
            <button id="undoBtn" class="m-btn m-encrypt-button" type="button"><i class="m-icon m-icon-undo"></i></button> \
            <button id="editorBtn" class="m-btn m-encrypt-button" type="button"><i class="m-icon m-icon-editor"></i></button> \
            ';
  this._eFrame = $('<div/>', {
    id: 'eFrame-' + that.id,
    'class': 'm-encrypt-frame',
    html: toolbar
  });

  this._eFrame.insertAfter(this._editElement);
  $(window).on('resize', this._setFrameDim.bind(this));
  // to react on position changes of edit element, e.g. click on CC or BCC in GMail
  this._refreshPosIntervalID = window.setInterval(function() {
    that._setFrameDim();
  }, 1000);
  this._eFrame.find('.m-frame-close').on('click', this._closeFrame.bind(this));
  this._eFrame.find('#undoBtn').on('click', this._onUndoButton.bind(this));
  this._eFrame.find('#editorBtn').on('click', this._onEditorButton.bind(this));
  this._normalizeButtons();
  this._eFrame.fadeIn('slow');

  this._emailTextElement.on('keypress', function() {
    if (++that._keyCounter >= 13) {
      that._emailTextElement.off('keypress');
      that._eFrame.fadeOut('slow', function() {
        that._closeFrame();
      });
    }
  });

};

mvelo.EncryptFrame.prototype._normalizeButtons = function() {
  //console.log('editor mode', this._editorMode);
  this._eFrame.find('.m-encrypt-button').hide();
  this._eFrame.find('#editorBtn').show();
  if (this._emailUndoText) {
    this._eFrame.find('#undoBtn').show();
  }
  this._setFrameDim();
};

mvelo.EncryptFrame.prototype._onUndoButton = function() {
  this._resetEmailText();
  this._normalizeButtons();
  return false;
};

mvelo.EncryptFrame.prototype._onEditorButton = function() {
  this._emailTextElement.off('keypress');
  this._showMailEditor();
  return false;
};

mvelo.EncryptFrame.prototype._closeFrame = function(finalClose) {
  this._eFrame.fadeOut(function() {
    window.clearInterval(this._refreshPosIntervalID);
    $(window).off('resize');
    this._eFrame.remove();
    if (finalClose === true) {
      this._port.disconnect();
      this._editElement.data(mvelo.FRAME_STATUS, null);
    } else {
      this._editElement.data(mvelo.FRAME_STATUS, mvelo.FRAME_DETACHED);
    }
    this._editElement.data(mvelo.FRAME_OBJ, null);
  }.bind(this));
  return false;
};

mvelo.EncryptFrame.prototype._setFrameDim = function() {
  var editElementPos = this._editElement.position();
  var editElementWidth = this._editElement.width();
  var toolbarWidth = this._eFrame.width();
  this._eFrame.css('top', editElementPos.top + 3);
  this._eFrame.css('left', editElementPos.left + editElementWidth - toolbarWidth - 20);
};

mvelo.EncryptFrame.prototype._showMailEditor = function() {
  this._port.postMessage({
    event: 'eframe-display-editor',
    sender: 'eFrame-' + this.id,
    text: this._getEmailText(this._editorType == mvelo.PLAIN_TEXT ? 'text' : 'html')
  });
};

mvelo.EncryptFrame.prototype._establishConnection = function() {
  this._port = mvelo.extension.connect({name: 'eFrame-' + this.id});
};

mvelo.EncryptFrame.prototype._html2text = function(html) {
  html = $('<div/>').html(html);
  // replace anchors
  html = html.find('a').replaceWith(function() {
                                      return $(this).text() + ' (' + $(this).attr('href') + ')';
                                    })
                       .end()
                       .html();
  html = html.replace(/(<(br|ul|ol)>)/g, '\n'); // replace <br>,<ol>,<ul> with new line
  html = html.replace(/<\/(div|p|li)>/g, '\n'); // replace </div>, </p> or </li> tags with new line
  html = html.replace(/<li>/g, '- ');
  html = html.replace(/<(.+?)>/g, ''); // remove tags
  html = html.replace(/\n{3,}/g, '\n\n'); // compress new line
  return $('<div/>').html(html).text(); // decode
};

mvelo.EncryptFrame.prototype._getEmailText = function(type) {
  var text, html;
  if (this._emailTextElement.is('textarea')) {
    text = this._emailTextElement.val();
  } else { // html element
    if (type === 'text') {
      this._emailTextElement.focus();
      var element = this._emailTextElement.get(0);
      var sel = element.ownerDocument.defaultView.getSelection();
      sel.selectAllChildren(element);
      text = sel.toString();
      sel.removeAllRanges();
    } else {
      html = this._emailTextElement.html();
      html = html.replace(/\n/g, ''); // remove new lines
      text = html;
    }
  }
  return text;
};

/**
 * Save editor content for later undo
 */
mvelo.EncryptFrame.prototype._saveEmailText = function() {
  if (this._emailTextElement.is('textarea')) {
    this._emailUndoText = this._emailTextElement.val();
  } else {
    this._emailUndoText = this._emailTextElement.html();
  }
};

mvelo.EncryptFrame.prototype._getEmailRecipient = function() {
  var emails = [];
  var emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;
  $('span').filter(':visible').each(function() {
    var valid = $(this).text().match(emailRegex);
    if (valid !== null) {
      // second filtering: only direct text nodes of span elements
      var spanClone = $(this).clone();
      spanClone.children().remove();
      valid = spanClone.text().match(emailRegex);
      if (valid !== null) {
        emails = emails.concat(valid);
      }
    }
  });
  $('input, textarea').filter(':visible').each(function() {
    var valid = $(this).val().match(emailRegex);
    if (valid !== null) {
      emails = emails.concat(valid);
    }
  });
  //console.log('found emails', emails);
  return emails;
};

/**
 * Replace content of editor element (_emailTextElement)
 * @param {string} msg txt or html content
 */
mvelo.EncryptFrame.prototype._setMessage = function(msg, type) {
  if (this._emailTextElement.is('textarea')) {
    // decode HTML entities for type text due to previous HTML parsing
    msg = mvelo.util.decodeHTML(msg);
    this._emailTextElement.val(msg);
  } else {
    // element is contenteditable or RTE
    if (type == 'text') {
      msg = '<pre>' + msg + '<pre/>';
    }
    this._emailTextElement.html(msg);
  }
  // trigger input event
  var inputEvent = document.createEvent('HTMLEvents');
  inputEvent.initEvent('input', true, true);
  this._emailTextElement.get(0).dispatchEvent(inputEvent);
};

mvelo.EncryptFrame.prototype._resetEmailText = function() {
  if (this._emailTextElement.is('textarea')) {
    this._emailTextElement.val(this._emailUndoText);
  } else {
    this._emailTextElement.html(this._emailUndoText);
  }
  this._emailUndoText = null;
};

mvelo.EncryptFrame.prototype._registerEventListener = function() {
  var that = this;
  this._port.onMessage.addListener(function(msg) {
    //console.log('eFrame-%s event %s received', that.id, msg.event);
    switch (msg.event) {
      case 'email-text':
        that._port.postMessage({
          event: 'eframe-email-text',
          data: that._getEmailText(msg.type),
          action: msg.action,
          sender: 'eFrame-' + that.id
        });
        break;
      case 'destroy':
        that._closeFrame(true);
        break;
      case 'recipient-proposal':
        that._port.postMessage({
          event: 'eframe-recipient-proposal',
          data: that._getEmailRecipient(),
          sender: 'eFrame-' + that.id
        });
        break;
      case 'set-editor-output':
        that._saveEmailText();
        that._normalizeButtons();
        that._setMessage(msg.text, 'text');
        break;
      default:
        console.log('unknown event', msg);
    }
  });
  this._port.onDisconnect.addListener(function(msg) {
    that._closeFrame(false);
  });
};

mvelo.EncryptFrame.isAttached = function(element) {
  var status = element.data(mvelo.FRAME_STATUS);
  switch (status) {
    case mvelo.FRAME_ATTACHED:
    case mvelo.FRAME_DETACHED:
      return true;
    default:
      return false;
  }
};

/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2014-2015 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var mvelo = mvelo || {};

mvelo.DecryptContainer = function(selector, keyringId, options) {
  this.selector = selector;
  this.keyringId = keyringId;
  this.options = options;
  this.id = mvelo.util.getHash();
  this.name = 'decryptCont-' + this.id;
  this.port = mvelo.extension.connect({name: this.name});
  this.registerEventListener();
  this.parent = null;
  this.container = null;
  this.armored = null;
  this.done = null;
};

mvelo.DecryptContainer.prototype.create = function(armored, done) {
  this.armored = armored;
  this.done = done;
  this.parent = document.querySelector(this.selector);
  this.container = document.createElement('iframe');
  var url;
  if (mvelo.crx) {
    url = mvelo.extension.getURL('common/ui/inline/dialogs/decryptInline.html?id=' + this.id);
  } else if (mvelo.ffa) {
    url = 'about:blank?mvelo=decryptInline&id=' + this.id;
  }
  this.container.setAttribute('src', url);
  this.container.setAttribute('frameBorder', 0);
  this.container.setAttribute('scrolling', 'no');
  this.container.style.width = '100%';
  this.container.style.height = '100%';
  this.parent.appendChild(this.container);
};

mvelo.DecryptContainer.prototype.registerEventListener = function() {
  var that = this;
  this.port.onMessage.addListener(function(msg) {
    switch (msg.event) {
      case 'destroy':
        that.parent.removeChild(this.container);
        that.port.disconnect();
        break;
      case 'error-message':
        that.done(msg.error);
        break;
      case 'get-armored':
        that.port.postMessage({
          event: 'set-armored',
          data: that.armored,
          keyringId: that.keyringId,
          options: that.options,
          sender: that.name
        });
        break;
      case 'decrypt-done':
        that.done();
        break;
      default:
        console.log('unknown event', msg);
    }
  });
};

/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2014-2015 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var mvelo = mvelo || {};

mvelo.EditorContainer = function(selector, keyringId, options) {
  this.selector = selector;
  this.keyringId = keyringId;
  this.options = options;
  this.id = mvelo.util.getHash();
  this.name = 'editorCont-' + this.id;
  this.port = mvelo.extension.connect({name: this.name});
  this.registerEventListener();
  this.parent = null;
  this.container = null;
  this.done = null;
  this.encryptCallback = null;
  this.createDraftCallback = null;
};

mvelo.EditorContainer.prototype.create = function(done) {
  this.done = done;
  this.parent = document.querySelector(this.selector);
  this.container = document.createElement('iframe');
  var url;
  var quota = '';
  if (this.options.quota) {
    quota = '&quota=' + this.options.quota;
  }

  if (mvelo.crx) {
    url = mvelo.extension.getURL('common/ui/editor/editor.html?id=' + this.id + quota + '&embedded=true');
  } else if (mvelo.ffa) {
    url = 'about:blank?mvelo=editor&id=' + this.id + quota + '&embedded=true';
  }
  this.container.setAttribute('src', url);
  this.container.setAttribute('frameBorder', 0);
  this.container.setAttribute('scrolling', 'no');
  this.container.style.width = '100%';
  this.container.style.height = '100%';
  this.parent.appendChild(this.container);
};

mvelo.EditorContainer.prototype.encrypt = function(recipients, callback) {
  this.checkInProgress();
  this.port.postMessage({
    event: 'editor-container-encrypt',
    sender: this.name,
    keyringId: this.keyringId,
    recipients: recipients
  });
  this.encryptCallback = callback;
};

mvelo.EditorContainer.prototype.createDraft = function(callback) {
  this.checkInProgress();
  this.port.postMessage({
    event: 'editor-container-create-draft',
    sender: this.name,
    keyringId: this.keyringId
  });
  this.createDraftCallback = callback;
};

mvelo.EditorContainer.prototype.checkInProgress = function() {
  if (this.encryptCallback || this.createDraftCallback) {
    var error = new Error('Encyption already in progress.');
    error.code = 'ENCRYPT_IN_PROGRESS';
    throw error;
  }
};

mvelo.EditorContainer.prototype.processOptions = function() {
  var error;
  if (this.options.quotedMail && mvelo.main.getMessageType(this.options.quotedMail) !== mvelo.PGP_MESSAGE ||
      this.options.armoredDraft && mvelo.main.getMessageType(this.options.armoredDraft) !== mvelo.PGP_MESSAGE) {
    error = new Error('quotedMail or armoredDraft parameter need to be a PGP message.');
    error.code = 'WRONG_ARMOR_TYPE';
    return error;
  }
  if (this.options.armoredDraft && (this.options.predefinedText || this.options.quotedMail ||
                                    this.options.quotedMailIndent || this.options.quotedMailHeader)) {
    error = new Error('armoredDraft parameter cannot be combined with parameters: predefinedText, quotedMail, quotedMailIndent, quotedMailHeader.');
    error.code = 'INVALID_OPTIONS';
    return error;
  }

  this.port.postMessage({
    event: 'editor-options',
    sender: this.name,
    keyringId: this.keyringId,
    options: this.options
  });
};

mvelo.EditorContainer.prototype.registerEventListener = function() {
  var that = this;
  this.port.onMessage.addListener(function(msg) {
    switch (msg.event) {
      case 'editor-ready':
        that.done(that.options && that.processOptions(), that.id);
        break;
      case 'destroy':
        that.parent.removeChild(this.container);
        that.port.disconnect();
        break;
      case 'error-message':
        if (that.encryptCallback) {
          that.encryptCallback(msg.error);
          that.encryptCallback = null;
        } else if (that.createDraftCallback) {
          that.createDraftCallback(msg.error);
          that.createDraftCallback = null;
        }
        break;
      case 'encrypted-message':
        if (that.encryptCallback) {
          that.encryptCallback(null, msg.message);
          that.encryptCallback = null;
        } else if (that.createDraftCallback) {
          that.createDraftCallback(null, msg.message);
          that.createDraftCallback = null;
        }
        break;
      default:
        console.log('unknown event', msg);
    }
  });
};

/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2015 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var mvelo = mvelo || {};

mvelo.OptionsContainer = function(selector, keyringId, options) {
  this.selector = selector;
  this.keyringId = keyringId;

  this.email = '';
  if (options && options.email) {
    this.email = '&email=' + encodeURIComponent(options.email);
  }

  this.fullName = '';
  if (options && options.fullName) {
    this.fullName = '&fname=' + encodeURIComponent(options.fullName);
  }

  this.id = mvelo.util.getHash();
  this.parent = null;
  this.container = null;
  this.done = null;
};

mvelo.OptionsContainer.prototype.create = function(done) {
  this.done = done;
  this.parent = document.querySelector(this.selector);
  this.container = document.createElement('iframe');
  var url;
  var options = 'krid=' + encodeURIComponent(this.keyringId) + this.email + this.fullName;
  if (mvelo.crx) {
    url = mvelo.extension.getURL('common/ui/options.html?' + options + '#keyring');
  } else if (mvelo.ffa) {
    url = 'about:blank?mvelo=options&' + options + '#keyring';
  }
  this.container.setAttribute('src', url);
  this.container.setAttribute('frameBorder', 0);
  this.container.setAttribute('style', 'width: 100%; height: 100%; overflow-x: none; overflow-y: auto');
  this.container.addEventListener('load', this.done.bind(this, null, this.id));
  this.parent.appendChild(this.container);
};

/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2015 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var mvelo = mvelo || {};

/**
 *
 * @param {CssSelector} selector - target container
 * @param {string} keyringId - the keyring to use for this operation
 * @param {object} options
 * @constructor
 */
mvelo.KeyGenContainer = function(selector, keyringId, options) {
  this.selector = selector;
  this.keyringId = keyringId;
  this.options = options;
  this.id = mvelo.util.getHash();
  this.name = 'keyGenCont-' + this.id;
  this.port = mvelo.extension.connect({name: this.name});
  this.registerEventListener();
  this.parent = null;
  this.container = null;
  this.done = null;
  this.generateCallback = null;
};

/**
 * Create an iframe
 * @param {function} done - callback function
 * @returns {mvelo.KeyGenContainer}
 */
mvelo.KeyGenContainer.prototype.create = function(done) {
  var url;

  this.done = done;
  this.parent = document.querySelector(this.selector);
  this.container = document.createElement('iframe');

  if (mvelo.crx) {
    url = mvelo.extension.getURL('common/ui/inline/dialogs/keyGenDialog.html?id=' + this.id);
  } else if (mvelo.ffa) {
    url = 'about:blank?mvelo=keyGenDialog&id=' + this.id;
  }

  this.container.setAttribute('src', url);
  this.container.setAttribute('frameBorder', 0);
  this.container.setAttribute('scrolling', 'no');
  this.container.style.width = '100%';
  this.container.style.height = '100%';

  while (this.parent.firstChild) {
    this.parent.removeChild(this.parent.firstChild);
  }
  this.parent.appendChild(this.container);
  return this;
};

/**
 * Generate a key pair and check if the inputs are correct
 * @param {boolean} confirmRequired - generated key only valid after confirm
 * @param {function} generateCallback - callback function
 * @returns {mvelo.KeyGenContainer}
 */
mvelo.KeyGenContainer.prototype.generate = function(confirmRequired, generateCallback) {
  this.generateCallback = generateCallback;
  this.options.confirmRequired = confirmRequired;
  this.port.postMessage({
    event: 'generate-key',
    sender: this.name,
    keyringId: this.keyringId,
    options: this.options
  });
  return this;
};

mvelo.KeyGenContainer.prototype.confirm = function() {
  this.port.postMessage({
    event: 'generate-confirm',
    sender: this.name,
  });
};

mvelo.KeyGenContainer.prototype.reject = function() {
  this.port.postMessage({
    event: 'generate-reject',
    sender: this.name,
  });
};

/**
 * @returns {mvelo.KeyGenContainer}
 */
mvelo.KeyGenContainer.prototype.registerEventListener = function() {
  var that = this;

  this.port.onMessage.addListener(function(msg) {
    switch (msg.event) {
      case 'generate-done':
        that.generateCallback(msg.error, msg.publicKey);
        break;
      case 'dialog-done':
        that.done(null, that.id);
        break;
      default:
        console.log('unknown event', msg);
    }
  });
  return this;
};

/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2015 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var mvelo = mvelo || {};

/**
 *
 * @param {CssSelector} selector - target container
 * @param {string} keyringId - the keyring to use for this operation
 * @param {object} options
 * @constructor
 */
mvelo.KeyBackupContainer = function(selector, keyringId, options) {
  this.selector = selector;
  this.keyringId = keyringId;
  this.options = options;
  this.id = mvelo.util.getHash();
  this.name = 'keyBackupCont-' + this.id;
  this.port = mvelo.extension.connect({name: this.name});
  this.registerEventListener();
  this.parent = null;
  this.container = null;
  this.done = null;
  this.popupDone = null;
  this.host = mvelo.domAPI.host;
};

/**
 * Create an iframe
 * @param {function} done - callback function
 * @returns {mvelo.KeyBackupContainer}
 */
mvelo.KeyBackupContainer.prototype.create = function(done) {
  var url;

  this.done = done;
  this.parent = document.querySelector(this.selector);
  this.container = document.createElement('iframe');

  this.port.postMessage({
    event: 'set-keybackup-window-props',
    sender: this.name,
    host: mvelo.domAPI.host,
    keyringId: this.keyringId,
    initialSetup: (this.options.initialSetup === undefined) ? true : this.options.initialSetup
  });

  if (mvelo.crx) {
    url = mvelo.extension.getURL('common/ui/inline/dialogs/keyBackupDialog.html?id=' + this.id);
  } else if (mvelo.ffa) {
    url = 'about:blank?mvelo=keybackup&id=' + this.id;
  }

  this.container.setAttribute('src', url);
  this.container.setAttribute('frameBorder', 0);
  this.container.setAttribute('scrolling', 'no');
  this.container.style.width = '100%';
  this.container.style.height = '100%';
  this.parent.appendChild(this.container);
  return this;
};

mvelo.KeyBackupContainer.prototype.keyBackupDone = function(done) {
  this.popupDone = done;
  return this;
};

mvelo.KeyBackupContainer.prototype.registerEventListener = function() {
  var that = this;

  this.port.onMessage.addListener(function(msg) {
    switch (msg.event) {
      case 'popup-isready':
        if (that.popupDone) {
          that.popupDone(msg.error);
        }
        break;
      case 'dialog-done':
        that.done(null, that.id);
        break;
      default:
        console.log('unknown event', msg);
    }
  });
  return this;
};

/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2015 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var mvelo = mvelo || {};

/**
 *
 * @param {CssSelector} selector - target container
 * @param {string} keyringId - the keyring to use for this operation
 * @param {object} options
 * @constructor
 */
mvelo.RestoreBackupContainer = function(selector, keyringId, options) {
  this.selector = selector;
  this.keyringId = keyringId;
  this.options = options;
  this.id = mvelo.util.getHash();
  this.name = 'restoreBackupCont-' + this.id;
  this.port = mvelo.extension.connect({name: this.name});
  this.registerEventListener();
  this.parent = null;
  this.container = null;
  this.done = null;
  this.restoreDone = null;
};

/**
 * Create an iframe
 * @param {function} done - callback function
 * @returns {mvelo.RestoreBackupContainer}
 */
mvelo.RestoreBackupContainer.prototype.create = function(done) {
  var url;

  this.done = done;
  this.parent = document.querySelector(this.selector);
  this.container = document.createElement('iframe');

  this.port.postMessage({
    event: 'set-init-data',
    sender: this.name,
    data: {
      keyringId: this.keyringId
    }
  });

  if (mvelo.crx) {
    url = mvelo.extension.getURL('common/ui/inline/dialogs/restoreBackupDialog.html?id=' + this.id);
  } else if (mvelo.ffa) {
    url = 'about:blank?mvelo=restoreBackup&id=' + this.id;
  }

  this.container.setAttribute('src', url);
  this.container.setAttribute('frameBorder', 0);
  this.container.setAttribute('scrolling', 'no');
  this.container.style.width = '100%';
  this.container.style.height = '100%';
  this.parent.appendChild(this.container);
  return this;
};

mvelo.RestoreBackupContainer.prototype.restoreBackupReady = function(done) {
  //console.log('mvelo.RestoreBackupContainer.prototype.restoreBackupReady()');
  this.restoreDone = done;
  return this;
};

mvelo.RestoreBackupContainer.prototype.registerEventListener = function() {
  var that = this;

  this.port.onMessage.addListener(function(msg) {
    switch (msg.event) {
      case 'restore-backup-done':
        if (that.restoreDone) {
          that.restoreDone(msg.error);
        }
        break;
      case 'dialog-done':
        that.port.postMessage({event: 'set-init-data', sender: that.name, data: that.options});
        that.done(null, that.id);
        break;
      default:
        console.log('unknown event', msg);
    }
  });
  return this;
};

/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2015 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var mvelo = mvelo || {};

/**
 *
 * @param {string} keyringId - the keyring to use for this operation
 * @constructor
 */
mvelo.SyncHandler = function(keyringId) {
  this.keyringId = keyringId;
  this.id = mvelo.util.getHash();
  this.name = 'syncHandler-' + this.id;
  this.port = mvelo.extension.connect({name: this.name});
  this.registerEventListener();

  this.port.postMessage({event: 'init', sender: this.name, keyringId: this.keyringId});
};

mvelo.SyncHandler.prototype.syncDone = function(data) {
  //console.log('mvelo.SyncHandler.prototype.restoreDone()', restoreBackup);
  this.port.postMessage({event: 'sync-done', sender: this.name, data: data});
};

/**
 * @returns {mvelo.SyncHandler}
 */
mvelo.SyncHandler.prototype.registerEventListener = function() {
  var that = this;
  this.port.onMessage.addListener(function(msg) {
    switch (msg.event) {
      case 'sync-event':
        mvelo.domAPI.postMessage('sync-event', null, msg, null);
        break;
      default:
        console.log('unknown event', msg);
    }
  });
  return this;
};

/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2014-2015 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var mvelo = mvelo || {};

mvelo.domAPI = {};

mvelo.domAPI.active = false;

mvelo.domAPI.containers = new Map();

mvelo.domAPI.host = null;

// must be a singelton
mvelo.syncHandler = null;

mvelo.domAPI.init = function() {
  this.active = mvelo.main.watchList.some(function(site) {
    return site.active && site.frames && site.frames.some(function(frame) {
      var hostRegex = mvelo.util.matchPattern2RegEx(frame.frame);
      var validHost = hostRegex.test(window.location.hostname);
      if (frame.scan && frame.api && validHost) {
        // host = match pattern without *. prefix
        mvelo.domAPI.host = frame.frame.replace(/^\*\./, '');
        return true;
      }
    });
  });
  if (this.active) {
    var apiTag = document.getElementById('mailvelope-api');
    if (apiTag) {
      if (apiTag.dataset.version !== mvelo.main.prefs.version) {
        window.setTimeout(function() {
          window.dispatchEvent(new CustomEvent('mailvelope-disconnect', { detail: {version: mvelo.main.prefs.version} }));
        }, 1);
      }
      return;
    }
    window.addEventListener('message', mvelo.domAPI.eventListener);
    if (!window.mailvelope) {
      $('<script/>', {
        id: 'mailvelope-api',
        src: mvelo.extension.getURL('common/client-API/mailvelope-client-api.js'),
        'data-version': mvelo.main.prefs.version
      }).appendTo($('head'));
    }
  }
};

mvelo.domAPI.postMessage = function(eventName, id, data, error) {
  window.postMessage({
    event: eventName,
    mvelo_extension: true,
    id: id,
    data: data,
    error: error
  }, window.location.origin);
};

mvelo.domAPI.reply = function(id, error, data) {
  if (error) {
    error = { message: error.message || error, code: error.code  || 'INTERNAL_ERROR' };
  }
  mvelo.domAPI.postMessage('callback-reply', id, data, error);
};

mvelo.domAPI.dataTypes = {
  identifier: 'string',
  selector: 'string',
  armored: 'string',
  options: 'object',
  recipients: 'array',
  emailAddr: 'string',
  dataURL: 'string',
  revision: 'number',
  fingerprint: 'string',
  syncHandlerObj: 'object',
  editorId: 'string',
  generatorId: 'string',
  popupId: 'string',
  syncHandlerId: 'string',
  syncType: 'string',
  syncData: 'object',
  error: 'object',
  restoreId: 'string',
  restoreBackup: 'string',
  id: 'string',
  confirmRequired: 'boolean'
};

mvelo.domAPI.optionsTypes = {
  showExternalContent: 'boolean',
  quota: 'number',
  predefinedText: 'string',
  quotedMail: 'string',
  signMsg: 'boolean',
  quotedMailIndent: 'boolean',
  quotedMailHeader: 'string',
  userIds: 'array',
  keySize: 'number',
  initialSetup: 'boolean',
  senderAddress: 'string',
  restorePassword: 'boolean',
  email: 'string',
  fullName: 'string',
  keepAttachments: 'boolean',
  armoredDraft: 'string'
};

mvelo.domAPI.checkTypes = function(data) {
  var error;
  if (data.id && typeof data.id !== 'string') {
    error = new Error('Type mismatch: data.id should be of type string.');
    error.code = 'TYPE_MISMATCH';
    throw error;
  }
  if (!data.data) {
    return;
  }
  this.enforceTypeWhitelist(data.data, mvelo.domAPI.dataTypes);
  if (data.data.options && typeof data.data.options === 'object') {
    this.enforceTypeWhitelist(data.data.options, mvelo.domAPI.optionsTypes);
  }
};

mvelo.domAPI.enforceTypeWhitelist = function(data, whitelist) {
  var error;
  var parameters = Object.keys(data) || [];
  for (var i = 0; i < parameters.length; i++) {
    var parameter = parameters[i];
    var dataType = whitelist[parameter];
    var value = data[parameter];
    if (dataType === undefined) {
      console.log('Mailvelope client-API type checker: parameter ' + parameter + ' not accepted.');
      delete data[parameter];
      continue;
    }
    if (value === undefined || value === null) {
      continue;
    }
    var wrong = false;
    switch (dataType) {
      case 'array':
        if (!Array.isArray(value)) {
          wrong = true;
        }
        break;
      default:
        if (typeof value !== dataType) {
          wrong = true;
        }
    }
    if (wrong) {
      error = new Error('Type mismatch: ' + parameter + ' should be of type ' + dataType + '.');
      error.code = 'TYPE_MISMATCH';
      throw error;
    }
  }
};

mvelo.domAPI.eventListener = function(event) {
  if (event.origin !== window.location.origin ||
      event.data.mvelo_extension ||
      !event.data.mvelo_client) {
    return;
  }
  //console.log('domAPI eventListener', event.data.event);
  try {
    mvelo.domAPI.checkTypes(event.data);
    var data = event.data.data;
    var keyringId = null;
    if (data && data.identifier) {
      if (data.identifier.indexOf(mvelo.KEYRING_DELIMITER) !== -1) {
        throw {message: 'Identifier invalid.', code: 'INVALID_IDENTIFIER'};
      }
      keyringId = mvelo.domAPI.host + mvelo.KEYRING_DELIMITER + data.identifier;
    }
    switch (event.data.event) {
      case 'get-version':
        mvelo.domAPI.reply(event.data.id, null, mvelo.main.prefs.version);
        break;
      case 'get-keyring':
        mvelo.domAPI.getKeyring(keyringId, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'create-keyring':
        mvelo.domAPI.createKeyring(keyringId, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'display-container':
        mvelo.domAPI.displayContainer(data.selector, data.armored, keyringId, data.options, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'editor-container':
        mvelo.domAPI.editorContainer(data.selector, keyringId, data.options, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'settings-container':
        mvelo.domAPI.settingsContainer(data.selector, keyringId, data.options, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'open-settings':
        mvelo.domAPI.openSettings(keyringId, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'key-gen-container':
        mvelo.domAPI.keyGenContainer(data.selector, keyringId, data.options, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'key-backup-container':
        mvelo.domAPI.keyBackupContainer(data.selector, keyringId, data.options, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'restore-backup-container':
        mvelo.domAPI.restoreBackupContainer(data.selector, keyringId, data.options, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'restore-backup-isready':
        mvelo.domAPI.restoreBackupIsReady(data.restoreId, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'keybackup-popup-isready':
        mvelo.domAPI.keyBackupPopupIsReady(data.popupId, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'generator-generate':
        mvelo.domAPI.generatorGenerate(data.generatorId, data.confirmRequired, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'generator-generate-confirm':
        mvelo.domAPI.generatorConfirm(data.generatorId);
        break;
      case 'generator-generate-reject':
        mvelo.domAPI.generatorReject(data.generatorId);
        break;
      case 'has-private-key':
        mvelo.domAPI.hasPrivateKey(keyringId, data.fingerprint, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'editor-encrypt':
        mvelo.domAPI.editorEncrypt(data.editorId, data.recipients, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'editor-create-draft':
        mvelo.domAPI.editorCreateDraft(data.editorId, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'query-valid-key':
        mvelo.domAPI.validKeyForAddress(keyringId, data.recipients, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'export-own-pub-key':
        mvelo.domAPI.exportOwnPublicKey(keyringId, data.emailAddr, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'import-pub-key':
        mvelo.domAPI.importPublicKey(keyringId, data.armored, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'set-logo':
        mvelo.domAPI.setLogo(keyringId, data.dataURL, data.revision, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'add-sync-handler':
        mvelo.domAPI.addSyncHandler(keyringId, mvelo.domAPI.reply.bind(null, event.data.id));
        break;
      case 'sync-handler-done':
        mvelo.domAPI.syncHandlerDone(data);
        break;
      default:
        console.log('domApi unknown event', event.data.event);
    }
  } catch (err) {
    mvelo.domAPI.reply(event.data.id, err);
  }
};

mvelo.domAPI.getKeyring = function(keyringId, callback) {
  mvelo.extension.sendMessage({
    event: 'get-keyring',
    api_event: true,
    keyringId: keyringId
  }, function(result) {
    callback(result.error, result.data);
  });
};

mvelo.domAPI.createKeyring = function(keyringId, callback) {
  mvelo.extension.sendMessage({
    event: 'create-keyring',
    api_event: true,
    keyringId: keyringId
  }, function(result) {
    callback(result.error, result.data);
  });
};

mvelo.domAPI.displayContainer = function(selector, armored, keyringId, options, callback) {
  var container, error;
  switch (mvelo.main.getMessageType(armored)) {
    case mvelo.PGP_MESSAGE:
      container = new mvelo.DecryptContainer(selector, keyringId, options);
      break;
    case mvelo.PGP_SIGNATURE:
      error = new Error('PGP signatures not supported.');
      error.code = 'WRONG_ARMORED_TYPE';
      throw error;
    case mvelo.PGP_PUBLIC_KEY:
      error = new Error('PGP keys not supported.');
      error.code = 'WRONG_ARMORED_TYPE';
      throw error;
    default:
      error = new Error('No valid armored block found.');
      error.code = 'WRONG_ARMORED_TYPE';
      throw error;
  }
  container.create(armored, callback);
};

mvelo.domAPI.editorContainer = function(selector, keyringId, options, callback) {
  options = options || {};
  if (options.quotedMailIndent === undefined && !options.armoredDraft) {
    options.quotedMailIndent = true;
  }
  if (options.quota) {
    // kilobyte -> byte
    options.quota = parseInt(options.quota) * 1024;
  }
  var container = new mvelo.EditorContainer(selector, keyringId, options);
  this.containers.set(container.id, container);
  container.create(callback);
};

mvelo.domAPI.settingsContainer = function(selector, keyringId, options, callback) {
  var container = new mvelo.OptionsContainer(selector, keyringId, options);
  this.containers.set(container.id, container);
  container.create(callback);
};

mvelo.domAPI.openSettings = function(keyringId, callback) {
  mvelo.extension.sendMessage({
    event: 'open-settings',
    api_event: true,
    keyringId: keyringId
  }, function(result) {
    callback(result.error, result.data);
  });
};

mvelo.domAPI.keyGenContainer = function(selector, keyringId, options, callback) {
  options = options || {};
  if (options.keySize === undefined) {
    options.keySize = 2048;
  }
  var container = new mvelo.KeyGenContainer(selector, keyringId, options);
  this.containers.set(container.id, container);
  container.create(callback);
};

mvelo.domAPI.keyBackupContainer = function(selector, keyringId, options, callback) {
  options = options || {};
  var container = new mvelo.KeyBackupContainer(selector, keyringId, options);
  this.containers.set(container.id, container);
  container.create(callback);
};

mvelo.domAPI.restoreBackupContainer = function(selector, keyringId, options, callback) {
  options = options || {};
  var container = new mvelo.RestoreBackupContainer(selector, keyringId, options);
  this.containers.set(container.id, container);
  container.create(callback);
};

mvelo.domAPI.restoreBackupIsReady = function(restoreId, callback) {
  this.containers.get(restoreId).restoreBackupReady(callback);
};

mvelo.domAPI.keyBackupPopupIsReady = function(popupId, callback) {
  this.containers.get(popupId).keyBackupDone(callback);
};

mvelo.domAPI.generatorGenerate = function(generatorId, confirmRequired, callback) {
  this.containers.get(generatorId).generate(confirmRequired, callback);
};

mvelo.domAPI.generatorConfirm = function(generatorId) {
  this.containers.get(generatorId).confirm();
};

mvelo.domAPI.generatorReject = function(generatorId) {
  this.containers.get(generatorId).reject();
};

mvelo.domAPI.hasPrivateKey = function(keyringId, fingerprint, callback) {
  mvelo.extension.sendMessage({
    event: 'has-private-key',
    api_event: true,
    keyringId: keyringId,
    fingerprint: fingerprint
  }, function(result) {
    callback(result.error, result.data);
  });
};

mvelo.domAPI.editorEncrypt = function(editorId, recipients, callback) {
  this.containers.get(editorId).encrypt(recipients, callback);
};

mvelo.domAPI.editorCreateDraft = function(editorId, callback) {
  this.containers.get(editorId).createDraft(callback);
};

mvelo.domAPI.validKeyForAddress = function(keyringId, recipients, callback) {
  mvelo.extension.sendMessage({
    event: 'query-valid-key',
    api_event: true,
    keyringId: keyringId,
    recipients: recipients
  }, function(result) {
    callback(result.error, result.data);
  });
};

mvelo.domAPI.exportOwnPublicKey = function(keyringId, emailAddr, callback) {
  mvelo.extension.sendMessage({
    event: 'export-own-pub-key',
    api_event: true,
    keyringId: keyringId,
    emailAddr: emailAddr
  }, function(result) {
    callback(result.error, result.data);
  });
};

mvelo.domAPI.importPublicKey = function(keyringId, armored, callback) {
  var error;
  switch (mvelo.main.getMessageType(armored)) {
    case mvelo.PGP_PUBLIC_KEY:
      // ok
      break;
    case mvelo.PGP_PRIVATE_KEY:
      error = new Error('No import of private PGP keys allowed.');
      error.code = 'WRONG_ARMORED_TYPE';
      throw error;
    default:
      error = new Error('No valid armored block found.');
      error.code = 'WRONG_ARMORED_TYPE';
      throw error;
  }
  mvelo.extension.sendMessage({
    event: 'import-pub-key',
    api_event: true,
    keyringId: keyringId,
    armored: armored
  }, function(result) {
    callback(result.error, result.data);
  });
};

mvelo.domAPI.setLogo = function(keyringId, dataURL, revision, callback) {
  var error;
  if (!/^data:image\/png;base64,/.test(dataURL)) {
    error = new Error('Data URL must start with "data:image/png;base64,".');
    error.code = 'LOGO_INVALID';
    throw error;
  }
  if (dataURL.length > 15 * 1024) {
    error = new Error('Data URL string size exceeds 15KB limit.');
    error.code = 'LOGO_INVALID';
    throw error;
  }
  mvelo.extension.sendMessage({
    event: 'set-logo',
    api_event: true,
    keyringId: keyringId,
    dataURL: dataURL,
    revision: revision
  }, function(result) {
    callback(result.error, result.data);
  });
};

mvelo.domAPI.addSyncHandler = function(keyringId, callback) {
  mvelo.syncHandler = mvelo.syncHandler || new mvelo.SyncHandler(keyringId);
  this.containers.set(mvelo.syncHandler.id, mvelo.syncHandler);

  callback(null, mvelo.syncHandler.id);
};

mvelo.domAPI.syncHandlerDone = function(data) {
  var container = this.containers.get(data.syncHandlerId);

  container.syncDone(data);
};
//# sourceURL=cs-mailvelope.js