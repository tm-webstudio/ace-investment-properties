const { supabase } = require('../config/supabase');

/**
 * Generic function to get records with pagination and filtering
 * @param {string} table - Table name
 * @param {Object} options - Query options
 * @returns {Object} Query result with data and metadata
 */
const getRecords = async (table, options = {}) => {
    try {
        const {
            select = '*',
            filters = {},
            orderBy = 'created_at',
            ascending = false,
            page = 1,
            limit = 20,
            search = null,
            searchColumns = []
        } = options;

        let query = supabase
            .from(table)
            .select(select, { count: 'exact' });

        // Apply filters
        Object.entries(filters).forEach(([column, value]) => {
            if (Array.isArray(value)) {
                query = query.in(column, value);
            } else if (typeof value === 'object' && value.operator) {
                switch (value.operator) {
                    case 'gte':
                        query = query.gte(column, value.value);
                        break;
                    case 'lte':
                        query = query.lte(column, value.value);
                        break;
                    case 'gt':
                        query = query.gt(column, value.value);
                        break;
                    case 'lt':
                        query = query.lt(column, value.value);
                        break;
                    case 'like':
                        query = query.ilike(column, `%${value.value}%`);
                        break;
                    case 'eq':
                    default:
                        query = query.eq(column, value.value);
                }
            } else {
                query = query.eq(column, value);
            }
        });

        // Apply search across multiple columns
        if (search && searchColumns.length > 0) {
            const searchConditions = searchColumns.map(column => 
                `${column}.ilike.%${search}%`
            ).join(',');
            query = query.or(searchConditions);
        }

        // Apply ordering
        query = query.order(orderBy, { ascending });

        // Apply pagination
        const start = (page - 1) * limit;
        const end = start + limit - 1;
        query = query.range(start, end);

        const { data, error, count } = await query;

        if (error) {
            throw error;
        }

        return {
            success: true,
            data,
            metadata: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
                hasNext: end < count - 1,
                hasPrev: page > 1
            }
        };
    } catch (error) {
        console.error(`Error getting ${table} records:`, error);
        return {
            success: false,
            error: error.message,
            data: [],
            metadata: null
        };
    }
};

/**
 * Generic function to get a single record by ID
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @param {string} select - Columns to select
 * @returns {Object} Query result
 */
const getRecordById = async (table, id, select = '*') => {
    try {
        const { data, error } = await supabase
            .from(table)
            .select(select)
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        return {
            success: true,
            data
        };
    } catch (error) {
        console.error(`Error getting ${table} record:`, error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

/**
 * Generic function to create a new record
 * @param {string} table - Table name
 * @param {Object} data - Record data
 * @param {string} select - Columns to return
 * @returns {Object} Query result
 */
const createRecord = async (table, data, select = '*') => {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .insert(data)
            .select(select)
            .single();

        if (error) {
            throw error;
        }

        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error(`Error creating ${table} record:`, error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

/**
 * Generic function to update a record
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @param {Object} data - Update data
 * @param {string} select - Columns to return
 * @returns {Object} Query result
 */
const updateRecord = async (table, id, data, select = '*') => {
    try {
        const updateData = {
            ...data,
            updated_at: new Date().toISOString()
        };

        const { data: result, error } = await supabase
            .from(table)
            .update(updateData)
            .eq('id', id)
            .select(select)
            .single();

        if (error) {
            throw error;
        }

        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error(`Error updating ${table} record:`, error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

/**
 * Generic function to delete a record
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @returns {Object} Query result
 */
const deleteRecord = async (table, id) => {
    try {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return {
            success: true,
            message: 'Record deleted successfully'
        };
    } catch (error) {
        console.error(`Error deleting ${table} record:`, error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Execute a custom SQL query (use with caution)
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Object} Query result
 */
const executeQuery = async (query, params = []) => {
    try {
        const { data, error } = await supabase.rpc('execute_sql', {
            sql_query: query,
            params
        });

        if (error) {
            throw error;
        }

        return {
            success: true,
            data
        };
    } catch (error) {
        console.error('Error executing custom query:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

module.exports = {
    getRecords,
    getRecordById,
    createRecord,
    updateRecord,
    deleteRecord,
    executeQuery
};