$ = jQuery

IMAGE_PATH = '/images/potato.png'
BG_IMAGE_PATH = '/images/eso1006a.jpg'

###
# @desc
# アプリケーションモデル
###
class App

  constructor: (selector) ->

    # 画像の設定
    param = window.location.search
    if param
      params = @getParam param
      if params['ver'] == 'achiku-potato'
        getImgPath = '/images/apotato.png'
      else
        getImgPath = 'http://i.imgur.com/'+params['ver']+'.jpg'
    @imgPath = getImgPath or IMAGE_PATH
    @potatoes = []

    # キャンバスの設定
    @$canvas = document.getElementById selector
    @$canvas.width = $(window).width()
    @$canvas.height = $(window).height()
    @stage = new createjs.Stage selector

    @$navigation = $('[data-app=navigation]')
    @inputFile = document.querySelector('#inputFile')

    # SHARE
    @$shareModalView = $('[data-app=shareModalView]')
    @$appView = $('[data-app=appView]')
    @$imgView = $('[data-app=imgView]')

    # APP SHARE
    @$appShareBtn = $('[data-app=appShareBtn]')
    @$appTweetBtn = $('[data-app=appTweetBtn]')
    @$appShareBtn.on 'click', @onClickAppShareBtn
    @$appConfirm = @$appView.find('[data-app=confirm]')
    @$appLoading = @$appView.find('[data-app=loading]')
    @$appTweetBtn.on 'click', @onClickAppTweetBtn

    # IMAGE SHARE
    @$captureBtn = $('[data-app=captureBtn]')
    @$imgConfirm = $('[data-app=imgConfirm]')
    @$imgLoading = $('[data-app=imgLoading]')
    @$thumb = $('[data-app=thumb]')
    @$imgTweetBtn = $('[data-app=imgTweetBtn]')
    @inputFile.addEventListener 'change', @changeImage
    @$captureBtn.on 'click', @onClickCaptureBtn
    @$shareModalView.on 'click', @onClickShareModalView
    @$imgTweetBtn.on 'click', @onClickImgTweetBtn

    @loadImg @imgPath, (path) =>
      @imgPath = path
      @setBgImg () =>
        @stage.addChild @bgImg
        @calcScale @imgPath, (scale) =>
          @scale = scale
          @create 0, 0, @scale
          createjs.Ticker.setFPS 24
          createjs.Ticker.addEventListener 'tick', @tick

    createjs.Touch.enable @stage

  #クロスドメイン画像をbase64に変換
  loadImg: (imgUrl, cb) ->
    xhr = new XMLHttpRequest()
    xhr.open('GET', imgUrl, true)
    xhr.responseType = 'arraybuffer'
    xhr.onload = ->
      bytes = new Uint8Array(@.response)
      binaryData = ''
      for i in [0..bytes.byteLength]
        binaryData += String.fromCharCode(bytes[i])
      bytes = new Uint8Array(@.response)
      if (bytes[0] == 0xff && bytes[1] == 0xd8 && bytes[bytes.byteLength-2] == 0xff && bytes[bytes.byteLength-1] == 0xd9)
        imgSrc = 'data:image/jpeg;base64,'
      else if (bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4e && bytes[3] == 0x47)
        imgSrc = 'data:image/png;base64,'
      else if (bytes[0] == 0x47 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x38)
        imgSrc = 'data:image/gif;base64,'
      else if (bytes[0] == 0x42 && bytes[1] == 0x4d)
        imgSrc = 'data:image/bmp;base64,'
      else
        imgSrc = 'data:image/unknown;base64,'
      path = imgSrc + window.btoa binaryData
      cb path
    xhr.send()

  # URLのパース処理
  getParam: (url) ->
    parameters = url.split('?')
    params = parameters[1].split('&')
    paramsArray = []
    for i in [0...params.length]
      val = params[i].split('=')
      paramsArray.push(val[0])
      paramsArray[val[0]] = val[1]
    return paramsArray

  # 背景画像の設定
  setBgImg: (cb) ->
    img = new Image()
    img.src = BG_IMAGE_PATH
    @bgImg = new createjs.Bitmap BG_IMAGE_PATH
    img.onload = =>
      if @$canvas.width > @$canvas.height
        scale = Math.max(@$canvas.width, @$canvas.height) / img.width
        pos = (@$canvas.height - img.height * scale) / 2
        @bgImg.y = pos
      else
        scale = Math.max(@$canvas.width, @$canvas.height) / img.height
        pos = (@$canvas.width - img.width * scale) / 2
        @bgImg.x = pos
      @bgImg.scaleX = scale
      @bgImg.scaleY = scale
      do cb

  tick: =>
    for potato in @potatoes
      potato.update()
    @stage.update()

  create: (x, y, scale) ->
    potatoItem = new Potato @imgPath, 600, x, y, scale
    @stage.addChild potatoItem
    @potatoes.push potatoItem

  clearStage: ->
    @stage.removeAllChildren()
    @potatoes = []

  calcScale: (imgPath, cb) ->
    img = new Image()
    img.src = imgPath
    img.onload = ->
      imgScale = 600 / Math.max(img.width, img.height)
      scale = Math.min(1, $(window).width() / 1000) * imgScale
      cb scale

  changeImage: =>
    file = @inputFile.files[0]
    reader = new FileReader()
    if file.type.match(/image.*/)
      reader.readAsDataURL file
      reader.onloadend = =>
        @$navigation.addClass 'isImportFile'
        @imgPath = reader.result
        @calcScale reader.result, (scale) =>
          @scale = scale
          @clearStage()
          @stage.addChild @bgImg
          @create 0, 0, @scale

  ##
  # SHARE
  ##
  onClickShareModalView: (e) =>
    if e.target.className.split(' ')[0] == 'Modal'
      @$shareModalView.fadeOut 200, =>
        @$appView.css 'display', 'none'
        @$appConfirm.css 'display', 'block'
        @$appLoading.css 'display', 'none'
        @$imgView.css 'display', 'none'
        @$imgConfirm.css 'display', 'block'
        @$imgLoading.css 'display', 'none'

  # APP SHARE
  onClickAppShareBtn: =>
    @$appView.css 'display', 'block'
    @$appConfirm.css 'display', 'block'
    @$shareModalView.fadeIn 100

  onClickAppTweetBtn: =>
    @$appConfirm.css 'display', 'none'
    @$appLoading.fadeIn 100
    img = @imgPath.split(',')[1]
    @postImgur img, (url) =>
      path = url.replace 'http://i.imgur.com/', ''
      hash = path.split('.')[0]
      window.location = 'https://twitter.com/intent/tweet?url=http://ideyuta.github.io/space-potato/?ver='+hash+'&hashtags=SpacePotato'

  # IMAGE SHARE
  onClickCaptureBtn: =>
    @exportImgPath = @stage.toDataURL('image/jpg')
    @blob @exportImgPath, (blob) =>
      url = window.URL.createObjectURL blob
      img = document.createElement 'img'
      img.src = url
      @$thumb.html img
      @$imgView.css 'display', 'block'
      @$imgConfirm.css 'display', 'block'
      @$shareModalView.fadeIn 100

  onClickImgTweetBtn: =>
    @$imgConfirm.css 'display', 'none'
    @$imgLoading.fadeIn 100
    img = @exportImgPath.split(',')[1]
    @postImgur img, (url) =>
      @$shareModalView.css 'display', 'none'
      @$imgLoading.css 'display', 'none'
      url = url.replace /.jpg/, ''
      window.location = 'https://twitter.com/intent/tweet?url='+url+'&text=potato%20http://space-potato.jp&hashtags=SpacePotato'

  # imgurへ画像を投稿してURLを返す
  postImgur: (img, cb) ->
    $.ajax 'https://api.imgur.com/3/image',
      type: 'post'
      headers: { Authorization: 'Client-ID eaef7ba9b34b1d1' }
      data: { image: img }
      dataType: 'json'
      success: (response) ->
        if response.success
          cb response.data.link

  blob: (base64, cb) =>
    bin = atob(base64.replace(/^.*,/, ''))
    buffer = new Uint8Array(bin.length)
    for i in [0..bin.length]
      buffer[i] = bin.charCodeAt(i)
    blob = new Blob([buffer.buffer], { type: 'image/jpg' })
    cb blob

