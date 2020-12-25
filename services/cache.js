const {promisify} = require('util')
const mongoose = require('mongoose')
const redis = require('redis')

const keys = require('../config/keys')

const client = redis.createClient(keys.redisUrl, {password: keys.redisPassword })
client.hget = promisify(client.hget)

mongoose.Query.prototype.useCache = function(opts = {}) {
  this._useCache = true
  this._cacheTimeout = opts.timeout || 600
  this._cacheKey = JSON.stringify(opts.key || '')
  return this
}

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.exec = async function () {
  if(!this._useCache) return exec.apply(this, arguments)

  const key = JSON.stringify(Object.assign({}, this.getFilter(), {collection: this.mongooseCollection.name}))
  const cachedValue = await client.hget(this._cacheKey, key)

  if(cachedValue) {
    const doc = JSON.parse(cachedValue)

    return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc)
  }
  
  const value = await exec.apply(this, arguments)
  
  client.hset(this._cacheKey, key,  JSON.stringify(value))
  client.expire(this._cacheKey, this._cacheTimeout)

  return value
}

module.exports.clearCache = function(key) {
  client.del(JSON.stringify(key))
}

