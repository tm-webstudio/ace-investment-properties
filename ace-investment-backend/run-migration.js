const { createClient } = require('@supabase/supabase-js');
const https = require('https');
require('dotenv').config();

// Function to make direct SQL queries via Supabase REST API
async function executeSQLViaAPI(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec_sql', process.env.SUPABASE_URL);
    
    const postData = JSON.stringify({ sql: sql });
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: JSON.parse(data || '{}') });
        } else {
          resolve({ success: false, error: JSON.parse(data || '{}') });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function createTablesDirectly() {
  console.log('🔧 Creating database tables...');

  const sql = `
    -- Create user type enum if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type_enum') THEN
        CREATE TYPE user_type_enum AS ENUM ('investor', 'landlord', 'admin');
        RAISE NOTICE 'Created user_type_enum';
      ELSE
        RAISE NOTICE 'user_type_enum already exists';
      END IF;
    END $$;

    -- Create profiles table if it doesn't exist
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

    -- Create indexes if they don't exist
    CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
    CREATE INDEX IF NOT EXISTS profiles_user_type_idx ON profiles(user_type);
    CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at);

    -- Enable RLS
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    -- Create update timestamp function
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$$$
    BEGIN
        NEW.updated_at = timezone('utc'::text, now());
        RETURN NEW;
    END;
    $$$$ language 'plpgsql';

    -- Create trigger for profiles table
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `;

  try {
    const result = await executeSQLViaAPI(sql);
    
    if (result.success) {
      console.log('✅ Database tables created successfully!');
      
      // Test the table by trying to query it
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('⚠️ Table test failed:', error.message);
        console.log('🔄 Trying direct table creation approach...');
        return await createTablesWithDirectQueries();
      } else {
        console.log('✅ Profiles table is accessible and ready!');
        return true;
      }
    } else {
      console.log('⚠️ SQL execution failed:', result.error);
      console.log('🔄 Trying direct table creation approach...');
      return await createTablesWithDirectQueries();
    }
  } catch (error) {
    console.error('❌ Failed to execute SQL:', error.message);
    console.log('🔄 Trying direct table creation approach...');
    return await createTablesWithDirectQueries();
  }
}

async function createTablesWithDirectQueries() {
  console.log('🔧 Creating tables with direct Supabase client...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Let's just try to create a simple profile record to test
    console.log('Testing if profiles table exists...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (!error) {
      console.log('✅ Profiles table already exists and is accessible!');
      return true;
    }

    console.log('⚠️ Profiles table does not exist or is not accessible.');
    console.log('📝 You need to create the database tables manually in Supabase dashboard.');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/bzibjaodstcyodsfndoh/editor');
    
    return false;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

if (require.main === module) {
  createTablesDirectly().then(() => {
    console.log('🎉 Migration process completed!');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
}

module.exports = { createTablesDirectly, createTablesWithDirectQueries };