load("DeviceMemory.js")

function MiniLabHardware(host, onMidi, onSysex) {
    
    this.host = host

    this.portOut = host.getMidiOutPort(0);
    this.portIn = host.getMidiInPort(0);

    this.isOctaveDownPressed = false;
    this.isOctaveUpPressed = false;

    this.keyboardInput = this.portIn.createNoteInput(
        "MiniLab Keys", 
        "80????",   // Ch. 1 Note off
        "90????",   // Ch. 1 Note on
        "B001??",   // CC 1 (Mod Wheel)
        "B002??",   // CC 1 (Breath Controler)
        "B007??",   // CC 1 (Channel Volume)
        "B00B??",   // CC 1 (Expression Controller)
        "B040??",   // CC 1 (Sustain Pedal)
        "C0????",   // Ch. 1 Prog. Change
        "D0????",   // Ch. 1 Aftertouch
        "E0????"    // Ch. 1 Pitchbend
        );

    this.keyboardInput.setShouldConsumeEvents(true);

    // Assign notes from MIDI Channel 10 to the PAD
    this.padInput = this.portIn.createNoteInput("MiniLab Pads", "?9????");
    this.padInput.setShouldConsumeEvents(false);
    this.padInput.assignPolyphonicAftertouchToExpression(0, NoteExpression.TIMBRE_UP, 2);

    // Arturia ID: 00 20 6B
    this.host.defineSysexIdentityReply("F0 7E ?? 06 02 00 20 6B 02 00 04 0? ?? ?? ?? ?? F7");

    this.portIn.setMidiCallback(onMidi);
    this.portIn.setSysexCallback(onSysex);

    // Flash the custom mapping to the device
    this.flashMemory();

    var padVelocitySetting = this.host.getPreferences().getEnumSetting("Pads", "Velocity Curve", ["Linear", "Logarithmic", "Exponential", "Full"], "Linear");
    padVelocitySetting.markInterested();
    padVelocitySetting.addValueObserver((function(value) {
        switch(value) {
            case "Linear":
                this.onPadVelocityCurveChanged(0);
            break;
            case "Logarithmic":
                this.onPadVelocityCurveChanged(1);
            break;
            case "Exponential":
                this.onPadVelocityCurveChanged(2);
            break;
            case "Full":
                this.onPadVelocityCurveChanged(3);
            break;
        }
        }).bind(this)
    );

    var keyVelocitySetting = this.host.getPreferences().getEnumSetting("Keyboard", "Velocity Curve", ["Linear", "Logarithmic", "Exponential", "Full"], "Linear");
    keyVelocitySetting.markInterested();
    keyVelocitySetting.addValueObserver((function(value) {
        switch(value) {
            case "Linear":
                this.onKeyVelocityCurveChanged(0);
            break;
            case "Logarithmic":
                this.onKeyVelocityCurveChanged(1);
            break;
            case "Exponential":
                this.onPadVelocityCurveChanged(2);
            break;
            case "Full":
                this.onKeyVelocityCurveChanged(3);
            break;
        } 
        }).bind(this)
    );

    var knobAccelerationSetting = this.host.getPreferences().getEnumSetting("Knobs", "Acceleration", ["Slow (Off)", "Medium", "Fast"], "Slow (Off)");
    knobAccelerationSetting.markInterested();
    knobAccelerationSetting.addValueObserver((function(value) {
        switch(value) {
            case "Slow (Off)":
                this.onPadVelocityCurveChanged(0);
            break;
            case "Medium":
                this.onPadVelocityCurveChanged(1);
            break;
            case "Fast":
                this.onPadVelocityCurveChanged(2);
            break;
        }
        }).bind(this)
    );
}

MiniLabHardware.prototype.flashMemory = function() {
    for(var i = 0; i < DEVICE_MEMORY.length; i++) {
        sendSysex(DEVICE_MEMORY[i]);
    }
}

MiniLabHardware.prototype.shiftPads = function(rootNote) {
    var table = initArray(0, 128);

    for(var i = 0; i < 128; i++) {
        table[i] = ((rootNote - 1) * 12) + i;
        // If the result is out of the MIDI Note Range, set it to -1 so the Note is not played:
        if(table[i] < 0 || table[i] > 127) {
           table[i] = -1;
        }
     }

    this.padInput.setKeyTranslationTable(table);
}

MiniLabHardware.prototype.onPadVelocityCurveChanged = function(value) {
    sendSysex("F0 00 20 6B 7F 42 02 00 41 03 0" + value + " F7");
}

MiniLabHardware.prototype.onKeyVelocityCurveChanged = function(value) {
    sendSysex("F0 00 20 6B 7F 42 02 00 41 01 0" + value + " F7");
}

MiniLabHardware.prototype.onKnobAccelerationChanged = function(value) {
    sendSysex("F0 00 20 6B 7F 42 02 00 41 04 0" + value + " F7");
}