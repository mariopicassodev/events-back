const handlePrismaError = (error) => {
    console.error('Prisma error:', error); // Log the full error for debugging

    const meta = error.meta || {}; // Safely access the meta property

    switch (error.code) {
        case 'P2000':
            return { status: 400, message: `The provided value for the column is too long for the column's type. Column: ${meta.column_name}` };
        case 'P2001':
            return { status: 404, message: `The record searched for in the where condition does not exist. Model: ${meta.model_name}, Argument: ${meta.argument_name}, Value: ${meta.argument_value}` };
        case 'P2002':
            return { status: 400, message: `Unique constraint failed on the ${meta.constraint}` };
        case 'P2003':
            return { status: 400, message: `Foreign key constraint failed on the field: ${meta.field_name}` };
        case 'P2004':
            return { status: 500, message: `A constraint failed on the database: ${meta.database_error}` };
        case 'P2005':
            return { status: 500, message: `The value ${meta.field_value} stored in the database for the field ${meta.field_name} is invalid for the field's type` };
        case 'P2006':
            return { status: 400, message: `The provided value ${meta.field_value} for ${meta.model_name} field ${meta.field_name} is not valid` };
        case 'P2007':
            return { status: 400, message: `Data validation error: ${meta.database_error}` };
        case 'P2008':
            return { status: 400, message: `Failed to parse the query: ${meta.query_parsing_error} at ${meta.query_position}` };
        case 'P2009':
            return { status: 400, message: `Failed to validate the query: ${meta.query_validation_error} at ${meta.query_position}` };
        case 'P2010':
            return { status: 500, message: `Raw query failed. Code: ${meta.code}. Message: ${meta.message}` };
        case 'P2011':
            return { status: 400, message: `Null constraint violation on the ${meta.constraint}` };
        case 'P2012':
            return { status: 400, message: `Missing a required value at ${meta.path}` };
        case 'P2013':
            return { status: 400, message: `Missing the required argument ${meta.argument_name} for field ${meta.field_name} on ${meta.object_name}` };
        case 'P2014':
            return { status: 400, message: `The change you are trying to make would violate the required relation '${meta.relation_name}' between the ${meta.model_a_name} and ${meta.model_b_name} models` };
        case 'P2015':
            return { status: 404, message: `A related record could not be found. ${meta.details}` };
        case 'P2016':
            return { status: 400, message: `Query interpretation error: ${meta.details}` };
        case 'P2017':
            return { status: 400, message: `The records for relation ${meta.relation_name} between the ${meta.parent_name} and ${meta.child_name} models are not connected` };
        case 'P2018':
            return { status: 404, message: `The required connected records were not found. ${meta.details}` };
        case 'P2019':
            return { status: 400, message: `Input error: ${meta.details}` };
        case 'P2020':
            return { status: 400, message: `Value out of range for the type: ${meta.details}` };
        case 'P2021':
            return { status: 404, message: `The table ${meta.table} does not exist in the current database` };
        case 'P2022':
            return { status: 404, message: `The column ${meta.column} does not exist in the current database` };
        case 'P2023':
            return { status: 500, message: `Inconsistent column data: ${meta.message}` };
        case 'P2024':
            return { status: 500, message: `Timed out fetching a new connection from the connection pool. Timeout: ${meta.timeout}, Connection limit: ${meta.connection_limit}` };
        case 'P2025':
            return { status: 404, message: `An operation failed because it depends on one or more records that were required but not found. ${meta.cause}` };
        case 'P2026':
            return { status: 400, message: `The current database provider doesn't support a feature that the query used: ${meta.feature}` };
        case 'P2027':
            return { status: 500, message: `Multiple errors occurred on the database during query execution: ${meta.errors}` };
        case 'P2028':
            return { status: 500, message: `Transaction API error: ${meta.error}` };
        case 'P2029':
            return { status: 400, message: `Query parameter limit exceeded error: ${meta.message}` };
        case 'P2030':
            return { status: 400, message: `Cannot find a fulltext index to use for the search` };
        case 'P2031':
            return { status: 400, message: `Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set` };
        case 'P2033':
            return { status: 400, message: `A number used in the query does not fit into a 64 bit signed integer` };
        case 'P2034':
            return { status: 500, message: `Transaction failed due to a write conflict or a deadlock` };
        case 'P2035':
            return { status: 500, message: `Assertion violation on the database: ${meta.database_error}` };
        case 'P2036':
            return { status: 500, message: `Error in external connector. ID: ${meta.id}` };
        case 'P2037':
            return { status: 500, message: `Too many database connections opened: ${meta.message}` };
        default:
            return { status: 500, message: 'An unexpected error occurred' };
    }
};

module.exports = handlePrismaError;
