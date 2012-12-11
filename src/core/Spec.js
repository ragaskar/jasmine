jasmine.Spec = function(attrs) {
  this.failedExpectations = [];
  this.encounteredExpectations = false;
  this.expectationFactory = attrs.expectationFactory;
  this.resultCallback = attrs.resultCallback || function() {};
  this.id = attrs.id;
  this.description = attrs.description || '';
  this.fn = attrs.fn;
  this.beforeFns = attrs.beforeFns || function() {};
  this.afterFns = attrs.afterFns || function() {};
  this.catchingExceptions = attrs.catchingExceptions;
  this.startCallback = attrs.startCallback || function() {};
  this.exceptionFormatter = attrs.exceptionFormatter || function() {};
  this.getSpecName = attrs.getSpecName;
  this.expectationResultFactory = attrs.expectationResultFactory || function() {};
  this.queueRunner = attrs.queueRunner || { execute: function() {}};
  this.catchingExceptions = attrs.catchingExceptions || function() { return true; };
};

jasmine.Spec.prototype.addExpectationResult = function(passed, data) {
  this.encounteredExpectations = true;
  if (!passed) {
    this.failedExpectations.push(data);
  }
};

jasmine.Spec.prototype.expect = function(actual) {
  return this.expectationFactory(actual, this);
};

jasmine.Spec.prototype.execute = function(done) {
  var self = this;
  if (this.disabled) {
    reportResult();
    return;
  }

  var befores = this.beforeFns() || [],
    afters = this.afterFns() || [];
  this.startCallback(this);
  var allFns = befores.concat(this.fn).concat(afters);

  this.queueRunner({
    fns: allFns,
    onException: function(e) {
      self.addExpectationResult(false, self.expectationResultFactory({
        matcherName: "",
        passed: false,
        expected: "",
        actual: "",
        message: self.exceptionFormatter(e),
        trace: e
      }));
    },
    onComplete: reportResult,
    catchingExceptions: self.catchingExceptions // TODO: move this up to env
  });

  function reportResult() {
    if (done) {
      done();
    }
    self.resultCallback({
      id: self.id,
      status: self.status(),
      description: self.description,
      failedExpectations: self.failedExpectations
    });
  }
};

jasmine.Spec.prototype.disable = function() {
  this.disabled = true;
};

jasmine.Spec.prototype.status = function() {
  if (this.disabled) {
    return 'disabled';
  }

  if (!this.encounteredExpectations) {
    return null;
  }

  if (this.failedExpectations.length > 0) {
    return 'failed';
  } else {
    return 'passed';
  }
};

jasmine.Spec.prototype.getFullName = function() {
  return this.getSpecName(this);
};


/*
resultCallback = function() {
  myReporter.report('blah')
  done();
}



var
specFactory = {
  new jasmine.Spec({
    reportResults: multiReporter.reportSpecBlah

  })

}

suiteFactory = {

  new jasmine.Suite...

}
*/
