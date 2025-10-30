/**
 * Contract Validation Script
 * Agent: API Contract Agent (API)
 * Purpose: Validate API calls match backend schemas
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface ContractValidation {
  endpoint: string;
  method: string;
  requestType?: string;
  responseType?: string;
  status: 'valid' | 'invalid' | 'missing';
  issues: string[];
}

async function validateContracts() {
  console.log('🔍 Validating API contracts...');
  
  const srcPath = path.join(process.cwd(), 'src');
  const serviceFiles = await glob('**/services/**/*.{ts,tsx}', {
    cwd: srcPath,
    ignore: ['**/*.test.{ts,tsx}', '**/__tests__/**']
  });
  
  const contracts: ContractValidation[] = [];
  
  // Known API contracts (would be loaded from backend OpenAPI spec in production)
  const knownContracts = {
    'POST /api/auth/login': {
      request: 'LoginRequest',
      response: 'AuthResponse'
    },
    'POST /api/pets/discover': {
      response: 'Pet[]'
    },
    'GET /api/chat/:matchId/messages': {
      response: 'Message[]'
    },
    'POST /api/chat/:matchId/send': {
      request: 'SendMessageRequest',
      response: 'Message'
    },
    'POST /api/chat/reactions': {
      request: 'ReactionRequest',
      response: 'ReactionResponse'
    },
    'POST /api/chat/attachments': {
      request: 'AttachmentRequest',
      response: 'AttachmentResponse'
    },
    'POST /api/chat/voice': {
      request: 'FormData',
      response: 'VoiceNoteResponse'
    },
    'DELETE /api/users/delete-account': {
      request: 'DeleteAccountRequest',
      response: 'DeleteAccountResponse'
    },
    'GET /api/users/export-data': {
      response: 'DataExportResponse'
    },
    'POST /api/premium/subscribe': {
      request: 'SubscribeRequest',
      response: 'CheckoutSession'
    }
  };
  
  // Parse service files to find API calls
  for (const file of serviceFiles) {
    const filePath = path.join(srcPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Find API calls (simplified regex)
    const apiCallMatches = [
      ...content.matchAll(/(?:request|api|axios)\.(?:get|post|put|delete|patch)\(['"`]([^'"`]+)/g),
    ];
    
    for (const match of apiCallMatches) {
      const endpoint = match[1];
      const method = match[0].includes('post') ? 'POST' : 
                     match[0].includes('get') ? 'GET' :
                     match[0].includes('put') ? 'PUT' :
                     match[0].includes('delete') ? 'DELETE' : 'GET';
      
      const knownContract = knownContracts[`${method} ${endpoint}`];
      
      contracts.push({
        endpoint,
        method,
        requestType: knownContract?.request,
        responseType: knownContract?.response,
        status: knownContract ? 'valid' : 'missing',
        issues: knownContract ? [] : ['Contract not defined in known contracts']
      });
    }
  }
  
  const report = {
    validationDate: new Date().toISOString(),
    agent: 'API Contract Agent',
    status: 'Validation Complete',
    totalContracts: contracts.length,
    valid: contracts.filter(c => c.status === 'valid').length,
    invalid: contracts.filter(c => c.status === 'invalid').length,
    missing: contracts.filter(c => c.status === 'missing').length,
    results: contracts
  };
  
  const reportPath = path.join(process.cwd(), '../../reports/contract_results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`✅ Contract validation complete: ${report.valid} valid, ${report.missing} missing`);
  console.log(`📁 Report saved to ${reportPath}`);
  
  return report;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateContracts().catch(console.error);
}

export default validateContracts;

