/**-----------------------------------------------
 *
 * 分数类/通关类游戏框架 Phaser
 * game_tpl type=1
 *
 * 注意事项（请仔细阅读）：
 * 1.获取窗口大小window.innerWidth、window.innerHeight时，使用game_width, game_height来代替，本地开发时将自定义这两个变量。
 * 2.注释带“测试用”的代码块要认真阅读，如无特别说明，上线时应将代码块注释。
 * 3.注释带“上线用”的代码块要认真阅读，如无特别说明，上线时应取消代块的注释。
 * 4.游戏场景基本分为加载（preload）、开始（create）、游戏（play）、结束（end），实际情况则根据游戏内容而定，开发时要注意场景之间切换所需要做的操作。
 * 5.接入平台后能获取的全局变量说明：（以下参数请勿修改）
 *      game_width   Number     游戏宽度
 *      game_height  Number     游戏高度
 *      case_tag     Boolean    是否为案例
 *      skip         Boolean    是否跳过开始界面和结束界面，并循环游戏
 *      configJson   Object     游戏配置表
 *      tpl_info     Object     模板信息（数据库表：game_tpl）
 *      game_info    Object     游戏信息（数据库表：custom_game）
 *      bestScore    Number     最高得分/关卡数（抽奖类可忽略）
 *      game_test    Number     0-正式环境 1-测试环境
 *      gift_config  Array      游戏奖品配置
 *      game_type    Number     游戏类型（对应game_tpl中的type）
 *      best_rank    Number     最高排名（通关类、抽奖类可忽略）
 *      play_times   Number     游戏次数
 *      left_times   Number     剩余可游戏次数（若为-1，则表示无限次）
 *      first_play   Number     0-不是第一次游戏 1-第一次游戏
 * 6.新建游戏配置表请务必注意复制的是不是最新的配置，以免有字段的遗漏或丢失。
 *
 * 关于平台调用游戏操作：
 * 1.开始按钮
 *      game.state.start('play');
 * 2.再玩一次按钮
 *      game.state.start('play');
 *      game.paused = false;
 * 3.点击暂停蒙版（仅在工作台中会显示）
 *      game.paused = false;
 *
 * 关于游戏调用平台操作：
 * 1.加载完毕，显示提示框
 *      showBox()
 *
 * 关于平台的接入，请参考文档：
 * https://docs.google.com/document/d/1wJZly0FEdk5rYvRNmh2wclIWEBBz_N8ayYrik1wLZ-U/edit
 *
 * 关于framework的维护：
 * 1.如有对framework进行修改，则须在提交SVN前跟开发人员说明，以免造成沟通上的失误。
 * 2.如有新的注意事项，请添加到头部的代码说明中。
 *
 * -----------------------------------------------*/

// 测试用 - 启动游戏
var gameManager;
$(document).ready(function(){
    gameManager = new Game();
    gameManager.init();
});
var game_width = game_width;
var game_height = game_height;

