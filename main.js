class Description extends Phaser.Scene {
  constructor() {
    super("Description");
  }

  create() {
    this.add.text(500, 50, "Controls", { fontSize: "40px", fill: "#fff" });

    this.add.text(500, 120, "Player 1", { fontSize: "32px", fill: "#0ff" });
    this.add.text(500, 160, "← → ↑ ↓ to move", { fontSize: "24px", fill: "#fff" });

    this.add.text(500, 220, "Player 2", { fontSize: "32px", fill: "#f0f" });
    this.add.text(500, 260, "A D W S to move", { fontSize: "24px", fill: "#fff" });

    const backBtn = this.add.text(500, 400, "Back", {
      fontSize: "28px",
      fill: "#ff0",
      backgroundColor: "#0528",
      padding: { x: 20, y: 10 }
    }).setInteractive();

    backBtn.on("pointerdown", () => {
      this.scene.start("StartScene");
    });
  }
}

class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
    
  }
  create() {
    this.add.text(500, 50, "Football Gaming", { fontSize: "40px", fill: "#fff" });
    this.add.text(500, 150, "Choose Mode:", { fontSize: "40px", fill: "#fff" });

    const btn1 = this.add.text(500, 250, "1 Player (vs CPU)", {
      fontSize: "30px", fill: "#0f0",
    }).setInteractive();
const text = this.add.text(this.scale.width / 2, this.scale.height - 100, "Description", {
  fontSize: "25px",
  fill: "#0F0"
}).setOrigin(0.5).setInteractive();
    text.on("pointerdown",()=>{
      this.scene.start("Description");
    })
    btn1.on("pointerdown", () => {
      this.scene.start("GameScene", { mode: "one_player" });
    });

    const btn2 = this.add.text(500, 320, "2 Players", {
      fontSize: "30px", fill: "#0f0",
    }).setInteractive();

    btn2.on("pointerdown", () => {
      this.scene.start("GameScene", { mode: "two_players" });
    });
  }
}
class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.escKey;
  }

  init(data) {
    this.mode = data.mode || "one_player";
    this.aiSpeed = 200; 
  }

  preload() {
    this.load.spritesheet("player", "assets/player1.png", { frameWidth: 32, frameHeight: 48 });
    this.load.image("ball", "assets/ball.png");
    this.load.image("goal", "assets/goal.png");
    this.load.audio("kick", "assets/kick.wav");
    this.load.audio("goal", "assets/goal.wav");
  }

  create() {

      this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  this.escKey.on('down', () => {
            if (!this.scene.isActive('MenuInsideGame')) { 
                this.physics.pause();
                if (this.bgMusic && this.bgMusic.isPlaying) {
                    this.bgMusic.pause(); 
                }
           this.physics.pause(); 
this.scene.launch('MenuInsideGame'); 
            }
        });
    this.add.image(680, 290, "field_bg").setDepth(-1);
    this.add.rectangle(680, 290, 1360, 580, 0x006400).setDepth(-1);

    this.ball = this.physics.add.sprite(680, 290, "ball").setCollideWorldBounds(true).setBounce(1);

    this.goalLeft = this.physics.add.staticImage(50, 290, "goal");
    this.goalRight = this.physics.add.staticImage(1310, 290, "goal");

    this.physics.add.overlap(this.ball, this.goalLeft, () => this.handleGoal(2), null, this);
    this.physics.add.overlap(this.ball, this.goalRight, () => this.handleGoal(1), null, this);

    this.score1 = 0;
    this.score2 = 0;

    this.player1 = this.physics.add.sprite(300, 290, "player", 0).setCollideWorldBounds(true);
    this.player2 = this.physics.add.sprite(1060, 290, "player", 0).setCollideWorldBounds(true);

    this.physics.add.collider(this.player1, this.ball, () => this.kickBall(this.player1));
    this.physics.add.collider(this.player2, this.ball, () => this.kickBall(this.player2));

    this.physics.add.collider(this.player1, this.player2);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'turn',
      frames: [{ key: 'player', frame: 4 }],
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    this.physics.world.setBounds(0, 0, 1360, 580);

    this.scoreText1 = this.add.text(30, 30, "0", { fontSize: "24px", fill: "#fff" });
    this.scoreText2 = this.add.text(1300, 30, "0", { fontSize: "24px", fill: "#fff" });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D");

    this.kickSound = this.sound.add("kick");
    this.goalSound = this.sound.add("goal");
    this.name1 = this.add.text(this.player1.x, this.player1.y - 40, this.mode === "two_players" ? "Player 1" : "You", {
  fontSize: "16px", fill: "#fff"
}).setOrigin(0.5);

this.name2 = this.add.text(this.player2.x, this.player2.y - 40, this.mode === "two_players" ? "Player 2" : "CPU", {
  fontSize: "16px", fill: "#fff"
}).setOrigin(0.5);
  }

  handleGoal(player) {
    this.goalSound.play();

    if (player === 1) this.score1++;
    else this.score2++;

    this.scoreText1.setText(this.score1);
    this.scoreText2.setText(this.score2);

    if (this.mode === "one_player") {
      this.aiSpeed += 50; 
    }

    this.ball.setPosition(680, 290);
    this.ball.setVelocity(0);

    if (this.score1 >= 5 || this.score2 >= 5) {
      alert(`Player ${this.score1 >= 5 ? 1 : 2} wins!`);
      this.scene.start("StartScene");
    }
  }

  update() {
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player1.setVelocityX(-speed);
      this.player1.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player1.setVelocityX(speed);
      this.player1.anims.play("right", true);
    } else {
      this.player1.setVelocityX(0);
      this.player1.anims.play("turn", true);
    }

    if (this.cursors.up.isDown) {
      this.player1.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player1.setVelocityY(speed);
    } else {
      this.player1.setVelocityY(0);
    }

    if (this.mode === "two_players") {
      if (this.keys.A.isDown) {
        this.player2.setVelocityX(-speed);
        this.player2.anims.play("left", true);
      } else if (this.keys.D.isDown) {
        this.player2.setVelocityX(speed);
        this.player2.anims.play("right", true);
      } else {
        this.player2.setVelocityX(0);
        this.player2.anims.play("turn", true);
      }

      if (this.keys.W.isDown) {
        this.player2.setVelocityY(-speed);
      } else if (this.keys.S.isDown) {
        this.player2.setVelocityY(speed);
      } else {
        this.player2.setVelocityY(0);
      }

    }
     else {
   if (Math.abs(this.ball.x - this.player2.x) > 20) {
    this.player2.setVelocityX(this.ball.x > this.player2.x ? this.aiSpeed : -this.aiSpeed);
  } else {
    this.player2.setVelocityX(0);
  }

  if (Math.abs(this.ball.y - this.player2.y) > 20) {
    this.player2.setVelocityY(this.ball.y > this.player2.y ? this.aiSpeed * 0.5 : -this.aiSpeed * 0.5); 
  } else {
    this.player2.setVelocityY(0);
  }

  const dirX = this.ball.x - this.player2.x;
  const dirY = this.ball.y - this.player2.y;

  if (Math.abs(dirX) > Math.abs(dirY)) {
    this.player2.anims.play(dirX > 0 ? "right" : "left", true);
  } else {
    this.player2.anims.play("turn", true);
  }
    }
    this.name1.setPosition(this.player1.x, this.player1.y - 40);
