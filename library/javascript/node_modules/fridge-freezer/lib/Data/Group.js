/**
 * Group data by a ordered key.
 *
 * @class
 * @exports Data/Group
 * @param  {Function} flushCallback callback for grouped data.
 */
var Group = function(flushCallback) {
    this.flushCallback = flushCallback;
    this.clear();
};

/**
 * The current key.
 * @type {string}
 */
Group.prototype.currentKey = null;

/**
 * The data buffer.
 * @type {Array}
 */
Group.prototype.buffer = null;

/**
 * Push new data in the grouper.
 * @param  {String} key The group key.
 * @param  {Object} row A data row.
 */
Group.prototype.push = function(key, row) {
    if (this.currentKey !== key.toString()) {
        this.flush();
        this.currentKey = key.toString();
    }

    return this.buffer.push(row);
};

/**
 * Flush the data out of the buffer.
 */
Group.prototype.flush = function() {
    if (this.buffer.length === 0) {
        return;
    }

    this.flushCallback(this.buffer, this.currentKey);
    this.clear();
};

/**
 * Clear the buffer.
 */
Group.prototype.clear = function() {
    this.buffer = [];
};

/**
 * Close all open resources
 * Must be called at the end.
 */
Group.prototype.close = function() {
    this.flush();
};

/**
 * @property {number}   length    - Current length of the buffer.
 */
Object.defineProperty(Group.prototype, 'length', {
    get: function() {
        return this.buffer.length;
    },
    enumerable: false,
    configurable: false
});

module.exports = Group;
