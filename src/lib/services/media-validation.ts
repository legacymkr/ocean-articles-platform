import { MediaType } from "@prisma/client";

// File type configurations
export const MEDIA_TYPE_CONFIG = {
  [MediaType.IMAGE]: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
    mimeTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/x-icon',
      'image/vnd.microsoft.icon'
    ],
    maxSize: 8 * 1024 * 1024, // 8MB
    magicNumbers: [
      { bytes: [0xFF, 0xD8, 0xFF], type: 'JPEG' },
      { bytes: [0x89, 0x50, 0x4E, 0x47], type: 'PNG' },
      { bytes: [0x47, 0x49, 0x46, 0x38], type: 'GIF' },
      { bytes: [0x52, 0x49, 0x46, 0x46], type: 'WEBP' },
      { bytes: [0x3C, 0x73, 0x76, 0x67], type: 'SVG' },
      { bytes: [0x42, 0x4D], type: 'BMP' }
    ]
  },
  [MediaType.VIDEO]: {
    extensions: ['mp4', 'webm', 'avi', 'mov', 'wmv', 'flv', 'mkv'],
    mimeTypes: [
      'video/mp4',
      'video/webm',
      'video/avi',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-flv',
      'video/x-matroska'
    ],
    maxSize: 32 * 1024 * 1024, // 32MB
    magicNumbers: [
      { bytes: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], type: 'MP4' },
      { bytes: [0x1A, 0x45, 0xDF, 0xA3], type: 'WEBM/MKV' },
      { bytes: [0x52, 0x49, 0x46, 0x46], type: 'AVI' },
      { bytes: [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70], type: 'MOV' }
    ]
  },
  [MediaType.AUDIO]: {
    extensions: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'],
    mimeTypes: [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/wave',
      'audio/ogg',
      'audio/aac',
      'audio/flac',
      'audio/mp4'
    ],
    maxSize: 8 * 1024 * 1024, // 8MB
    magicNumbers: [
      { bytes: [0xFF, 0xFB], type: 'MP3' },
      { bytes: [0xFF, 0xF3], type: 'MP3' },
      { bytes: [0xFF, 0xF2], type: 'MP3' },
      { bytes: [0x52, 0x49, 0x46, 0x46], type: 'WAV' },
      { bytes: [0x4F, 0x67, 0x67, 0x53], type: 'OGG' },
      { bytes: [0x66, 0x4C, 0x61, 0x43], type: 'FLAC' }
    ]
  },
  [MediaType.DOCUMENT]: {
    extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/rtf',
      'application/rtf'
    ],
    maxSize: 4 * 1024 * 1024, // 4MB
    magicNumbers: [
      { bytes: [0x25, 0x50, 0x44, 0x46], type: 'PDF' },
      { bytes: [0xD0, 0xCF, 0x11, 0xE0], type: 'DOC' },
      { bytes: [0x50, 0x4B, 0x03, 0x04], type: 'DOCX' },
      { bytes: [0x7B, 0x5C, 0x72, 0x74, 0x66], type: 'RTF' }
    ]
  }
};

// Validation result interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  detectedType?: MediaType;
  detectedMimeType?: string;
  detectedExtension?: string;
}

export interface FileValidationInput {
  filename: string;
  mimeType: string;
  size: number;
  buffer?: ArrayBuffer;
  expectedType?: MediaType;
}

// Main validation service class
export class MediaValidationService {
  
  /**
   * Validate a file based on its properties
   */
  static validateFile(input: FileValidationInput): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Extract file extension
    const extension = this.extractExtension(input.filename);
    result.detectedExtension = extension;

    // Detect media type from extension and MIME type
    const detectedType = this.detectMediaType(input.filename, input.mimeType);
    result.detectedType = detectedType;
    result.detectedMimeType = input.mimeType;

    // Validate against expected type if provided
    if (input.expectedType && detectedType !== input.expectedType) {
      result.errors.push(
        `File type mismatch: expected ${input.expectedType}, detected ${detectedType}`
      );
      result.isValid = false;
    }

