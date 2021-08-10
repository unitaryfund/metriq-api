// mongooseService.js

class MongooseService {
  constructor (Collection) {
    this.Collection = Collection
  }

  async new () {
    return new this.Collection()
  }

  async create (data) {
    return await data.save()
  }

  async find (keyValuePair) {
    return await this.Collection.find(keyValuePair).exec()
  }
}

module.exports = MongooseService
