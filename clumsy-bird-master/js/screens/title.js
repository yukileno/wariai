game.TitleScreen = me.ScreenObject.extend({
    init: function() {
        this._super(me.ScreenObject, 'init');
        this.ground1 = null;
        this.ground2 = null;
        this.titleBanner = null;
    },

    onResetEvent: function() {
        me.audio.stop("theme");
        game.data.newHiScore = false;
        game.data.quizPaused = false;
        game.data.resuming = false;
        game.data.uiBlocking = false;
        if (window.BirdQuiz) window.BirdQuiz.stopSession();
        if (window.BirdRanking) window.BirdRanking.setScreen('title');

        me.game.world.addChild(new BackgroundLayer('bg', 1));
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        me.input.bindKey(me.input.KEY.SPACE, "enter", true);
        me.input.bindPointer(me.input.pointer.LEFT, me.input.KEY.ENTER);

        this.handler = me.event.subscribe(me.event.KEYDOWN, function(action) {
            if (action === "enter" && !game.data.uiBlocking) {
                me.state.change(me.state.PLAY);
            }
        });

        // 日本語タイトルロゴ（バウンドアニメーション付き）
        this.titleBanner = new (me.Renderable.extend({
            init: function() {
                this._super(me.Renderable, 'init', [0, me.game.viewport.height / 2 - 20, me.game.viewport.width, 160]);
                this.mainShadow = new me.Font(JP_FONT, 58, '#0f172a', 'center');
                this.mainShadow.bold();
                this.mainFont = new me.Font(JP_FONT, 58, '#a3e635', 'center');
                this.mainFont.bold();

                this.subShadow = new me.Font(JP_FONT, 24, '#0f172a', 'center');
                this.subShadow.bold();
                this.subFont = new me.Font(JP_FONT, 24, '#fef08a', 'center');
                this.subFont.bold();
            },
            draw: function(renderer) {
                var cx = me.game.viewport.width / 2;
                var y = this.pos.y;
                this.mainShadow.draw(renderer, 'クラムジーバード', cx + 4, y + 4);
                this.mainFont.draw(renderer, 'クラムジーバード', cx, y);
                this.subShadow.draw(renderer, '〜 20秒ごとに割合チャレンジ！ 〜', cx + 2, y + 74);
                this.subFont.draw(renderer, '〜 20秒ごとに割合チャレンジ！ 〜', cx, y + 72);
            }
        }))();
        me.game.world.addChild(this.titleBanner, 10);

        me.pool.pull("me.Tween", this.titleBanner.pos)
            .to({y: me.game.viewport.height / 2 - 135}, 900)
            .easing(me.Tween.Easing.Exponential.InOut).start();

        this.ground1 = me.pool.pull("ground", 0, me.video.renderer.getHeight() - 96);
        this.ground2 = me.pool.pull("ground", me.video.renderer.getWidth(), me.video.renderer.getHeight() - 96);
        me.game.world.addChild(this.ground1, 11);
        me.game.world.addChild(this.ground2, 11);

        me.game.world.addChild(new (me.Renderable.extend({
            init: function() {
                this._super(me.Renderable, 'init', [0, 0, 100, 100]);
                this.line1 = me.device.touch ? 'タップして スタート' : 'スペースキー または クリックで スタート';
                this.line2 = me.device.touch ? '20秒ごとに割合の問題が出るよ！' : '「M」キーで おと オン／オフ';
                this.font1 = new me.Font(JP_FONT, 22, '#0f172a', 'center');
                this.font1.bold();
                this.font2 = new me.Font(JP_FONT, 17, '#1e293b', 'center');
                this.font2.bold();
            },
            draw: function(renderer) {
                var cx = me.game.viewport.width / 2;
                var y = me.game.viewport.height / 2 + 40;
                this.font1.draw(renderer, this.line1, cx, y);
                this.font2.draw(renderer, this.line2, cx, y + 38);
            }
        }))(), 12);
    },

    onDestroyEvent: function() {
        if (window.BirdRanking) window.BirdRanking.setScreen('none');
        me.event.unsubscribe(this.handler);
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindKey(me.input.KEY.SPACE);
        me.input.unbindPointer(me.input.pointer.LEFT);
        this.ground1 = null;
        this.ground2 = null;
        if (this.titleBanner) {
            me.game.world.removeChild(this.titleBanner);
            this.titleBanner = null;
        }
    }
});
