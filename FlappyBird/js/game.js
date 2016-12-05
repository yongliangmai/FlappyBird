var width = window.innerWidth*2;
var height = window.innerHeight*2;

var game = new Phaser.Game(width,height,Phaser.AUTO,'game'); //实例化game


	
game.States = {}; //存放state对象

game.States.boot = function(){
	this.preload = function(){		
		game.load.image('loading','assets/preloader.gif');
		$(game.canvas).css("width", width / 2);
		$(game.canvas).css("height", height / 2);
	};
	this.create = function(){
		game.state.start('preload'); //跳转到资源加载页面
	};
}	

game.States.preload = function(){
	this.preload = function(){
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
	}
	this.create = function(){
		game.state.start('menu');  
	}
}

game.States.menu = function(){

	this.create = function(){
		$(game.canvas).css("width", width / 2);
		$(game.canvas).css("height", height / 2);
		
		var bg = game.add.image(0,0,'background');  //加入背景瓦片图，并向左滚动
		var bgScale = game.world.width / bg.width;
        bg.scale.setTo(bgScale, bgScale);
		

		var ground = game.add.tileSprite(0,game.height-224,game.width,224,'ground'); //加入地面瓦片图，并向左滚动
		//var groundScale = game.world.width / ground.width;
		ground.tileScale.setTo(2,2);
		//console.log(ground.width);
		ground.autoScroll(-100/2,0);

		var titleGroup = game.add.group();  //创建标题组，用于存储标题和小鸟图标 
		titleGroup.x = game.width/4;
		titleGroup.y = game.height/4;
		titleGroup.create(0,0,'title');  //把标题加入标题组
		var bird = titleGroup.create(190,10,'bird');  //把小鸟图标进入标题组，包括全部3帧
		bird.animations.add('fly');  //小鸟加入动画，默认包括全部3帧
		bird.animations.play('fly',10,true)  //小鸟图标播放动画，速度为10帧每秒，循环
		game.add.tween(titleGroup).to({y:120},1000,null,true,0,Number.MAX_VALUE,true); //创造标题组动画：向下移动到120像素，时间长度为1秒，没有ease函数，默认为匀速移动，自动开始，没有延迟，不断重复往返运动

		var btn = game.add.image(game.width/2,game.height/2,'btn');
		btn.scale.setTo(2,2);
		btn.anchor.setTo(0.5,0.5);  //让按钮的中心位于画布中央		
		titleGroup.scale.setTo(2,2);
		
		game.input.onTap.add(function(e){
			console.log('x '+e.x);
			console.log('y '+e.y);
			//if( (e.x<game.width/4+52) && (e.x>game.width/4-52) && (e.y<game.height/4+48) && (e.y>game.height/4-48) )
			//	{game.state.start('play');				
			//}
		}
		, this);
		
	}
}

