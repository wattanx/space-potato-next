(function() {
  var $, App, BG_IMAGE_PATH, IMAGE_PATH, Potato,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = jQuery;

  IMAGE_PATH = 'images/potato.png';

  BG_IMAGE_PATH = 'images/eso1006a.jpg';


  /*
   * @desc
   * アプリケーションモデル
   */

  App = (function() {
    function App(selector) {
      this.blob = __bind(this.blob, this);
      this.onClickImgTweetBtn = __bind(this.onClickImgTweetBtn, this);
      this.onClickCaptureBtn = __bind(this.onClickCaptureBtn, this);
      this.onClickAppTweetBtn = __bind(this.onClickAppTweetBtn, this);
      this.onClickAppShareBtn = __bind(this.onClickAppShareBtn, this);
      this.onClickShareModalView = __bind(this.onClickShareModalView, this);
      this.changeImage = __bind(this.changeImage, this);
      this.tick = __bind(this.tick, this);
      this.checkParam = __bind(this.checkParam, this);
      this.potatoes = [];
      this.$canvas = document.getElementById(selector);
      this.$canvas.width = $(window).width();
      this.$canvas.height = $(window).height();
      this.stage = new createjs.Stage(selector);
      this.$navigation = $('[data-app=navigation]');
      this.inputFile = document.querySelector('#inputFile');
      this.$shareModalView = $('[data-app=shareModalView]');
      this.$loadView = $('[data-app=loadView]');
      this.$appView = $('[data-app=appView]');
      this.$imgView = $('[data-app=imgView]');
      this.$appShareBtn = $('[data-app=appShareBtn]');
      this.$appTweetBtn = $('[data-app=appTweetBtn]');
      this.$appShareBtn.on('click', this.onClickAppShareBtn);
      this.$appConfirm = this.$appView.find('[data-app=confirm]');
      this.$appLoading = this.$appView.find('[data-app=loading]');
      this.$appTweetBtn.on('click', this.onClickAppTweetBtn);
      this.$captureBtn = $('[data-app=captureBtn]');
      this.$imgConfirm = this.$imgView.find('[data-app=confirm]');
      this.$imgLoading = this.$imgView.find('[data-app=loading]');
      this.$thumb = $('[data-app=thumb]');
      this.$imgTweetBtn = $('[data-app=imgTweetBtn]');
      this.inputFile.addEventListener('change', this.changeImage);
      this.$captureBtn.on('click', this.onClickCaptureBtn);
      this.$shareModalView.on('click', this.onClickShareModalView);
      this.$imgTweetBtn.on('click', this.onClickImgTweetBtn);
      this.setBgImg((function(_this) {
        return function() {
          var param;
          _this.stage.addChild(_this.bgImg);
          param = window.location.search;
          if (param) {
            return _this.checkParam(param, function(path) {
              if (path) {
                return _this.transBase64(path, function(base64) {
                  _this.imgPath = base64;
                  return _this.start();
                });
              } else {
                _this.imgPath = IMAGE_PATH;
                return _this.start();
              }
            });
          } else {
            _this.imgPath = IMAGE_PATH;
            return _this.start();
          }
        };
      })(this));
      createjs.Ticker.setFPS(24);
      createjs.Ticker.addEventListener('tick', this.tick);
      createjs.Touch.enable(this.stage);
    }

    App.prototype.start = function() {
      return this.calcScale(this.imgPath, (function(_this) {
        return function(data) {
          _this.scale = data[0];
          _this.create(0, 0, data[1], data[2], _this.scale);
          _this.$shareModalView.fadeOut(100);
          return _this.$loadView.css('display', 'none');
        };
      })(this));
    };

    App.prototype.checkParam = function(param, cb) {
      var params;
      params = this.getParam(param);
      if (params['ver'] === 'achiku-potato') {
        return cb(this.imgPath = '/images/apotato.png');
      } else {
        return this.getImgur(params['ver'], function(path) {
          if (path !== null) {
            return cb(this.imgPath = path);
          } else {
            return cb(this.imgPath = IMAGE_PATH);
          }
        });
      }
    };

    App.prototype.getImgur = function(id, cb) {
      return $.ajax('https://api.imgur.com/3/image/' + id, {
        type: 'get',
        headers: {
          Authorization: 'Client-ID eaef7ba9b34b1d1'
        },
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            return cb(response.data.link);
          }
        },
        error: function(response) {
          return cb();
        }
      });
    };

    App.prototype.transBase64 = function(imgUrl, cb) {
      var xhr;
      xhr = new XMLHttpRequest();
      xhr.open('GET', imgUrl, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function() {
        var binaryData, bytes, i, imgSrc, path, _i, _ref;
        bytes = new Uint8Array(this.response);
        binaryData = '';
        for (i = _i = 0, _ref = bytes.byteLength; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          binaryData += String.fromCharCode(bytes[i]);
        }
        bytes = new Uint8Array(this.response);
        if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[bytes.byteLength - 2] === 0xff && bytes[bytes.byteLength - 1] === 0xd9) {
          imgSrc = 'data:image/jpeg;base64,';
        } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
          imgSrc = 'data:image/png;base64,';
        } else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
          imgSrc = 'data:image/gif;base64,';
        } else if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
          imgSrc = 'data:image/bmp;base64,';
        } else {
          imgSrc = 'data:image/unknown;base64,';
        }
        path = imgSrc + window.btoa(binaryData);
        return cb(path);
      };
      return xhr.send();
    };

    App.prototype.getParam = function(url) {
      var i, parameters, params, paramsArray, val, _i, _ref;
      parameters = url.split('?');
      params = parameters[1].split('&');
      paramsArray = [];
      for (i = _i = 0, _ref = params.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        val = params[i].split('=');
        paramsArray.push(val[0]);
        paramsArray[val[0]] = val[1];
      }
      return paramsArray;
    };

    App.prototype.setBgImg = function(cb) {
      var img;
      img = new Image();
      img.src = BG_IMAGE_PATH;
      this.bgImg = new createjs.Bitmap(BG_IMAGE_PATH);
      return img.onload = (function(_this) {
        return function() {
          var pos, scale;
          if (_this.$canvas.width > _this.$canvas.height) {
            scale = Math.max(_this.$canvas.width, _this.$canvas.height) / img.width;
            pos = (_this.$canvas.height - img.height * scale) / 2;
            _this.bgImg.y = pos;
          } else {
            scale = Math.max(_this.$canvas.width, _this.$canvas.height) / img.height;
            pos = (_this.$canvas.width - img.width * scale) / 2;
            _this.bgImg.x = pos;
          }
          _this.bgImg.scaleX = scale;
          _this.bgImg.scaleY = scale;
          return cb();
        };
      })(this);
    };

    App.prototype.tick = function() {
      var potato, _i, _len, _ref;
      _ref = this.potatoes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        potato = _ref[_i];
        potato.update();
      }
      return this.stage.update();
    };

    App.prototype.create = function(x, y, w, h, scale) {
      var potatoItem;
      potatoItem = new Potato(this.imgPath, x, y, w, h, scale);
      this.stage.addChild(potatoItem);
      return this.potatoes.push(potatoItem);
    };

    App.prototype.clearStage = function() {
      this.stage.removeAllChildren();
      return this.potatoes = [];
    };

    App.prototype.calcScale = function(imgPath, cb) {
      var img;
      img = new Image();
      img.src = imgPath;
      return img.onload = function() {
        var imgScale, maxSize, scale;
        maxSize = Math.max(img.width, img.height);
        if (maxSize <= 600) {
          imgScale = maxSize / 600;
        } else {
          imgScale = 600 / Math.max(img.width, img.height);
        }
        scale = Math.min(1, $(window).width() / 1000) * imgScale;
        return cb([scale, img.width, img.height]);
      };
    };

    App.prototype.changeImage = function() {
      var file, reader;
      file = this.inputFile.files[0];
      reader = new FileReader();
      if (file.type.match(/image.*/)) {
        reader.readAsDataURL(file);
        return reader.onloadend = (function(_this) {
          return function() {
            _this.$navigation.addClass('isImportFile');
            _this.imgPath = reader.result;
            return _this.calcScale(reader.result, function(data) {
              _this.scale = data[0];
              _this.clearStage();
              _this.stage.addChild(_this.bgImg);
              return _this.create(0, 0, data[1], data[2], _this.scale);
            });
          };
        })(this);
      }
    };

    App.prototype.onClickShareModalView = function(e) {
      if (e.target.className.split(' ')[0] === 'Modal') {
        return this.$shareModalView.fadeOut(200, (function(_this) {
          return function() {
            _this.$appView.css('display', 'none');
            _this.$appConfirm.css('display', 'block');
            _this.$appLoading.css('display', 'none');
            _this.$imgView.css('display', 'none');
            _this.$imgConfirm.css('display', 'block');
            return _this.$imgLoading.css('display', 'none');
          };
        })(this));
      }
    };

    App.prototype.onClickAppShareBtn = function() {
      this.$appView.css('display', 'block');
      this.$appConfirm.css('display', 'block');
      return this.$shareModalView.fadeIn(100);
    };

    App.prototype.onClickAppTweetBtn = function() {
      var img;
      this.$appConfirm.css('display', 'none');
      this.$appLoading.fadeIn(100);
      img = this.imgPath.split(',')[1];
      return this.postImgur(img, (function(_this) {
        return function(url) {
          var hash, path;
          path = url.replace('http://i.imgur.com/', '');
          hash = path.split('.')[0];
          return window.location = 'https://twitter.com/intent/tweet?url=http://ideyuta.com/space-potato/?ver=' + hash + '&via=_space_potato';
        };
      })(this));
    };

    App.prototype.onClickCaptureBtn = function() {
      this.exportImgPath = this.stage.toDataURL('image/jpg');
      return this.blob(this.exportImgPath, (function(_this) {
        return function(blob) {
          var img, url;
          url = window.URL.createObjectURL(blob);
          img = document.createElement('img');
          img.src = url;
          _this.$thumb.html(img);
          _this.$imgView.css('display', 'block');
          _this.$imgConfirm.css('display', 'block');
          return _this.$shareModalView.fadeIn(100);
        };
      })(this));
    };

    App.prototype.onClickImgTweetBtn = function() {
      var img;
      this.$imgConfirm.css('display', 'none');
      this.$imgLoading.fadeIn(100);
      img = this.exportImgPath.split(',')[1];
      return this.postImgur(img, (function(_this) {
        return function(url) {
          _this.$shareModalView.css('display', 'none');
          _this.$imgLoading.css('display', 'none');
          url = url.replace(/.jpg/, '');
          return window.location = 'https://twitter.com/intent/tweet?url=' + url + '&text=Space%20Potato%20http://ideyuta.com/space-potato/&via=_space_potato';
        };
      })(this));
    };

    App.prototype.postImgur = function(img, cb) {
      return $.ajax('https://api.imgur.com/3/image', {
        type: 'post',
        headers: {
          Authorization: 'Client-ID eaef7ba9b34b1d1'
        },
        data: {
          image: img
        },
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            return cb(response.data.link);
          }
        }
      });
    };

    App.prototype.blob = function(base64, cb) {
      var bin, blob, buffer, i, _i, _ref;
      bin = atob(base64.replace(/^.*,/, ''));
      buffer = new Uint8Array(bin.length);
      for (i = _i = 0, _ref = bin.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        buffer[i] = bin.charCodeAt(i);
      }
      blob = new Blob([buffer.buffer], {
        type: 'image/jpg'
      });
      return cb(blob);
    };

    return App;

  })();


  /*
   * @desc
   * ポテトモデル
   */

  Potato = (function(_super) {
    __extends(Potato, _super);

    function Potato(args, x, y, w, h, scale) {
      this.onClickPotato = __bind(this.onClickPotato, this);
      var hitObject;
      this.initialize(args);
      this.scale = scale;
      this.radius = Math.max(w, h) * scale / 2;
      this.regX = w * scale / 2;
      this.regY = h * scale / 2;
      this.distance = this.radius + this.scale;
      this.resize();
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.vx = Math.floor(Math.random() * 16) + 1;
      this.vy = Math.floor(Math.random() * 8) + 1;
      this.addEventListener('click', this.onClickPotato);
      hitObject = new createjs.Shape();
      hitObject.graphics.beginFill("#000000").drawRect(0, 0, w, h);
      this.hitArea = hitObject;
    }

    Potato.prototype.update = function() {
      this.x += this.vx;
      this.y += this.vy;
      this.rotation++;
      return this.wallHit();
    };

    Potato.prototype.wallHit = function() {
      var pos;
      pos = {
        wall: {
          l: 0,
          r: potato.app.stage.canvas.width,
          t: 0,
          b: potato.app.stage.canvas.height
        },
        potato: {
          l: this.x - this.distance,
          r: this.x + this.distance,
          t: this.y - this.distance,
          b: this.y + this.distance
        }
      };
      if (pos.potato.l <= pos.wall.l) {
        this.x = pos.wall.l + this.distance;
        this.vx *= -1;
      } else if (pos.potato.r >= pos.wall.r) {
        this.x = pos.wall.r - this.distance;
        this.vx *= -1;
      }
      if (pos.potato.t <= pos.wall.t) {
        this.y = pos.wall.t + this.distance;
        return this.vy *= -1;
      } else if (pos.potato.b >= pos.wall.b) {
        this.y = pos.wall.b - this.distance;
        return this.vy *= -1;
      }
    };

    Potato.prototype.onClickPotato = function() {
      this.clone();
      return this.resize();
    };

    Potato.prototype.clone = function() {
      return potato.app.create(this.x, this.y, this.w, this.h, this.scale);
    };

    Potato.prototype.resize = function() {
      this.scaleX = this.scale;
      this.scaleY = this.scale;
      this.distance = this.radius * this.scale;
      return this.scale = this.scale / 1.2;
    };

    return Potato;

  })(createjs.Bitmap);

  $(function() {
    return potato.app = new App('canvas');
  });

}).call(this);
