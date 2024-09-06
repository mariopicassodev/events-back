const { GraphQLError } = require('graphql');

function handlePrismaError(error) {
    console.error('Prisma error:', error); // Log the full error for debugging

    const meta = error.meta || {}; // Safely access the meta property

    switch (error.code) {
        case 'P2000':
            return new GraphQLError('The provided value for the column is too long for the column\'s type.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    columnName: meta.column_name,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2001':
            return new GraphQLError('The record searched for in the where condition does not exist.', {
                extensions: {
                    code: 'NOT_FOUND',
                    modelName: meta.model_name,
                    argumentName: meta.argument_name,
                    argumentValue: meta.argument_value,
                    http: {
                        status: 404,
                    },
                },
            });
        case 'P2002':
            return new GraphQLError('Unique constraint failed.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    constraint: meta.constraint,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2003':
            return new GraphQLError('Foreign key constraint failed.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    fieldName: meta.field_name,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2004':
            return new GraphQLError('A constraint failed on the database.', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                    databaseError: meta.database_error,
                    http: {
                        status: 500,
                    },
                },
            });
        case 'P2005':
            return new GraphQLError('The value stored in the database is invalid for the field\'s type.', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                    fieldValue: meta.field_value,
                    fieldName: meta.field_name,
                    http: {
                        status: 500,
                    },
                },
            });
        case 'P2006':
            return new GraphQLError('The provided value for the field is not valid.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    fieldValue: meta.field_value,
                    modelName: meta.model_name,
                    fieldName: meta.field_name,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2007':
            return new GraphQLError('Data validation error.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    databaseError: meta.database_error,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2008':
            return new GraphQLError('Failed to parse the query.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    queryParsingError: meta.query_parsing_error,
                    queryPosition: meta.query_position,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2009':
            return new GraphQLError('Failed to validate the query.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    queryValidationError: meta.query_validation_error,
                    queryPosition: meta.query_position,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2010':
            return new GraphQLError('Raw query failed.', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                    rawQueryErrorCode: meta.code,
                    rawQueryErrorMessage: meta.message,
                    http: {
                        status: 500,
                    },
                },
            });
        case 'P2011':
            return new GraphQLError('Null constraint violation.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    constraint: meta.constraint,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2012':
            return new GraphQLError('Missing a required value.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    path: meta.path,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2013':
            return new GraphQLError('Missing the required argument for field.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    argumentName: meta.argument_name,
                    fieldName: meta.field_name,
                    objectName: meta.object_name,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2014':
            return new GraphQLError('The change you are trying to make would violate the required relation.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    relationName: meta.relation_name,
                    modelAName: meta.model_a_name,
                    modelBName: meta.model_b_name,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2015':
            return new GraphQLError('A related record could not be found.', {
                extensions: {
                    code: 'NOT_FOUND',
                    details: meta.details,
                    http: {
                        status: 404,
                    },
                },
            });
        case 'P2016':
            return new GraphQLError('Query interpretation error.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    details: meta.details,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2017':
            return new GraphQLError('The records for relation are not connected.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    relationName: meta.relation_name,
                    parentName: meta.parent_name,
                    childName: meta.child_name,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2018':
            return new GraphQLError('The required connected records were not found.', {
                extensions: {
                    code: 'NOT_FOUND',
                    details: meta.details,
                    http: {
                        status: 404,
                    },
                },
            });
        case 'P2019':
            return new GraphQLError('Input error.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    details: meta.details,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2020':
            return new GraphQLError('Value out of range for the type.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    details: meta.details,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2021':
            return new GraphQLError('The table does not exist in the current database.', {
                extensions: {
                    code: 'NOT_FOUND',
                    table: meta.table,
                    http: {
                        status: 404,
                    },
                },
            });
        case 'P2022':
            return new GraphQLError('The column does not exist in the current database.', {
                extensions: {
                    code: 'NOT_FOUND',
                    column: meta.column,
                    http: {
                        status: 404,
                    },
                },
            });
        case 'P2023':
            return new GraphQLError('Inconsistent column data.', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: meta.message,
                    http: {
                        status: 500,
                    },
                },
            });
        case 'P2024':
            return new GraphQLError('Timed out fetching a new connection from the connection pool.', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                    timeout: meta.timeout,
                    connectionLimit: meta.connection_limit,
                    http: {
                        status: 500,
                    },
                },
            });
        case 'P2025':
            return new GraphQLError('An operation failed because it depends on one or more records that were required but not found.', {
                extensions: {
                    code: 'NOT_FOUND',
                    cause: meta.cause,
                    http: {
                        status: 404,
                    },
                },
            });
        case 'P2026':
            return new GraphQLError('The current database provider doesn\'t support a feature that the query used.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    feature: meta.feature,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2027':
            return new GraphQLError('Multiple errors occurred on the database during query execution.', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                    errors: meta.errors,
                    http: {
                        status: 500,
                    },
                },
            });
        case 'P2028':
            return new GraphQLError('Transaction API error.', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                    error: meta.error,
                    http: {
                        status: 500,
                    },
                },
            });
        case 'P2029':
            return new GraphQLError('Query parameter limit exceeded error.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    message: meta.message,
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2030':
            return new GraphQLError('Cannot find a fulltext index to use for the search.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2031':
            return new GraphQLError('Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2033':
            return new GraphQLError('A number used in the query does not fit into a 64 bit signed integer.', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    http: {
                        status: 400,
                    },
                },
            });
        case 'P2034':
            return new GraphQLError('Transaction failed due to a write conflict or a deadlock.', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                    http: {
                        status: 500,
                    },
                },
            });
        case 'P2035':
            return new GraphQLError('Assertion violation on the database.', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                    databaseError: meta.database_error,
                    http: {
                        status: 500,
                    },
                },
            });
        case 'P2036':
            return new GraphQLError('Error in external connector.', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                    id: meta.id,
                    http: {
                        status: 500,
                    },
                },
            });
        case 'P2037':
            return new GraphQLError('Too many database connections opened.', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: meta.message,
                    http: {
                        status: 500,
                    },
                },
            });
        default:
            return new GraphQLError('An unexpected error occurred.', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                    http: {
                        status: 500,
                    },
                },
            });
    }
}

module.exports = handlePrismaError;
