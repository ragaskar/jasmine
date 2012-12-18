describe("New HtmlReporter", function() {

  it("builds the initial DOM elements, including the title banner", function() {
    var env = new jasmine.Env(),
      body = document.createElement("body"),
      fakeDocument = {
        body: body
      },
      reporter = new jasmine.NewReporter({
        env: env,
        document: fakeDocument
      });
    reporter.initialize();

    // Main top-level elements
    var divs = body.getElementsByTagName("div");
    expect(findElement(divs, "html-reporter")).toBeTruthy();
    expect(findElement(divs, "banner")).toBeTruthy();
    expect(findElement(divs, "alert")).toBeTruthy();
    expect(findElement(divs, "results")).toBeTruthy();

    var uls = body.getElementsByTagName("ul");
    expect(findElement(uls, "symbol-summary")).toBeTruthy();

    // title banner
    var banner = body.getElementsByClassName("banner")[0];

    var title = banner.getElementsByClassName("title")[0];
    expect(title.innerHTML).toMatch(/Jasmine/);

    var version = banner.getElementsByClassName("version")[0];
    expect(version.innerHTML).toMatch(/\d+\.\d+\.\d+\srevision\s+\d+/);
  });

  describe("when a spec is done", function() {
    it("reports the status symbol of a disabled spec", function() {
      var env = new jasmine.Env(),
        body = document.createElement("body"),
        fakeDocument = {
          body: body
        },
        reporter = new jasmine.NewReporter({
          env: env,
          document: fakeDocument
        });
      reporter.initialize();

      reporter.specDone({id: 789, status: "disabled"});

      var statuses = body.getElementsByClassName('symbol-summary')[0];
      var specEl = statuses.getElementsByTagName('li')[0];
      expect(specEl.getAttribute("class")).toEqual("disabled");
      expect(specEl.getAttribute("id")).toEqual("spec_789");
    });

    it("reports the status symbol of a passing spec", function() {
      var env = new jasmine.Env(),
        body = document.createElement("body"),
        fakeDocument = {
          body: body
        },
        reporter = new jasmine.NewReporter({
          env: env,
          document: fakeDocument
        });
      reporter.initialize();

      reporter.specDone({id: 123, status: "passed"});

      var statuses = body.getElementsByClassName("symbol-summary")[0];
      var specEl = statuses.getElementsByTagName("li")[0];
      expect(specEl.getAttribute("class")).toEqual("passed");
      expect(specEl.getAttribute("id")).toEqual("spec_123");
    });

    it("reports the status symbol of a failing spec", function() {
      var env = new jasmine.Env(),
        body = document.createElement("body"),
        fakeDocument = {
          body: body
        },
        reporter = new jasmine.NewReporter({
          env: env,
          document: fakeDocument
        });

      reporter.initialize();

      reporter.specDone({
        id: 345,
        status: "failed",
        failedExpectations: []
      });

      var statuses = body.getElementsByClassName('symbol-summary')[0];
      var specEl = statuses.getElementsByTagName('li')[0];
      expect(specEl.getAttribute("class")).toEqual("failed");
      expect(specEl.getAttribute("id")).toEqual("spec_345");
    });
  });

  describe("when Jasmine is done", function() {
    it("reports the run time", function() {
      var env = new jasmine.Env(),
        fakeNow = jasmine.createSpy('fake Date.now'),
        body = document.createElement("body"),
        fakeDocument = {
          body: body
        },
        reporter = new jasmine.NewReporter({
          env: env,
          document: fakeDocument,
          now: fakeNow
        });

      reporter.initialize();

      fakeNow.andReturn(500);
      reporter.jasmineStarted({});
      fakeNow.andReturn(600);
      reporter.jasmineDone();

      var banner = body.getElementsByClassName("banner")[0];
      var duration = banner.getElementsByClassName("duration")[0];
      expect(duration.innerHTML).toMatch(/finished in 0.1s/);
    });

    describe("and all specs pass", function() {
      var env, body, fakeDocument, reporter;
      beforeEach(function() {
        env = new jasmine.Env();
        body = document.createElement("body");
        fakeDocument = {
          body: body
        };
        reporter = new jasmine.NewReporter({
          env: env,
          document: fakeDocument
        });
        reporter.initialize();

        reporter.jasmineStarted({});
        reporter.specDone({
          id: 123,
          description: "with a spec",
          fullName: "A Suite with a spec",
          status: "passed"
        });
        reporter.specDone({
          id: 124,
          description: "with another spec",
          fullName: "A Suite inner suite with another spec",
          status: "passed"
        });
        reporter.jasmineDone();
      });

      it("reports the specs counts", function() {
        var alert = body.getElementsByClassName("alert")[0];
        var alertBars = alert.getElementsByClassName("bar");

        expect(alertBars.length).toEqual(1);
        expect(alertBars[0].getAttribute('class')).toMatch(/passed/);
        expect(alertBars[0].innerHTML).toMatch(/2 specs, 0 failures/);
      });

      it("reports no failure details", function() {
        var specFailure = body.getElementsByClassName("failures")[0];

        expect(specFailure.childNodes.length).toEqual(0);
      });
    });

    describe("and some tests fail", function() {
      var env, body, fakeDocument, reporter;

      beforeEach(function() {
        env = new jasmine.Env();
        body = document.createElement("body");
        fakeDocument = {
          body: body
        };
        reporter = new jasmine.NewReporter({
          env: env,
          document: fakeDocument
        });
        reporter.initialize();

        reporter.jasmineStarted({});
        reporter.specDone({id: 123, status: "passed"});
        reporter.specDone({
          id: 124,
          status: "failed",
          description: "a failing spec",
          fullName: "a suite with a failing spec",
          failedExpectations: [
            {
              message: "a failure message",
              trace: {
                stack: "a stack trace"
              }
            }
          ]
        });
        reporter.jasmineDone();
      });

      it("reports the specs counts", function() {
        var alert = body.getElementsByClassName("alert")[0];
        var alertBars = alert.getElementsByClassName("bar");

        expect(alertBars[0].getAttribute('class')).toMatch(/failed/);
        expect(alertBars[0].innerHTML).toMatch(/2 specs, 1 failure/);
      });

      it("reports failure messages and stack traces", function() {
        var specFailures = body.getElementsByClassName("failures")[0];

        var failure = specFailures.childNodes[0];
        expect(failure.getAttribute("class")).toMatch(/failed/);
        expect(failure.getAttribute("class")).toMatch(/spec-detail/);

        var specLink = failure.childNodes[0];
        expect(specLink.getAttribute("class")).toEqual("description");
        expect(specLink.getAttribute("title")).toEqual("a suite with a failing spec");
        expect(specLink.getAttribute("href")).toEqual("?spec=a%20suite%20with%20a%20failing%20spec");

        var message = failure.childNodes[1].childNodes[0];
        expect(message.getAttribute("class")).toEqual("result-message");
        expect(message.innerHTML).toEqual("a failure message");

        var stackTrace = failure.childNodes[1].childNodes[1];
        expect(stackTrace.getAttribute("class")).toEqual("stack-trace");
        expect(stackTrace.innerHTML).toEqual("a stack trace");
      });

      it("allows switching between failure details and the spec summary", function() {
        var menuBar = body.getElementsByClassName("bar")[1];

        expect(menuBar.getAttribute("class")).not.toMatch(/hidden/);

        var link = menuBar.getElementsByTagName('a')[0];
        expect(link.text).toEqual("Failures");
        expect(link.getAttribute("href")).toEqual("#");
      });

      it("sets the reporter to 'Failures List' mode" , function() {
        var reporterNode = body.getElementsByClassName("html-reporter")[0];
        expect(reporterNode.getAttribute("class")).toMatch("failure-list");
      });
    });

    it("reports the suite and spec summaries", function() {
      var env = new jasmine.Env(),
        body = document.createElement("body"),
        fakeDocument = {
          body: body
        },
        reporter = new jasmine.NewReporter({
          env: env,
          document: fakeDocument
        });
      reporter.initialize();

      reporter.jasmineStarted({});
      reporter.suiteStarted({
        id: 1,
        description: "A Suite",
        fullName: "A Suite"
      });

      reporter.specStarted({id: 123});
      reporter.specDone({
        id: 123,
        description: "with a spec",
        fullName: "A Suite with a spec",
        status: "passed"
      });

      reporter.suiteStarted({
        id: 2,
        description: "inner suite",
        fullName: "A Suite inner suite"
      });

      reporter.specStarted({id: 124});
      reporter.specDone({
        id: 124,
        description: "with another spec",
        fullName: "A Suite inner suite with another spec",
        status: "passed"
      });

      reporter.suiteDone({id: 2});

      reporter.specStarted({id: 209});
      reporter.specDone({
        id: 209,
        description: "with a failing spec",
        fullName: "A Suite inner with a failing spec",
        status: "failed",
        failedExpectations: []
      });

      reporter.suiteDone({id: 1});

      reporter.jasmineDone();
      var summary = body.getElementsByClassName("summary")[0];

      expect(summary.childNodes.length).toEqual(1);

      var outerSuite = summary.childNodes[0];
      expect(outerSuite.childNodes.length).toEqual(4);

      var classes = [];
      for (var i = 0; i < outerSuite.childNodes.length; i++) {
        var node = outerSuite.childNodes[i];
        classes.push(node.getAttribute("class"));
      }
      expect(classes).toEqual(["suite-detail", "specs", "suite", "specs"]);

      var suiteDetail = outerSuite.childNodes[0];
      var suiteLink = suiteDetail.childNodes[0];
      expect(suiteLink.text).toEqual("A Suite");
      expect(suiteLink.getAttribute('href')).toEqual("?spec=A%20Suite");

      var specs = outerSuite.childNodes[1];
      var spec = specs.childNodes[0];
      expect(spec.getAttribute("class")).toEqual("passed");
      expect(spec.getAttribute("id")).toEqual("spec-123");

      var specLink = spec.childNodes[0];
      expect(specLink.text).toEqual("with a spec");
      expect(specLink.getAttribute("href")).toEqual("?spec=A%20Suite%20with%20a%20spec");
      expect(specLink.getAttribute("title")).toEqual("A Suite with a spec");
    });
  });

  // spec filtering

  describe("specFilter", function() {

    it("always returns true if there is no filter", function() {
      var env = new jasmine.Env(),
        body = document.createElement("body"),
        fakeDocument = {
          body: body
        },
        queryString = function() {
          return ""
        },
        reporter = new jasmine.NewReporter({
          env: env,
          document: fakeDocument,
          queryString: queryString
        }),
        fakeSpec = {
          getFullName: function() { return "A suite with a spec"}
        };

      expect(reporter.specFilter(fakeSpec)).toBe(true);
    });

    it("matches a focused spec name", function() {
      var env = new jasmine.Env(),
        body = document.createElement("body"),
        fakeDocument = {
          body: body
        },
        queryString = function() {
          return "spec=A%20suite%20with%20a%20spec"
        },
        reporter = new jasmine.NewReporter({
          env: env,
          document: fakeDocument,
          queryString: queryString
        }),
        fakeMatchingSpec = {
          getFullName: function() { return "A suite with a spec"}
        },
        fakeNonMatchingSpec = {
          getFullName: function() { return "sasquatch"}
        };

      expect(reporter.specFilter(fakeMatchingSpec)).toBe(true);
      expect(reporter.specFilter(fakeNonMatchingSpec)).toBe(false);
    });

    it("matches a substring of a spec name", function() {
      var env = new jasmine.Env(),
        body = document.createElement("body"),
        fakeDocument = {
          body: body
        },
        queryString = function() {
          return "spec=with"
        },
        reporter = new jasmine.NewReporter({
          env: env,
          document: fakeDocument,
          queryString: queryString
        }),
        fakeMatchingSpec = {
          getFullName: function() { return "A suite with a spec"}
        },
        fakeNonMatchingSpec = {
          getFullName: function() { return "sasquatch"}
        };

      expect(reporter.specFilter(fakeMatchingSpec)).toBe(true);
      expect(reporter.specFilter(fakeNonMatchingSpec)).toBe(false);
    });
  });

  describe("when specs are filtered", function() {
    it("shows the count of run specs and defined specs", function() {
      var env = new jasmine.Env(),
        body = document.createElement("body"),
        fakeDocument = {
          body: body
        },
        reporter = new jasmine.NewReporter({
          env: env,
          document: fakeDocument
        });

      reporter.initialize();

      reporter.jasmineStarted({
        totalSpecsDefined: 2
      });
      reporter.specDone({
        id: 123,
        description: "with a spec",
        fullName: "A Suite with a spec",
        status: "passed"
      });
      reporter.specDone({
        id: 124,
        description: "with another spec",
        fullName: "A Suite inner suite with another spec",
        status: "disabled"
      });
      reporter.jasmineDone();

      var skippedBar = body.getElementsByClassName("bar")[0];
      expect(skippedBar.getAttribute("class")).toMatch(/skipped/);

      var runAllLink = skippedBar.childNodes[0];
      expect(runAllLink.getAttribute("href")).toEqual("?");
      expect(runAllLink.text).toMatch(/Ran \d+ of \d+ specs - run all/);
    });
  });

  // passing in the try/catch

  // utility functions
  function findElements(divs, withClass) {
    var els = [];
    for (var i = 0; i < divs.length; i++) {
      if (divs[i].className == withClass) els.push(divs[i]);
    }
    return els;
  }

  function findElement(divs, withClass) {
    var els = findElements(divs, withClass);
    if (els.length > 0) {
      return els[0];
    }
    throw new Error("couldn't find div with class " + withClass);
  }
});