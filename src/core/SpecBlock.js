jasmine.SpecBlock = function(env, func, spec) {
  jasmine.Block.call(this, env, func, spec);
};

jasmine.util.inherit(jasmine.SpecBlock, jasmine.Block);

jasmine.SpecBlock.prototype.isSpec = function() {
  return true;
};