game.States.play = function(){
	this.create = function(){
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
        	game.time.events.start(); 	//启动时钟，开始计时
        }

        this.fly = function(){  //小鸟飞翔函数
        	this.bird.body.velocity.y = -350; 	//让小鸟有一个向上的速度，即向上飞一段距离
        	game.add.tween(this.bird).to({angle:-30},100,null,true,0,0,false);  //给小鸟施加向上30度的动画，即让小鸟抬头
        	this.soundFly.play(); //播放飞的声音
        }

        this.generatePipes = function(){	//生成管道函数
        	gap =  118;  //管道间间隙
        	var position = 80 + Math.floor( 153 * Math.random());//计算出一个上下管道之间的间隙左上角的随机位置
        	var topPipeY = position - 320;   	//上方管道左上角位置
        	var bottomPipeY = position + gap;	//下方管道左上角位置

        	if(this.resetPipe(topPipeY,bottomPipeY)) return; //如果有出了边界的管道，则重置他们，不再制造新的管道了,达到循环利用的目的

        	var topPipe = game.add.sprite(game.width, topPipeY, 'pipe', 0, this.pipeGroup); //上方的管道
		    var bottomPipe = game.add.sprite(game.width, bottomPipeY, 'pipe', 1, this.pipeGroup); //下方的管道
		    
		    this.pipeGroup.setAll('body.immovable',true); //让管道不受小鸟撞击影响
		    this.pipeGroup.setAll('checkWorldBounds',true); //开启边界检测，才能让outOfBoundsKill生效
		    this.pipeGroup.setAll('outOfBoundsKill',true); //出边界后自动kill
		    this.pipeGroup.setAll('body.velocity.x', -this.gameSpeed); //设置管道运动的速度		   
        }

        this.resetPipe = function(topPipeY,bottomPipeY){//重置出了边界的管道，做到回收利用
		    var i = 0;
		    this.pipeGroup.forEachDead(function(pipe){ //对组调用forEachDead方法来获取那些已经出了边界，也就是“死亡”了的对象
		        if(pipe.y<=0){ //是上方的管道
		            pipe.reset(game.width, topPipeY); //重置到初始位置
		            pipe.hasScored = false; //重置为未得分
		        }else{//是下方的管道
		            pipe.reset(game.width, bottomPipeY); //重置到初始位置
		        }
		        pipe.body.velocity.x = -this.gameSpeed; //设置管道速度
		        i++;
		    }, this);
		    return i == 2; //如果 i==2 代表有一组管道已经出了边界，可以回收这组管道了
		}

        this.update = function(){
        	if(!this.hasStarted) 
        		return; //若游戏还没开始，返回
        	game.physics.arcade.collide(this.bird,this.ground,this.hitGround,null,this);  //检测小鸟与地面碰撞，碰撞后调用hitGround函数
        	game.physics.arcade.collide(this.bird,this.pipeGroup,this.hitPipe,null,this); //检测小鸟与管道组碰撞，碰撞后调用hitPipe函数
        	if(this.bird.angle < 90)  //当小鸟的头未超过垂直向下时
        	 	this.bird.angle += 2.5; //下降时头朝下
			this.pipeGroup.forEachExists(this.checkScore,this); //对每一个存在的管道，调用checkScore函数
        }

        this.hitGround = function(){
        	if(this.hasGameOvered)	//如果游戏已经结束，返回
        	 	return;
        	this.hasHitGround = true;	//碰撞到地面标记为真
        	this.soundHitGround.play(); //播放撞击地面声音
        	this.gameOver(true);		//调用gameoOver函数，传入参数为true	//撞击地面函数
        }

        this.hitPipe = function(){		//撞击管道函数
        	if(this.hasGameOvered)	//如果游戏已经结束，返回
        	 	return;
        	this.hasHitPipe = true;	//碰撞到管道标记为真
        	this.soundHitPipe.play(); //播放撞击管道声音
        	this.gameOver();		//调用gameOver函数
        }

        this.gameOver = function(){        	
        	this.hasGameOvered = true;  //标记游戏结束
        	this.stopGame();        	//调用停止游戏函数
        	this.showResult();   		//调用输出结果函数//死亡后函数
        }

        this.stopGame = function(){
        	this.bg.stopScroll();   //背景开始停止移动
        	this.ground.stopScroll();  //地面开始停止移动
        	this.pipeGroup.setAll('body.velocity.x',0);	//管道停止移动
        	game.time.events.stop(true);	//时钟停止
        	game.input.onDown.remove(this.fly,this);   //去除fly函数
        	this.bird.animations.stop();    //小鸟动画停止				停止游戏
        }

        this.checkScore = function(pipe){   //每一帧都检查分数
	        if(!pipe.hasScored && pipe.y<0 && pipe.x+54<=this.bird.x &&pipe.y< this.bird.y) {  //未得分的，上方的管道，当小鸟经过时
	        	pipe.hasScored = true;
	        	this.score++;  //游戏得分+1
	        	this.scoreText.text = this.score;
	        	this.soundScore.play();
	        }
        }
		
		this.showResult = function(){
			this.scoreText.destroy();	//去除上方得分文字

			game.bestScore = game.bestScore || 0;	//若存在最高分数，则继承，若无，则设为0

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
		    	;    //展示得分榜
		}
}

game.state.add("boot",game.States.boot);
game.state.add("preload",game.States.preload);
game.state.add("menu",game.States.menu);
game.state.add("play",game.States.play);
game.state.start("boot");