game.PlayScreen = me.ScreenObject.extend({
    init: function() {
        me.audio.play("theme", true);
        var vol = me.device.ua.indexOf("Firefox") !== -1 ? 0.3 : 0.5;
        me.audio.setVolume(vol);
        this._super(me.ScreenObject, 'init');
    },

    onResetEvent: function() {
        me.game.reset();
        me.audio.stop("theme");
        if (!game.data.muted) {
            me.audio.play("theme", true);
        }

        me.input.bindKey(me.input.KEY.SPACE, "fly", true);
        game.data.score = 0;
        game.data.steps = 0;
        game.data.quizSolved = 0;
        game.data.start = false;
        game.data.newHiscore = false;
        game.data.quizPaused = false;
        game.data.resuming = false;
        game.data.uiBlocking = false;
        if (window.BirdRanking) window.BirdRanking.setScreen('play');
        if (window.BirdQuiz) window.BirdQuiz.showHud();

        me.game.world.addChild(new BackgroundLayer('bg', 1));

        this.ground1 = me.pool.pull('ground', 0, me.game.viewport.height - 96);
        this.ground2 = me.pool.pull('ground', me.game.viewport.width, me.game.viewport.height - 96);
        me.game.world.addChild(this.ground1, 11);
        me.game.world.addChild(this.ground2, 11);

        this.HUD = new game.HUD.Container();
        me.game.world.addChild(this.HUD, 11);

        this.bird = me.pool.pull("clumsy", 60, me.game.viewport.height / 2 - 100);
        me.game.world.addChild(this.bird, 10);

        me.input.bindPointer(me.input.pointer.LEFT, me.input.KEY.SPACE);

        // 日本語「じゅんびは いい？」バナー
        this.getReady = new (me.Renderable.extend({
            init: function() {
                this._super(me.Renderable, 'init', [0, 0, me.game.viewport.width, me.game.viewport.height]);
                this.alpha = 1;
                this.shadow = new me.Font(JP_FONT, 48, '#0f172a', 'center');
                this.shadow.bold();
                this.font = new me.Font(JP_FONT, 48, '#facc15', 'center');
                this.font.bold();
                this.sub = new me.Font(JP_FONT, 20, '#0f172a', 'center');
                this.sub.bold();
            },
            draw: function(renderer) {
                var cx = me.game.viewport.width / 2;
                var cy = me.game.viewport.height / 2 - 30;
                this.shadow.draw(renderer, 'じゅんびは いい？', cx + 3, cy + 3);
                this.font.draw(renderer, 'じゅんびは いい？', cx, cy);
                this.sub.draw(renderer, 'スペース / クリックで ジャンプ！', cx, cy + 62);
            }
        }))();
        me.game.world.addChild(this.getReady, 11);

        var that = this;
        new me.Tween(this.getReady).to({alpha: 0}, 1800)
            .easing(me.Tween.Easing.Linear.None)
            .onComplete(function() {
                game.data.start = true;
                me.game.world.addChild(new game.PipeGenerator(), 0);
                me.game.world.removeChild(that.getReady);
                if (window.BirdQuiz) window.BirdQuiz.startSession();
            }).start();
    },

    onDestroyEvent: function() {
        me.audio.stopTrack('theme');
        if (window.BirdQuiz) window.BirdQuiz.stopSession();
        this.HUD = null;
        this.bird = null;
        this.ground1 = null;
        this.ground2 = null;
        me.input.unbindKey(me.input.KEY.SPACE);
        me.input.unbindPointer(me.input.pointer.LEFT);
    }
});
