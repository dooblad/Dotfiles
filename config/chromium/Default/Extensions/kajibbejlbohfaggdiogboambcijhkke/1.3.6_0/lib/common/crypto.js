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

define(function(require, exports, module) {

  var mvelo = require('../lib-mvelo').mvelo;

  function randomString(length) {
    var result = '';
    var base = 32;
    var buf = new Uint8Array(length);
    mvelo.util.getDOMWindow().crypto.getRandomValues(buf);
    for (var i = 0; i < buf.length; i++) {
      result += (buf[i] % base).toString(base);
    }
    return result;
  }

  exports.randomString = randomString;

});
