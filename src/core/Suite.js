jasmine.Suite = function(attrs) {
  this.env = attrs.env;
  this.id = attrs.id;
  this.parentSuite = attrs.parentSuite;
  this.description = attrs.description;
  this.beforeFns = [];
  this.afterFns = [];

  var queueFactory = attrs.queueFactory || function() {
  };
  this.queue = queueFactory();

  this.isSuite = attrs.isSuite || function() {
  };

  this.children_ = []; // TODO: used by current reporters; keep for now
  this.suites = [];
  this.specs = [];
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
  this.queue.add(fn);
};

jasmine.Suite.prototype.addSuite = function(suite) {
  this.children_.push(suite);
  this.suites.push(suite);
  this.env.currentRunner().addSuite(suite);
  this.queue.add(suite);
};

jasmine.Suite.prototype.specComplete = function(specResult) {
  specResult.fullName = this.getFullName() + ' ' + specResult.description + '.';
  specResult.suite = this;
  this.env.removeAllSpies();
  this.env.reporter.reportSpecResults(specResult);
  this.queue.incrementQueue();
};

jasmine.Suite.prototype.children = function() {
  return this.children_;
};

jasmine.Suite.prototype.execute = function(onComplete) {
  var self = this;
  this.queue.start(function() {
    self.finish(onComplete);
  });
};
