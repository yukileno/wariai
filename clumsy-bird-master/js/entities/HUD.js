game.HUD = game.HUD || {};

var JP_FONT = '"BIZ UDPGothic", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", "Meiryo", sans-serif';

game.HUD.Container = me.Container.extend({
    init: function() {
        this._super(me.Container, 'init');
        this.isPersistent = true;
        this.collidable = false;
        this.z = Infinity;
        this.name = "HUD";
        this.addChild(new game.HUD.ScoreItem(5, 5));
    }
});

game.HUD.ScoreItem = me.Renderable.extend({
    init: function(x, y) {
        this._super(me.Renderable, "init", [x, y, 10, 10]);
        this.stepsFont = new me.Font('gamefont', 72, '#ffffff', 'center');
        this.shadowFont = new me.Font('gamefont', 72, '#0f172a', 'center');
        this.stepsFont.bold();
        this.shadowFont.bold();
        this.floating = true;
    },

    draw: function(renderer) {
        if (game.data.start && me.state.isCurrent(me.state.PLAY)) {
            var cx = me.game.viewport.width / 2;
            this.shadowFont.draw(renderer, String(game.data.steps), cx + 3, 15);
            this.stepsFont.draw(renderer, String(game.data.steps), cx, 12);
        }
    }
});

var BackgroundLayer = me.ImageLayer.extend({
    init: function(image, z, speed) {
        var settings = {};
        settings.name = image;
        settings.width = 900;
        settings.height = 600;
        settings.image = image;
        settings.z = z;
        settings.ratio = 1;
        this._super(me.ImageLayer, 'init', [0, 0, settings]);
    },

    update: function() {
        if (!game.data.quizPaused && me.input.isKeyPressed('mute')) {
            game.data.muted = !game.data.muted;
            if (game.data.muted) {
                me.audio.disable();
            } else {
                me.audio.enable();
            }
        }
        return true;
    }
});
