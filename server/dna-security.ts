import crypto from "crypto";

export interface DNAProfile {
  sequence: string;
  role: string;
  permissions: string[];
  securityLevel: number;
}

export class DNASecurityManager {
  private static readonly DNA_PROFILES: { [key: string]: DNAProfile } = {
    'CAACCCTCTCGGGCAGAGTGCACA': {
      sequence: 'CAACCCTCTCGGGCAGAGTGCACA',
      role: 'owner',
      permissions: ['read', 'write', 'delete', 'manage', 'override', 'security', 'admin', 'full_access', 'suspend', 'create', 'modify'],
      securityLevel: 10
    },
    'AAGATGCTACCCCCAACACCTCGC': {
      sequence: 'AAGATGCTACCCCCAACACCTCGC',
      role: 'system',
      permissions: ['read', 'write', 'delete', 'manage', 'override', 'security', 'admin', 'full_access', 'monitor', 'execute'],
      securityLevel: 10
    },
    'GTTCAAATGCGCCCAATAACAAAA': {
      sequence: 'GTTCAAATGCGCCCAATAACAAAA',
      role: 'superadmin',
      permissions: ['read', 'write', 'delete', 'manage', 'override', 'security', 'admin', 'full_access', 'control', 'unlimited'],
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

    // Check only the two authorized sequences
    for (const [key, profile] of Object.entries(this.DNA_PROFILES)) {
      const matches = this.sequenceMatch(dnaSequence, profile.sequence);
      console.log(`[DNA-ANALYSIS] Checking ${profile.role} (${key}): ${matches ? 'MATCH' : 'NO MATCH'}`);

      if (matches) {
        console.log(`[DNA-ANALYSIS] ✅ Authentication successful - Role: ${profile.role}, Security Level: ${profile.securityLevel}`);
        return profile;
      }
    }

    console.log(`[DNA-ANALYSIS] ❌ ACCESS SUSPENDED - Only authorized sequences allowed`);
    return null;
  }

  private static sequenceMatch(input: string, target: string): boolean {
    // Enhanced matching for authorized sequences

    // 1. Exact match (highest priority)
    if (input === target || target === input) {
      return true;
    }

    // 2. Direct substring match
    if (input.includes(target) || target.includes(input)) {
      return true;
    }

    // 3. Check for partial sequences (sliding window)
    const windowSize = Math.min(12, target.length);
    for (let i = 0; i <= target.length - windowSize; i++) {
      const segment = target.substring(i, i + windowSize);
      if (input.includes(segment)) {
        return true;
      }
    }

    // 4. Position-based similarity (strict for security)
    const minLength = Math.min(input.length, target.length);
    let matches = 0;

    for (let i = 0; i < minLength; i++) {
      if (input[i] === target[i]) {
        matches++;
      }
    }

    const similarity = matches / minLength;
    return similarity >= 0.8; // High threshold for authorized access only
  }

  static validatePermission(dnaProfile: DNAProfile | null, requiredPermission: string): boolean {
    if (!dnaProfile) return false;
    return dnaProfile.permissions.includes(requiredPermission) || dnaProfile.permissions.includes('full_access');
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

    const trustScore = profile ? profile.securityLevel * 20 : 0; // Zero trust for unauthorized

    return {
      dnaSequence,
      profile,
      trustScore,
      biometricHash
    };
  }
}

export default DNASecurityManager;