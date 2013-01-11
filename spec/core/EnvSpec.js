describe("jasmine.Env", function() {
  var env;
  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;
  });

  describe('ids', function() {
    it('nextSpecId should return consecutive integers, starting at 0', function() {
      expect(env.nextSpecId()).toEqual(0);
      expect(env.nextSpecId()).toEqual(1);
      expect(env.nextSpecId()).toEqual(2);
    });
  });

  describe("reporting", function() {
    var fakeReporter;

    beforeEach(function() {
      fakeReporter = originalJasmine.createSpyObj("fakeReporter", ["log"]);
    });

    describe('version', function() {
      var oldVersion;

      beforeEach(function() {
        oldVersion = jasmine.version_;
      });

      afterEach(function() {
        jasmine.version_ = oldVersion;
      });

      it('should raise an error if version is not set', function() {
        jasmine.version_ = null;
        var exception;
        try {
          env.version();
        }
        catch (e) {
          exception = e;
        }
        expect(exception.message).toEqual('Version not set');
      });

      it("version should return the current version as an int", function() {
        jasmine.version_ = {
          "major": 1,
          "minor": 9,
          "build": 7,
          "revision": 8
        };
        expect(env.version()).toEqual({
          "major": 1,
          "minor": 9,
          "build": 7,
          "revision": 8
        });
      });

      describe("versionString", function() {
        it("should return a stringified version number", function() {
          jasmine.version_ = {
            "major": 1,
            "minor": 9,
            "build": 7,
            "release_candidate": "1",
            "revision": 8
          };
          expect(env.versionString()).toEqual("1.9.7.rc1 revision 8");
        });

        it("should return a nice string when version is unknown", function() {
          jasmine.version_ = null;
          expect(env.versionString()).toEqual("version unknown");
        });
      });
    });

    it("should allow reporters to be registered", function() {
      env.addReporter(fakeReporter);
      env.reporter.log("message");
      expect(fakeReporter.log).toHaveBeenCalledWith("message");
    });
  });

  describe("equality testing", function() {
    describe("with custom equality testers", function() {
      var aObj, bObj, isEqual;

      beforeEach(function() {
        env.addEqualityTester(function(a, b) {
          aObj = a;
          bObj = b;
          return isEqual;
        });
      });

      it("should call the custom equality tester with two objects for comparison", function() {
        env.equals_("1", "2");
        expect(aObj).toEqual("1");
        expect(bObj).toEqual("2");
      });

      describe("when the custom equality tester returns false", function() {
        beforeEach(function() {
          isEqual = false;
        });

        it("should give custom equality testers precedence", function() {
          expect(env.equals_('abc', 'abc')).toBeFalsy();
          var o = {};
          expect(env.equals_(o, o)).toBeFalsy();
        });
      });


      describe("when the custom equality tester returns true", function() {
        beforeEach(function() {
          isEqual = true;
        });

        it("should give custom equality testers precedence", function() {
          expect(env.equals_('abc', 'def')).toBeTruthy();
          expect(env.equals_(true, false)).toBeTruthy();
        });
      });

      describe("when the custom equality tester returns undefined", function() {
        beforeEach(function() {
          isEqual = jasmine.undefined;
        });

        it("should use normal equality rules", function() {
          expect(env.equals_('abc', 'abc')).toBeTruthy();
          expect(env.equals_('abc', 'def')).toBeFalsy();
        });

        describe("even if there are several", function() {
          beforeEach(function() {
            env.addEqualityTester(function(a, b) {
              return jasmine.undefined;
            });
            env.addEqualityTester(function(a, b) {
              return jasmine.undefined;
            });
          });

          it("should use normal equality rules", function() {
            expect(env.equals_('abc', 'abc')).toBeTruthy();
            expect(env.equals_('abc', 'def')).toBeFalsy();
          });
        });
      });

      it("should evaluate custom equality testers in the order they are declared", function() {
        isEqual = false;
        env.addEqualityTester(function(a, b) {
          return true;
        });
        expect(env.equals_('abc', 'abc')).toBeFalsy();
      });
    });
  });
});

describe("jasmine Env (integration)", function() {

  it("Mock clock can be installed and used in tests", function() {
    var setTimeout = jasmine.createSpy('setTimeout'),
      globalTimeoutFn = jasmine.createSpy('globalTimeoutFn'),
      fakeTimeoutFn = jasmine.createSpy('fakeTimeoutFn'),
      env = new jasmine.Env({global: { setTimeout: setTimeout }});

    env.describe("tests", function() {
      env.it("test with mock clock", function() {
        env.clock.install();
        env.clock.setTimeout(fakeTimeoutFn, 100);
        env.clock.tick(100);
      });
      env.it("test without mock clock", function() {
        env.clock.setTimeout(globalTimeoutFn, 100);
      });
    });

    expect(setTimeout).not.toHaveBeenCalled();
    expect(fakeTimeoutFn).not.toHaveBeenCalled();

    env.execute();

    expect(fakeTimeoutFn).toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledWith(globalTimeoutFn, 100);
  });

  it("should be possible to get full name from a spec", function() {
    var env = new jasmine.Env({global: { setTimeout: setTimeout }}),
      topLevelSpec, nestedSpec, doublyNestedSpec;

    env.describe("my tests", function() {
      topLevelSpec = env.it("are sometimes top level", function() {
      });
      env.describe("are sometimes", function() {
        nestedSpec = env.it("singly nested", function() {
        });
        env.describe("even", function() {
          doublyNestedSpec = env.it("doubly nested", function() {
          });
        });
      });
    });

    env.execute();

    expect(topLevelSpec.getFullName()).toBe("my tests are sometimes top level.");
    expect(nestedSpec.getFullName()).toBe("my tests are sometimes singly nested.");
    expect(doublyNestedSpec.getFullName()).toBe("my tests are sometimes even doubly nested.");
  });
});
