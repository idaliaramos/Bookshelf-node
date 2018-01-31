exports.up = function(knex, Promise) {
  return knex.schema.createTable('favorites', table => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .notNullable()
      .references('users.id')
      .onDelete('CASCADE')
      .index();
    table
      .integer('book_id')
      .notNullable()
      .references('books.id')
      .onDelete('CASCADE')
      .index();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('favorites');
};
