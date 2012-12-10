jasmine.exceptionFormatter = function(e) {
  var file = e.fileName || e.sourceURL || '',
    line = e.lineNumber || e.line || '',
    message = e.toString();

  if (file.length && line.length) {
    message += ' ('
      + file
      + ':'
      + line
      + ')';
  }

  return message;
};
