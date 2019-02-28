const BookmarksService = {
  // get
  getAll(db) {
    return db
      .select('*')
      .from('bookmarks');
  },
  getById(db, id) {
    return db
      .select('*')
      .from('bookmarks')
      .where('id', id);
  },
  // insert
  insert(db, obj) {
    return db
      .insert(obj)
      .into('bookmarks')
      .returning('*')
      .then(rows => rows[0]);
  },
  // update
  update(db, id, newBookmark){
    return db('bookmarks')
      .where({id})
      .update(newBookmark)
  },
  // delete
  delete(db, id){
    return db('bookmarks')
      .where({id})
      .delete()
  }
};

module.exports = BookmarksService;