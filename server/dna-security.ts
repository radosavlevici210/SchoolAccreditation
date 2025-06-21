
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
    for (const profile of Object.values(this.DNA_PROFILES)) {
      if (this.sequenceMatch(dnaSequence, profile.sequence)) {
        return profile;
      }
    }
    return null;
  }

  private static sequenceMatch(input: string, target: string): boolean {
    // Check for 60% or higher sequence similarity
    const minLength = Math.min(input.length, target.length);
    let matches = 0;
    
    for (let i = 0; i < minLength; i++) {
      if (input[i] === target[i]) {
        matches++;
      }
    }
    
    return (matches / minLength) >= 0.6;
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
