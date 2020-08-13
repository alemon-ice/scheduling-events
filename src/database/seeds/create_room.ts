import Knex from 'knex';

export async function seed(knex: Knex) {
  await knex('rooms').insert([
    {
      name: 'Sala 12',
      building: 'Bloco A',
    },
    {
      name: 'Sala 55',
      building: 'Bloco B',
    },
  ]);
}