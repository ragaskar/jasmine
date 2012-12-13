jasmine.Suite = function(attrs) {
  this.env = attrs.env;
  this.id = attrs.id;
  this.parentSuite = attrs.parentSuite;
  this.description = attrs.description;
  this.completeCallback = attrs.completeCallback || function() {};
  this.resultCallback = attrs.resultCallback || function() {};

  this.beforeFns = [];
  this.afterFns = [];
  this.queueRunner = attrs.queueRunner || function() {};
  this.disabled = false;

  // TODO: dead code
  this.isSuite = attrs.isSuite || function() {};

  this.children_ = []; // TODO: rename
  this.suites = []; // TODO: needed?
  this.specs = [];  // TODO: needed?
};

jasmine.Suite.prototype.getFullName = function() {
  var fullName = this.description;
  for (var parentSuite = this.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite) {
    if (parentSuite.parentSuite) {
      fullName = parentSuite.description + ' ' + fullName;
    }
  }
  return fullName;
};

jasmine.Suite.prototype.disable = function() {
  this.disabled = true;
};

jasmine.Suite.prototype.beforeEach = function(fn) {
  this.beforeFns.unshift(fn);
};

jasmine.Suite.prototype.afterEach = function(fn) {
  this.afterFns.unshift(fn);
};

jasmine.Suite.prototype.addSpec = function(spec) {
  this.children_.push(spec);
  this.specs.push(spec);   // TODO: needed?
};

jasmine.Suite.prototype.addSuite = function(suite) {
  suite.parentSuite = this;
  this.children_.push(suite);
  this.suites.push(suite);    // TODO: needed?
};

jasmine.Suite.prototype.children = function() {
  return this.children_;
};

jasmine.Suite.prototype.execute = function(onComplete) {
  var self = this;
  if (this.disabled) {
    complete();
    return;
  }

  var allFns = [],
    children = this.children_;

  for (var i = 0; i < children.length; i++) {
    allFns.push(wrapChild(i));

    function wrapChild(index) {
      var child = children[index];

      return function(done) {
        child.execute(done)
      }
    }
  }

  this.queueRunner({
    fns: allFns,
    onException: function() {},
    onComplete: complete
  });

  function complete() {
    self.resultCallback({
      id: self.id,
      status: self.disabled ? 'disabled' : '',
      description: self.getFullName()
    });

    if (onComplete) {
      onComplete();
    }
  }
};
