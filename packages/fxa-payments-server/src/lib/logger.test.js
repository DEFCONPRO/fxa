/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import Logger from './logger';
import sinon from 'sinon';

var assert = chai.assert;

describe('lib/logger', function () {
  var logger;

  describe('constructor', function () {
    it('should create logger', function () {
      jest.spyOn(console, 'info').mockImplementation(jest.fn());
      sinon.spy(window.console, 'info');

      var information = 'Hello Firefox!';

      logger = new Logger();
      logger.info(information);

      assert.equal(window.console.info.args[0][0], information);
      assert.isNotNull(window.console.info.thisValues[0]);
      window.console.info.restore();
    });
  });

  describe('info', function () {
    beforeEach(function () {
      jest.spyOn(console, 'info').mockImplementation(jest.fn());
      logger = new Logger(window);
      sinon.spy(window.console, 'info');
    });

    afterEach(function () {
      window.console.info.restore();
    });

    it('should log from string', function () {
      var information = 'Information about stuff!';
      logger.info(information);

      assert.equal(window.console.info.args[0][0], information);
      assert.isNotNull(window.console.info.thisValues[0]);
    });

    it('should not throw when logging with undefined console', function () {
      var tempConsole = window.console;
      window.console = undefined;

      logger = new Logger(window);

      assert.doesNotThrow(function () {
        logger.info('Hello Firefox!');
      });

      window.console = tempConsole;
    });
  });

  describe('trace', function () {
    beforeEach(function () {
      jest.spyOn(console, 'trace').mockImplementation(jest.fn());
      logger = new Logger(window);
      sinon.spy(window.console, 'trace');
    });

    afterEach(function () {
      window.console.trace.restore();
    });

    it('should print trace', function () {
      logger.trace();

      assert.equal(window.console.trace.calledOnce, true);
      assert.isNotNull(window.console.trace.thisValues[0]);
    });

    it('should not throw when logging with undefined console', function () {
      var tempConsole = window.console;
      window.console = undefined;

      logger = new Logger(window);

      assert.doesNotThrow(function () {
        logger.trace();
      });

      window.console = tempConsole;
    });
  });

  describe('warn', function () {
    beforeEach(function () {
      jest.spyOn(console, 'warn').mockImplementation(jest.fn());
      logger = new Logger(window);
      sinon.spy(window.console, 'warn');
    });

    afterEach(function () {
      window.console.warn.restore();
    });

    it('should log from string', function () {
      var warning = 'Warning about something!';
      logger.warn(warning);

      assert.equal(window.console.warn.args[0][0], warning);
      assert.isNotNull(window.console.warn.thisValues[0]);
    });

    it('should not throw when logging with undefined console', function () {
      var tempConsole = window.console;
      window.console = undefined;

      logger = new Logger(window);

      assert.doesNotThrow(function () {
        logger.warn('Warning Firefox!');
      });

      window.console = tempConsole;
    });
  });

  describe('error', function () {
    beforeEach(function () {
      jest.spyOn(console, 'error').mockImplementation(jest.fn());
      logger = new Logger(window);
      sinon.spy(window.console, 'error');
    });

    afterEach(function () {
      window.console.error.restore();
    });

    it('should log from string', function () {
      var error = 'Something went really wrong!';
      logger.error(error);

      assert.equal(window.console.error.args[0][0], error);
      assert.isNotNull(window.console.error.thisValues[0]);
    });

    it('should log from object', function () {
      var error = new Error('Something went super wrong!');
      logger.error('Error %s', String(error));

      assert.equal(window.console.error.args[0][0], 'Error %s');
      assert.equal(window.console.error.args[0][1], String(error));
      assert.isNotNull(window.console.error.thisValues[0]);
    });

    it('should not throw when logging with undefined console', function () {
      var tempConsole = window.console;
      window.console = undefined;

      logger = new Logger(window);

      assert.doesNotThrow(function () {
        logger.error('Error Firefox!');
      });

      window.console = tempConsole;
    });
  });
});
