$ = jQuery

IMAGE_PATH = '/images/potato.png'
BG_IMAGE_PATH = '/images/eso1006a.jpg'
SIZE = 600

###
# @desc
# アプリケーションモデル
###
class App

  constructor: (selector) ->
    @$canvas = document.getElementById selector
    @$canvas.width = $(window).width()
    @$canvas.height = $(window).height()
    @stage = new createjs.Stage selector
    @potatoes = []
    @$potatoCount = $('[data-app=potatoCount]')
    @inputFile = document.querySelector('#inputFile')
    @$captureBtn = $('[data-app=captureBtn]')
    @$potatoTweet = $('[data-app=potatoTweet]')
    @$potatoImg = $('[data-app=potatoImg]')
    @$potatoTweetBtn = $('[data-app=potatoTweetBtn]')
    @$shareModalView = $('[data-app=shareModalView]')
    @$confirm = $('[data-app=confirm]')
    @$loading = $('[data-app=loading]')
    @$thumb = $('[data-app=thumb]')
    @$tweetBtn = $('[data-app=tweetBtn]')

    @inputFile.addEventListener 'change', @changeImage
    @$shareModalView.on 'click', @onClickShareModalView
    @$captureBtn.on 'click', @onClickCaptureBtn
    @$tweetBtn.on 'click', @onClickTweetBtn

    @setBgImg () =>
      @stage.addChild @bgImg
      @calcScale IMAGE_PATH, (scale) =>
        @scale = scale
        @create 0, 0, @scale
        createjs.Ticker.setFPS 24
        createjs.Ticker.addEventListener 'tick', @tick

    createjs.Touch.enable @stage

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
    @$potatoCount.html @potatoes.length
    for potato in @potatoes
      potato.update()
    @stage.update()

  create: (x, y, scale) ->
    potatoItem = new Potato IMAGE_PATH, SIZE, x, y, scale
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
        IMAGE_PATH = reader.result
        @calcScale reader.result, (scale) =>
          @scale = scale
          @clearStage()
          @stage.addChild @bgImg
          @create 0, 0, @scale

  onClickShareModalView: (e) =>
    if e.target.className.split(' ')[0] == 'Modal'
      @$shareModalView.fadeOut 200, =>
        @$confirm.css 'display', 'block'
        @$loading.css 'display', 'none'

  onClickCaptureBtn: =>
    @imgPath = @stage.toDataURL('image/jpg')
    @blob @imgPath, (blob) =>
      url = window.URL.createObjectURL blob
      img = document.createElement 'img'
      img.src = url
      @$thumb.html img
      @$confirm.css 'display', 'block'
      @$shareModalView.fadeIn 100

  blob: (base64, cb) =>
    bin = atob(base64.replace(/^.*,/, ''))
    buffer = new Uint8Array(bin.length)
    for i in [0..bin.length]
      buffer[i] = bin.charCodeAt(i)
    blob = new Blob([buffer.buffer], { type: 'image/jpg' })
    cb blob

  onClickTweetBtn: =>
    @$confirm.css 'display', 'none'
    @$loading.fadeIn 100
    img = @imgPath.split(',')[1]
    @postImgur img, (url) =>
      @postTwitter url

  postImgur: (img, cb) ->
    $.ajax 'https://api.imgur.com/3/image',
      type: 'post'
      headers: { Authorization: 'Client-ID eaef7ba9b34b1d1' }
      data: { image: img }
      dataType: 'json'
      success: (response) ->
        if response.success
          cb response.data.link

  postTwitter: (url) ->
    @$shareModalView.css 'display', 'none'
    @$loading.css 'display', 'none'
    url = url.replace /.jpg/, ''
    window.open 'https://twitter.com/intent/tweet?url='+url+'&text=potato%20http://space-potato.jp&hashtags=SpacePotato'

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
