"use strict";

const KeyboardApp = {
    create: function(args) {
        const app = Object.create(this);
        app.init(args)
        return app
    },
    init: function(args) {

        this.$Keyboard = args.$Keyboard
        this.$Keys = args.$Keys
        this.$KeyboardTypeSelect = args.$KeyboardTypeSelect
        this.$KeyboardVolumeRange = args.$KeyboardVolumeRange

        this.Context = new(window.AudioContext || window.webkitAudioContext)();
        this.oscillators = {}
        this.gain = this.Context.createGain()
        this.gain.gain.setValueAtTime(0.5, this.Context.currentTime);
        this.gain.connect(this.Context.destination)

        this.type = 'sine'
        this.volume = 0.5

        this.bindInputs()

    },
    bindInputs: function() {

        const activeTones = {}
        let isMouseDown = false
        let app = this;

        this.$KeyboardTypeSelect.on('change', function() {
            const val = $(this).val()
            app.type = val
        })

        this.$KeyboardVolumeRange.on('input', function() {
            const val = $(this).val()
            app.gain.gain.setValueAtTime(val / 100, app.Context.currentTime);
        })

        this.$Keyboard.on('mousedown', function() {
            isMouseDown = true
        }).on('mouseup', function() {
            isMouseDown = false
        })

        this.$Keys.on('mouseover', function() {
            if (isMouseDown) {
                const tone = $(this).data('tone')
                if (!activeTones[tone]) {
                    activeTones[tone] = true
                    app.playTones(activeTones)
                }
            }
        }).on('mouseout', function() {
            const tone = $(this).data('tone')
            if (activeTones[tone]) {
                activeTones[tone] = false
                app.playTones(activeTones)
            }
        }).on('mousedown', function() {
            const tone = $(this).data('tone')
            if (!activeTones[tone]) {
                activeTones[tone] = true
                app.playTones(activeTones)
            }
        }).on('mouseup', function() {
            const tone = $(this).data('tone')
            if (activeTones[tone]) {
                activeTones[tone] = false
                app.playTones(activeTones)
            }
        })

        const keyToneReference = {
            '90': '1', // z
            '83': '2', // s
            '88': '3', // x
            '68': '4', // d
            '67': '5', // c
            '86': '6', // v
            '71': '7', // g
            '66': '8', // b
            '72': '9', // h
            '78': '10', // n
            '74': '11', // j
            '77': '12' // m
        }

        $(window).on('keydown', function(e) {
            const tone = keyToneReference[e.which];
            if (tone) {
                if (!activeTones[tone]) {
                    app.$Keys.filter('[data-tone=' + tone + ']').addClass('active')
                    activeTones[tone] = true
                    app.playTones(activeTones)
                }
            }
        }).on('keyup', function(e) {
            const tone = keyToneReference[e.which];
            if (tone) {
                if (activeTones[tone]) {
                    app.$Keys.filter('[data-tone=' + tone + ']').removeClass('active')
                    activeTones[tone] = false
                    app.playTones(activeTones)
                }
            }
        })

    },
    playTones: function(activeTones) {
        _.each(activeTones, (play, toneIndex) => {
            if (play && this.oscillators[toneIndex]) return;
            if (!play && !this.oscillators[toneIndex]) return;
            if (play) {
                const oscillator = this.Context.createOscillator();
                oscillator.type = this.type;
                oscillator.frequency.setValueAtTime(this.calculateFrequencyFromToneIndex(toneIndex), this.Context.currentTime);
                oscillator.connect(this.gain)
                oscillator.start();
                this.oscillators[toneIndex] = oscillator
            } else {
                this.oscillators[toneIndex].stop(this.Context.currentTime)
                this.oscillators[toneIndex] = null
            }
        })
    },
    calculateFrequencyFromToneIndex: function(toneIndex) {
        const distanceFromA = toneIndex - 10;
        const freq = 440 * Math.pow(1.059463094359, distanceFromA)
        return freq;
    }
}

const app = KeyboardApp.create({
    "$Keyboard": $('#KeyboardApp'),
    "$Keys": $('.Key'),
    "$KeyboardTypeSelect": $('#KeyboardTypeSelect'),
    "$KeyboardVolumeRange": $('#KeyboardVolumeRange')
})