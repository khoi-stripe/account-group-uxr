#!/usr/bin/env node

/**
 * Generate Participant JSON Files from CSV Data
 * 
 * This script reads the organizations.csv file and generates participant JSON files
 * for all organizations, matching the same structure and logic as the prototype.
 */

const fs = require('fs');
const path = require('path');

// Color palette for accounts (same as used in the prototype)
const ACCOUNT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#F43F5E', '#8B5A2B', '#059669', '#7C2D12',
  '#BE123C', '#0369A1', '#7E22CE', '#B91C1C', '#166534'
];

// Organizations that already have participant files (skip these)
const EXISTING_PARTICIPANT_ORGS = [
  'Togetherwork',
  'Vocento'
];

/**
 * Generate account ID based on organization and account name
 * Matches the prototype's generateAccountId logic
 */
function generateAccountId(orgName, accountName, nameCount = 1) {
  const orgPrefix = orgName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 4);
  
  const accountSlug = accountName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 8);
  
  // Generate random suffix (6 characters)
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomSuffix = '';
  for (let i = 0; i < 6; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${orgPrefix}_${accountSlug}_${randomSuffix}`;
}

/**
 * Generate consistent color for account based on account name
 * Matches the prototype's generateAccountColor logic
 */
function generateAccountColor(accountName, accountId) {
  // Use account ID for consistency (since it's unique)
  let hash = 0;
  const str = accountId || accountName;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return ACCOUNT_COLORS[Math.abs(hash) % ACCOUNT_COLORS.length];
}

/**
 * Generate a participant ID
 */
function generateParticipantId() {
  const timestamp = Date.now();
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomId = '';
  for (let i = 0; i < 6; i++) {
    randomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `participant-${timestamp}-${randomId}`;
}

/**
 * Parse CSV content into organization structures
 */
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const header = lines[0];
  
  if (!header.includes('Organization') || !header.includes('Account Name')) {
    throw new Error('CSV must have "Organization" and "Account Name" columns');
  }
  
  const organizations = new Map();
  const accountNameCounters = new Map();
  
  // Process data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parsing (handles quotes)
    const row = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim()); // Add the last field
    
    if (row.length < 2 || !row[0] || !row[1]) continue;
    
    const orgName = row[0];
    const accountName = row[1];
    
    // Track account name occurrences for unique ID generation
    const orgAccountKey = `${orgName}_${accountName}`;
    const nameCount = (accountNameCounters.get(orgAccountKey) || 0) + 1;
    accountNameCounters.set(orgAccountKey, nameCount);
    
    // Initialize organization if not exists
    if (!organizations.has(orgName)) {
      organizations.set(orgName, {
        name: orgName,
        accounts: [
          {
            id: "all_accounts",
            name: orgName,
            type: "Aggregate view",
            isAggregate: true
          }
        ]
      });
    }
    
    // Generate unique ID and color for this account
    const accountId = generateAccountId(orgName, accountName, nameCount);
    const accountColor = generateAccountColor(accountName, accountId);
    
    // Add account to organization
    organizations.get(orgName).accounts.push({
      id: accountId,
      name: accountName,
      originalName: accountName,
      type: "Account",
      color: accountColor
    });
  }
  
  return Array.from(organizations.values());
}

/**
 * Generate participant JSON data for an organization
 */
function generateParticipantData(organization) {
  return {
    scenarioName: organization.name,
    organizationName: organization.name,
    accounts: organization.accounts,
    metadata: {
      createdAt: new Date().toISOString(),
      scenario: `csv-${organization.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      description: `CSV-generated participant data for ${organization.name}`,
      participantFile: true,
      generatedFrom: 'csv-upload-script'
    }
  };
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting CSV to Participant JSON generation...\n');
    
    // Read CSV file
    const csvPath = path.join(__dirname, '..', 'data', 'organizations.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    console.log(`📄 Read CSV file: ${csvPath}`);
    
    // Parse CSV into organizations
    const organizations = parseCSV(csvContent);
    console.log(`📋 Parsed ${organizations.length} organizations from CSV`);
    
    // Filter out organizations that already have participant files
    const newOrganizations = organizations.filter(org => 
      !EXISTING_PARTICIPANT_ORGS.includes(org.name)
    );
    
    console.log(`\n⚠️  Skipping existing participant files for: ${EXISTING_PARTICIPANT_ORGS.join(', ')}`);
    console.log(`✅ Generating participant files for ${newOrganizations.length} organizations:`);
    newOrganizations.forEach(org => console.log(`   - ${org.name} (${org.accounts.length - 1} accounts)`));
    
    // Generate participant files
    const participantDir = path.join(__dirname, '..', 'data', 'participants');
    const results = [];
    
    for (const organization of newOrganizations) {
      const participantId = generateParticipantId();
      const participantData = generateParticipantData(organization);
      const filename = `${participantId}.json`;
      const filepath = path.join(participantDir, filename);
      
      // Write participant file
      fs.writeFileSync(filepath, JSON.stringify(participantData, null, 2));
      
      const participantUrl = `https://khoi-stripe.github.io/account-group-uxr/?data=${participantId}&mode=participant`;
      
      results.push({
        organization: organization.name,
        participantId,
        filename,
        accountCount: organization.accounts.length - 1, // Exclude aggregate account
        url: participantUrl
      });
      
      console.log(`📄 Generated: ${filename}`);
    }
    
    console.log('\n🎯 PARTICIPANT FILES GENERATED:');
    console.log('================================\n');
    
    results.forEach(result => {
      console.log(`📁 Organization: ${result.organization}`);
      console.log(`   File: ${result.filename}`);
      console.log(`   Accounts: ${result.accountCount}`);
      console.log(`   URL: ${result.url}`);
      console.log('');
    });
    
    console.log('✅ All participant files generated successfully!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Review the generated files in data/participants/');
    console.log('2. Commit and push to GitHub: git add . && git commit -m "📄 Generate participant files from CSV" && git push');
    console.log('3. Share participant URLs with research participants');
    
  } catch (error) {
    console.error('❌ Error generating participant files:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { parseCSV, generateParticipantData, generateParticipantId };
