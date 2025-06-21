
import crypto from "crypto";

export interface DNAProfile {
  sequence: string;
  role: string;
  permissions: string[];
  securityLevel: number;
}

export class DNASecurityManager {
  private static readonly DNA_PROFILES: { [key: string]: DNAProfile } = {
    'ATCGATCGATCG': {
      sequence: 'ATCGATCGATCG',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'manage'],
      securityLevel: 5
    },
    'GCTAGCTAGCTA': {
      sequence: 'GCTAGCTAGCTA', 
      role: 'student',
      permissions: ['read', 'enroll'],
      securityLevel: 2
    },
    'TTAACCGGTTAA': {
      sequence: 'TTAACCGGTTAA',
      role: 'instructor',
      permissions: ['read', 'write', 'grade'],
      securityLevel: 4
    },
    'AAAATTTTCCCC': {
      sequence: 'AAAATTTTCCCC',
      role: 'system',
      permissions: ['read', 'write', 'monitor'],
      securityLevel: 3
    },
    'ACGGAGGAAGCC': {
      sequence: 'ACGGAGGAAGCC',
      role: 'superadmin',
      permissions: ['read', 'write', 'delete', 'manage', 'override', 'security'],
      securityLevel: 6
    },
    'GCCGAGGCGGGT': {
      sequence: 'GCCGAGGCGGGT',
      role: 'developer',
      permissions: ['read', 'write', 'debug', 'deploy'],
      securityLevel: 5
    },
    'GAGGCGGGTAAT': {
      sequence: 'GAGGCGGGTAAT',
      role: 'manager',
      permissions: ['read', 'write', 'manage', 'approve'],
      securityLevel: 4
    },
    'CAACCCTCTCGGGCAGAGTGCACA': {
      sequence: 'CAACCCTCTCGGGCAGAGTGCACA',
      role: 'owner',
      permissions: ['read', 'write', 'delete', 'manage', 'override', 'security', 'admin', 'full_access'],
      securityLevel: 10
    }
  };

  static generateBiometricHash(userAgent: string, ip: string, timestamp: number): string {
    const data = `${userAgent}:${ip}:${Math.floor(timestamp / 300000)}`; // 5-minute windows
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static convertHashToDNA(hash: string): string {
    return hash.substring(0, 24).replace(/[0-9a-f]/g, (char) => {
      const nucleotideMap: { [key: string]: string } = {
        '0': 'A', '1': 'T', '2': 'C', '3': 'G',
        '4': 'A', '5': 'T', '6': 'C', '7': 'G', 
        '8': 'A', '9': 'T', 'a': 'C', 'b': 'G',
        'c': 'A', 'd': 'T', 'e': 'C', 'f': 'G'
      };
      return nucleotideMap[char];
    });
  }

  static analyzeDNAPattern(dnaSequence: string): DNAProfile | null {
    console.log(`[DNA-ANALYSIS] Analyzing sequence: ${dnaSequence}`);
    
    // Check each profile with detailed logging
    for (const [key, profile] of Object.entries(this.DNA_PROFILES)) {
      const matches = this.sequenceMatch(dnaSequence, profile.sequence);
      console.log(`[DNA-ANALYSIS] Checking ${profile.role} (${key}): ${matches ? 'MATCH' : 'NO MATCH'}`);
      
      if (matches) {
        console.log(`[DNA-ANALYSIS] ✅ Authentication successful - Role: ${profile.role}, Security Level: ${profile.securityLevel}`);
        return profile;
      }
    }
    
    console.log(`[DNA-ANALYSIS] ❌ No matching profile found for sequence: ${dnaSequence}`);
    return null;
  }

  private static sequenceMatch(input: string, target: string): boolean {
    // Multiple matching strategies for better authentication
    
    // 1. Direct substring match (most accurate)
    if (input.includes(target) || target.includes(input)) {
      return true;
    }
    
    // 2. Check for partial sequences (sliding window)
    const windowSize = Math.min(8, target.length);
    for (let i = 0; i <= target.length - windowSize; i++) {
      const segment = target.substring(i, i + windowSize);
      if (input.includes(segment)) {
        return true;
      }
    }
    
    // 3. Position-based similarity (original method, lowered threshold)
    const minLength = Math.min(input.length, target.length);
    let matches = 0;
    
    for (let i = 0; i < minLength; i++) {
      if (input[i] === target[i]) {
        matches++;
      }
    }
    
    const similarity = matches / minLength;
    return similarity >= 0.4; // Lowered from 0.6 to 0.4 for better access
  }

  static validatePermission(dnaProfile: DNAProfile | null, requiredPermission: string): boolean {
    if (!dnaProfile) return false;
    return dnaProfile.permissions.includes(requiredPermission);
  }

  static getSecurityMetrics(req: any): {
    dnaSequence: string;
    profile: DNAProfile | null;
    trustScore: number;
    biometricHash: string;
  } {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress || '';
    const timestamp = Date.now();
    
    const biometricHash = this.generateBiometricHash(userAgent, ip, timestamp);
    const dnaSequence = this.convertHashToDNA(biometricHash);
    const profile = this.analyzeDNAPattern(dnaSequence);
    
    const trustScore = profile ? profile.securityLevel * 20 : 10;
    
    return {
      dnaSequence,
      profile,
      trustScore,
      biometricHash
    };
  }
}

export default DNASecurityManager;
