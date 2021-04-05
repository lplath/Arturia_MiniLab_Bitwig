Array.prototype.includes = function(item) {
    for(var i = 0; i < this.length; i++) {
        if (this[i] == item)
            return true;
    }
    return false;
}