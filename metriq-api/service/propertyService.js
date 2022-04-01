// propertyService.js

// This is our first "domain" object, comprising multiple models linked by domain-specific knowledge.
// It doesn't exactly fit the model-service-controller abstraction paradigm that we use, but maybe we can build a "domain" interface at this level.

class PropertyService {
  async submit (userId, property) {
    // TODO
  }

  async update (params, property, userId) {
    // TODO
  }
}

module.exports = PropertyService
