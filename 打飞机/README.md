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
网上素材无音乐