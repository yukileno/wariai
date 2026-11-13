var game = {
    data: {
        score: 0,
        steps: 0,
        quizSolved: 0,
        start: false,
        newHiScore: false,
        muted: false,
        quizPaused: false,
        resuming: false,
        uiBlocking: false
    },

    resources: [
        // images
        {name: "bg", type: "image", src: "data/img/bg.png"},
        {name: "clumsy", type: "image", src: "data/img/clumsy.png"},
        {name: "pipe", type: "image", src: "data/img/pipe.png"},
        {name: "ground", type: "image", src: "data/img/ground.png"},
        {name: "gameoverbg", type: "image", src: "data/img/gameoverbg.png"},
        {name: "hit", type: "image", src: "data/img/hit.png"},
        // sounds
        {name: "theme", type: "audio", src: "data/bgm/"},
        {name: "hit", type: "audio", src: "data/sfx/"},
        {name: "lose", type: "audio", src: "data/sfx/"},
        {name: "wing", type: "audio", src: "data/sfx/"}
    ],

    onload: function() {
        if (!me.video.init(900, 600, {
            wrapper: "screen",
            scale: "auto",
            scaleMethod: "fit"
        })) {
            alert("お使いのブラウザはHTML5キャンバスに対応していません。");
            return;
        }
        me.audio.init("mp3,ogg");
        me.loader.preload(game.resources, this.loaded.bind(this));
    },

    loaded: function() {
        me.state.set(me.state.MENU, new game.TitleScreen());
        me.state.set(me.state.PLAY, new game.PlayScreen());
        me.state.set(me.state.GAME_OVER, new game.GameOverScreen());

        me.input.bindKey(me.input.KEY.SPACE, "fly", true);
        me.input.bindKey(me.input.KEY.M, "mute", true);
        me.input.bindPointer(me.input.KEY.SPACE);

        me.pool.register("clumsy", game.BirdEntity);
        me.pool.register("pipe", game.PipeEntity, true);
        me.pool.register("hit", game.HitEntity, true);
        me.pool.register("ground", game.Ground, true);

        me.state.change(me.state.MENU);
    },

    activeBird: null,

    resetBirdAfterQuiz: function() {
        if (this.activeBird) {
            this.activeBird.gravityForce = 0.2;
            this.activeBird.currentAngle = 0;
        }
        // Clear any pending fly key press from quiz interaction
        me.input.isKeyPressed("fly");
    }
};
