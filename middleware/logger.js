module.exports = function (req, res, next) {
  const current = new Date();

  console.log('customized logger...');
  next();
};
