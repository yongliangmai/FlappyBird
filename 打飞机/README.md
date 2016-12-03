# 打飞机
套工作室模板后的打飞机小游戏

###缺陷：
因为缩放原因，enableDrag无法使用，暂时只能由 
					game.input.onDown.add(function(e) {
                        if (e.x < game.width / 4)
                            this.myplane.body.velocity.x = -400;
                        else
                            this.myplane.body.velocity.x = 400;
                    }, this);

                    game.input.onUp.add(function() {
                        this.myplane.body.velocity.x = 0;
                    }, this);
代替。
（以解决以上问题，在update中使用：
this.myplane.x = game.input.x*2;
this.myplane.y = game.input.y*2;
即可让飞机跟着指针移动）

网上素材无音乐