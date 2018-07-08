// 网易云音乐API调用加密

const CryptoJS = require('crypto-js');
const rsa = require('./rsa');

var biRadixBits = 16, bitsPerDigit = biRadixBits, biRadix = 65536, biHalfRadix = biRadix >>> 1, biRadixSquared = biRadix * biRadix, maxDigitVal = biRadix - 1, maxInteger = 9999999999999998;
// 定值，从网易云音乐 core.js 中获取
const encryptParam = '0CoJUm6Qyw8W8jud';
const keyParam1 = '010001';
const keyParam2 = '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7';
const key = '9eb56913cc311acb3232c4425975e6b16618a8622cf2d718a7c30c92299cc73d66bfa55bff7b95e047caa49efc36326d8598ea97e337538f45778b65d09c6c474954a1f32a84e512fdf331bd91c3e011bc8eeeb6f761aea6b1a707b129493d4cf3f2c4ed9b7c05ff8ba5f2303ccc3cc1260fe243c563cb1523ebd0f5be94e896'

const strangeParam = ["色", "流感", "这边", "弱", "嘴唇", "亲", "开心", "呲牙", "憨笑", "猫", "皱眉", "幽灵", "蛋糕", "发怒", "大哭", "兔子", "星星", "钟情", "牵手", "公鸡", "爱意", "禁止", "狗", "亲亲", "叉", "礼物", "晕", "呆", "生病", "钻石", "拜", "怒", "示爱", "汗", "小鸡", "痛苦", "撇嘴", "惶恐", "口罩", "吐舌", "心碎", "生气", "可爱", "鬼脸", "跳舞", "男孩", "奸笑", "猪", "圈", "便便", "外星", "圣诞"];
const strangeParam1 = ["流泪", "强"];
const strangeParam2 = ["爱心", "女孩", "惊恐", "大笑"];
const strangeParam0 = {"色": "00e0b", "流感": "509f6", "这边": "259df", "弱": "8642d", "嘴唇": "bc356", "亲": "62901", "开心": "477df", "呲牙": "22677", "憨笑": "ec152", "猫": "b5ff6", "皱眉": "8ace6", "幽灵": "15bb7", "蛋糕": "b7251", "发怒": "52b3a", "大哭": "b17a8", "兔子": "76aea", "星星": "8a5aa", "钟情": "76d2e", "牵手": "41762", "公鸡": "9ec4e", "爱意": "e341f", "禁止": "56135", "狗": "fccf6", "亲亲": "95280", "叉": "104e0", "礼物": "312ec", "晕": "bda92", "呆": "557c9", "生病": "38701", "钻石": "14af6", "拜": "c9d05", "怒": "c4f7f", "示爱": "0c368", "汗": "5b7a4", "小鸡": "6bee2", "痛苦": "55932", "撇嘴": "575cc", "惶恐": "e10b4", "口罩": "24d81", "吐舌": "3cfe4", "心碎": "875d3", "生气": "e8204", "可爱": "7b97d", "鬼脸": "def52", "跳舞": "741d5", "男孩": "46b8e", "奸笑": "289dc", "猪": "6935b", "圈": "3ece0", "便便": "462db", "外星": "0a22b", "圣诞": "8e7", "流泪": "01000", "强": "1", "爱心": "0CoJU", "女孩": "m6Qyw", "惊恐": "8W8ju", "大笑": "d"};

function a(a) {
  var d, e, b = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", c = "";
  for (d = 0; a > d; d += 1)
    e = Math.random() * b.length,
      e = Math.floor(e),
      c += b.charAt(e);
  return c
}
function b(a, b) {
  var c = CryptoJS.enc.Utf8.parse(b)
    , d = CryptoJS.enc.Utf8.parse("0102030405060708")
    , e = CryptoJS.enc.Utf8.parse(a)
    , f = CryptoJS.AES.encrypt(e, c, {
    iv: d,
    mode: CryptoJS.mode.CBC
  });
  return f.toString()
}

function d(d, e, f, g) {
  var h = {}
    , i = a(16);
  return h.encText = b(d, g),
    h.encText = b(h.encText, i),
    h.encSecKey = rsa(i, e, f),
    h
}


const BO2x = function(j2x, t2x) {
  try {
    t2x = t2x.toLowerCase();
    if (j2x === null)
      return t2x == "null";
    if (j2x === undefined)
      return t2x == "undefined";
    return Object.prototype.toString.call(j2x).toLowerCase() == "[object " + t2x + "]"
  } catch (e) {
    return !1
  }
};

const k2x = {
  gb4f: function(j2x) {
    return BO2x(j2x, "function")
  },
  bc2x: function(i2x, dr3x, im5r) {
    if (!i2x || !i2x.length || !k2x.gb4f(dr3x))
      return this;
    if (!!i2x.forEach) {
      i2x.forEach(dr3x, im5r);
      return this
    }
    for (let i = 0, l = i2x.length; i < l; i++)
      dr3x.call(im5r, i2x[i], i, i2x);
    return this
  }
};

const k9b = {};

var HE1x = function(i9b, u9l) {
  try {
    u9l = u9l.toLowerCase();
    if (i9b === null) {
      return u9l == "null";
    }
    if (i9b === undefined) {
      return u9l == "undefined";
    }
    const tempObj = {};
    return tempObj.toString.call(i9b).toLowerCase() == "[object " + u9l + "]"
  } catch (e) {
    return !1
  }
};

k9b.bd0x = function(j9a, cC1x, P0x) {
  if (!j9a || !j9a.length || !HE1x(cC1x, 'function'))
    return this;
  if (!!j9a.forEach) {
    j9a.forEach(cC1x, P0x);
    return this
  }
  for (var i = 0, l = j9a.length; i < l; i++)
    cC1x.call(P0x, j9a[i], i, j9a);
  return this
}

const brX3x = function(crL6F) {
  const m9d = [];
  k9b.bd0x(crL6F, function(crK6E) {
    m9d.push(strangeParam0[crK6E])
  });
  return m9d.join("")
};

const encrypter = (data) => {
  return d(JSON.stringify(data), brX3x(strangeParam1), brX3x(strangeParam), brX3x(strangeParam2));
};

module.exports = encrypter
