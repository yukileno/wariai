game.GameOverScreen = me.ScreenObject.extend({
    init: function() {
        this.savedData = null;
        this.handler = null;
    },

    onResetEvent: function() {
        game.data.quizPaused = false;
        game.data.resuming = false;
        game.data.uiBlocking = false;
        if (window.BirdQuiz) window.BirdQuiz.stopSession();
        if (window.BirdRanking) window.BirdRanking.setScreen('gameover');

        this.savedData = {
            score: game.data.score,
            steps: game.data.steps
        };
        me.save.add(this.savedData);

        if (!me.save.topSteps) me.save.add({topSteps: game.data.steps});
        if (game.data.steps > me.save.topSteps) {
            me.save.topSteps = game.data.steps;
            game.data.newHiScore = true;
        }
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        me.input.bindKey(me.input.KEY.SPACE, "enter", false);
        me.input.bindPointer(me.input.pointer.LEFT, me.input.KEY.ENTER);

        this.handler = me.event.subscribe(me.event.KEYDOWN, function(action) {
            if (action === "enter" && !game.data.uiBlocking) {
                me.state.change(me.state.MENU);
            }
        });

        var gameOverBG = new me.Sprite(
            me.game.viewport.width / 2,
            me.game.viewport.height / 2,
            {image: 'gameoverbg'}
        );
        me.game.world.addChild(gameOverBG, 10);

        me.game.world.addChild(new BackgroundLayer('bg', 1));

        this.ground1 = me.pool.pull('ground', 0, me.game.viewport.height - 96);
        this.ground2 = me.pool.pull('ground', me.game.viewport.width, me.video.renderer.getHeight() - 96);
        me.game.world.addChild(this.ground1, 11);
        me.game.world.addChild(this.ground2, 11);

        this.dialog = new (me.Renderable.extend({
            init: function() {
                this._super(me.Renderable, 'init', [0, 0, me.game.viewport.width, me.game.viewport.height]);
                this.titleShadow = new me.Font(JP_FONT, 46, '#0f172a', 'center');
                this.titleShadow.bold();
                this.titleFont = new me.Font(JP_FONT, 46, '#facc15', 'center');
                this.titleFont.bold();

                this.newFont = new me.Font(JP_FONT, 22, '#dc2626', 'center');
                this.newFont.bold();

                this.font = new me.Font(JP_FONT, 30, '#0f172a', 'center');
                this.font.bold();

                this.subFont = new me.Font(JP_FONT, 18, '#334155', 'center');
                this.subFont.bold();

                this.steps = 'きろく： ' + game.data.steps + ' てん（クイズ ' + (game.data.quizSolved || 0) + '問）';
                this.topSteps = 'さいこうきろく： ' + me.save.topSteps + ' てん';
            },

            draw: function(renderer) {
                var cx = me.game.viewport.width / 2;
                var cy = me.game.viewport.height / 2;

                this.titleShadow.draw(renderer, 'ゲームオーバー', cx + 3, cy - 147);
                this.titleFont.draw(renderer, 'ゲームオーバー', cx, cy - 150);

                if (game.data.newHiScore) {
                    this.newFont.draw(renderer, '★ 新記録！ ★', cx, cy - 52);
                }

                this.font.draw(renderer, this.steps, cx, cy - 12);
                this.font.draw(renderer, this.topSteps, cx, cy + 36);
                this.subFont.draw(renderer, 'スペース または クリックで タイトルへ', cx, cy + 125);
            }
        }))();
        me.game.world.addChild(this.dialog, 12);
    },

    onDestroyEvent: function() {
        if (window.BirdRanking) window.BirdRanking.setScreen('none');
        me.event.unsubscribe(this.handler);
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindKey(me.input.KEY.SPACE);
        me.input.unbindPointer(me.input.pointer.LEFT);
        this.ground1 = null;
        this.ground2 = null;
        me.audio.stop("theme");
    }
});
