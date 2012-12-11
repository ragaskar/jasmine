jasmine.Suite = function(attrs) {
  this.env = attrs.env;
  this.id = attrs.id;
  this.parentSuite = attrs.parentSuite;
  this.description = attrs.description;
  this.completeCallback = attrs.completeCallback || function() {};
  this.beforeFns = [];
  this.afterFns = [];

  this.isSuite = attrs.isSuite || function() {};

  this.children_ = []; // TODO: used by current reporters; keep for now
  this.suites = []; // TODO: needed?
  this.specs = [];  // TODO: needed?
  this.executionIndex = 0;
};

jasmine.Suite.prototype.getFullName = function() {
  var fullName = this.description;
  for (var parentSuite = this.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite) {
    fullName = parentSuite.description + ' ' + fullName;
  }
  return fullName;
};

jasmine.Suite.prototype.finish = function(onComplete) {
  this.env.reporter.reportSuiteResults(this);
  if (typeof(onComplete) == 'function') {
    onComplete();
  }
};

jasmine.Suite.prototype.beforeEach = function(fn) {
  this.beforeFns.unshift(fn);
};

jasmine.Suite.prototype.afterEach = function(fn) {
  this.afterFns.unshift(fn);
};

jasmine.Suite.prototype.addSpec = function(fn) {
  this.children_.push(fn);
  this.specs.push(fn);
};

jasmine.Suite.prototype.addSuite = function(suite) {
  suite.parentSuite = this;
  this.children_.push(suite);
  this.suites.push(suite);
  this.env.currentRunner().addSuite(suite);
};

jasmine.Suite.prototype.children = function() {
  return this.children_;
};

jasmine.Suite.prototype.specComplete = function(specResult) {
  specResult.fullName = this.getFullName() + ' ' + specResult.description + '.';
  specResult.suite = this;
  this.env.removeAllSpies();
  this.env.reporter.reportSpecResults(specResult);
  this.executionIndex++;
  this.executeNextChild();
};

jasmine.Suite.prototype.execute = function() {
  this.executionIndex = 0;
  this.executeNextChild();
};

jasmine.Suite.prototype.executeNextChild = function() {
  if (this.executionIndex >= this.children_.length) {
    this.env.reporter.reportSuiteResults(this);
    this.completeCallback();
    return;
  }
  this.children_[this.executionIndex].execute();
};

jasmine.Suite.prototype.childrenComplete = function() {

};
