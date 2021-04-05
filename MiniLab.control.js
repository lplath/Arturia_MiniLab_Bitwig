DEBUG = false;

loadAPI(10);

load("MiniLabHardware.js");
load("TrackHandler.js");
load("PadHandler.js");

host.setShouldFailOnDeprecatedUse(DEBUG);
host.defineController("Arturia", "MiniLab", "1.0beta", "3be644d6-8249-470d-9f19-8832015356fd", "lplath");
host.defineMidiPorts(1, 1);

if (host.platformIsWindows())
   host.addDeviceNameBasedDiscoveryPair(["Arturia MINILAB"], ["Arturia MINILAB"]);
else if (host.platformIsMac())
	host.addDeviceNameBasedDiscoveryPair(["Arturia MINILAB"], ["Arturia MINILAB"]);
else if (host.platformIsLinux())
	host.addDeviceNameBasedDiscoveryPair(["Arturia MINILAB MIDI 1"], ["Arturia MINILAB MIDI 1"]);

   
var hardware = null;
var trackHandler = null;
var padHandler = null;

function init() {
   hardware = new MiniLabHardware(host, handleMidi, handleSysex);
   trackHandler = new TrackHandler(host, hardware);
   padHandler = new PadHandler(host, host.createTransport());
}

function handleMidi(status, data1, data2) {

   if(DEBUG)
      println("[MIDI] status = " + status + " data1 = " + data1 + " data2 = " + data2);


   if(trackHandler.handleMidi(status, data1, data2))
      return;

   if(padHandler.handleMidi(status, data1, data2))
      return;

   if(DEBUG) {
      host.errorln("Midi command not processed: " + status + " : " + data1);
   }

}

function handleSysex(data) {
   println(data);
}

function flush() {}

function exit() {}