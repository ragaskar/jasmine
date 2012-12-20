(function() {
  var env = jasmine.getEnv();

  var jasmineInterface = {
    describe: function(description, specDefinitions) {
      return env.describe(description, specDefinitions);
    },

    xdescribe: function(description, specDefinitions) {
      return env.xdescribe(description, specDefinitions);
    },

    it: function(desc, func) {
      return env.it(desc, func);
    },

    xit: function(desc, func) {
      return env.xit(desc, func);
    },

    beforeEach: function(beforeEachFunction) {
      return env.beforeEach(beforeEachFunction);
    },

    afterEach: function(afterEachFunction) {
      return env.afterEach(afterEachFunction);
    },

    expect: function(actual) {
      return env.expect(actual);
    },

    addMatchers: function(matchers) {
      return env.addMatchers(matchers);
    },

    spyOn: function(obj, methodName) {
      return env.spyOn(obj, methodName);
    },

    clock: env.clock,
    setTimeout: env.clock.setTimeout,
    clearTimeout: env.clock.clearTimeout,
    setInterval: env.clock.setInterval,
    clearInterval: env.clock.clearInterval,

    jsApiReporter: new jasmine.JsApiReporter(jasmine)
  };

  if (typeof window == "undefined" && typeof exports == "object") {
    extend(exports, jasmineInterface);
  } else {
    extend(window, jasmineInterface);
  }

  var htmlReporter = new jasmine.NewReporter({
    env: env,
    window: window
  });

  env.addReporter(jasmineInterface.jsApiReporter);
  env.addReporter(htmlReporter);

  var params = queryStringToObject();
  if (params.hasOwnProperty("catch")) {
    env.catchExceptions(params["catch"]);
  }

  env.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };

  var currentWindowOnload = window.onload;

  window.onload = function() {
    if (currentWindowOnload) {
      currentWindowOnload();
    }
    htmlReporter.initialize();
    env.execute();
  };

  function extend(destination, source) {
    for (var property in source) destination[property] = source[property];
    return destination;
  }

  function queryStringToObject() {
    var paramStr = window.location.search.substring(1),
      params = [], paramMap = {};

    if (paramStr.length > 0) {
      params = paramStr.split('&');
      for (var i = 0; i < params.length; i++) {
        var p = params[i].split('=');
        var value = decodeURIComponent(p[1]);
        if (value === "true" || value === "false") {
          value = JSON.parse(value);
        }
        paramMap[decodeURIComponent(p[0])] = value;
      }
    }

    return paramMap;
  }

}());