var Game = function(bestScore, config ,domId) {
    this.bestScore = bestScore || 0;
    this.config = config;
    this.domId = domId || '';
};
Game.prototype = {
    
    isInit : false,
    // 音乐管理器
    musicManager : null,
    // 插入的domId
    domId : null,
    // 设备信息
    device : {
        type : null,
        platform : null,
        width : 0,
        height : 0
    },
    // 画布大小
    canvasSize : {
        width : 0,
        height : 0,
        ratio : 0
    },
    // phaser游戏对象实例
    instance : null,

    // 初始化-设备信息
    initDevice : function() {
        this.device.width = game_width;
        this.device.height = game_height;
        if (game_width > game_height) {
            this.device.width = game_height;
            this.device.height = game_width;
        }
        this.device.platform = (navigator.userAgent.toLowerCase().indexOf('android') < 0) ? 'apple' : 'android';
        this.device.type = (this.device.width > 700) ? 'pad' : 'mobile';
    },
    // 初始化-画布大小
    initCanvasSize : function() {
        if (game_width < game_height) {
            this.canvasSize.width = game_width * 2;
            this.canvasSize.height = game_height * 2;
            this.canvasSize.ratio = this.canvasSize.width/this.canvasSize.height;
        }
    },
    // 初始化-游戏
    init : function() {
        var self = this;
        // 初始化设备信息
        this.initDevice();
        // 初始化画布大小
        this.initCanvasSize();
        // 设置已进入初始化阶段
        this.isInit = true;
        // 创建游戏实例
        this.instance = new Phaser.Game(320, 505, Phaser.CANVAS, 'game');
        // 创建游戏状态
        this.instance.States = {};

        var game = this.instance;
        // State - boot
        // 加载加载页所需资源
        game.States.boot = function() {
            this.preload = function() {
                // 设置画布大小
                $(game.canvas).css("width", self.canvasSize.width/2);
                $(game.canvas).css("height", self.canvasSize.height/2);
                // 设置默认背景颜色
                //game.stage.backgroundColor = '#aaa';
                game.load.image('loading','assets/preloader.gif');
            };
            this.create = function() {
                // 进入preload状态
                game.state.start('preload');
            };
        };

        // State - preload
        // 加载游戏所需资源
        game.States.preload = function() {
            this.preload = function() {
                // 上线用 - 说明：加载页面至少显示3秒，由deadline控制是否允许进入下一个状态
                // var deadLine = false;
                // setTimeout(function() {
                //  deadLine = true;
                // }, 3000);
                // 加载完成回调
                // 
                var preloadSprite = game.add.sprite(35,game.height/2,'loading');
                game.load.setPreloadSprite(preloadSprite);

                game.load.image('background','assets/background.png'); //背景
                game.load.image('ground','assets/ground.png'); //地面
                game.load.image('title','assets/title.png'); //游戏标题
                game.load.image('btn','assets/start-button.png');  //按钮

                game.load.spritesheet('bird','assets/bird.png',34,24,3); //鸟        
                game.load.spritesheet('pipe','assets/pipes.png',54,320,2); //管道
                game.load.spritesheet('medals','assets/medals.png',44,46,2); //奖牌       

                game.load.audio('fly_sound', 'assets/flap.wav');//飞翔的音效
                game.load.audio('score_sound', 'assets/score.wav');//得分的音效
                game.load.audio('hit_pipe_sound', 'assets/pipe-hit.wav'); //撞击管道的音效
                game.load.audio('hit_ground_sound', 'assets/ouch.wav'); //撞击地面的音效

                game.load.image('ready_text','assets/get-ready.png');//ready文字
                game.load.image('play_tip','assets/instructions.png'); //提示图片
                game.load.image('game_over','assets/gameover.png'); //gameover文字图片
                game.load.image('score_board','assets/scoreboard.png'); //得分榜
                
            };
            this.create = function(){
                 game.state.start('menu');  //调用menu场景
            }
        };

        game.States.menu = function(){
            this.create = function(){
                game.add.tileSprite(0,0,game.width,game.height,'background').autoScroll(-10,0);  //加入背景瓦片图，并向左滚动
                game.add.tileSprite(0,game.height-112,game.width,112,'ground').autoScroll(-100,0); //加入地面瓦片图，并向左滚动

                var titleGroup = game.add.group();  //创建标题组，用于存储标题和小鸟图标 
                titleGroup.x = 50;
                titleGroup.y = 100;
                titleGroup.create(0,0,'title');  //把标题加入标题组
                var bird = titleGroup.create(190,10,'bird');  //把小鸟图标进入标题组，包括全部3帧
                bird.animations.add('fly');  //小鸟加入动画，默认包括全部3帧
                bird.animations.play('fly',10,true)  //小鸟图标播放动画，速度为12帧每秒，循环
                game.add.tween(titleGroup).to({y:120},1000,null,true,0,Number.MAX_VALUE,true); //创造标题组动画：向下移动到120像素，时间长度为1秒，没有ease函数，默认为匀速移动，自动开始，没有延迟，不断重复往返运动

                var btn = game.add.button(game.width/2,game.height/2,'btn',function(){  //创建按钮，图片为btn，位于画布中央，
                    game.state.start('play');           //点击按钮后调用play场景
                })
                btn.anchor.setTo(0.5,0.5);  //让按钮的中心位于画布中央      
            }
        }


        // State - play
        // 游戏界面
        game.States.play = function(){
            this.create = function(){
                // 上线用
                // if(self.config['game']['bg'].indexOf('#') == 0){
                //  game.stage.backgroundColor = self.config['game']['bg'];
                // } else {
                //  var bg = game.add.image(0, 0, "bg");
                //  bg.width = self.canvasSize.width;
                //  bg.height = self.canvasSize.height;
                // }

                // 此处写游戏逻辑

                // 上线用 - 如果暂停蒙版正在显示，则暂停
                // if ($(".pause-mask").css("display") == "block") game.paused = true;

                // 上线用 - 提交分数
                // if (skip) {
                //  game.state.start('play');
                // } else {
                //  setGameScore({
                //      'game_score':score,
                //      'game_id':game_info['game_id'],
                //      'device_type':self.device.platform
                //  });
                //  game.state.start('end');
                // }
                this.bg = game.add.tileSprite(0,0,game.width,game.height,'background');
                this.ground = game.add.tileSprite(0,game.height-112,game.width,112,'ground');
                
                this.pipeGroup = game.add.group();
                this.pipeGroup.enableBody = true;  //该组内所有内容开启物理系统，默认物理系统为physicsBodyType

                this.ground = game.add.tileSprite(0,game.height-112,game.width,112,'ground'); //ground放在pipeGroup后面定义，这样地面可以覆盖管道
                this.scoreText = game.add.text(game.world.centerX-20, 30, '0', 36);  //跟上面同理

                this.bird = game.add.sprite(50,150,'bird');
                this.bird.animations.add('fly');
                this.bird.animations.play('fly',10,true);
                this.bird.anchor.setTo(0.5,0.5);
                game.physics.enable(this.bird,Phaser.Physics.ARCADE); //小鸟开启arcade物理系统
                this.bird.body.gravity.y = 0;  //开始前重力为0        
                game.physics.enable(this.ground,Phaser.Physics.ARCADE);//地面开启arcade物理系统
                this.ground.body.immovable = true;   //地面不会受到其他物理撞击的影响

                this.soundFly = game.add.sound('fly_sound');
                this.soundScore = game.add.sound('score_sound');
                this.soundHitPipe = game.add.sound('hit_pipe_sound');
                this.soundHitGround = game.add.sound('hit_ground_sound');       
         
                this.readyText = game.add.image(game.width/2, 40, 'ready_text'); //get ready 文字
                this.playTip = game.add.image(game.width/2,300,'play_tip'); //提示点击屏幕的图片
                this.readyText.anchor.setTo(0.5, 0.2);
                this.playTip.anchor.setTo(0.5, 0.2);

                this.hasStarted = false;  //游戏是否开始标记
                game.time.events.loop(1000,this.generatePipes,this);  //每900ms调用一次generatePipes函数(生成一组管道)        
                game.input.onDown.addOnce(this.startGame, this); //点击屏幕后调用startGame函数（开始游戏），仅生效一次
                

            };
            this.update = function(){
                if(!this.hasStarted) 
                    return; //若游戏还没开始，返回
                game.physics.arcade.collide(this.bird,this.ground,this.hitGround,null,this);  //检测小鸟与地面碰撞，碰撞后调用hitGround函数
                game.physics.arcade.collide(this.bird,this.pipeGroup,this.hitPipe,null,this); //检测小鸟与管道组碰撞，碰撞后调用hitPipe函数
                if(this.bird.angle < 90)  //当小鸟的头未超过垂直向下时
                    this.bird.angle += 2.5; //下降时头朝下
                this.pipeGroup.forEachExists(this.checkScore,this); //对每一个存在的管道，调用checkScore函数
            }
            

            this.startGame = function(){  //设置开始游戏后相关参数
                this.gameSpeed = 200;  //移动速度
                this.hasGameOvered = false;  //是否gameover标记
                this.hasHitGround = false;   //是否碰到地面标记
                this.hasStarted = true;      //是否开始游戏标记，设为TRUE，游戏开始
                this.score = 0;              //初始化得分为0
                this.bg.autoScroll(-(this.gameSpeed/10),0);   //背景开始向左移动，速度为gameSpeed的十分之一
                this.ground.autoScroll(-(this.gameSpeed),0);  //地面开始向左移动，速度为gameSpeed
                this.bird.body.gravity.y = 1000;   //给小鸟施加重力，让小鸟向下掉
                this.readyText.destroy();  //去掉ready文字
                this.playTip.destroy();    //去掉Tip图片
                game.input.onDown.add(this.fly,this);   //点击屏幕后，调用fly函数
                game.time.events.start();   //启动时钟，开始计时
            }

            this.fly = function(){  //小鸟飞翔函数
                this.bird.body.velocity.y = -350;   //让小鸟有一个向上的速度，即向上飞一段距离
                game.add.tween(this.bird).to({angle:-30},100,null,true,0,0,false);  //给小鸟施加向上30度的动画，即让小鸟抬头
                this.soundFly.play(); //播放飞的声音
            }

            this.generatePipes = function(){    //生成管道函数
                gap =  118;  //管道间间隙
                var position = 80 + Math.floor( 153 * Math.random());//计算出一个上下管道之间的间隙左上角的随机位置
                var topPipeY = position - 320;      //上方管道左上角位置
                var bottomPipeY = position + gap;   //下方管道左上角位置

                var topPipe = game.add.sprite(game.width, topPipeY, 'pipe', 0, this.pipeGroup); //上方的管道
                var bottomPipe = game.add.sprite(game.width, bottomPipeY, 'pipe', 1, this.pipeGroup); //下方的管道
                
                this.pipeGroup.setAll('body.immovable',true); //让管道不受小鸟撞击影响
                this.pipeGroup.setAll('checkWorldBounds',true); //开启边界检测，才能让outOfBoundsKill生效
                this.pipeGroup.setAll('outOfBoundsKill',true); //出边界后自动kill
                this.pipeGroup.setAll('body.velocity.x', -this.gameSpeed); //设置管道运动的速度         
            }

            this.hitGround = function(){
            if(this.hasGameOvered)  //如果游戏已经结束，返回
                return;
            this.hasHitGround = true;   //碰撞到地面标记为真
            this.soundHitGround.play(); //播放撞击地面声音
            this.gameOver(true);        //调用gameoOver函数，传入参数为true
        }

        this.hitPipe = function(){
            if(this.hasGameOvered)  //如果游戏已经结束，返回
                return;
            this.hasHitPipe = true; //碰撞到管道标记为真
            this.soundHitPipe.play(); //播放撞击管道声音
            this.gameOver();        //调用gameOver函数
        }

        this.gameOver = function(){         
            this.hasGameOvered = true;  //标记游戏结束
            this.stopGame();            //调用停止游戏函数
            this.showResult();          //调用输出结果函数
        }

        this.stopGame = function(){
            this.bg.stopScroll();   //背景开始停止移动
            this.ground.stopScroll();  //地面开始停止移动
            this.pipeGroup.setAll('body.velocity.x',0); //管道停止移动
            game.time.events.stop(true);    //时钟停止
            game.input.onDown.remove(this.fly,this);   //去除fly函数
            this.bird.animations.stop();    //小鸟动画停止
        }

        this.checkScore = function(pipe){   //每一帧都检查分数
            if(!pipe.hasScored && pipe.y<0 && pipe.x+54<=this.bird.x) {  //未得分的，上方的管道，当小鸟经过时
                pipe.hasScored = true;
                this.score++;  //游戏得分+1
                this.scoreText.text = this.score;
                this.soundScore.play();
            }
        }
        
        this.showResult = function(){
            this.scoreText.destroy();   //去除上方得分文字

            game.bestScore = game.bestScore || 0;   //若存在最高分数，则继承，若无，则设为0

            if(game.bestScore < this.score)
                game.bestScore = this.score;  //如果这次的分数比游戏记录好，那么这次分数设为游戏记录

            this.scoreGroup = this.add.group();   //创建一个组存放得分面板内容

            var gameOverText = this.scoreGroup.create(game.width/2,40,'game_over');  //GameOver文字
            gameOverText.anchor.setTo(0.5,0);

            var scoreBoard = this.scoreGroup.create(game.width/2,115,'score_board'); //得分面板
            scoreBoard.anchor.setTo(0.5,0);

            var currentScoreText = this.add.text(game.width/2+60,145,this.score+'', 20 , this.scoreGroup );  //显示本次分数
            var bestScoreText = this.add.text(game.width/2+65,195,game.bestScore+'', 20 , this.scoreGroup ); //显示最高分数

            var returnBtn = this.add.button(game.width/2,253,'btn',function(){  //加入按钮，按后重新调用play场景
                game.state.start('play');},
                this,this.scoreGroup);
            returnBtn.anchor.setTo(0.5,0);

            currentScoreText.anchor.setTo(0.5,0);
            bestScoreText.anchor.setTo(0.5,0);

            if(this.score > 5 && this.score <=10)
                var silverMedal = this.add.sprite(game.width/2-88, 158, 'medals', 0, this.scoreGroup); //显示银牌
            else if(this.score >10)
                var goldMedal = this.add.sprite(game.width/2-88, 158, 'medals', 1, this.scoreGroup); //显示金牌
            else
                ;
        }

        // 添加游戏状态
        game.state.add("boot",game.States.boot);
        game.state.add("preload",game.States.preload);
        game.state.add("menu",game.States.menu);
        game.state.add("play",game.States.play);
        game.state.start("boot");
    }
}

}