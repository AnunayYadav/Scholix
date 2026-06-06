const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const url = 'https://shmwnwftpbqyfrbrrrtv.supabase.co/rest/v1/';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobXdud2Z0cGJxeWZyYnJycnR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc2OTA2OSwiZXhwIjoyMDg1MzQ1MDY5fQ.xBCD58w_SFGD__CWLMyq_bC2gcAZDAtlF_TtiAW3dPA';

async function inspectSchema() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': key,
        'Content-Type': 'application/json'
      }
    });
    const schema = await res.json();
    console.log('API schema root keys:', Object.keys(schema));
    if (schema.definitions) {
      console.log('Definitions keys:', Object.keys(schema.definitions));
      console.log('questions schema:', JSON.stringify(schema.definitions.questions, null, 2));
    } else if (schema.components && schema.components.schemas) {
      console.log('Schemas keys:', Object.keys(schema.components.schemas));
      console.log('questions schema:', JSON.stringify(schema.components.schemas.questions, null, 2));
    } else {
      console.log('No definitions/schemas found. Keys:');
      console.log(JSON.stringify(schema, null, 2).slice(0, 1000));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

inspectSchema();
