var Pong = Class.create(
{
    area                           : null,
    updateIntervalId               : null,
    updateInterval                 : 30,   // milliseconds
    replayDelay                    : 1000, // milliseconds
    width                          : 500,  // pixels
    height                         : 250,  // pixels
    leftPaddle                     : null,
    rightPaddle                    : null,
    leftPlayer                     : null,
    rightPlayer                    : null,
    projectiles                    : [],
    projectileIncrementalId        : 0,
    availableWeightedProjectiles   : [['paddle-speed-power', 30],
                                        ['ball', 70]],
    maxProjectiles                 : 10,
    paused                         : false,
    started                        : false,
    maxScore                       : 50,
    fireProjectileTime             : 0,     // time
    fireProjectileDelayMin         : 1000,  // milliseconds
    fireProjectileDelayMax         : 2000, // milliseconds
    currentTime                    : 0,     // milliseconds

    initialize: function(p)
    {
        this.area = document.createElement('div');
        this.area.setAttribute('id', 'pong-area');
        this.area.setAttribute('style', 'width: ' + this.width + 'px; height: ' + this.height + 'px;');
        document.getElementsByTagName('body')[0].appendChild(this.area);
        this.leftPaddle = new Paddle(
        {
            'container' : this,
            'id'        : 'pong-left',
            'width'     : 6,
            'height'    : 60,
            'position'  : 'left'
        });
        this.rightPaddle = new Paddle(
        {
            'container' : this,
            'id'        : 'pong-right',
            'width'     : 6,
            'height'    : 60,
            'position'  : 'right'
        });

        this.projectiles.push(this.createNewProjectile('ball'));
        this.leftPlayer  = new Player({name: 'left'});
        this.rightPlayer = new Player({name: 'right'});

        // handle keystrokes
        var keyboard = new Keyboard();
        document.observe('keydown', keyboard.keyDownHandler.bind(keyboard, this));
        document.observe('keyup', keyboard.keyUpHandler.bind(keyboard, this));
    },
    update: function()
    {
        this.setCurrentTime();

        // Paddles
        if (this.leftPaddle.isGoingUp)
        {
            this.leftPaddle.moveUp();
        }
        else if (this.leftPaddle.isGoingDown)
        {
            this.leftPaddle.moveDown();
        }
        if (this.rightPaddle.isGoingUp)
        {
            this.rightPaddle.moveUp();
        }
        else if (this.rightPaddle.isGoingDown)
        {
            this.rightPaddle.moveDown();
        }

        // Projectiles
        if (this.needsNewProjectile())
        {
            this.initFireProjectileTime();

            if (this.projectiles.length < this.maxProjectiles)
            {
                this.projectiles.push(this.createNewProjectile());
            }
        }

        for (var i = 0; i < this.projectiles.length; i++)
        {
            if (this.projectiles[i].isLiving(this.currentTime))
            {
                this.projectiles[i].move();
            }
            else
            {
                this.projectiles[i].remove();
                delete this.projectiles[i];
                this.projectiles = this.projectiles.compact();
            }
        }

        // Score
        if (this.leftPlayer.hasReachedScore(this.maxScore))
        {
            console.log('Left player won with ' +
                this.leftPlayer.score +
                ' points. Right player lost with ' +
                this.rightPlayer.score);
            this.stop();
        }
        else if (this.rightPlayer.hasReachedScore(this.maxScore))
        {
            console.log('Right player won with ' +
                this.rightPlayer.score +
                ' points. Left player lost with ' +
                this.leftPlayer.score);
            this.stop();
        }
    },
    start: function()
    {
        if (this.started)
        {
            return;
        }
        this.stop();
        this.leftPlayer.resetScore();
        this.rightPlayer.resetScore();
        this.pursue();
    },
    stop: function()
    {
        this.started = false;
        this.paused  = true;
        clearInterval(this.updateIntervalId);
        this.updateIntervalId = null;
        this.projectiles.each(function(projectile)
        {
            projectile.resetPosition();
        });
        this.leftPaddle.resetPosition();
        this.rightPaddle.resetPosition();
    },
    pause: function()
    {
        this.started = true;
        this.paused  = true;
        clearInterval(this.updateIntervalId);
        this.updateIntervalId = null;
    },
    pursue: function()
    {
        this.started          = true;
        this.paused           = false;
        this.setCurrentTime();
        this.initFireProjectileTime();
        this.updateIntervalId =
            setInterval(this.update.bind(this), this.updateInterval);
    },
    togglePause: function()
    {
        if (!this.started)
        {
            return;
        }
        if (this.paused)
        {
            this.pursue();
        }
        else
        {
            this.pause();
        }
    },
    replay: function()
    {
        this.pause();
        setTimeout(this.stop.bind(this), this.replayDelay);
    },
    initFireProjectileTime: function()
    {
        this.fireProjectileTime =
            Helper.getRandomFromRange(this.fireProjectileDelayMin, this.fireProjectileDelayMax) +
            this.currentTime;
    },
    createNewProjectile: function(name)
    {
        if (typeof name === 'undefined')
        {
            var name = Helper.getWeightedRandomValue(this.availableWeightedProjectiles);
        }

        var id = 'pong-' + name + '-' + this.projectileIncrementalId++;
        var projectile = null;

        switch (name)
        {
            case 'ball':
                projectile = new Ball(
                {
                    'container' : this,
                    'id'        : id,
                    'width'     : 10,
                    'height'    : 10,
                    'lifeTime'  : 20000
                });
                break;
            case 'paddle-speed-power':
                projectile = new PaddleSpeedPower(
                {
                    'container' : this,
                    'id'        : id,
                    'width'     : 10,
                    'height'    : 10,
                    'lifeTime'  : 20000
                });
                break;
            default:
                console.log('try to add an unknown projectile');
                break;
        }

        return projectile;

    },
    needsNewProjectile: function()
    {
        return this.fireProjectileTime <= this.currentTime;
    },
    setCurrentTime: function()
    {
        var date = new Date();
        this.currentTime = date.getTime();
    }
});
