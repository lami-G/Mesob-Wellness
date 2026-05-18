#!/usr/bin/env node

/**
 * MESOB Wellness System - Emoji Removal Script
 * Removes all emojis and replaces them with professional Lucide React icons
 */

const fs = require('fs');
const path = require('path');

// Emoji to Lucide Icon mapping
const emojiReplacements = {
  // Charts & Analytics
  '📊': '<BarChart3 size={SIZE} />',
  '📈': '<TrendingUp size={SIZE} />',
  '📉': '<TrendingDown size={SIZE} />',
  '📋': '<ClipboardList size={SIZE} />',
  
  // Medical & Health
  '🏥': '<Building2 size={SIZE} />',
  '🩺': '<Activity size={SIZE} />',
  '💉': '<Syringe size={SIZE} />',
  '💊': '<Pill size={SIZE} />',
  
  // People & Users
  '👥': '<Users size={SIZE} />',
  '👨‍⚕️': '<User size={SIZE} />',
  '👩‍⚕️': '<User size={SIZE} />',
  '👔': '<Briefcase size={SIZE} />',
  
  // Status & Actions
  '✅': '<CheckCircle size={SIZE} />',
  '❌': '<XCircle size={SIZE} />',
  '⚠️': '<AlertTriangle size={SIZE} />',
  '🚨': '<AlertCircle size={SIZE} />',
  '⏳': '<Clock size={SIZE} />',
  '⏱️': '<Clock size={SIZE} />',
  '✏️': '<Edit size={SIZE} />',
  '➕': '<Plus size={SIZE} />',
  '💾': '<Save size={SIZE} />',
  
  // Locations & Buildings
  '📍': '<MapPin size={SIZE} />',
  '🏢': '<Building size={SIZE} />',
  '🌍': '<Globe size={SIZE} />',
  '🏛️': '<Landmark size={SIZE} />',
  
  // Misc
  '🎛️': '<Settings size={SIZE} />',
  '⚡': '<Zap size={SIZE} />',
  '💚': '<Heart size={SIZE} />',
  '⭐': '<Star size={SIZE} />',
  'ℹ️': '<Info size={SIZE} />',
  
  // Simple text replacements (for inline text)
  '✓': '✓', // Keep checkmark as text
  '●': '●', // Keep bullet as text
  '○': '○', // Keep circle as text
};

// Files to process
const filesToProcess = [
  'frontend/src/pages/RegionalDashboard.jsx',
  'frontend/src/pages/ManagerDashboard.jsx',
];

function removeEmojisFromFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // Remove emoji icons from objects
  content = content.replace(/icon:\s*['"]([📊🎯🚶💉📋⭐🔥🚀🏥💊🩺👨‍⚕️👩‍⚕️🏃‍♂️🏃‍♀️📈📉💪🌟✨🎉🎊👍👏🙌💯📍👥⚠️⏱️✅❌⏳✏️➕ℹ️🎛️👔🏢🌍🏛️💚🚨💾⚡]+)['"]/g, (match, emoji) => {
    changes++;
    // Determine appropriate icon component based on context
    if (emoji === '📊' || emoji === '📈' || emoji === '📉') return 'icon: BarChart3';
    if (emoji === '👥') return 'icon: Users';
    if (emoji === '🏥') return 'icon: Building2';
    if (emoji === '🩺') return 'icon: Activity';
    if (emoji === '✅') return 'icon: CheckCircle';
    if (emoji === '❌') return 'icon: XCircle';
    if (emoji === '⚠️' || emoji === '🚨') return 'icon: AlertTriangle';
    if (emoji === '⏱️' || emoji === '⏳') return 'icon: Clock';
    if (emoji === '✏️') return 'icon: Edit';
    if (emoji === '➕') return 'icon: Plus';
    if (emoji === '💾') return 'icon: Save';
    if (emoji === '📍') return 'icon: MapPin';
    if (emoji === '⚡') return 'icon: Zap';
    if (emoji === '💚') return 'icon: Heart';
    if (emoji === '👔') return 'icon: Briefcase';
    if (emoji === '🏢') return 'icon: Building';
    if (emoji === '🌍') return 'icon: Globe';
    if (emoji === '🏛️') return 'icon: Landmark';
    if (emoji === '🎛️') return 'icon: Settings';
    return 'icon: Activity'; // Default fallback
  });
  
  // Remove inline emojis in JSX
  content = content.replace(/<span[^>]*>([📊🎯🚶💉📋⭐🔥🚀🏥💊🩺👨‍⚕️👩‍⚕️🏃‍♂️🏃‍♀️📈📉💪🌟✨🎉🎊👍👏🙌💯📍👥⚠️⏱️✅❌⏳✏️➕ℹ️🎛️👔🏢🌍🏛️💚🚨💾⚡]+)<\/span>/g, (match, emoji) => {
    changes++;
    return ''; // Remove emoji spans
  });
  
  // Remove emojis from strings
  content = content.replace(/([📊🎯🚶💉📋⭐🔥🚀🏥💊🩺👨‍⚕️👩‍⚕️🏃‍♂️🏃‍♀️📈📉💪🌟✨🎉🎊👍👏🙌💯📍👥⚠️⏱️✅❌⏳✏️➕ℹ️🎛️👔🏢🌍🏛️💚🚨💾⚡]+)\s*/g, '');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Removed ${changes} emoji instances from ${filePath}`);
}

// Process all files
filesToProcess.forEach(removeEmojisFromFile);

console.log('\n✓ Emoji removal complete!');
console.log('\nNOTE: You may need to:');
console.log('1. Import additional Lucide icons if not already imported');
console.log('2. Review the changes and adjust icon sizes as needed');
console.log('3. Test the application to ensure all icons render correctly');