###
# @desc
# ポテトモデル
###
class Potato extends createjs.Bitmap

  constructor: (args, size, x, y, scale) ->
    @initialize args
    @scale = scale
    @radius = size / 2
    @regX = size / 2
    @regY = size / 2
    @distance = @radius + @scale
    @resize()
    @x = x
    @y = y
    @vx = Math.floor(Math.random() * 16) + 1
    @vy = Math.floor(Math.random() * 8) + 1
    @.addEventListener 'click', @onClickPotato
    hitObject = new createjs.Shape()
    hitObject .graphics.beginFill("#000000").drawRect(0, 0, size, size)
    @hitArea = hitObject

  update: ->
    @x += @vx
    @y += @vy
    @rotation++
    @wallHit()

  wallHit: ->
    pos =
      wall:
        l: 0,
        r: potato.app.stage.canvas.width,
        t: 0,
        b: potato.app.stage.canvas.height
      ,
      potato:
        l: @x - @distance,
        r: @x + @distance,
        t: @y - @distance,
        b: @y + @distance
    if pos.potato.l <= pos.wall.l
      @x = pos.wall.l + @distance
      @vx *= -1
    else if pos.potato.r >= pos.wall.r
      @x = pos.wall.r - @distance
      @vx *= -1
    if pos.potato.t <= pos.wall.t
      @y = pos.wall.t + @distance
      @vy *= -1
    else if pos.potato.b >= pos.wall.b
      @y = pos.wall.b - @distance
      @vy *= -1

  onClickPotato: =>
    @clone()
    @resize()

  clone: ->
    potato.app.create @x, @y, @scale

  resize: ->
    @.scaleX = @scale
    @.scaleY = @scale
    @distance = @radius * @scale
    @scale = @scale / 1.2

$ ->
  potato.app = new App 'canvas'
