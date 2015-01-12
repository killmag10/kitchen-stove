var JavaSystem = java.lang.System;

var Properties = {};

Properties.get = function(key)
{
    return String(JavaSystem.getProperties().getProperty(key));
}

Properties.getAsObject = function(regex)
{
    var propertyList = JavaSystem.getProperties().entrySet().toArray();
    var result = {};

    if (regex) {
        // filter regex matching items
        propertyList = propertyList.filter(function(item) {
            return (item.getKey().search(regex) >= 0)
        });
    }

    propertyList = propertyList.forEach(function(item) {
        var propertyKey = String(item.getKey());

        // Remove regex part
        if (regex) propertyKey = propertyKey.replace(regex , '');

        result[propertyKey] = String(item.getValue());
    });

    return result;
}

module.exports = Properties;
