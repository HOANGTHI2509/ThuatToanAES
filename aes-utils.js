// aes-utils.js

// Thêm một "Magic String" để xác định file đã được mã hóa bởi ứng dụng này
// và kiểm tra tính đúng đắn của mật khẩu khi giải mã.
// Chuỗi này nên đủ dài và ngẫu nhiên để tránh trùng lặp với dữ liệu thật.
const MAGIC_STRING = "AES_FILE_ENCRYPTOR_V1.0_"; // Cố tình để nó không quá dài

/**
 * Hàm trợ giúp để chuyển đổi chuỗi thành mảng các byte.
 * @param {string} str - Chuỗi đầu vào.
 * @returns {number[]} Mảng các byte.
 */
function stringToBytes(str) {
    return Array.from(str).map(char => char.charCodeAt(0));
}

/**
 * Hàm trợ giúp để chuyển đổi mảng các byte thành chuỗi.
 * @param {number[]} bytes - Mảng các byte.
 * @returns {string} Chuỗi đầu ra.
 */
function bytesToString(bytes) {
    return String.fromCharCode(...bytes);
}

/**
 * Mã hóa dữ liệu bằng thuật toán AES đơn giản (mô phỏng XOR lặp lại).
 * KHÔNG PHẢI AES CHUẨN. CHỈ DÙNG CHO MỤC ĐÍCH MINH HỌA.
 * @param {string} plaintext - Dữ liệu cần mã hóa.
 * @param {string} key - Khóa bí mật.
 * @returns {string} Dữ liệu đã mã hóa (base64 encoded).
 */
function simpleAESEncrypt(plaintext, key) {
    // Thêm Magic String vào đầu plaintext trước khi mã hóa
    const contentToEncrypt = MAGIC_STRING + plaintext;
    const plainBytes = stringToBytes(contentToEncrypt);
    const keyBytes = stringToBytes(key);
    const encryptedBytes = [];

    for (let i = 0; i < plainBytes.length; i++) {
        encryptedBytes.push(plainBytes[i] ^ keyBytes[i % keyBytes.length]);
    }

    return btoa(bytesToString(encryptedBytes));
}

/**
 * Giải mã dữ liệu bằng thuật toán AES đơn giản (mô phỏng XOR lặp lại).
 * KHÔNG PHẢI AES CHUẨN. CHỈ DÙNG CHO MỤC ĐÍCH MINH HỌA.
 * @param {string} ciphertext - Dữ liệu đã mã hóa (base64 encoded).
 * @param {string} key - Khóa bí mật.
 * @returns {string} Dữ liệu đã giải mã (không bao gồm Magic String).
 */
function simpleAESDecrypt(ciphertext, key) {
    try {
        const encryptedString = atob(ciphertext); // Cẩn thận: atob không ném lỗi cho chuỗi không hợp lệ
        const encryptedBytes = stringToBytes(encryptedString);
        const keyBytes = stringToBytes(key);
        const decryptedBytes = [];

        for (let i = 0; i < encryptedBytes.length; i++) {
            decryptedBytes.push(encryptedBytes[i] ^ keyBytes[i % keyBytes.length]);
        }

        const result = bytesToString(decryptedBytes);

        // **Kiểm tra Magic String**
        // Đây là bước quan trọng nhất để xác định mật khẩu đúng/sai
        if (!result.startsWith(MAGIC_STRING)) {
            // Nếu không có Magic String, nghĩa là mật khẩu sai hoặc file không phải là file mã hóa của ứng dụng này
            throw new Error('Mật khẩu sai hoặc file không hợp lệ.');
        }

        // Cắt bỏ Magic String khỏi kết quả giải mã
        return result.substring(MAGIC_STRING.length);

    } catch (error) {
        console.error("Lỗi khi giải mã:", error);
        // Ném lỗi cụ thể để app.js có thể bắt và hiển thị thông báo
        if (error.message.includes('Mật khẩu sai')) {
            throw new Error('Mật khẩu sai. Vui lòng nhập lại.');
        } else if (error.message.includes('file không hợp lệ')) {
            throw new Error('File không phải là file được mã hóa bởi ứng dụng này hoặc đã bị hỏng.');
        }
        throw new Error('Giải mã thất bại. Có thể khóa sai hoặc file bị hỏng.');
    }
}