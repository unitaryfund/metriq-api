// mongooseService.js

class MongooseService {
    constructor(Model) {
        this.Model = Model;
    }

    async create(data) {
        return await this.Model.save();
    }
}

module.exports = MongooseService;