export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

export class FileHelper {
    /**
     * Valida se o arquivo é uma imagem
     */
    static validateImageType(file: File): FileValidationResult {
        if (!file.type.startsWith('image/')) {
            return {
                valid: false,
                error: 'Por favor, selecione apenas arquivos de imagem.',
            };
        }

        return { valid: true };
    }

    /**
     * Valida o tamanho do arquivo
     */
    static validateFileSize(file: File, maxSizeMB: number = 2): FileValidationResult {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (file.size > maxSizeBytes) {
            return {
                valid: false,
                error: `A imagem deve ter no máximo ${maxSizeMB}MB.`,
            };
        }

        return { valid: true };
    }

    /**
     * Valida tipo e tamanho do arquivo
     */
    static validateImageFile(file: File, maxSizeMB: number = 2): FileValidationResult {
        const typeValidation = this.validateImageType(file);
        if (!typeValidation.valid) {
            return typeValidation;
        }

        const sizeValidation = this.validateFileSize(file, maxSizeMB);
        if (!sizeValidation.valid) {
            return sizeValidation;
        }

        return { valid: true };
    }
}
