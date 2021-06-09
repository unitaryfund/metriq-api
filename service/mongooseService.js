// mongooseService.js

class MongooseService {
    constructor(Collection) {
        this.Collection = Collection;
    }

    async create(data) {
        return await data.save();
    }
}

module.exports = MongooseService;