    // Validate file extension
    const extensionValidation = this.validateExtension(extension, detectedType);
    if (!extensionValidation.isValid) {
      result.errors.push(...extensionValidation.errors);
      result.isValid = false;
    }

    // Validate MIME type
    const mimeValidation = this.validateMimeType(input.mimeType, detectedType);
    if (!mimeValidation.isValid) {
      result.errors.push(...mimeValidation.errors);
      result.isValid = false;
    }

    // Validate file size
    const sizeValidation = this.validateFileSize(input.size, detectedType);
    if (!sizeValidation.isValid) {
      result.errors.push(...sizeValidation.errors);
      result.isValid = false;
    }

    // Validate magic numbers if buffer is provided
    if (input.buffer) {
      const magicValidation = this.validateMagicNumbers(input.buffer, detectedType);
      if (!magicValidation.isValid) {
        result.warnings.push(...magicValidation.errors);
        // Magic number validation failures are warnings, not hard errors
      }
    }

    // Additional security checks
    const securityValidation = this.performSecurityChecks(input);
    if (!securityValidation.isValid) {
      result.errors.push(...securityValidation.errors);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Detect media type from filename and MIME type
   */
  static detectMediaType(filename: string, mimeType: string): MediaType {
    const extension = this.extractExtension(filename);
    
    // Check each media type configuration
    for (const [type, config] of Object.entries(MEDIA_TYPE_CONFIG)) {
      const mediaType = type as MediaType;
      
      // Check by MIME type first (more reliable)
      if (config.mimeTypes.includes(mimeType.toLowerCase())) {
        return mediaType;
      }
      
      // Check by extension as fallback
      if (config.extensions.includes(extension)) {
        return mediaType;
      }
    }
    
    // Default to DOCUMENT if no match found
    return MediaType.DOCUMENT;
  }

  /**
   * Extract file extension from filename
   */
  static extractExtension(filename: string): string {
    const parts = filename.toLowerCase().split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  /**
   * Validate file extension against media type
   */
  static validateExtension(extension: string, mediaType: MediaType): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    
    if (!extension) {
      result.errors.push('File has no extension');
      result.isValid = false;
      return result;
    }

    const config = MEDIA_TYPE_CONFIG[mediaType];
    if (!config.extensions.includes(extension)) {
      result.errors.push(
        `Invalid file extension '.${extension}' for ${mediaType}. ` +
        `Allowed extensions: ${config.extensions.map(ext => `.${ext}`).join(', ')}`
      );
      result.isValid = false;
    }

    return result;
  }

  /**
   * Validate MIME type against media type
   */
  static validateMimeType(mimeType: string, mediaType: MediaType): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    
    if (!mimeType) {
      result.errors.push('MIME type is required');
      result.isValid = false;
      return result;
    }

    const config = MEDIA_TYPE_CONFIG[mediaType];
    if (!config.mimeTypes.includes(mimeType.toLowerCase())) {
      result.errors.push(
        `Invalid MIME type '${mimeType}' for ${mediaType}. ` +
        `Allowed MIME types: ${config.mimeTypes.join(', ')}`
      );
      result.isValid = false;
    }

    return result;
  }

  /**
   * Validate file size against media type limits
   */
  static validateFileSize(size: number, mediaType: MediaType): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    
    if (size <= 0) {
      result.errors.push('File size must be greater than 0');
      result.isValid = false;
      return result;
    }

    const config = MEDIA_TYPE_CONFIG[mediaType];
    if (size > config.maxSize) {
      const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
      const fileSizeMB = (size / (1024 * 1024)).toFixed(1);
      
      result.errors.push(
        `File size ${fileSizeMB}MB exceeds maximum allowed size of ${maxSizeMB}MB for ${mediaType}`
      );
      result.isValid = false;
    }

    // Warning for very small files
    if (size < 1024) {
      result.warnings.push('File is very small (less than 1KB), please verify it is not corrupted');
    }

