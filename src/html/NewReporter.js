jasmine.NewReporter = function(options) {
  var env = options.env || {},
    doc = options.document || window.document,
    now = options.now || function() { return new Date().getTime();},
    queryString = options.queryString || function() {
      return window.document.location.search.substring(1);
    },
    results = [],
    startTime,
    specsExecuted = 0,
    failureCount = 0,
    htmlReporterMain,
    symbols;

  this.initialize = function() {
    htmlReporterMain = createDom("div", {className: "html-reporter"},
      createDom("div", {className: "banner"},
        createDom("span", {className: "title"}, "Jasmine"),
        createDom("span", {className: "version"}, env.versionString())
      ),
      createDom("ul", {className: "symbol-summary"}),
      createDom("div", {className: "alert"}),
      createDom("div", {className: "results"},
        createDom("div", {className: "failures"})
      )
    );
    doc.body.appendChild(htmlReporterMain);

    symbols = doc.body.getElementsByClassName("symbol-summary")[0];
  };

  var specFilterParam, specFilterPattern;

  this.specFilter = function(spec) {
    if (!isFiltered()) {
      return true;
    }

    var specName = spec.getFullName();

    return !!(specName.match(specFilterPattern));
  };

  var totalSpecsDefined;
  this.jasmineStarted = function(options) {
    totalSpecsDefined = options.totalSpecsDefined || 0;
    startTime = now();
  };

  var summary = createDom("div", {className: "summary"}),
    currentParentNode = summary;

  this.suiteStarted = function(result) {
    if (currentParentNode.getAttribute("class") == "specs") {
      currentParentNode = currentParentNode.parentNode;
    }

    var suiteList =
      createDom("ul", {className: "suite", id: "suite-" + result.id},
        createDom("li", {className: "suite-detail"},
          createDom("a", {href: specHref(result)}, result.description)
        )
      );
    currentParentNode.appendChild(suiteList);
    currentParentNode = suiteList;
  };

  this.suiteDone = function(result) {
    // TODO: test this
    if (currentParentNode == summary) {
      return;
    }

    while (currentParentNode.getAttribute("id") != ("suite-" + result.id)) {
      currentParentNode = currentParentNode.parentNode;
    }

    if (currentParentNode != summary) {
      currentParentNode = currentParentNode.parentNode;
    }
  };

  this.specStarted = function(result) {
    if (currentParentNode.getAttribute("class") == "specs") {
      return;
    }
    var specList = createDom("ul", {className: "specs"});
    currentParentNode.appendChild(specList);
    currentParentNode = specList;
  };

  var failures = [];

  this.specDone = function(result) {
    if (result.status != "disabled") {
      specsExecuted++;
    }

    symbols.appendChild(createDom("li", {
        className: result.status,
        id: "spec_" + result.id}
    ));

    var specNode =
      createDom("li", {className: result.status, id: "spec-" + result.id},
        createDom("a", {
          href: specHref(result),
          title: result.fullName
        }, result.description)
      );
    currentParentNode.appendChild(specNode);

    if (result.status == "failed") {
      failureCount++;

      var failure =
        createDom("div", {className: "spec-detail failed"},
          createDom("a", {className: "description", title: result.fullName, href: specHref(result)}, result.fullName),
          createDom("div", {className: "messages"})
        );
      var messages = failure.childNodes[1];

      for (var i = 0; i < result.failedExpectations.length; i++) {
        var expectation = result.failedExpectations[i];
        var stack = (expectation.trace && expectation.trace.stack) || "";
        messages.appendChild(createDom("div", {className: "result-message"}, expectation.message));
        messages.appendChild(createDom("div", {className: "stack-trace"}, stack));
      }

      failures.push(failure);
    }
  };

  this.jasmineDone = function() {
    var elapsed = now() - startTime;

    var banner = doc.body.getElementsByClassName("banner")[0];
    banner.appendChild(createDom("span", {className: "duration"}, "finished in " + elapsed / 1000 + "s"));

    var alert = doc.body.getElementsByClassName("alert")[0];

    if (specsExecuted < totalSpecsDefined) {
      var skippedMessage = "Ran " + specsExecuted + " of " + totalSpecsDefined + " specs - run all";
      alert.appendChild(
        createDom("span", {className: "bar skipped"},
          createDom("a", {href: "?", title: "Run all specs"}, skippedMessage)
        )
      );
    }
    var statusBarMessage = "" + pluralize("spec", specsExecuted) + ", " + pluralize("failure", failureCount),
      statusBarClassName = "bar " + ((failureCount > 0) ? "failed" : "passed");
    alert.appendChild(createDom("span", {className: statusBarClassName}, statusBarMessage));

    var results = doc.body.getElementsByClassName("results")[0];
    results.appendChild(summary);

    if (failures.length) {
      alert.appendChild(
        createDom('span', {className: "menu bar spec-list"},
          createDom("span", {}, "Spec List | "),
          createDom('a', {className: "failures-menu", href: "#"}, "Failures")));
      alert.appendChild(
        createDom('span', {className: "menu bar failure-list"},
          createDom('a', {className: "spec-list-menu", href: "#"}, "Spec List"),
          createDom("span", {}, " | Failures ")));

      doc.body.getElementsByClassName("failures-menu")[0].onclick = function() {
        setMenuModeTo('failure-list');
      };
      doc.body.getElementsByClassName("spec-list-menu")[0].onclick = function() {
        setMenuModeTo('spec-list');
      };

      setMenuModeTo('failure-list');

      var failureNode = doc.body.getElementsByClassName("failures")[0];
      for (var i = 0; i < failures.length; i++) {
        failureNode.appendChild(failures[i]);
      }
    }
  };

  return this;

  function createDom(type, attrs, childrenVarArgs) {
    var el = document.createElement(type);

    for (var i = 2; i < arguments.length; i++) {
      var child = arguments[i];

      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else {
        if (child) {
          el.appendChild(child);
        }
      }
    }

    for (var attr in attrs) {
      if (attr == "className") {
        el[attr] = attrs[attr];
      } else {
        el.setAttribute(attr, attrs[attr]);
      }
    }

    return el;
  }

  function pluralize(singular, count) {
    var word = (count == 1 ? singular : singular + "s");

    return "" + count + " " + word;
  }

  function specHref(result) {
    return "?spec=" + encodeURIComponent(result.fullName);
  }

  function buildSpecFilter() {
    var paramStr = queryString(),
      params = [], paramMap = {};

    if (paramStr.length > 0) {
      params = paramStr.split('&');
      for (var i = 0; i < params.length; i++) {
        var p = params[i].split('=');
        paramMap[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
      }
    }

    specFilterParam = paramMap.spec || "";
    specFilterPattern = new RegExp(specFilterParam);
  }

  function isFiltered() {
    buildSpecFilter();

    return !!specFilterParam;
  }

  function setMenuModeTo(mode) {
    htmlReporterMain.setAttribute("class", "html-reporter " + mode);
  }
};