var Midi = {
    isCC: function(status){ 
        return (status & 0xF0) == 0xB0;
    }
}