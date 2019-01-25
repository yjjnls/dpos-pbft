function beginEpochTime() {
    var d = new Date(1462953000000);

    return d;
}

function getEpochTime(time) {
    if (time === undefined) {
        time = (new Date()).getTime();
    }
    var d = beginEpochTime();
    var t = d.getTime();
    return Math.floor((time - t) / 1000);
}

module.exports = {

    interval: 10,

    delegates: 20,

    getTime: function (time) {
        return getEpochTime(time);
    },

    getRealTime: function (epochTime) {
        if (epochTime === undefined) {
            epochTime = this.getTime();
        }
        var d = beginEpochTime();
        var t = Math.floor(d.getTime() / 1000) * 1000;
        return t + epochTime * 1000;
    },
    // 根据当前时间来产生一个数，对这个数取余就是票选出的见证者ID
    // 每十分钟才会增加一次slot number
    getSlotNumber: function (epochTime) {
        if (epochTime === undefined) {
            epochTime = this.getTime();
        }
        return Math.floor(epochTime / this.interval);
    },

    getSlotTime: function (slot) {
        return slot * this.interval;
    },

    getNextSlot: function () {
        var slot = this.getSlotNumber();

        return slot + 1;
    },

    getLastSlot: function (nextSlot) {
        return nextSlot + this.delegates;
    },

    roundTime: function (date) {
        Math.floor(date.getTime() / 1000) * 1000;
    }
};
