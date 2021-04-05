const PADS_1 = [36, 37, 38, 39, 40, 41, 42, 43];
const PADS_2 = [44, 45, 46, 47, 48, 49, 50, 51];

function PadHandler(host, transport) {
    this.host = host;
    this.transport = transport;

    this.isPadPressed = [false, false, false, false, false, false, false, false];

    this.userMacros = {
        "Unassigned" : function() {},
        "Continue Playback" : function() { this.transport.continuePlayback() },
        "Stop" : function() { this.transport.stop() },
        "Toggle Play" : function() { this.transport.togglePlay() },
        "Restart" : function() { this.transport.restart() },
        "Record" : function() { this.transport.record() },
        "Rewind" : function() { this.transport.rewind() },
        "Fast Forward" : function() { this.transport.fastForward() },
        "Tap Tempo" : function() { this.transport.tapTempo() },
        "Toggle Loop" : function() { this.transport.isArrangerLoopEnabled().toggle() },
        "Toggle Punch In" : function() { this.transport.isPunchInEnabled().toggle() },
        "Toggle Pounch Out" : function() { this.transport.isPunchOutEnabled().toggle() },
        "Toggle Click" : function() { this.transport.isMetronomeEnabled().toggle() },
        "Toggle Metronome Ticks" : function() { this.transport.isMetronomeTickPlaybackEnabled().toggle },
        "Toggle Metronome During Pre-Roll" : function() { this.transport.isMetronomeAudibleDuringPreRoll().toggle() },
        "Toggle Overdub" : function() { this.transport.isArrangerOverdubEnabled().toggle() },
        "Toggle Launcher Overdub" : function() { this.transport.isClipLauncherOverdubEnabled().toggle() },
        "Toggle Latch Automation Write-Mode" : function() { this.transport.toggleLatchAutomationWriteMode() },
        "Toggle Write Arranger Automation" : function() { this.transport.toggleWriteArrangerAutomation() },
        "Toggle Write Clip-Launcher Automation" : function() { this.transport.toggleWriteClipLauncherAutomation() },
        "Reset Automation Overrides" : function() { this.transport.resetAutomationOverrides() },
        "Return To Arrangment" : function() { this.transport.returnToArrangement() },
        "Launch From Play-Start Position" : function() { this.transport.launchFromPlayStartPosition() },
        "Jump To Play-Start Position" : function() { this.transport.jumpToPlayStartPosition()},
        "Jump To Previous Cue-Marker" : function() { this.transport.jumpToPreviousCueMarker() },
        "Jump To Next Cue-Marker" : function() { this.transport.jumToNextCueMarker() }
    };

    this.assignedMacros = initArray(0, 8);

    /* Root Pad Setting */
    var padRootSetting = this.host.getPreferences().getEnumSetting("Pads", "Root Note", ["C0", "C1", "C2", "C3", "C4"], "C1");
    padRootSetting.markInterested();
    padRootSetting.addValueObserver(function(value) {
        this.hardware.shiftPads(parseInt(value[1]));
    });

    /* Macro Settings */
    for(var i = 0; i < 8; i++) {
        var padMacroSetting = this.host.getPreferences().getEnumSetting("Pad " + (i + 1), "Macros", Object.keys(this.userMacros), "Unassigned");
        padMacroSetting.markInterested();
        padMacroSetting.addValueObserver(function(padIndex, macroName) {
            this.assignedMacros[padIndex] = macroName;
        }.bind(this, i))
    }
}

PadHandler.prototype.handleMidi = function(status, data1, data2) {
    if(PADS_1.includes(data1)) {
        
        var padIndex = PADS_1.indexOf(data1)

        // Channel 10 Note on
        if(status == 153) {
            this.isPadPressed[padIndex] = true;
            return true;
        }

        // Channel 10 Note off
        else if(status == 137) {

            if(!this.isPadPressed[padIndex]) {
                var macroName = this.assignedMacros[padIndex];
                
                if(!Object.keys(this.userMacros).includes(macroName)) {
                    host.errorln("Can't find macro : " + macroName);
                    return false;
                }

                this.userMacros[macroName].call(this);
            }

            this.isPadPressed[padIndex] = false;
            return true;
        }
    }
}