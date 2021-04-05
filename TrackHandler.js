load("Midi.js");
load("Utils.js");

const KNOBS_REMOTE = [102, 103, 104, 105, 110, 111, 112, 113];
const KNOBS_SEND = [106, 107, 108, 109];
const KNOB_VOLUME = 117;
const KNOB_PAN = 116;

const OCTAVE_DOWN = 20;
const OCTAVE_UP = 21;


function TrackHandler(host, hardware) {
    this.host = host;
    this.hardware = hardware;

    
    this.cursorTrack = this.host.createCursorTrack(4, 0);
    this.cursorDevice = this.cursorTrack.createCursorDevice();
    this.remoteControls = this.cursorDevice.createCursorRemoteControlsPage(8);

    this.sendBank = this.cursorDevice.channel().sendBank();

    for (var i = 0; i < 8; i++) {
		var p = this.remoteControls.getParameter(i).getAmount();
		p.setIndication(true);
		p.setLabel("P" + (i + 1));
    }
}

TrackHandler.prototype.handleMidi = function(status, data1, data2) {
    if(Midi.isCC(status)) {

        var increment = (data2 - 64) * 0.1;

        if(KNOBS_REMOTE.includes(data1)) {
            var paramIndex = KNOBS_REMOTE.indexOf(data1);
            
            this.remoteControls.getParameter(paramIndex).inc(increment, 128);

            return true;
        }

        else if(KNOBS_SEND.includes(data1)) {
            var knobIndex = KNOBS_SEND.indexOf(data1);

            this.sendBank.getItemAt(knobIndex).value().inc(increment, 128)
        }

        else if(data1 == KNOB_VOLUME) {

            this.cursorTrack.volume().value().inc(increment, 128);
        }

        else if(data1 == KNOB_PAN) {

            this.cursorTrack.pan().value().inc(increment, 128);
        }

        else if(data1 == OCTAVE_DOWN) {
            if(data2 != 127) {
                this.hardware.isOctaveDownPressed = false;
                return true;
            }
            this.hardware.isOctaveDownPressed = true;

            if(this.hardware.isOctaveUpPressed) {
                // Reset
                this.remoteControls.selectedPageIndex().set(0);
            }
            else {
                // Previous Page
                this.remoteControls.selectPreviousPage(false);
            }

            return true;
        }

        else if(data1 == OCTAVE_UP) {
            if(data2 != 127) {
                this.hardware.isOctaveUpPressed = false;
                return true;
            }
            this.hardware.isOctaveUpPressed = true;

            if(this.hardware.isOctaveDownPressed) {
                // Reset
                this.remoteControls.selectedPageIndex().set(0);
            }
            else {
                // Next Page
                this.remoteControls.selectNextPage(false);
            }

            return true;
        }
    }
}