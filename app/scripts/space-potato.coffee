$ = jQuery

IMAGE_PATH = '/images/potato.png'
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
    createjs.Touch.enable @stage

    @potatoes = []
    @$potatoCount = $('[data-app=potatoCount]')

    @inputFile = document.querySelector('#inputFile')
    @inputFile.addEventListener 'change', @changeImage

    @calcScale IMAGE_PATH, (scale) =>
      @scale = scale
      @create 0, 0, @scale
      createjs.Ticker.setFPS 24
      createjs.Ticker.addEventListener 'tick', @tick

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
        console.log reader.result
        IMAGE_PATH = reader.result
        @calcScale reader.result, (scale) =>
          @scale = scale
          @clearStage()
          @create 0, 0, @scale

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
