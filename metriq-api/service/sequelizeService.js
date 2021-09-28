// sequelizeService.js

class SequelizeService {
  constructor (Collection) {
    this.Collection = Collection
  }

  async new () {
    return this.Collection.build({})
  }

  async create (data) {
    return await data.save()
  }

  async find (keyValuePair) {
    return await this.Collection.findAll({ where: keyValuePair })
  }

  async projectAll (attributes) {
    return await this.Collection.findAll({ attributes: attributes })
  }

  async findAndProject (keyValuePair, attributes) {
    return await this.Collection.findAll({ where: keyValuePair, attributes: attributes })
  }

  async distinctAll (attribute) {
    return await this.Collection.aggregate(attribute, 'DISTINCT', { plain: false })
  }
}

module.exports = SequelizeService
