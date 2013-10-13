
var _ = require('underscore'),
    moment = require('moment');

exports.transform_tags = function (tags) {
    var type = _.any(tags, 
                     function (tag) { return tag[0] == '!'; }) ? '!tags' : 'tags';
    
    tags = tags
        .map(function (tag) { return tag.replace('!', ''); })
        .join(',');

    return {type: type,
            tags: tags};
};

exports.iso_date = function (date) {
    date = date instanceof Date ? date : moment(date);
    return date.toISOString();
};
