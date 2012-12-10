describe("ExceptionFormatter", function() {
  it("defaults to using the exception's toString", function() {
    var fakeException = {
        toString: function() {
          return "A Classic Mistake: you got your foo in my bar"
        }
      },
      message;

    message = jasmine.exceptionFormatter(fakeException);

    expect(message).toEqual('A Classic Mistake: you got your foo in my bar');
  });

  it("adds filename and line number if present (Firefox interface)", function() {
    var fakeException = {
        toString: function() {
          return "A Classic Mistake: you got your foo in my bar"
        },
        fileName: "foo.js",
        lineNumber: "1978"
      },
      message;

    message = jasmine.exceptionFormatter(fakeException);

    expect(message).toEqual('A Classic Mistake: you got your foo in my bar (foo.js:1978)');
  });

  it("adds filename and line number if present (Safari interface)", function() {
    var fakeException = {
        toString: function() {
          return "A Classic Mistake: you got your foo in my bar"
        },
        sourceURL: "http://foo.js",
        line: "1978"
      },
      message;

    message = jasmine.exceptionFormatter(fakeException);

    expect(message).toEqual('A Classic Mistake: you got your foo in my bar (http://foo.js:1978)');
  });
});
