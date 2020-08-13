import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('rooms_events', table => {
    table.increments('id').primary();
    table
      .integer('id_room')
      .notNullable()
      .references('id')
      .inTable('rooms')
      .onDelete('CASCADE');
    table
      .integer('id_event')
      .notNullable()
      .references('id')
      .inTable('events')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('rooms_events');
}