    return result;
  }

  /**
   * Validate file content using magic numbers (file signatures)
   */
  static validateMagicNumbers(buffer: ArrayBuffer, mediaType: MediaType): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    
    if (buffer.byteLength < 8) {
      result.warnings.push('File too small to validate magic numbers');
      return result;
    }

    const bytes = new Uint8Array(buffer.slice(0, 16)); // Check first 16 bytes
    const config = MEDIA_TYPE_CONFIG[mediaType];
    
    let foundMatch = false;
    
    for (const magic of config.magicNumbers) {
      if (this.matchesMagicNumber(bytes, magic.bytes)) {
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch && config.magicNumbers.length > 0) {
      result.errors.push(
        `File content does not match expected ${mediaType} format (magic number validation failed)`
      );
      result.isValid = false;
    }

    return result;
  }

  /**
   * Check if bytes match a magic number pattern
   */
  static matchesMagicNumber(fileBytes: Uint8Array, magicBytes: number[]): boolean {
    if (fileBytes.length < magicBytes.length) {
      return false;
    }

    for (let i = 0; i < magicBytes.length; i++) {
      if (fileBytes[i] !== magicBytes[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Perform basic security checks
   */
  static performSecurityChecks(input: FileValidationInput): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

    // Check for suspicious filenames
    const suspiciousPatterns = [
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.pif$/i,
      /\.com$/i,
      /\.jar$/i,
      /\.js$/i,
      /\.vbs$/i,
      /\.php$/i,
      /\.asp$/i,
      /\.jsp$/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(input.filename)) {
        result.errors.push(
          `Potentially dangerous file type detected: ${input.filename}. ` +
          'Executable files are not allowed for security reasons.'
        );
        result.isValid = false;
        break;
      }
    }

    // Check for double extensions (e.g., image.jpg.exe)
    const parts = input.filename.split('.');
    if (parts.length > 2) {
      const secondToLast = parts[parts.length - 2].toLowerCase();
      const commonExtensions = ['jpg', 'png', 'gif', 'pdf', 'doc', 'txt'];
      
      if (commonExtensions.includes(secondToLast)) {
        result.warnings.push(
          'File has multiple extensions, which could be suspicious. Please verify the file is safe.'
        );
      }
    }

    // Check filename length
    if (input.filename.length > 255) {
      result.errors.push('Filename is too long (maximum 255 characters)');
      result.isValid = false;
    }

    // Check for null bytes in filename
    if (input.filename.includes('\0')) {
      result.errors.push('Filename contains null bytes, which is not allowed');
      result.isValid = false;
    }

    return result;
  }

  /**
   * Get allowed file types for a specific media type
   */
  static getAllowedTypes(mediaType: MediaType): { extensions: string[], mimeTypes: string[] } {
    const config = MEDIA_TYPE_CONFIG[mediaType];
    return {
      extensions: [...config.extensions],
      mimeTypes: [...config.mimeTypes]
    };
  }

  /**
   * Get maximum file size for a media type
   */
  static getMaxFileSize(mediaType: MediaType): number {
    return MEDIA_TYPE_CONFIG[mediaType].maxSize;
  }

  /**
   * Format file size in human-readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate multiple files at once
   */
  static validateFiles(files: FileValidationInput[]): ValidationResult[] {
    return files.map(file => this.validateFile(file));
  }
}

// Extended validation for dimensions and advanced size checks
export interface DimensionValidationInput {
  width?: number;
  height?: number;
  duration?: number; // for video/audio
  aspectRatio?: number;
  mediaType: MediaType;
}

export interface SizeValidationOptions {
  strictMode?: boolean;
  allowCompression?: boolean;
  recommendOptimization?: boolean;
}

export class AdvancedMediaValidation extends MediaValidationService {
  
  // Dimension constraints for different media types
  static readonly DIMENSION_CONSTRAINTS = {
    [MediaType.IMAGE]: {
      minWidth: 1,
      maxWidth: 10000,
      minHeight: 1,
      maxHeight: 10000,
      recommendedMaxWidth: 2048,
      recommendedMaxHeight: 2048,
      minAspectRatio: 0.1, // Very wide or very tall images
      maxAspectRatio: 10.0
    },
    [MediaType.VIDEO]: {
      minWidth: 144,
      maxWidth: 4096,
      minHeight: 144,
      maxHeight: 4096,
      recommendedMaxWidth: 1920,
      recommendedMaxHeight: 1080,
      minDuration: 1, // 1 second
      maxDuration: 3600, // 1 hour
      recommendedMaxDuration: 600 // 10 minutes
    },
    [MediaType.AUDIO]: {
      minDuration: 1, // 1 second
      maxDuration: 7200, // 2 hours
      recommendedMaxDuration: 1800 // 30 minutes
    }
  };

  // Size optimization recommendations
  static readonly SIZE_RECOMMENDATIONS = {
    [MediaType.IMAGE]: {
      excellent: 500 * 1024, // 500KB
      good: 1024 * 1024, // 1MB
      acceptable: 2 * 1024 * 1024, // 2MB
      large: 4 * 1024 * 1024 // 4MB
    },
    [MediaType.VIDEO]: {
      excellent: 5 * 1024 * 1024, // 5MB
      good: 10 * 1024 * 1024, // 10MB
      acceptable: 20 * 1024 * 1024, // 20MB
      large: 30 * 1024 * 1024 // 30MB
    },
    [MediaType.AUDIO]: {
      excellent: 2 * 1024 * 1024, // 2MB
      good: 4 * 1024 * 1024, // 4MB
      acceptable: 6 * 1024 * 1024, // 6MB
      large: 8 * 1024 * 1024 // 8MB
    },
    [MediaType.DOCUMENT]: {
      excellent: 100 * 1024, // 100KB
      good: 500 * 1024, // 500KB
      acceptable: 1024 * 1024, // 1MB
      large: 2 * 1024 * 1024 // 2MB
    }
  };

  /**
   * Validate image/video dimensions
   */
  static validateDimensions(input: DimensionValidationInput): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    
    if (input.mediaType === MediaType.DOCUMENT || input.mediaType === MediaType.AUDIO) {
      // Documents don't have width/height, audio only has duration
      if (input.mediaType === MediaType.AUDIO && input.duration !== undefined) {
        return this.validateAudioDuration(input.duration);
      }
      return result;
    }

    const constraints = this.DIMENSION_CONSTRAINTS[input.mediaType];
    
    // Validate width
    if (input.width !== undefined) {
      if (input.width < constraints.minWidth || input.width > constraints.maxWidth) {
        result.errors.push(
          `Invalid width: ${input.width}px. Must be between ${constraints.minWidth}px and ${constraints.maxWidth}px`
        );
        result.isValid = false;
      } else if (input.width > constraints.recommendedMaxWidth) {
        result.warnings.push(
          `Width ${input.width}px is larger than recommended maximum of ${constraints.recommendedMaxWidth}px. ` +
          'Consider resizing for better performance.'
        );
      }
    }

    // Validate height
    if (input.height !== undefined) {
      if (input.height < constraints.minHeight || input.height > constraints.maxHeight) {
        result.errors.push(
          `Invalid height: ${input.height}px. Must be between ${constraints.minHeight}px and ${constraints.maxHeight}px`
        );
        result.isValid = false;
      } else if (input.height > constraints.recommendedMaxHeight) {
        result.warnings.push(
          `Height ${input.height}px is larger than recommended maximum of ${constraints.recommendedMaxHeight}px. ` +
          'Consider resizing for better performance.'
        );
      }
    }

    // Validate aspect ratio
    if (input.width && input.height) {
      const aspectRatio = input.width / input.height;
      
      if (input.mediaType === MediaType.IMAGE) {
        const imgConstraints = this.DIMENSION_CONSTRAINTS[MediaType.IMAGE];
        if (aspectRatio < imgConstraints.minAspectRatio || aspectRatio > imgConstraints.maxAspectRatio) {
          result.warnings.push(
            `Unusual aspect ratio: ${aspectRatio.toFixed(2)}. ` +
            'Very wide or very tall images may not display well.'
          );
        }
      }

      // Check for common aspect ratios and provide recommendations
      const commonRatios = [
        { ratio: 16/9, name: '16:9 (widescreen)' },
        { ratio: 4/3, name: '4:3 (standard)' },
        { ratio: 1/1, name: '1:1 (square)' },
        { ratio: 3/2, name: '3:2 (photo)' },
        { ratio: 21/9, name: '21:9 (ultrawide)' }
      ];

      const tolerance = 0.05;
      const matchingRatio = commonRatios.find(r => 
        Math.abs(aspectRatio - r.ratio) < tolerance
      );

      if (matchingRatio) {
        result.warnings.push(`Detected ${matchingRatio.name} aspect ratio`);
      }
    }

    // Validate video duration
    if (input.mediaType === MediaType.VIDEO && input.duration !== undefined) {
      const videoDurationValidation = this.validateVideoDuration(input.duration);
      result.errors.push(...videoDurationValidation.errors);
      result.warnings.push(...videoDurationValidation.warnings);
      if (!videoDurationValidation.isValid) {
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Validate video duration
   */
  static validateVideoDuration(duration: number): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    const constraints = this.DIMENSION_CONSTRAINTS[MediaType.VIDEO];

    if (duration < constraints.minDuration) {
      result.errors.push(
        `Video duration ${duration}s is too short. Minimum duration is ${constraints.minDuration}s`
      );
      result.isValid = false;
    } else if (duration > constraints.maxDuration) {
      result.errors.push(
        `Video duration ${duration}s exceeds maximum allowed duration of ${constraints.maxDuration}s`
      );
      result.isValid = false;
    } else if (duration > constraints.recommendedMaxDuration) {
      result.warnings.push(
        `Video duration ${duration}s is longer than recommended maximum of ${constraints.recommendedMaxDuration}s. ` +
        'Consider splitting into shorter segments for better user experience.'
      );
    }

    return result;
  }

  /**
   * Validate audio duration
   */
  static validateAudioDuration(duration: number): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    const constraints = this.DIMENSION_CONSTRAINTS[MediaType.AUDIO];

    if (duration < constraints.minDuration) {
      result.errors.push(
        `Audio duration ${duration}s is too short. Minimum duration is ${constraints.minDuration}s`
      );
      result.isValid = false;
    } else if (duration > constraints.maxDuration) {
      result.errors.push(
        `Audio duration ${duration}s exceeds maximum allowed duration of ${constraints.maxDuration}s`
      );
      result.isValid = false;
    } else if (duration > constraints.recommendedMaxDuration) {
      result.warnings.push(
        `Audio duration ${duration}s is longer than recommended maximum of ${constraints.recommendedMaxDuration}s. ` +
        'Consider splitting into shorter segments.'
      );
    }

    return result;
  }

  /**
   * Advanced file size validation with optimization recommendations
   */
  static validateFileSizeAdvanced(
    size: number, 
    mediaType: MediaType, 
    options: SizeValidationOptions = {}
  ): ValidationResult {
    const result = this.validateFileSize(size, mediaType);
    
    if (!result.isValid) {
      return result;
    }

    const recommendations = this.SIZE_RECOMMENDATIONS[mediaType];
    const sizeCategory = this.categorizeFileSize(size, recommendations);
    
    // Add size optimization recommendations
    switch (sizeCategory) {
      case 'excellent':
        result.warnings.push(`File size is excellent (${this.formatFileSize(size)})`);
        break;
      case 'good':
        result.warnings.push(`File size is good (${this.formatFileSize(size)})`);
        break;
      case 'acceptable':
        result.warnings.push(
          `File size is acceptable (${this.formatFileSize(size)}) but could be optimized for better performance`
        );
        break;
      case 'large':
        result.warnings.push(
          `File size is large (${this.formatFileSize(size)}). ` +
          'Consider compressing or optimizing the file for better loading times.'
        );
        break;
      case 'too_large':
        result.warnings.push(
          `File size is very large (${this.formatFileSize(size)}). ` +
          'This may cause slow loading times and poor user experience.'
        );
        break;
    }

    // Add specific optimization suggestions
    if (options.recommendOptimization && sizeCategory !== 'excellent') {
      result.warnings.push(...this.getOptimizationSuggestions(mediaType, size));
    }

    return result;
  }

  /**
   * Categorize file size based on recommendations
   */
  static categorizeFileSize(
    size: number, 
    recommendations: typeof AdvancedMediaValidation.SIZE_RECOMMENDATIONS[MediaType]
  ): string {
    if (size <= recommendations.excellent) return 'excellent';
    if (size <= recommendations.good) return 'good';
    if (size <= recommendations.acceptable) return 'acceptable';
    if (size <= recommendations.large) return 'large';
    return 'too_large';
  }

  /**
   * Get optimization suggestions based on media type and size
   */
  static getOptimizationSuggestions(mediaType: MediaType, size: number): string[] {
    const suggestions: string[] = [];

    switch (mediaType) {
      case MediaType.IMAGE:
        suggestions.push('Consider using WebP format for better compression');
        suggestions.push('Reduce image dimensions if displaying at smaller sizes');
        suggestions.push('Use JPEG for photos, PNG for graphics with transparency');
        if (size > 2 * 1024 * 1024) {
          suggestions.push('Consider progressive JPEG for large images');
        }
        break;

      case MediaType.VIDEO:
        suggestions.push('Use H.264 codec for better compression and compatibility');
        suggestions.push('Consider reducing resolution or frame rate');
        suggestions.push('Use appropriate bitrate for the content type');
        if (size > 20 * 1024 * 1024) {
          suggestions.push('Consider splitting long videos into segments');
        }
        break;

      case MediaType.AUDIO:
        suggestions.push('Use MP3 or AAC format for better compression');
        suggestions.push('Consider reducing bitrate for voice content');
        suggestions.push('Use appropriate sample rate (44.1kHz for music, 22kHz for voice)');
        break;

      case MediaType.DOCUMENT:
        suggestions.push('Compress PDF files to reduce size');
        suggestions.push('Remove unnecessary metadata and embedded objects');
        suggestions.push('Consider using PDF/A format for archival purposes');
        break;
    }

    return suggestions;
  }

  /**
   * Comprehensive validation combining all checks
   */
  static validateMediaComprehensive(input: {
    file: FileValidationInput;
    dimensions?: DimensionValidationInput;
    options?: SizeValidationOptions;
  }): ValidationResult {
    const results: ValidationResult[] = [];

    // Basic file validation
    results.push(this.validateFile(input.file));

    // Dimension validation
    if (input.dimensions) {
      results.push(this.validateDimensions(input.dimensions));
    }

    // Advanced size validation
    results.push(this.validateFileSizeAdvanced(
      input.file.size, 
      input.file.expectedType || this.detectMediaType(input.file.filename, input.file.mimeType),
      input.options
    ));

    // Combine all results
    const combinedResult: ValidationResult = {
      isValid: results.every(r => r.isValid),
      errors: results.flatMap(r => r.errors),
      warnings: results.flatMap(r => r.warnings),
      detectedType: results[0].detectedType,
      detectedMimeType: results[0].detectedMimeType,
      detectedExtension: results[0].detectedExtension
    };

    // Remove duplicate messages
    combinedResult.errors = [...new Set(combinedResult.errors)];
    combinedResult.warnings = [...new Set(combinedResult.warnings)];

    return combinedResult;
  }

  /**
   * Get validation summary for display
   */
  static getValidationSummary(result: ValidationResult): string {
    if (result.isValid) {
      const warningCount = result.warnings.length;
      if (warningCount === 0) {
        return 'File validation passed with no issues';
      } else {
        return `File validation passed with ${warningCount} recommendation(s)`;
      }
    } else {
      const errorCount = result.errors.length;
      return `File validation failed with ${errorCount} error(s)`;
    }
  }
}