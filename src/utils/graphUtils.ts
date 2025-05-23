
export class GraphUtils {
  // Generate unique node name following the specified sequence
  static generateUniqueName(existingNames: string[]): string {
    // Capital A-Z
    for (let i = 65; i <= 90; i++) {
      const name = String.fromCharCode(i);
      if (!existingNames.includes(name)) return name;
    }
    
    // Lowercase a-z
    for (let i = 97; i <= 122; i++) {
      const name = String.fromCharCode(i);
      if (!existingNames.includes(name)) return name;
    }
    
    // Hindi characters (क to ज्ञ)
    const hindiChars = [
      'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ',
      'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न',
      'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श',
      'ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ'
    ];
    
    for (const char of hindiChars) {
      if (!existingNames.includes(char)) return char;
    }
    
    // Numbers starting from 0
    for (let i = 0; i < 1000; i++) {
      const name = i.toString();
      if (!existingNames.includes(name)) return name;
    }
    
    // Fallback
    return `Node${Date.now()}`;
  }
  
  // Validate node name
  static isValidName(name: string): boolean {
    if (!name || name.length === 0) return false;
    
    // Single English alphabet (A-Z or a-z)
    if (/^[A-Za-z]$/.test(name)) return true;
    
    // Single Hindi character (क to ज्ञ)
    const hindiPattern = /^[क-ह]$|^[क्ष|त्र|ज्ञ]$/;
    if (hindiPattern.test(name)) return true;
    
    // Numbers < 1000
    const num = parseInt(name);
    if (!isNaN(num) && num >= 0 && num < 1000 && num.toString() === name) return true;
    
    return false;
  }
  
  // Get node color based on degree
  static getNodeColor(degree: number): string {
    const colors = [
      '#f3f4f6', // 0 degree - gray
      '#dbeafe', // 1 degree - light blue
      '#bfdbfe', // 2 degrees - blue
      '#93c5fd', // 3 degrees - medium blue
      '#60a5fa', // 4 degrees - darker blue
      '#3b82f6', // 5+ degrees - strong blue
    ];
    return colors[Math.min(degree, colors.length - 1)];
  }
}
