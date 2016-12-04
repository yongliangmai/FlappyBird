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
——————————————————————————————————————————————————————————————————————
上面方法也有缺陷：指针在边边时飞机会抖动和闪
解决方法：
					if (game.input.x * 2 < this.myplane.width / 2) { //如果指针位置距离屏幕左边太近，则默认去到最左边
                        this.myplane.x = this.myplane.width / 2
                    } else if (game.input.x * 2 > game.width - this.myplane.width / 2) { //同上，这次是右边
                        this.myplane.x = game.width - this.myplane.width / 2;
                    } else {
                        this.myplane.x = game.input.x * 2;
                    }

                    if (game.input.y * 2 < this.myplane.height / 2) { //如果指针位置距离屏幕上方太近，则默认去到最上方
                        this.myplane.y = this.myplane.height / 2
                    } else if (game.input.y * 2 > game.height - this.myplane.height / 2) { //同上，这次是右边
                        this.myplane.y = game.height - this.myplane.height / 2;
                    } else {
                        this.myplane.y = game.input.y * 2;
                    }

——————————————————————————————————————————————————————————————————————————————————
1）解决了以上缺陷：
增加一个前提：
				this.checkInputIsOnPlane = function() {
                    if ((game.input.x * 2 <= this.myplane.body.x + this.myplane.body.width * 2) && (game.input.x * 2 >= this.myplane.body.x - this.myplane.body.width * 2) &&
                        (game.input.y * 2 <= this.myplane.body.y + this.myplane.body.height * 2) && (game.input.y * 2 >= this.myplane.body.y - this.myplane.body.height * 2)) {
                        return true;
                    } else {
                        return false;
                    }
                }

2）让飞机处于点击位置前方，这样可以在操控飞机时看到飞机，便于躲避子弹，增强了游戏的可操控性。
3）改变了生成敌人的时间间隔，随时间增加，敌人生成间隔会减少，直到一个最小值，增强了游戏的可玩性。

网上素材音乐无法获取