$ = jQuery

POTATO_IMAGE_PATH = '/images/potato.png'

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

    @$potatoCount = $('[data-app=potatoCount]')
    @$potatoPoint = $('[data-app=potatoPoint]')

    @potatoes = []
    @point = 0
    @create 0, 0, 1

    createjs.Ticker.setFPS 24
    createjs.Ticker.addEventListener 'tick', @tick

  tick: =>
    @$potatoCount.html @potatoes.length
    @$potatoPoint.html @point
    for potato in @potatoes
      potato.update()
    @stage.update()

  create: (x, y, scale) ->
    @calcPoint scale
    potato = new Potato POTATO_IMAGE_PATH, x, y, scale
    @stage.addChild potato
    @potatoes.push potato

  calcPoint: (scale) ->
    @point += switch
      when scale < .01 then 10240
      when scale < .02 then 5120
      when scale < .04 then 2560
      when scale < .06 then 1280
      when scale < .08 then 640
      when scale < .1 then 320
      when scale < .2 then 160
      when scale < .4 then 80
      when scale < .6 then 40
      when scale < .9 then 20
      else 0

###
# @desc
# ポテトモデル
###
class Potato extends createjs.Bitmap

  constructor: (args, x, y, scale) ->
    @initialize args
    @scale = scale
    @radius = 300
    @regX = 300
    @regY = 300
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
