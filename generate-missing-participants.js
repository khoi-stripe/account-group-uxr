/**
 * Generate participant JSON files for missing organizations
 * Run this in the browser console on your prototype page
 */

async function generateMissingParticipantFiles() {
  console.log('🚀 Starting participant file generation for missing organizations...');
  
  // Check if OrgDataManager is available
  if (!window.OrgDataManager || !window.OrgDataManager.organizations) {
    console.error('❌ OrgDataManager not available. Please load the prototype page first.');
    return;
  }
  
  const organizations = window.OrgDataManager.organizations;
  console.log('📋 Found organizations:', organizations.map(org => org.name));
  
  // Organizations that already have participant files
  const existingParticipantFiles = [
    'Togetherwork',
    'Vocento'
  ];
  
  // Find missing organizations
  const missingOrgs = organizations.filter(org => 
    !existingParticipantFiles.includes(org.name)
  );
  
  console.log('⚠️ Missing participant files for:', missingOrgs.map(org => org.name));
  
  if (missingOrgs.length === 0) {
    console.log('✅ All organizations already have participant files!');
    return;
  }
  
  // Generate participant files for missing organizations
  const participantFiles = {};
  
  missingOrgs.forEach((org, index) => {
    const timestamp = Date.now() + (index * 1000); // Stagger timestamps
    const participantId = `participant-${timestamp}-${generateRandomId()}`;
    
    const participantData = {
      scenarioName: org.name,
      organizationName: org.name,
      accounts: org.accounts || [],
      metadata: {
        createdAt: new Date().toISOString(),
        scenario: `csv-${org.name.toLowerCase().replace(/\s+/g, '-')}`,
        description: `CSV-generated participant data for ${org.name}`,
        participantFile: true,
        generatedFrom: 'csv-upload'
      }
    };
    
    participantFiles[participantId] = {
      filename: `${participantId}.json`,
      content: JSON.stringify(participantData, null, 2),
      orgName: org.name,
      url: `${window.location.origin}${window.location.pathname}?data=${participantId}&mode=participant`
    };
    
    console.log(`📄 Generated: ${participantId}.json for ${org.name}`);
  });
  
  // Display results
  console.log('\n🎯 PARTICIPANT FILES GENERATED:');
  console.log('================================');
  
  Object.entries(participantFiles).forEach(([participantId, fileData]) => {
    console.log(`\n📁 ${fileData.filename}`);
    console.log(`   Organization: ${fileData.orgName}`);
    console.log(`   URL: ${fileData.url}`);
    console.log(`   Content ready for download`);
  });
  
  console.log('\n📥 DOWNLOAD FILES:');
  console.log('==================');
  
  // Create download for each file
  Object.entries(participantFiles).forEach(([participantId, fileData]) => {
    const blob = new Blob([fileData.content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileData.filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    console.log(`📄 Click to download ${fileData.filename}:`, link);
    
    // Auto-download (comment out if you don't want auto-download)
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
  });
  
  console.log('\n✅ All participant files generated and downloaded!');
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Upload all downloaded JSON files to data/participants/ folder');
  console.log('2. Commit and push to GitHub');
  console.log('3. Share the participant URLs above with your research participants');
  
  return participantFiles;
}

// Helper function to generate random ID
function generateRandomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Auto-run the function
generateMissingParticipantFiles();
