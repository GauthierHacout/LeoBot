
// Every name of the columns in the SQLite quotes table + the name of the table.
const QUOTES = {
    TABLE: 'quotes',
    QUOTE: 'quote',
    CREATION_DATE: 'creation_date',
    ID: 'id',
    AUTHOR: 'author',
    // Specific SQLite error when trying to add a quote with an
    // already existing id (which is a primary key in the table)
    UNIQUE_ID_ERROR: 'SQLITE_CONSTRAINT: UNIQUE constraint failed: quotes.id',
};

// Every name of the columns in the SQLite codename table + the name of the table
const CODENAME = {
    TABLE: 'codename',
    WORD: 'word',
    CATEGORY: 'category',
};

// Every name of the columns in the SQLite countries table + the name of the table
const COUNTRIES = {
    TABLE: 'countries',
    NAME: 'Name',
    CODE: 'Code',
};

exports.COUNTRIES = COUNTRIES;
exports.QUOTES = QUOTES;
exports.CD = CODENAME;
