const https = require('https');
require('dotenv').config();

async function createTableViaHTTP() {
    console.log('🔧 Attempting to create profiles table via direct HTTP API...');
    
    const sql = `
        -- Create user type enum
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type_enum') THEN
                CREATE TYPE user_type_enum AS ENUM ('investor', 'landlord', 'admin');
            END IF;
        END $$;

        -- Create profiles table
        CREATE TABLE IF NOT EXISTS profiles (
            id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            first_name TEXT,
            last_name TEXT,
            phone TEXT,
            user_type user_type_enum NOT NULL DEFAULT 'investor',
            profile_complete BOOLEAN DEFAULT FALSE,
            avatar_url TEXT,
            bio TEXT,
            location TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Enable RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

        -- Create policies
        DO $$
        BEGIN
            -- Drop existing policies if they exist
            DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
            DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
            DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
            DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON profiles;

            -- Create new policies
            CREATE POLICY "Users can view own profile" ON profiles
                FOR SELECT USING (auth.uid() = id);

            CREATE POLICY "Users can update own profile" ON profiles
                FOR UPDATE USING (auth.uid() = id);

            CREATE POLICY "Users can insert own profile" ON profiles
                FOR INSERT WITH CHECK (auth.uid() = id);

            CREATE POLICY "Authenticated users can view public profiles" ON profiles
                FOR SELECT USING (auth.role() = 'authenticated');
        END $$;
    `;

    const postData = JSON.stringify({
        query: sql
    });

    const options = {
        hostname: 'bzibjaodstcyodsfndoh.supabase.co',
        port: 443,
        path: '/rest/v1/rpc',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`Response status: ${res.statusCode}`);
                console.log('Response:', data);
                
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ success: true, data });
                } else {
                    resolve({ success: false, error: data });
                }
            });
        });

        req.on('error', (e) => {
            console.error('Request error:', e);
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}

async function testTableExists() {
    console.log('🔍 Testing if profiles table exists...');
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);

        if (error) {
            console.log('❌ Table test failed:', error.message);
            return false;
        } else {
            console.log('✅ Profiles table exists and is accessible!');
            return true;
        }
    } catch (error) {
        console.log('❌ Table test error:', error.message);
        return false;
    }
}

async function createProfileForExistingUser(email) {
    console.log(`🔧 Attempting to create profile for user: ${email}`);
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    try {
        // First, try to get the user from auth.users
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) {
            console.log('❌ Could not list users:', usersError);
            return false;
        }

        const user = users.find(u => u.email === email);
        if (!user) {
            console.log(`❌ User with email ${email} not found in auth.users`);
            return false;
        }

        console.log(`✅ Found user: ${user.id}`);

        // Try to create the profile
        const { data, error } = await supabase
            .from('profiles')
            .insert([{
                id: user.id,
                email: user.email,
                first_name: user.user_metadata?.first_name || '',
                last_name: user.user_metadata?.last_name || '',
                user_type: user.user_metadata?.user_type || 'investor',
                profile_complete: false
            }]);

        if (error) {
            console.log('❌ Profile creation failed:', error);
            return false;
        }

        console.log('✅ Profile created successfully!');
        return true;

    } catch (error) {
        console.log('❌ Profile creation error:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting database setup...');
    
    // Test if table already exists
    const tableExists = await testTableExists();
    
    if (!tableExists) {
        console.log('🔧 Table does not exist, attempting to create...');
        
        // Try to create the table via HTTP
        const createResult = await createTableViaHTTP();
        
        if (createResult.success) {
            console.log('✅ HTTP table creation succeeded!');
        } else {
            console.log('⚠️ HTTP table creation failed:', createResult.error);
        }
        
        // Test again
        const tableExistsAfter = await testTableExists();
        if (!tableExistsAfter) {
            console.log('❌ Table creation failed. Manual SQL execution required.');
            console.log('🔗 Please go to: https://supabase.com/dashboard/project/bzibjaodstcyodsfndoh/editor');
            return;
        }
    }
    
    // Create profile for the test user
    await createProfileForExistingUser('tolu1998@hotmail.co.uk');
    
    console.log('🎉 Setup complete! Try signing in now.');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { createTableViaHTTP, testTableExists, createProfileForExistingUser };