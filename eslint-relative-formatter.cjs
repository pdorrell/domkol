// eslint-relative-formatter.cjs
const path = require('path');
const process = require('process');

module.exports = function(results) {
  let output = '';
  const cwd = process.cwd(); // Get the current working directory where ESLint is run from

  results.forEach(fileResult => {
    const relativeFilePath = path.relative(cwd, fileResult.filePath);

    fileResult.messages.forEach(message => {
      // THIS IS THE CRITICAL LINE FOR OUTPUT FORMAT
      // It should produce plain text for Emacs' compilation mode.
      output += `${relativeFilePath}:${message.line}:${message.column}: ${message.message} (${message.ruleId})\n`;
    });
  });
  return output;
};