this.name2.setPosition(this.player2.x, this.player2.y - 40);
  }

  kickBall(player, force = 500) {
    const dir = new Phaser.Math.Vector2(this.ball.x - player.x, this.ball.y - player.y).normalize();
    this.ball.setVelocity(dir.x * force, dir.y * force);
    this.kickSound.play();
  }
}
class MenuInsideGame extends Phaser.Scene{
    constructor(){
    super({key:'MenuInsideGame'})
}
        
    
  create(){
       this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.7 
        ).setOrigin(0.5);

        this.add.text(this.scale.width / 2, 100, 'Game Paused', {
            fontSize: '60px',
            fill: '#ffffff',
            backgroundColor: '#1a1a1a',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5);

        const resumeGameButton = this.add.text(this.scale.width / 2, 250, 'Resume Game', {
            fontSize: '45px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 25, y: 12 }
        })
        .setOrigin(0.5)
        .setInteractive();

        resumeGameButton.on('pointerdown', () => {
          const gameScene = this.scene.get('GameScene');
if (gameScene && gameScene.physics.world.isPaused) {
    gameScene.physics.resume(); 
}
            if (gameScene && gameScene.bgMusic && !gameScene.bgMusic.isPlaying) {
                gameScene.bgMusic.resume();
            }
            this.scene.stop('MenuInsideGame'); 
        });

        const exitButton = this.add.text(this.scale.width / 2, 480, 'Exit Game', {
            fontSize: '40px',
            fill: '#ff0000',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        exitButton.on('pointerdown', () => {
            this.scene.start('StartScene');
this.scene.stop('GameScene');
this.scene.stop('MenuInsideGame');
            const gameScene = this.scene.get('GameScene');
            if (gameScene && gameScene.bgMusic && gameScene.bgMusic.isPlaying) {
                gameScene.bgMusic.stop();
            }
        });

        [resumeGameButton, exitButton].forEach(button => {
            button.on('pointerover', () => button.setStyle({ fill: '#fff', backgroundColor: '#555' }));
            button.on('pointerout', () => {
                if (button === resumeGameButton) button.setStyle({ fill: '#00ff00', backgroundColor: '#000000' });
                else if (button === exitButton) button.setStyle({ fill: '#ff0000', backgroundColor: '#000000' });
            });
        });
    }
}
const config = {
   type: Phaser.AUTO,
    scale: {
        width: window.innerWidth,
        height: window.innerHeight
    },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [StartScene, GameScene,MenuInsideGame,Description],
    audio: {
        disableWebAudio: false
    }
};

const game = new Phaser.Game(config);