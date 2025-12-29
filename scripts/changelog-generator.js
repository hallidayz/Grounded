#!/usr/bin/env node
/**
 * CHANGELOG Generator
 * 
 * Generates CHANGELOG.md from git commit history
 * Parses conventional commits and formats them
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getLastTag, getCommitsSinceTag, getCurrentVersion } from './release-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const changelogPath = join(rootDir, 'CHANGELOG.md');

/**
 * Parse conventional commit message
 */
function parseCommit(commitLine) {
  const [hash, ...rest] = commitLine.split('|');
  const message = rest.join('|');
  
  // Conventional commit format: type(scope): subject
  const conventionalMatch = message.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/);
  
  if (conventionalMatch) {
    const [, type, scope, subject] = conventionalMatch;
    return {
      hash: hash.substring(0, 7),
      type: type.toLowerCase(),
      scope: scope || null,
      subject: subject.trim(),
      raw: message,
    };
  }
  
  // Fallback for non-conventional commits
  return {
    hash: hash.substring(0, 7),
    type: 'other',
    scope: null,
    subject: message.trim(),
    raw: message,
  };
}

/**
 * Group commits by type
 */
function groupCommitsByType(commits) {
  const groups = {
    feat: [],
    fix: [],
    perf: [],
    refactor: [],
    docs: [],
    style: [],
    test: [],
    chore: [],
    build: [],
    ci: [],
    other: [],
  };
  
  commits.forEach(commit => {
    const parsed = parseCommit(commit);
    const type = parsed.type in groups ? parsed.type : 'other';
    groups[type].push(parsed);
  });
  
  return groups;
}

/**
 * Format commit for changelog
 */
function formatCommit(commit) {
  const scope = commit.scope ? `**${commit.scope}**: ` : '';
  return `- ${scope}${commit.subject} (${commit.hash})`;
}

/**
 * Generate changelog entry for a version
 */
function generateChangelogEntry(version, date, commitGroups) {
  const sections = [];
  
  // Features
  if (commitGroups.feat.length > 0) {
    sections.push('### Added');
    commitGroups.feat.forEach(commit => {
      sections.push(formatCommit(commit));
    });
  }
  
  // Fixes
  if (commitGroups.fix.length > 0) {
    sections.push('### Fixed');
    commitGroups.fix.forEach(commit => {
      sections.push(formatCommit(commit));
    });
  }
  
  // Performance
  if (commitGroups.perf.length > 0) {
    sections.push('### Performance');
    commitGroups.perf.forEach(commit => {
      sections.push(formatCommit(commit));
    });
  }
  
  // Refactoring
  if (commitGroups.refactor.length > 0) {
    sections.push('### Changed');
    commitGroups.refactor.forEach(commit => {
      sections.push(formatCommit(commit));
    });
  }
  
  // Documentation
  if (commitGroups.docs.length > 0) {
    sections.push('### Documentation');
    commitGroups.docs.forEach(commit => {
      sections.push(formatCommit(commit));
    });
  }
  
  // Other changes
  const otherTypes = ['style', 'test', 'chore', 'build', 'ci', 'other'];
  const otherCommits = otherTypes.flatMap(type => commitGroups[type]);
  if (otherCommits.length > 0) {
    sections.push('### Other');
    otherCommits.forEach(commit => {
      sections.push(formatCommit(commit));
    });
  }
  
  if (sections.length === 0) {
    sections.push('- No changes documented');
  }
  
  return `## [${version}] - ${date}\n\n${sections.join('\n\n')}\n`;
}

/**
 * Read existing CHANGELOG
 */
function readExistingChangelog() {
  if (existsSync(changelogPath)) {
    return readFileSync(changelogPath, 'utf-8');
  }
  return `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
}

/**
 * Generate CHANGELOG.md
 */
export function generateChangelog(newVersion, previousVersion = null) {
  const lastTag = getLastTag();
  const commits = getCommitsSinceTag(lastTag || previousVersion);
  
  if (commits.length === 0 && !previousVersion) {
    console.warn('No commits found since last tag. Creating empty changelog entry.');
  }
  
  const commitGroups = groupCommitsByType(commits);
  const date = new Date().toISOString().split('T')[0];
  const entry = generateChangelogEntry(newVersion, date, commitGroups);
  
  const existing = readExistingChangelog();
  
  // Insert new entry after the header
  const headerEnd = existing.indexOf('\n## ');
  if (headerEnd > 0) {
    const before = existing.substring(0, headerEnd + 1);
    const after = existing.substring(headerEnd + 1);
    const updated = before + entry + '\n' + after;
    writeFileSync(changelogPath, updated, 'utf-8');
  } else {
    // No existing entries, append
    writeFileSync(changelogPath, existing + entry + '\n', 'utf-8');
  }
  
  return {
    success: true,
    version: newVersion,
    commitsCount: commits.length,
    entry,
  };
}

/**
 * CLI interface
 */
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('changelog-generator.js')) {
  const args = process.argv.slice(2);
  const newVersion = args[0] || getCurrentVersion();
  const previousVersion = args[1] || null;
  
  try {
    const result = generateChangelog(newVersion, previousVersion);
    console.log(`✅ CHANGELOG.md generated for v${result.version}`);
    console.log(`   ${result.commitsCount} commits included`);
  } catch (error) {
    console.error('❌ Error generating CHANGELOG:', error.message);
    process.exit(1);
  }
}

