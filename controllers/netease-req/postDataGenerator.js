const encrypter = require('./encrypter');

module.exports = (oriParams) => {
  const cryptedParams = encrypter(oriParams);
  const serialize = (paramObj, splitter, encode) => {
    if (!paramObj)
      return "";
    const paramArr = [];
    for (let key in paramObj) {
      paramArr.push(encodeURIComponent(key) + "=" + (!!encode ? encodeURIComponent(paramObj[key]) : paramObj[key]))
    }
    return paramArr.join(splitter || ",")
  };
  return serialize({
    params: cryptedParams.encText,
    encSecKey: cryptedParams.encSecKey
  }, "&", true);
}
