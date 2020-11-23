'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddFatherToProductSchema extends Schema {
  up () {
    this.table('add_father_to_products', (table) => {
      // alter table
    })
  }

  down () {
    this.table('add_father_to_products', (table) => {
      // reverse alternations
    })
  }
}

module.exports = AddFatherToProductSchema
